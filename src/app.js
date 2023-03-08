import dotenv from 'dotenv';
import express from 'express';
import { router } from './routes/api.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { adminRouter } from './routes/adminRoutes.js';
import { indexRouter } from './routes/indexRoutes.js';

const app = express();

const path = dirname(fileURLToPath(import.meta.url));

// Fyrir gögn úr formi!
// app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(router);
app.use(indexRouter);
app.use('/admin', adminRouter);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});

app.use((err, req, res, next) => {
  console.error(err);
  const title = 'Villa kom upp';
  res.status(500).render('error', { title });
});

function notFoundHandler(req, res) {
  console.warn('Not found', req.originalUrl);
  res.status(404).render('error');
}

function errorHandler(err, req, res) {
  console.error(err);
  res.status(500).json({
    error: err.message,
  });
}

app.use(notFoundHandler);
app.use(errorHandler);