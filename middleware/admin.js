const jsonWebToken = require('jsonwebtoken');

const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');


exports.adminProtection = async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
    token = req.headers.authorization.split(' ')[1];

  if (!token)
    return next(new ErrorResponse('You are not allowed to access this resource.', 401));


  try {
    const decoded = jsonWebToken.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user)
      return next(new ErrorResponse('Could not retrieve user information, please try again.', 404));

    if (user.type !== 'admin')
      return next(new ErrorResponse('You are not allowed to access this resource.', 403));

    req.user = user; next();

  } catch (error) { return next(new ErrorResponse('You are not allowed to access this resource.', 500))}
};