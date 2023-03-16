import express from 'express';
import passport from 'passport';
import { addUserIfAuthenticated } from '../auth/passport.js';
import { comparePasswords, createUser, findByUsername } from '../auth/users.js';
import { catchErrors } from '../lib/catch-errors.js';
import { ensureLoggedIn } from '../lib/login.js';
import { xssSanitizationMiddleware } from '../lib/validation.js';
import { validateUser } from '../validation/validators.js';

export const userRouter = express.Router();

export async function userRoute(req, res) {
  const q = 'SELECT * FROM users';
  const users = await query(q);
  res.status(200).json(users.rows);
}

export async function loginRoute(req, res) {
  console.log("LoginRoute triggered");
  if (req.isAuthenticated()) {
    res.status(200).json({
      message: 'Successfully logged in',
    })
  } else {
    res.status(400).json({
      message: 'Unable to log in',
    })
  }
}

export async function logoutRoute(req, res) {
  console.log("LogoutRoute triggered");
  req.logout(function (err) {
    if (err) { return next(err); }
    res.status(200).json({
      message: 'Logged out',
    })
  });
}

export async function registerUserRoute(req, res) {
  const { username, password } = req.body;

  if (!username && !password) {
    res.status(400).json({ message: 'Missing required fields: username, password' });
    return;
  }
  if (!username) {
    res.status(400).json({ message: 'Missing required field: username' });
    return;
  }
  if (!password) {
    res.status(400).json({ message: 'Missing required field: password' });
    return;
  }

  createUser(username, password);
  res.status(200).json({ message: 'User created' });
}

userRouter.post(
  '/register', // TODO: Sanitization, Validation
  catchErrors(registerUserRoute)
);

userRouter.post(
  '/login',
  xssSanitizationMiddleware,
  validateUser,
  passport.authenticate('local', {
    failureMessage: 'Notendanafn eða lykilorð vitlaust.',
    failureRedirect: '/login',
  }),
  addUserIfAuthenticated,
  catchErrors(loginRoute)
);

userRouter.post(
  '/logout',
  ensureLoggedIn,
  catchErrors(logoutRoute)
)