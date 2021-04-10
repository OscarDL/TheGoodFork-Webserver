const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');


exports.getUserAccounts = async (req, res, next) => {
  try {
    const users = await User.find({type: {$eq: 'user'}});

    return res.status(200).json({success: true, users});

  } catch (error) { return next(new ErrorResponse('Could not retrieve user accounts, please try again.', 500)); }
};


exports.getStaffAccounts = async (req, res, next) => {
  try {
    const users = await User.find({type: {$ne: 'user'}});
  
    return res.status(200).json({success: true, users});
    
  } catch (error) { return next(new ErrorResponse('Could not retrieve staff members, please try again.', 500)); }
};


exports.registerStaffAccount = async (req, res, next) => {
  try {
    // Do all checks for field entries before checking uniqueness of username & email address
    const {firstName, lastName, email, password, passCheck, type} = req.body;

    if (!(firstName && lastName && email && password && passCheck && type))
      return next(new ErrorResponse('Please fill in all the fields.', 400));

    if (password.length < 6)
      return next(new ErrorResponse('Password needs to be at least 6 characters long.', 400));

    if (password !== passCheck)
      return next(new ErrorResponse('Passwords do not match.', 400));

      
    // Check uniqueness of email address
    const emailExists = await User.findOne({email});
    if (emailExists)
      return next(new ErrorResponse(`Email address "${email}" is already in use, please register with a different one.`, 409));


    const staff = await User.create({firstName, lastName, email, password, type});

    return res.status(201).json({
      success: true,
      data: `${staff.firstName} ${staff.lastName} successfully registered.`
    })

  } catch (error) { return next(new ErrorResponse(`Could not register staff member.`, 500)); }
};


exports.updateStaffAccount = async (req, res, next) => {
  if (!req.params.id)
    return next(new ErrorResponse('Could not retrieve staff member.', 400));

  try {
    const staff = await User.findById(req.params.id);

    if (!staff)
      return next(new ErrorResponse('Could not retrieve staff member.', 404));

    const {firstName, lastName, password, email, type} = req.body;

    if (password) {
      if (password.length < 6)
        return next(new ErrorResponse('Password needs to be at least 6 characters long.', 400));
      staff.password = password;
    }

    staff.firstName = firstName;
    staff.lastName = lastName;
    staff.email = email;
    staff.type = type;

    await staff.save();

    return res.status(201).json({
      success: true,
      data: 'Account updated successfully.'
    })

  } catch (error) { return next(new ErrorResponse('Could not update staff member.', 500)); }
};


exports.deleteStaffAccount = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user)
      return next(new ErrorResponse('Could not find staff member.', 404));

    return res.status(201).json({
      success: true,
      data: 'Account successfully deleted.'
    })

  } catch (error) { return next(new ErrorResponse('Could not delete staff member.', 500)); }
};