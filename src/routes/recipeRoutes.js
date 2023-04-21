import express from 'express';
import { requireAdmin } from '../auth/passport.js';
import { catchErrors } from '../lib/catch-errors.js';
import { conditionalUpdate, deleteRecipe, query } from '../lib/db.js';
import { isString } from '../lib/isString.js';
import { ensureLoggedIn } from '../lib/login.js';
import { validationCheck } from '../validation/helpers.js';
import { uploadImage } from '../lib/cloudinary.js';
import xss from 'xss';

// root -> /recipes

export const recipeRouter = express.Router();

async function getAllRecipesRoute(req, res) {
  const { limit, offset } = req.query;
  const q = 'SELECT * FROM recipes LIMIT $1 OFFSET $2';
  const recipes = await query(q, [limit, offset]);
  res.json(recipes.rows);
}

async function getRecipeRoute(req, res) {
  const { id } = req.params;
  const recipe = await query(`
    SELECT * FROM recipes WHERE id = $1;
  `, [id]);

  // Komment til að pusha eh breytingu fyrir deploy!

  if (recipe?.rows === [] || recipe?.rows.length === 0) {
    return res.status(404).json({ message: 'Recipe not found' });
  }
  return res.json(recipe.rows[0]);
}

async function updateIngredientsRoute(req, res) {
  const ingredients = req.body;
  // console.log(ingredients);

  for (let i = 0; i < ingredients.length; i++) {
    const fields = [
      isString(ingredients[i].name) ? 'name' : null,
      isString(ingredients[i].quantity) ? 'quantity' : null,
      isString(ingredients[i].unit) ? 'unit' : null
    ]
    const values = [
      isString(ingredients[i].name) ? ingredients[i].name : null,
      isString(ingredients[i].quantity) ? ingredients[i].quantity : null,
      isString(ingredients[i].unit) ? ingredients[i].unit : null
    ]
    if (!fields) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }
    const filteredFields = fields.filter((i) => typeof i === 'string');
    const filteredValues = values.filter((i) => typeof i === 'string');

    const id = ingredients[i].id;
    if (id) {
      const result = await conditionalUpdate('ingredients', id.toString(), filteredFields, filteredValues);
      if (!result) {
        return res.status(400).json({
          error: 'Nothing to update',
        })
      }
    }
  }
  res.json("updateIngredients");
}

async function updateRecipeRoute(req, res) {
  const { id } = req.params;
  const { user, recipeName, description, instructions, image } = req.body;
  console.log(req.body);
  if (user) {
    const fields = [
      isString(recipeName) ? 'name' : null,
      isString(description) ? 'description' : null,
      isString(instructions) ? 'instructions' : null,
      isString(image) ? 'image' : null
    ]
    const values = [
      isString(recipeName) ? recipeName : null,
      isString(description) ? description : null,
      isString(instructions) ? instructions : null,
      isString(image) ? image : null
    ]
    if (!fields) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }
    const filteredFields = fields.filter((i) => typeof i === 'string');
    const filteredValues = values.filter((i) => typeof i === 'string');

    if (id) {
      const result = await conditionalUpdate('recipes', id.toString(), filteredFields, filteredValues);
      if (!result) {
        return res.status(400).json({
          error: 'Nothing to update',
        })
      }
    }
  }
  res.json("updateRecipe");
}

async function deleteRecipeRoute(req, res) {
  const { id } = req.params;
  if (!isString(id)) {
    res.status(400).json({ message: 'Invalid id' });
    return;
  }
  const recipe = await getRecipeById(id);
  if (!recipe) {
    res.status(404).json({ message: 'Recipe not found' });
    return;
  }

  const result = await deleteRecipe(id);
  res.json(result.rows ? { message: 'Recipe successfully deleted' } : { message: 'Error deleting recipe' });
}

async function getRecipeById(id) {
  const recipe = await query(`
    SELECT * FROM recipes WHERE id = $1;
  `, [id]);
  if (recipe.rows === [] || recipe.rows.length === 0) {
    return null;
  }
  return recipe.rows[0];
}


async function createRecipeRoute(req, res) {
  const { name, description, instructions, image  } = req.body;
  const fields = [
    isString(name) ? name : null,
    isString(description) ? description : null,
    isString(instructions) ? instructions : null,
    isString(image) ? image : 'image'
  ]
  const values = [
    isString(name) ? name : null,
    isString(description) ? description : null,
    isString(instructions) ? instructions : null,
    isString(image) ? image : ''
  ]

  if (!fields) {
    res.status(400).json({ message: 'Missing required fields' });
    return;
  }

  const filteredFields = fields.filter((i) => typeof i === 'string');
  const filteredValues = values.filter((i) => typeof i === 'string');

  for (let i = 0; i < filteredValues.length; i++) {
    filteredValues[i] = xss(filteredValues[i]);
  }

  if (filteredFields.length === 0) {
    res.status(400).json({ message: 'Missing or illegal fields' });
  }

  if (filteredFields.length !== filteredValues.length) {
    return res.status(400).json({ error: 'Number of fields doesn\'t match number of values' });
  }

  const q = `
    INSERT INTO recipes
      (name, description, instructions, image)
    VALUES
      ($1, $2, $3, $4)
    RETURNING *;
  `;

  const queryValues = filteredValues;
  const result = await query(q, queryValues);

  if(result) {
    return res.status(200).json(result.rows[0]);
  }
  return res.status(400).json({ error: 'Failed to create recipe' });
}

