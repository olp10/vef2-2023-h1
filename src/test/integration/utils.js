import crypto from 'crypto';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const {
  BASE_TEST_URL = 'http://localhost:5000',
  ADMIN_USER: adminUser = '',
  ADMIN_PASS: adminPass = '',
} = process.env;

export const baseUrl = BASE_TEST_URL;

export function randomValue() {
  return crypto.randomBytes(16).toString('hex');
}

export async function methodAndParse(method, path, data = null, token = null) {
  const url = new URL(path, baseUrl);

  const options = { headers: {} };

  if (method !== 'GET') {
    options.method = method;
  }

  if (data) {
    options.headers['content-type'] = 'application/json';
    options.body = JSON.stringify(data);
  }

  if (token) {
    options.headers.Authorization = `Bearer ${token}`;
  }

  const result = await fetch(url, options);

  let json;

  try {
    json = await result.json();
  } catch (e) {
    console.error('unable to parse json', e);
  }

  return {
    result: json,
    status: result.status,
  };
}

export async function fetchAndParse(path, token = null) {
  return methodAndParse('GET', path, null, token);
}

export async function postAndParse(path, data, token = null) {
  return methodAndParse('POST', path, data, token);
}

export async function patchAndParse(path, data, token = null) {
  return methodAndParse('PATCH', path, data, token);
}

export async function deleteAndParse(path, data, token = null) {
  return methodAndParse('DELETE', path, data, token);
}

export async function loginAndReturnToken(data) {
  const { result } = await postAndParse('/users/login', data);

  if (result && result.token) {
    return result.token;
  }

  return null;
}

export async function createRandomUserAndReturnWithToken() {
  const rnd = randomValue();
  const name = 'test-user';
  const username = `user${rnd}`;
  const email = `user${rnd}@example.org`;
  const password = '1234567890';

  const data = { name, username, password, email };
  const { result } = await postAndParse('/users/register', data);
  const token = await loginAndReturnToken({ username, password });

  return {
    user: result,
    token,
  };
}

export async function loginAsHardcodedAdminAndReturnToken() {
  const token = await loginAndReturnToken({
    username: adminUser,
    password: adminPass,
  });
  return token;
}