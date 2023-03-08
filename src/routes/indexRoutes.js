import express from 'express';
import { catchErrors } from '../lib/catch-errors.js';

export const indexRouter = express.Router();

export async function indexRoute(req, res) {
    res.render('index');
}


indexRouter.get('/', catchErrors(indexRoute));