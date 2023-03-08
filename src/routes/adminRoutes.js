import express from 'express';
import { catchErrors } from '../lib/catch-errors.js';

export const adminRouter = express.Router();

export async function adminRoute(req, res) {
  res.render('admin');
}

adminRouter.get('/', catchErrors(adminRoute));

