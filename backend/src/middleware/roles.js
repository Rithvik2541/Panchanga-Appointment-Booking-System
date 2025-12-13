/**
 * Role-Based Access Control Middleware
 * Checks if authenticated user has required role
 */

/**
 * Middleware factory to check if user has one of the allowed roles
 * @param {Array<string>} allowedRoles - Array of allowed roles (e.g., ['ADMIN', 'CONSULTANT'])
 * @returns {Function} Express middleware function
 */
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    // Ensure user is authenticated (req.user should be set by auth middleware)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    // Check if user's role is in the allowed roles array
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.',
      });
    }

    // User has required role, proceed to next middleware/route handler
    next();
  };
};

module.exports = checkRole;
