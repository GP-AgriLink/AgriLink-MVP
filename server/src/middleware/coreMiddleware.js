import express from 'express';
import handleJsonSyntaxError from './jsonErrorHandler.js';
import requireJson from './requireJson.js'; // Make sure you have this file
import sanitizeReq from './sanitizeMiddleware.js';

// Export an array of middleware in the exact order they should run
const coreMiddleware = [
  // 1. Parse JSON
  express.json(),

  // 2. Handle Syntax Errors (e.g., trailing commas)
  handleJsonSyntaxError,

  // 3. Enforce Content-Type header
  requireJson,

  // 4. Security Sanitization
  sanitizeReq,
];

export default coreMiddleware;
