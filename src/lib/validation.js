import { body } from 'express-validator';
import xss from 'xss';


// Endurnýtum mjög líka validation
export function registrationValidationMiddleware(req, res) {
  const { username, password } = req.body;
  return [
    body(username)
      .trim()
      .isLength({ min: 1 })
      .withMessage('Nafn má ekki vera tómt'),
    body(username)
      .isLength({ max: 64 })
      .withMessage('Nafn má að hámarki vera 64 stafir'),
    body(password)
      .isLength({ max: 400 })
      .withMessage('Lögum má að hámarki vera 400 stafir'),
  ];
}

// FIXME: Þarf að laga þetta middleware
// Viljum keyra sér og með validation, ver gegn „self XSS“
export function xssSanitizationMiddleware(req, res, next) {
  const { username, password } = req.body;
  console.log(username, password);
  const sanitizedUsername = body(username).customSanitizer((v) => xss(v));
  const sanitizedPassword = body(password).customSanitizer((v) => xss(v));
  next();
}

export function sanitizationMiddleware(textField) {
  return [body('name').trim().escape(), body(textField).trim().escape()];
}