import express from 'express';
import jwt from 'jsonwebtoken';
import { catchErrors } from '../lib/catchErrors.js';
import { logger } from '../lib/logger.js';
import { validationCheck } from '../validation/helpers.js';
import {
  atLeastOneBodyValueValidator,
  emailDoesNotExistValidator,
  emailValidator,
  passwordValidator,
  usernameAndPaswordValidValidator,
  usernameDoesNotExistValidator,
  usernameValidator,
} from '../validation/validators.js';
import { jwtOptions, requireAdmin, requireAuthentication, tokenOptions } from './passport.js';
import { createUser, findById, findByUsername, updateUser } from './users.js';

/**
 * Skilgreinir API fyrir nýskráningu, innskráningu notanda, ásamt því að skila
 * upplýsingum um notanda og uppfæra þær.
 */

export const router = express.Router();

async function registerRoute(req, res) {
  const { username, email, password = '' } = req.body;

  const result = await createUser(username, email, password);

  delete result.password;

  return res.status(201).json(result);
}

async function loginRoute(req, res) {
  const { username } = req.body;

  const user = await findByUsername(username);

  if (!user) {
    logger.error('Unable to find user', username);
    return res.status(500).json({});
  }

  const payload = { id: user.id };
  const token = jwt.sign(payload, jwtOptions.secretOrKey, tokenOptions);
  delete user.password;

  return res.json({
    user,
    token,
    expiresIn: tokenOptions.expiresIn,
  });
}



async function updateCurrentUserRoute(req, res) {
  const { id } = req.user;

  const user = await findById(id);

  if (!user) {
    // shouldn't happen
    logger.error('Unable to update user by id', id);
    return res.status(500).json(null);
  }

  const { password, email } = req.body;

  const result = await updateUser(id, password, email);

  if (!result) {
    return res.status(400).json({ error: 'Nothing to update' });
  }

  return res.status(200).json(result);
}

router.post(
  '/users/register',
  usernameValidator,
  emailValidator,
  passwordValidator,
  usernameDoesNotExistValidator,
  validationCheck,
  catchErrors(registerRoute)
);

router.post(
  '/users/login',
  usernameValidator,
  passwordValidator,
  usernameAndPaswordValidValidator,
  validationCheck,
  catchErrors(loginRoute)
);



router.patch(
  '/users/me',
  requireAdmin,
  emailValidator,
  passwordValidator,
  emailDoesNotExistValidator,
  atLeastOneBodyValueValidator(['email', 'password']),
  validationCheck,
  catchErrors(updateCurrentUserRoute)
);