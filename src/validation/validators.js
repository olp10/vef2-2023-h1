import { body, param, query } from 'express-validator';
import {
  comparePasswords,
  findByEmail,
  findByUsername,
} from '../auth/users.js';
import { logger } from '../lib/logger.js';
import { resourceExists } from './helpers.js';

/**
 * Collection of validators based on express-validator
 */

export async function validateUser(req, res) {
  const { username, password } = req.body;
  const user = await findByUsername(username);
  if (!user) {
    res.status(400).json({ message: 'Invalid username or password' });
    return;
  }
  const valid = await comparePasswords(password, user.password);
  if (!valid) {
    res.status(400).json({ message: 'Invalid username or password' });
    return;
  }
  req.login(user, function (err) {
    if (err) { return next(err); }
    res.status(200).json({ message: 'Successfully logged in' });
  });
}

export const pagingQuerystringValidator = [
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('query parameter "offset" must be an int, 0 or larget'),
  query('limit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('query parameter "limit" must be an int, larger than 0'),
];

// TODO make sure it exists
export const categoryQuerystringValidator = [
  query('category')
    .optional()
    .isInt({ min: 1 })
    .withMessage('query parameter "category" must be an int, 1 or larget'),
];

export const searchQuerystringValidator = [
  query('search')
    .optional()
    .isString({ min: 1 })
    .withMessage('query parameter "search" must be an string'),
];

export function validateResourceExists(fetchResource, paramName = 'id') {
  return [
    param(paramName)
      .custom(resourceExists(fetchResource))
      .withMessage('not found'),
  ];
}

export function validateResourceNotExists(fetchResource) {
  return [
    param('id')
      .not()
      .custom(resourceExists(fetchResource))
      .withMessage('already exists'),
  ];
}

export const usernameValidator = body('username')
  .isLength({ min: 1, max: 256 })
  .withMessage('username is required, max 256 characters');

const isPatchingAllowAsOptional = (value, { req }) => {
  if (!value && req.method === 'PATCH') {
    return false;
  }

  return true;
};

export const titleValidator = body('title')
  .if(isPatchingAllowAsOptional)
  .isLength({ min: 1, max: 256 })
  .withMessage('title is required, max 128 characters');

export const nameValidator = body('name')
  .isLength({ min: 1, max: 256 })
  .withMessage('title is required, max 255 characters');

export const priceValidator = body('price')
  .if(isPatchingAllowAsOptional)
  .isInt({ min: 1 })
  .withMessage('number must be an integer larger than 0');

// TODO make sure it exists
export const categoryValidator = body('category')
  .if(isPatchingAllowAsOptional)
  .isInt({ min: 1 })
  .withMessage('category must be an integer larger than 0');

// TODO make sure it exists
export const productIdValidator = body('product')
  .isInt({ min: 1 })
  .withMessage('product id must be an integer larger than 0');

export const quantityValidator = body('quantity')
  .isInt({ min: 1 })
  .withMessage('quantity must be an integer larger than 0');

export const emailValidator = body('email')
  .if(isPatchingAllowAsOptional)
  .isLength({ min: 1, max: 256 })
  .isEmail()
  .withMessage('email is required, max 256 characters');

export const passwordValidator = body('password')
  .if(isPatchingAllowAsOptional)
  .isLength({ min: 10, max: 256 })
  .withMessage('password is required, min 10 characters, max 256 characters');

export const emailDoesNotExistValidator = body('email').custom(
  async (email) => {
    const user = await findByEmail(email);

    if (user) {
      return Promise.reject(new Error('email already exists'));
    }
    return Promise.resolve();
  }
);

export const usernameDoesNotExistValidator = body('username').custom(
  async (username) => {
    const user = await findByUsername(username);

    if (user) {
      return Promise.reject(new Error('username already exists'));
    }
    return Promise.resolve();
  }
);

export const usernameAndPaswordValidValidator = body('username').custom(
  async (username, { req: { body: reqBody } = {} }) => {
    // Can't bail after username and password validators, so some duplication
    // of validation here
    // TODO use schema validation instead?
    const { password } = reqBody;

    if (!username || !password) {
      return Promise.reject(new Error('skip'));
    }

    let valid = false;
    try {
      const user = await findByUsername(username);
      valid = await comparePasswords(password, user.password);
    } catch (e) {
      // Here we would track login attempts for monitoring purposes
      logger.info(`invalid login attempt for ${username}`);
    }

    if (!valid) {
      return Promise.reject(new Error('username or password incorrect'));
    }
    return Promise.resolve();
  }
);

export const adminValidator = body('admin')
  .exists()
  .withMessage('admin is required')
  .isBoolean()
  .withMessage('admin must be a boolean')
  .bail()
  .custom(async (admin, { req: { user, params } = {} }) => {
    let valid = false;

    const userToChange = parseInt(params.id, 10);
    const currentUser = user.id;

    if (Number.isInteger(userToChange) && userToChange !== currentUser) {
      valid = true;
    }

    if (!valid) {
      return Promise.reject(new Error('admin cannot change self'));
    }
    return Promise.resolve();
  });

export const descriptionValidator = body('description')
  .if(isPatchingAllowAsOptional)
  .isString({ min: 1 })
  .withMessage('description must be a string');

const MIMETYPES = ['image/jpeg', 'image/png', 'image/gif'];

function validateImageMimetype(mimetype) {
  return MIMETYPES.indexOf(mimetype.toLowerCase()) >= 0;
}

export const imageValidator = body('image').custom(
  async (image, { req = {} }) => {
    const { file: { path, mimetype } = {} } = req;

    if (!path && !mimetype && req.method === 'PATCH') {
      return Promise.resolve();
    }

    if (!path && !mimetype) {
      return Promise.reject(new Error('image is required'));
    }

    if (!validateImageMimetype(mimetype)) {
      const error =
        `Mimetype ${mimetype} is not legal. ` +
        `Only ${MIMETYPES.join(', ')} are accepted`;
      return Promise.reject(new Error(error));
    }

    return Promise.resolve();
  }
);

export const ORDER_STATUS = ['NEW', 'PREPARE', 'COOKING', 'READY', 'FINISHED'];

export const validateStatus = body('status')
  .isIn(ORDER_STATUS)
  .withMessage(`status must be one of ${ORDER_STATUS.join(', ')}`);

export function atLeastOneBodyValueValidator(fields) {
  return body().custom(async (value, { req }) => {
    const { body: reqBody } = req;

    let valid = false;

    for (let i = 0; i < fields.length; i += 1) {
      const field = fields[i];

      if (field in reqBody && reqBody[field] != null) {
        valid = true;
        break;
      }
    }

    if (!valid) {
      return Promise.reject(
        new Error(`require at least one value of: ${fields.join(', ')}`)
      );
    }
    return Promise.resolve();
  });
}

export const validateCartExists = body('cart').custom(async (cartid) => {
  const cart = await getCart(cartid);

  if (!cart) {
    return Promise.reject(new Error('cart does not exists'));
  }
  return Promise.resolve();
});

export const productValidator = [
  titleValidator,
  priceValidator,
  descriptionValidator,
  imageValidator,
  categoryValidator,
];