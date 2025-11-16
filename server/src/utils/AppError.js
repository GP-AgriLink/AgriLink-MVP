/**
 * @file AppError.js
 * @description Custom error class for handling operational errors (e.g., user input).
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message); // Call the parent Error constructor
    this.statusCode = statusCode;
    this.isOperational = true; // Mark it as an error we created on purpose

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
