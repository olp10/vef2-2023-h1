import express from 'express';
import { catchErrors } from '../lib/catch-errors.js';

export const indexRouter = express.Router();

export async function indexRoute(req, res) {
  const allRoutes = [
    'GET / -> Skilar lista af mögulegum aðgerðum',
    'GET /recipes -> Skilar öllum uppskriftum',
    'GET /recipes/:id -> Skilar uppskrift',
    'GET /recipes/:id/ingredients -> Skilar lista af hráefnum í uppskrift',
    'POST /recipes -> Býr til nýja uppskrift',
    'POST /recipes/:id/ingredients -> Bætir hráefnum við uppskrift',
    'PATCH /recipes/:id -> Uppfærir uppskrift',
    'DELETE /recipes/:id -> Eyðir uppskrift',
    'POST /login -> skráir notanda inn',
    'POST /logout -> skráir notanda út',
    'POST /register -> stofnar nýjan notanda',
  ]
  res.status(200).json(allRoutes);
}

export async function loginRoute(req, res) {
  res.json();
}


indexRouter.get('/', catchErrors(indexRoute));