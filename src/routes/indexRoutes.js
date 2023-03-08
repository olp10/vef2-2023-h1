import express from 'express';
import { catchErrors } from '../lib/catch-errors.js';

export const indexRouter = express.Router();

export async function indexRoute(req, res) {
    res.render('index');
}

export async function loginRoute(req, res) {
  // TODO: Grípa username/password úr req
  res.render('login');
}


indexRouter.get('/', catchErrors(indexRoute));
indexRouter.get('/login', catchErrors(loginRoute));