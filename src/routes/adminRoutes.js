import express from 'express';
import { catchErrors } from '../lib/catch-errors.js';

export const adminRouter = express.Router();

export async function adminRoute(req, res) {
  res.json();
}

adminRouter.get('/', catchErrors(adminRoute));

