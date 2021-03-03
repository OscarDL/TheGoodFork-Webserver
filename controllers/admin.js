const JsonWebToken = require('jsonwebtoken');

const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');


exports.getUserAccounts = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
    token = req.headers.authorization.split(' ')[1];

  if (!token)
    return next(new ErrorResponse('Could not verify your rights, please try again or sign out then in again.', 401));


  try {

    const decoded = JsonWebToken.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user)
      return next(new ErrorResponse('Could not verify your account, please try again or sign out then in again.', 404));

    if (!user.type || user?.type !== 'admin')
      return next(new ErrorResponse('You are not allowed to get special accounts information.', 403));


    try {
      const users = await User.find({ type: { $eq: 'user' } });

      req.users = users;
      return res.status(200).json({ success: true, users });

    } catch (error) { return next(new ErrorResponse('Could not retrieve staff members, please try again.', 500)); }

    
  } catch (error) { return next(new ErrorResponse('Could not verify your account, please try again or sign out then in again.', 401)); }
};


exports.getSpecialAccounts = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
    token = req.headers.authorization.split(' ')[1];

  if (!token)
    return next(new ErrorResponse('Could not verify your rights, please try again or sign out then in again.', 401));


  try {

    const decoded = JsonWebToken.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user)
      return next(new ErrorResponse('Could not verify your account, please try again or sign out then in again.', 404));

    if (!user.type || user?.type !== 'admin')
      return next(new ErrorResponse('You are not allowed to get special accounts information.', 403));


    try {
      const users = await User.find({ type: { $ne: 'user' } });

      req.users = users;
      return res.status(200).json({ success: true, users });

    } catch (error) { return next(new ErrorResponse('Could not retrieve staff members, please try again.', 500)); }

    
  } catch (error) { return next(new ErrorResponse('Could not verify your account, please try again or sign out then in again.', 401)); }
};