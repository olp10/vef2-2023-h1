import express from 'express';
import { indexRouter } from './indexRoutes.js';

export const router = express.Router();

export async function error() {
    throw new Error('error');
}

router.get('/', indexRouter);

