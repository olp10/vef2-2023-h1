import { readFile } from 'fs/promises';
import { createSchema, dropSchema, end, query } from './lib/db.js';
import { faker } from '@faker-js/faker';
import { listImages, uploadImage } from './lib/cloudinary.js';

async function create() {
  await uploadImage(faker.image.imageUrl());
  await listImages();
  const drop = await dropSchema();

  if (drop) {
    console.info('schema dropped');
  } else {
    console.info('schema not dropped, exiting');
    process.exit(-1);
  }

  const result = await createSchema();

  if (result) {
    console.info('schema created');
  } else {
    console.info('schema not created');
  }

  const data = await readFile('./sql/insert.sql');
  const insert = await query(data.toString('utf-8'));

  if (insert) {
    console.info('data inserted');
  } else {
    console.info('data not inserted');
  }

  await fakeUsers();
  await fakeRecipes();

  await end();
}

async function fakeUsers() {
  for (let i = 0; i < 20; i++) {
    const username = {
      name: faker.internet.userName(),
      password: faker.internet.password(20),
      isAdmin: false,
    }
    const q = `
      INSERT INTO users (username, password, isAdmin)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [
      username.name,
      username.password,
      username.isAdmin
    ]
    console.log(values);
    await query(q, values);
  }
}

async function fakeRecipes() {
  for (let i = 0; i < 20; i++) {
    const name = faker.lorem.word();
    const instructions = faker.lorem.sentences(5);
    const description = faker.lorem.sentences(3);
    const image = faker.image.food();
    const q = `
      INSERT INTO recipes (name, instructions, description, image)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [
      name,
      instructions,
      description,
      image
    ]
    const res = await query(q, values);
    const { id } = res.rows[0];
    await fakeIngredients(id);
    await fakeReviews(id);
  }
}

async function fakeIngredients(id) {
  for (let i = 0; i < 10; i++) {
    const name = faker.lorem.word(20) + i;
    const quantity = faker.random.numeric({ min: 1, max: 10 });
    const unit = faker.helpers.arrayElement(['kg', 'g', 'ml', 'l']);
    const q = `
      INSERT INTO ingredients (name, quantity, unit, recipe_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [
      name,
      quantity,
      unit,
      id
    ]
    await query(q, values);
  }
}

async function fakeReviews(recipeId) {
  for (let i = 0; i < 10; i++) {
    const rating = faker.random.numeric({ min: 1, max: 5 });
    const userId = faker.random.numeric({ min: 1, max: 20 });
    const comment = faker.lorem.sentences(5);
    const q = `
      INSERT INTO reviews (recipe_id, rating, user_id, comment)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [
      recipeId,
      rating,
      userId,
      comment
    ]
    await query(q, values);
  }
}

create().catch((err) => {
  console.error('Error creating running setup', err);
});