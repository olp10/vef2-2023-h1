import express from 'express';
import { requireAdmin } from '../auth/passport.js';
import { catchErrors } from '../lib/catch-errors.js';
import { query } from '../lib/db.js';
import { isString } from '../lib/isString.js';
import { validationCheck } from '../validation/helpers.js';

// root -> /recipes

export const recipeRouter = express.Router();

async function getAllRecipesRoute(req, res) {
  const q = 'SELECT * FROM recipes';
  const recipes = await query(q);
  res.json(recipes.rows);
}

async function getRecipeRoute(req, res) {
  const { id } = req.params;
  res.json(await getRecipe(id));
}

async function updateRecipeRoute(req, res) {
  const { id } = req.params;
  console.log("Triggered updateRecipeRoute");
  res.json("updateRecipe");
}

async function deleteRecipeRoute(req, res) {
  const { id } = req.params;
  console.log("Triggered deleteRecipeRoute");
  res.json("deleteRecipe");
}

async function getRecipe(id) {
  const recipe = await query(`
    SELECT * FROM recipes WHERE id = $1;
  `, [id]);

  return recipe.rows[0];
}

async function createRecipeRoute(req, res) {
  const { name, description, instructions, image  } = req.body;
  const fields = [
    isString(name) ? name : null,
    isString(description) ? description : null,
    isString(instructions) ? instructions : null,
    isString(image) ? image : null
  ]
  const values = [
    isString(name) ? name : null,
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

  if (filteredFields.length === 0) {
    // TODO: Mögulega skila villu?
    return [];
  }

  if (filteredFields.length !== filteredValues.length) {
    return res.status(400).json({ error: 'Failed to create recipe' });
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


// TODO: Paging
recipeRouter.get('/', catchErrors(getAllRecipesRoute));

recipeRouter.post(
  '/',
  // requireAdmin, // TODO: Authentication gengur ekki fyrr en búið að útfæra leið til að skrá sig inn sem admin
  validationCheck,
  catchErrors(createRecipeRoute)
);

recipeRouter.get('/:id', catchErrors(getRecipeRoute));

recipeRouter.patch(
  '/:id',
  // requireAdmin, // TODO: Authentication gengur ekki fyrr en búið að útfæra leið til að skrá sig inn sem admin
  catchErrors(updateRecipeRoute)
);

recipeRouter.delete(
  '/:id',
  // requireAdmin, // TODO: Authentication gengur ekki fyrr en búið að útfæra leið til að skrá sig inn sem admin
  catchErrors(deleteRecipeRoute)
);