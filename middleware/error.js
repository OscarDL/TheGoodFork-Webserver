const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
  let error = {...err};
  error.message = err.message;

  if (err.code === 1100) error = new ErrorResponse('Username or Email address are already in use. Please try with different entries.', 400);

  if (err.name === 'ValidationError') error = new ErrorResponse(
    Object.values(err.errors).map(val => val.message), 400
  );

  res.status(err.statusCode || 500).json({
    success: false,
    error: error.message || 'Server error: something went wrong.'
  });
};

module.exports = errorHandler;