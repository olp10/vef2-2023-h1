import express from 'express';
import { catchErrors } from '../lib/catch-errors.js';

export const indexRouter = express.Router();

export async function indexRoute(req, res) {
    res.json();
}

export async function loginRoute(req, res) {
  res.json();
}


indexRouter.get('/', catchErrors(indexRoute));
indexRouter.get('/login', catchErrors(loginRoute));