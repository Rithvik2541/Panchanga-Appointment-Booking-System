/**
 * Global Error Handler Middleware
 * Catches and formats all errors in the application
 */

/**
 * Express error handling middleware
 * Should be used as the last middleware in the app
 */
const errorHandler = (err, req, res, next) => {
  // Log error for debugging
  console.error('Error:', err);

  // Default error status and message
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went wrong';

  // Send JSON error response
  res.status(statusCode).json({
    success: false,
    message: message,
    // Include stack trace in development mode
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
