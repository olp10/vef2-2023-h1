import { readFile } from 'fs/promises';
import { createSchema, dropSchema, end, query } from './lib/db.js';
import { faker } from '@faker-js/faker';

async function create() {
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

  for (let i = 0; i < 20; i++) {
    await fakeUser();
  }

  await end();
}

create().catch((err) => {
  console.error('Error creating running setup', err);
});


async function fakeUser() {
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
