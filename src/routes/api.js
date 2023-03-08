import express from 'express';
import { adminRouter } from './adminRoutes.js';
import { indexRouter } from './indexRoutes.js';

export const router = express.Router();

export async function error() {
    throw new Error('error');
}

router.get('/admin', adminRouter);
router.get('/', indexRouter);

