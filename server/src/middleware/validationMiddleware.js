import { validationResult } from 'express-validator';

/**
 * @desc    Middleware to check for validation errors.
 * If errors exist, it sends a 400 response and stops the request.
 * If no errors, it calls next() to let the controller run.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Log the error for debugging (optional)
    // console.log('Validation Error:', errors.array());

    return res.status(400).json({
      message: 'Validation Error',
      errors: errors.array(),
    });
  }

  next();
};

export { validate };
