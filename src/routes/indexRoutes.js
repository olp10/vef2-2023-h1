import express from 'express';
import { catchErrors } from '../lib/catch-errors.js';

export const indexRouter = express.Router();

export async function indexRoute(req, res) {
  // TODO: GET á / skal skila lista af slóðum í mögulegar aðgerðir.
  res.json();
}

export async function loginRoute(req, res) {
  res.json();
}


indexRouter.get('/', catchErrors(indexRoute));
indexRouter.get('/login', catchErrors(loginRoute));