async function getIngredientsRoute(req, res) {
  const { id } = req.params;
  const recipe = await getRecipeById(id);
  if (!recipe) {
    res.status(404).json({ message: 'Recipe not found' });
    return;
  }
  const q = `
    SELECT * FROM ingredients WHERE recipe_id = $1;
  `;
  const ingredients = await query(q, [id]);
  res.json(ingredients.rows);
}

async function addImageToRecipe(req, res) {
  const { id } = req.params;
  const recipe = await getRecipeById(id);
  if (!recipe) {
    res.status(404).json({ message: 'Recipe not found' });
    return;
  }
  const { image } = req.body;
  const q = `
    UPDATE recipes
    SET image = $1
    WHERE id = $2
    RETURNING *;
  `;
  const values = [xss(image), id];
  const result = await query(q, values);
  res.json(result.rows[0]);

  await uploadImage(image);
}


async function addIngredientsRoute(req, res) {
  const { id } = req.params;
  const { name, quantity, unit } = req.body;

  const fields = [
    isString(name) ? name : null,
    isString(quantity) ? quantity : null,
    isString(unit) ? unit : null
  ]
  const values = [
    isString(name) ? name : null,
    isString(quantity) ? quantity : null,
    isString(unit) ? unit : null
  ]

  if (!fields) {
    res.status(400).json({ message: 'Missing required fields' });
    return;
  }
  const filteredFields = fields.filter((i) => typeof i === 'string');
  const filteredValues = values.filter((i) => typeof i === 'string');

  if (filteredFields.length === 0) {
    res.status(400).json({ message: 'Missing or illegal fields' });
  }

  if (filteredFields.length !== filteredValues.length) {
    return res.status(400).json({ error: 'Number of fields doesn\'t match number of values' });
  }

  const q = (`
    INSERT INTO ingredients
      (name, quantity, unit, recipe_id)
    VALUES
      ($1, $2, $3, $4)
  `);

  filteredValues.push(id);
  const result = await query(q, filteredValues);
  if(result) {
    return res.status(200).json(result.rows[0]);
  }
  return res.status(400).json({ error: 'Failed to add ingredient' });
}

async function getRecipesByIngredient(req, res) {
  const { name } = req.params;
  if (!isString(name)) {
    res.status(400).json({ message: 'Invalid ingredient name' })
  }
  const recipe = await query (`
    SELECT * FROM recipes
    WHERE id = (
      SELECT recipe_id FROM ingredients
      WHERE name = $1
    );
  `, [name]);
  return res.json(recipe.rows[0]);
}

async function getRecipesByIngredients(req, res) {
  let queryString = `
  SELECT * FROM recipes WHERE id in (
    SELECT recipe_id
    FROM ingredients
    WHERE
  `;

  let ingredientNames = [];
  const bodyLength = req.body.length;
  for (let i=0; i<bodyLength; i++) {
    ingredientNames.push(req.body[i].ingredient);
    if (i === 0 ) {
      queryString += ` name = $1`
    } else {
      queryString += ` OR name = $${i + 1}`
    }
  }
  queryString += `
  GROUP BY recipe_id
  HAVING count(1) > ${bodyLength - 1} );
  `
  console.log('queryString: ' + queryString);
  const recipes = await query(queryString, ingredientNames);
  return res.json(recipes.rows[0]);
}


// TODO: Paging
recipeRouter.get('/', catchErrors(getAllRecipesRoute));
recipeRouter.get('/:id', catchErrors(getRecipeRoute));
recipeRouter.get('/:id/ingredients', catchErrors(getIngredientsRoute));
recipeRouter.post('/ingredients', catchErrors(getRecipesByIngredients));
recipeRouter.get('/ingredient/:name', catchErrors(getRecipesByIngredient));

recipeRouter.post(
  '/:id/ingredients',
  ensureLoggedIn, // TODO: Sanitization
  catchErrors(addIngredientsRoute)
);

recipeRouter.post(
  '/recipes/:id/addImage',
  //ensureLoggedIn, // TODO: Sanitization
  //requireAdmin,
  catchErrors(addImageToRecipe)
)

recipeRouter.post(
  '/',
  ensureLoggedIn,
  requireAdmin,
  validationCheck, // TODO: Validation og sanitization
  catchErrors(createRecipeRoute)
);

recipeRouter.patch(
  '/:id/ingredients',
  catchErrors(updateIngredientsRoute)
);

recipeRouter.patch(
  '/:id',
  //ensureLoggedIn,
  //requireAdmin, // TODO: Validation og sanitization
  catchErrors(updateRecipeRoute)
);

recipeRouter.delete(
  '/:id',
  ensureLoggedIn,
  requireAdmin,
  catchErrors(deleteRecipeRoute)
);