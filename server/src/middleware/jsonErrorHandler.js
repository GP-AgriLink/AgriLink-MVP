/**
 * @desc    Middleware to catch JSON syntax errors (like trailing commas)
 * thrown by express.json()
 */
const handleJsonSyntaxError = (err, req, res, next) => {
  // Check if the error is a SyntaxError thrown by body-parser
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      message:
        'Invalid JSON format. Please check for syntax errors (like trailing commas).',
    });
  }

  // If it's not a JSON error, pass it to the next error handler
  next(err);
};

export default handleJsonSyntaxError;
