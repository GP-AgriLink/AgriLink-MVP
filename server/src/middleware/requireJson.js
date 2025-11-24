const requireJson = (req, res, next) => {
  // Allow GET/DELETE requests (they usually don't have bodies)
  if (req.method === 'GET' || req.method === 'DELETE') {
    return next();
  }

  // Check Content-Type header
  const contentType = req.headers['content-type'];

  if (!contentType || !contentType.includes('application/json')) {
    return res.status(415).json({
      message:
        "Unsupported Media Type. Please send 'Content-Type: application/json'",
    });
  }

  next();
};

export default requireJson;
