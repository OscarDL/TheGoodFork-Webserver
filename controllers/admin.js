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


exports.getStaffAccounts = async (req, res, next) => {
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


exports.updateStaffAccount = async (req, res, next) => {
  const id = req.params.id;

  try {

    const user = await User.findOne({_id: id});

    if (!user)
      return next(new ErrorResponse('Staff account could not be updated.', 404));

    user.firstName = req.body.firstName;
    user.lastName = req.body.lastName;
    user.email = req.body.email;
    user.type = req.body.type;

    await user.save();

    return res.status(201).json({
      success: true,
      data: 'Staff account was successfully updated.'
    })

  } catch (error) { next(error) }
};


exports.deleteStaffAccount = async (req, res, next) => {
  const id = req.params.id;

  try {

    const deleted = await User.deleteOne({_id: id});

    if (!deleted)
      return next(new ErrorResponse('Staff account could not be deleted.', 400));

    return res.status(201).json({
      success: true,
      data: 'Staff account was successfully deleted.'
    })

  } catch (error) { next(error) }
};