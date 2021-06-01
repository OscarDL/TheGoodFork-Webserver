const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
  let error = {...err};
  error.message = err.message;

  if (err.name === 'ValidationError') error = new ErrorResponse(
    Object.values(err.errors).map(val => val.message), 400
  );

  res.status(err.statusCode || 500).json({
    success: false,
    error: error.message || 'Une erreur est survenue.'
  });
};

module.exports = errorHandler;