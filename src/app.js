import dotenv from 'dotenv';
import express from 'express';
import session from 'express-session';
import passport from './lib/login.js';
import { router } from './routes/api.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { adminRouter } from './routes/adminRoutes.js';
import { indexRouter } from './routes/indexRoutes.js';
import { recipeRouter } from './routes/recipeRoutes.js';
import { userRouter } from './routes/userRoutes.js';
import { isInvalid } from './lib/template-helpers.js';

const app = express();

dotenv.config();

const path = dirname(fileURLToPath(import.meta.url));

app.use(express.json());

const port = process.env.PORT || 3001;

const {
  SESSION_SECRET: sessionSecret,
} = process.env;

app.use(
  session({
    secret: sessionSecret,
    resave: true,
    saveUninitialized: true,
    cookie: {
      maxAge: 20 * 1000,
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.locals = {
  isInvalid,
};

app.use(router);
app.use(userRouter);
app.use('/', indexRouter);
app.use('/admin', adminRouter);
app.use('/recipes', recipeRouter)

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
  res.status(404).json('error');
}

function errorHandler(err, req, res) {
  console.error(err);
  res.status(500).json({
    error: err.message,
  });
}

app.use(notFoundHandler);
app.use(errorHandler);