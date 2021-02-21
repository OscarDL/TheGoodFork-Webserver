const crypto = require('crypto');

const ErrorResponse = require('../utils/errorResponse');
const sendEmail = require('../utils/sendEmail');
const User = require('../models/User');

exports.register = async (req, res, next) => {
  const {username, firstName, lastName, email, password, passCheck} = req.body;

  try {

    // Do all checks for field entries before checking uniqueness of username & email address
    if (!(username && firstName && lastName && email && password))
      return next(new ErrorResponse('Please fill in all fields to register.', 400));

    if (username.includes('@') || username.includes(' '))
      return next(new ErrorResponse('Please choose a username without spaces or an @ symbol.', 400));

    if (password.length < 6)
      return next(new ErrorResponse('Your password needs to be at least 6 characters long.', 400));

    if (password !== passCheck)
      return next(new ErrorResponse('The passwords you entered do not match, please try again.', 400));

      
    // Check uniqueness of username & email address
    const usernameExists = await User.findOne({username: username.toLowerCase()});
    if (usernameExists)
      return next(new ErrorResponse(`Username '${username}' already exists, please try again with a different one.`, 400));
    
    const emailExists = await User.findOne({email});
    if (emailExists)
      return next(new ErrorResponse(`Email address '${email}' already exists, please try again with a different one.`, 400));


    const user = await User.create({
      username: username.toLowerCase(), firstName, lastName, email, password
    });

    sendToken(user, 201, res);

  } catch (error) { next(error); }
};

exports.login = async (req, res, next) => {
  const {login, password} = req.body;

  if (!login || !password)
    return next(new ErrorResponse('Please provide both email and password in order to login.', 400));

  try {
    
    const user = await User.findOne(login.includes('@') ? {email: login} : {username: login.toLowerCase()}).select('+password');

    if (!user)
      return next(new ErrorResponse(`${login.includes('@') ? 'Email address' : 'Username'} not found.`, 401));

    const isMatch = await user.matchPasswords(password);

    if(!isMatch)
      return next(new ErrorResponse('Invalid password', 401));

    sendToken(user, 200, res);

  } catch (error) { next(error); }
};

exports.forgotpw = async (req, res, next) => {
  const {forgot} = req.body;

  try {

    const user = await User.findOne(forgot.includes('@') ? {email: forgot} : {username: forgot.toLowerCase()})

    if (!user)
      return next(new ErrorResponse(`This ${forgot.includes('@') ? 'Email address' : 'Username'} could not be found.`, 404))

    const resetToken = user.getResetPasswordToken();
    await user.save();

    const resetUrl = `https://${process.env.DOMAIN || 'localhost:9000'}/resetpassword/${resetToken}`;
    const message = `
      <h2>${user.username.charAt(0).toUpperCase() + user.username.slice(1)},</h2>
      <br/><h3>You requested a password reset.</h3>
      <p>Please jump to the following link to reset your password:
        <br/><a href="${resetUrl}" clicktracking=off>The Good Fork - Password Reset</a>
      </p><br/>
      <h4>Thank you for using our services and making your account more secure.</h4>
      <p style="text-align: right;">The Good Fork &copy; - 2021</p>
    `;

    try {

      await sendEmail({
        email: user.email,
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

const sendToken = (user, statusCode, res) => {
  const token = user.getSignedToken();
  res.status(statusCode).json({
    success: true,
    token: token
  });
};