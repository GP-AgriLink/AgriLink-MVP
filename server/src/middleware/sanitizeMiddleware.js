import sanitize from 'mongo-sanitize';

const sanitizeReq = (req, res, next) => {
  if (req.body) {
    req.body = sanitize(req.body);
  }

  if (req.params) {
    req.params = sanitize(req.params);
  }

  // We iterate over keys to avoid the "Cannot set property query" error
  if (req.query) {
    for (const key in req.query) {
      req.query[key] = sanitize(req.query[key]);
    }
  }

  next();
};

export default sanitizeReq;
