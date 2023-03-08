import { readFile } from 'fs/promises';
import pg from 'pg';
import dotenv from 'dotenv';

const SCHEMA_FILE = './sql/schema.sql';
const DROP_SCHEMA_FILE = './sql/drop.sql';
const DATA_DIR = './data';

dotenv.config();

const { DATABASE_URL: connectionString } =
  process.env;

const pool = new pg.Pool({ connectionString });

if (!connectionString) {
  console.error('vantar DATABASE_URL í .env');
  process.exit(-1);
}

pool.on('error', (err) => {
  console.error('Villa í tengingu við gagnagrunn, forrit hættir', err);
  process.exit(-1);
});

export async function query(q, values = []) {
  let client;
  try {
    client = await pool.connect();
  } catch (e) {
    console.error('unable to get client from pool', e);
    return null;
  }

  try {
    const result = await client.query(q, values);
    return result;
  } catch (e) {
      console.error('unable to query', e);
      return null;
  } finally {
    client.release();
  }
}


export async function createSchema(schemaFile = SCHEMA_FILE) {
  const data = await readFile(schemaFile);

  return query(data.toString('latin1'));
}

export async function dropSchema(dropFile = DROP_SCHEMA_FILE) {
  const data = await readFile(dropFile);

  return query(data.toString('latin1'));
}

export async function end() {
  await pool.end();
}

export async function registerUser(username, password, isAdmin) {
  const q = `
    INSERT INTO users
      (username, password, isAdmin)
    VALUES
      ($1, $2, $3)
    RETURNING
      username, password, isAdmin;
  `;
  const values = [username, password, isAdmin];
  const result = await query(q, values);

  if (result && result.rowCount === 1) {
    return result.rows[0];
  }

  return null;
}