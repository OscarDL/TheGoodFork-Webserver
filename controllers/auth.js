require('dotenv').config({path: './config.env'});

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const stripe = require('stripe')(process.env.STRIPE_SK);

const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const ErrorResponse = require('../utils/errorResponse');


exports.register = async (req, res, next) => {
  const {firstName, lastName, email, password, passCheck, type} = req.body;
      
  // Do all checks for field entries before checking uniqueness of username & email address
  if (!(firstName && lastName && email && password && passCheck && type))
    return next(new ErrorResponse('Please fill in all the fields.', 400));

  if (password.length < 6)
    return next(new ErrorResponse('Your password needs to be at least 6 characters long.', 400));

  if (password !== passCheck)
    return next(new ErrorResponse('Passwords do not match.', 400));


  try {
    // Check uniqueness of email address
    const emailExists = await User.findOne({email});
    if (emailExists)
      return next(new ErrorResponse(`Email address '${email}' is already in use, please register with a different one.`, 409));

    let stripeUser;
    if (type === 'user')
      stripeUser = await stripe.customers.create({email, name: `${firstName} ${lastName}`});

    const user = await User.create({firstName, lastName, email, password, type, stripeId: stripeUser.id});

    user.password = undefined;
    return sendToken(user, 201, res);

  } catch (error) { next(new ErrorResponse('Could not create account.', 500)); }
};


exports.login = async (req, res, next) => {
  const {email, password} = req.body;

  if (!email || !password)
    return next(new ErrorResponse('Please provide both email and password to login.', 400));


  try {
    const user = await User.findOne({email}).select('+password');

    if (!user)
      return next(new ErrorResponse('Invalid credentials.', 401));

    const isMatch = await user.matchPasswords(password);

    if(!isMatch)
      return next(new ErrorResponse('Invalid credentials.', 401));

    user.password = undefined;
    return sendToken(user, 200, res);

  } catch (error) { next(new ErrorResponse('Could not sign you in.', 500)); }
};


exports.forgotpw = async (req, res, next) => {
  const {email} = req.body;

  if (!email)
    return next(new ErrorResponse('Please provide your email address.', 400));


  try {
    const user = await User.findOne({email});

    if (!user)
      return next(new ErrorResponse('Email address could not be found.', 404));

    const resetToken = user.getResetPasswordToken();
    await user.save();

    const content = `
      <h2>${user?.firstName || user?.email},</h2>
      <h3>You requested a password reset.</h3><br/>
      <p>Please copy this reset code back inside the app:
        <br/>${resetToken}
      </p><br/>
      <p>If the reset code matches, your account will be secured with your new password.</p>
      <h4>Thank you for using our services and making your account more secure.</h4>
      <p>The Good Fork &copy; - 2021</p>
    `;

    sendEmail({email, subject: 'The Good Fork - Password Reset Request', content});

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      data: 'Email sent successfully.'
    });

  } catch (error) { next(new ErrorResponse('Email could not be sent.', 500)); }

};


exports.resetpw = async (req, res, next) => {
  const {password, passCheck} = req.body;
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');

  if (!password || !passCheck)
    return next(new ErrorResponse('Please type-in and confirm your new password.', 400));

  if (password.length < 6)
    return next(new ErrorResponse('Your password should be at least 6 characters long.', 400));

  if (password !== passCheck)
    return next(new ErrorResponse('Passwords do not match.', 400));


  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: {$gt: Date.now()} // Check if current time is still in the token expiration timeframe
    });

    if (!user)
      return next(new ErrorResponse('The token to reset your password is wrong or has expired. Please reset your password within 15 minutes of sending the reset request.', 400));

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return res.status(201).json({
      success: true,
      data: 'Password has been reset successfully.'
    });
  
  } catch (error) { next(new ErrorResponse('Could not reset your password.', 500)) }
};


exports.userinfo = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
    token = req.headers.authorization.split(' ')[1];

  if (!token)
    return next(new ErrorResponse('Could not get user info, please try again or sign out then in again.', 401));


  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user)
      return next(new ErrorResponse('Could not get user info, please try again or sign out then in again.', 404));

    return res.status(200).json({success: true, user});

  } catch (error) { return next(new ErrorResponse('Could not get user info, please try again or sign out then in again.', 401)); }
};


exports.deleteUser = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
    token = req.headers.authorization.split(' ')[1];

  if (!token)
    return next(new ErrorResponse('Could not get user info, please try again or sign out then in again.', 401));


  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByIdAndDelete(decoded.id);

    if (!user)
      return next(new ErrorResponse('Could not get user info, please try again or sign out then in again.', 404));

    return res.status(200).json({success:true});

  } catch (error) { return next(new ErrorResponse('Could not delete your account, please try again.', 401)); }
};


const sendToken = (user, statusCode, res) => {
  const token = user.getSignedToken();
  return res.status(statusCode).json({success: true, token, user});
};