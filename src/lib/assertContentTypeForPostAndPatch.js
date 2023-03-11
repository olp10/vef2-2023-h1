export function assertContentTypeForPostAndPatch(req, res, next) {
  if (req.method === 'POST' || req.method === 'PATCH') {
    if (
      req.headers['content-type'] &&
      req.headers['content-type'] !== 'application/json' &&
      !req.headers['content-type'].startsWith('multipart/form-data;')
    ) {
      return res.status(400).json({ error: 'body must be json or form-data' });
    }
  }
  return next();
}