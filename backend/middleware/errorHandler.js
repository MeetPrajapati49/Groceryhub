// Centralized error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Invalid data provided',
      details: messages
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      error: 'DUPLICATE_ERROR',
      message: `${field} already exists`
    });
  }

  // Mongoose cast error (invalid ObjectId etc.)
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'INVALID_ID',
      message: 'Invalid resource ID format'
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'INVALID_TOKEN',
      message: 'Invalid authentication token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'TOKEN_EXPIRED',
      message: 'Authentication token has expired'
    });
  }

  // CORS error
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({
      error: 'CORS_ERROR',
      message: 'Cross-origin request blocked'
    });
  }

  // Default server error
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: 'SERVER_ERROR',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};

export default errorHandler;
