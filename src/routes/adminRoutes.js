import express from 'express';
import { catchErrors } from '../lib/catch-errors.js';

export const adminRouter = express.Router();

export async function adminRoute(req, res) {
  res.render('admin');
}

// Hmmm.. hefði haldið að rótin (/) hér myndi losa mann við að skrifa admin?
adminRouter.get('/admin', catchErrors(adminRoute));

