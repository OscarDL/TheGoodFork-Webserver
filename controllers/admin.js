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


exports.registerStaffAccount = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
    token = req.headers.authorization.split(' ')[1];

  if (!token)
    return next(new ErrorResponse('Could not verify your rights, please try again or sign out then in again.', 401));


  const {firstName, lastName, email, password, passCheck, type} = req.body;

  try {
    // Check for staff registration rights
    const decoded = JsonWebToken.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (user.type !== 'admin')
      return next(new ErrorResponse('You are not allowed to register a new staff member.', 403));

    // Do all checks for field entries before checking uniqueness of username & email address
    if (!(firstName && lastName && email && password && passCheck && type))
      return next(new ErrorResponse('Please fill in all the fields.', 400));

    if (password.length < 6)
      return next(new ErrorResponse('Password needs to be at least 6 characters long.', 400));

    if (password !== passCheck)
      return next(new ErrorResponse('Passwords do not match.', 400));

      
    // Check uniqueness of email address
    const emailExists = await User.findOne({email});
    if (emailExists)
      return next(new ErrorResponse(`Email address '${email}' is already in use, please register with a different one.`, 409));


    const staff = await User.create({firstName, lastName, email, password, type});

    return res.status(201).json({
      success: true,
      data: `${staff.firstName} ${staff.lastName} successfully registered.`
    })

  } catch (error) { next(new ErrorResponse(`Could not register staff member.`, 400)); }
};


exports.updateStaffAccount = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
    token = req.headers.authorization.split(' ')[1];

  if (!token)
    return next(new ErrorResponse('Could not verify your rights, please try again or sign out then in again.', 401));


  const id = req.params.id;

  try {
    // Check for staff registration rights
    const decoded = JsonWebToken.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (user.type !== 'admin')
      return next(new ErrorResponse('You are not allowed to update a staff member.', 403));


    const staff = await User.findOne({_id: id});

    if (!staff)
      return next(new ErrorResponse('Staff account could not be updated.', 404));

    staff.firstName = req.body.firstName;
    staff.lastName = req.body.lastName;
    staff.email = req.body.email;
    staff.type = req.body.type;

    await staff.save();

    return res.status(201).json({
      success: true,
      data: 'Account updated successfully.'
    })

  } catch (error) { next(new ErrorResponse('Could not update staff member.', 400)); }
};


exports.deleteStaffAccount = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
    token = req.headers.authorization.split(' ')[1];

  if (!token)
    return next(new ErrorResponse('Could not verify your rights, please try again or sign out then in again.', 401));


  const id = req.params.id;

  try {
    // Check for staff registration rights
    const decoded = JsonWebToken.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (user.type !== 'admin')
      return next(new ErrorResponse('You are not allowed to delete a staff member.', 403));


    const deleted = await User.deleteOne({_id: id});

    if (!deleted)
      return next(new ErrorResponse('Staff account could not be deleted.', 400));

    return res.status(201).json({
      success: true,
      data: 'Account successfully deleted.'
    })

  } catch (error) { next(error) }
};