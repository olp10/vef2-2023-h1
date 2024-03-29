import bcrypt from 'bcrypt';
import xss from 'xss';

export async function comparePasswords(password, hash) {
  try {
    return await bcrypt.compare(password, hash);
  } catch (err) {
    console.error('Gat ekki borið saman lykilorð', e);
  }

  return false;
}

export async function findByUsername(username) {
  const q = `
    SELECT * FROM users WHERE username = $1;
  `;
  try {
    const result = await query(q, [username]);

    if (result.rowCount === 1) {
      return result.rows[0];
    }
  } catch (err) {
    console.error('Gat ekki fundið notanda eftir notendanafni');
    return null
  }

  return false;
}

export async function findById(id) {
  const q = 'SELECT * FROM users WHERE id = $1';

  try {
    const result = await query(q, [id]);

    if (result.rowCount === 1) {
      return result.rows[0];
    }
  } catch (e) {
    console.error('Gat ekki fundið notanda eftir id');
  }

  return null;
}

export async function createUser(username, password) {
  const hashedPassword = await bcrypt.hash(password, 11);

  const q = `
    INSERT INTO
      users (username, password)
    VALUES ($1, $2)
    RETURNING *
  `;

  try {
    const result = await query(q, [xss(username), hashedPassword]);
    return result.rows[0];
  } catch (e) {
    console.error('Gat ekki búið til notanda');
  }

  return null;
}
