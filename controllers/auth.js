const crypto = require('crypto');
const JsonWebToken = require('jsonwebtoken');

const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const ErrorResponse = require('../utils/errorResponse');

exports.register = async (req, res, next) => {
  const {firstName, lastName, email, password, passCheck} = req.body;

  try {

    // Do all checks for field entries before checking uniqueness of username & email address
    if (!(firstName && lastName && email && password && passCheck))
      return next(new ErrorResponse('Please fill in all the fields.', 400));

    if (password.length < 6)
      return next(new ErrorResponse('Your password needs to be at least 6 characters long.', 400));

    if (password !== passCheck)
      return next(new ErrorResponse('The passwords you entered do not match, please try again.', 400));

      
    // Check uniqueness of email address
    const emailExists = await User.findOne({email});
    if (emailExists)
      return next(new ErrorResponse(`Email address '${email}' is already in use, please register with a different one.`, 400));


    const user = await User.create({firstName, lastName, email, password, type: 'user'});

    sendToken(user, 201, res);

  } catch (error) { next(error); }
};

exports.login = async (req, res, next) => {
  const {email, password} = req.body;

  if (!email || !password)
    return next(new ErrorResponse('Please provide both email and password in order to login.', 400));

  try {
    
    const user = await User.findOne({email}).select('+password');

    if (!user)
      return next(new ErrorResponse('Invalid credentials.', 401));

    const isMatch = await user.matchPasswords(password);

    if(!isMatch)
      return next(new ErrorResponse('Invalid credentials.', 401));

    sendToken(user, 200, res);

  } catch (error) { next(error); }
};

exports.forgotpw = async (req, res, next) => {
  const {email} = req.body;

  try {

    const user = await User.findOne({email});

    if (!user)
      return next(new ErrorResponse(`This email address could not be found.`, 404))

    const resetToken = user.getResetPasswordToken();
    await user.save();

    const resetUrl = `https://${process.env.DOMAIN || 'localhost:9000'}/resetpassword/${resetToken}`;
    const message = `
      <h2>${user.firstName},</h2>
      <br/><h3>You requested a password reset.</h3>
      <p>Please jump to the following link to reset your password:
        <br/><a href="${resetUrl}" clicktracking=off>The Good Fork - Password Reset</a>
      </p><br/>
      <h4>Thank you for using our services and making your account more secure.</h4>
      <p style="text-align: right;">The Good Fork &copy; - 2021</p>
    `;

    try {

      sendEmail({
        email,
        subject: 'The Good Fork - Password Reset Request',
        content: message
      });

      res.status(200).json({
        success: true,
        data: 'Email sent successfully.'
      });

    } catch (error) {

      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
     
      return next(new ErrorResponse('Email could not be sent.', 500));
    }

  } catch (error) { next(error); }

};

exports.resetpw = async (req, res, next) => {
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');

  try {

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: {$gt: Date.now()} // Check if current time is still in the token expiration timeframe
    });

    if (!user)
      return next(new ErrorResponse('The token to reset your password is wrong or has expired. Please reset your password within 15 minutes of sending the reset request.', 400));

    user.password = req.body.password
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return res.status(201).json({
      success: true,
      data: 'Password has been reset successfully.'
    })

  } catch (error) { next(error) }
};

exports.userinfo = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
    token = req.headers.authorization.split(' ')[1];

  if (!token)
    return next(new ErrorResponse('Could not get user info, please try again or sign out then in again.', 401));

  try {
    const decoded = JsonWebToken.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user)
      return next(new ErrorResponse('Could not get user info, please try again or sign out then in again.', 404));

    req.user = user;
    return res.status(200).json({ success: true, user });

  } catch (error) { return next(new ErrorResponse('Could not get user info, please try again or sign out then in again.', 401)); }
};

const sendToken = (user, statusCode, res) => {
  const token = user.getSignedToken();
  res.status(statusCode).json({
    success: true,
    token: token
  });
};