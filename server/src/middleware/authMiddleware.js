/**
 * @file authMiddleware.js
 * @description Middleware to protect routes by verifying a JWT.
 */
import jwt from 'jsonwebtoken';
import User from '../models/User.js'; // Import User, not Farmer

/**
 * Middleware function that checks for a valid JWT in the Authorization header.
 * If valid, it decodes the payload, finds the associated user, and attaches
 * the user object to the request (`req.user`) for use in subsequent controllers.
 */
const protect = async (req, res, next) => {
  let token;

  // Check for "Bearer <token>" in the Authorization header.
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract the token string.
      token = req.headers.authorization.split(' ')[1];

      // Verify the token's signature and expiration.
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find the user by the ID from the token's payload.
      // .select('-password') prevents the hashed password from being returned.
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res
          .status(401)
          .json({ message: 'Not authorized, user not found' });
      }

      // Proceed to the next middleware or the route's controller.
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  // If no token is found in the header, deny access.
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

/**
 * @desc    Authorize specific roles
 */
const isFarmer = (req, res, next) => {
  if (req.user && req.user.role === 'farmer') {
    next();
  } else {
    res.status(403); // Forbidden
    return res
      .status(403)
      .json({ message: 'Access denied. Farmer role required.' });
  }
};

/**
 * @desc    Authorize Admin only
 */
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403); // Forbidden
    throw new Error('Access denied. Admin privileges required.');
  }
};

const isDriver = (req, res, next) => {
  if (req.user && req.user.role === 'delivery') {
    next();
  } else {
    res.status(403);
    throw new Error('Access denied. Delivery role required.');
  }
};

export { protect, isFarmer, isAdmin, isDriver };
