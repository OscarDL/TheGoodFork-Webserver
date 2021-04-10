const JsonWebToken = require('jsonwebtoken');

const User = require('../models/User');
const Dish = require('../models/Dish');
const ErrorResponse = require('../utils/errorResponse');


exports.createDish = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
    token = req.headers.authorization.split(' ')[1];

  if (!token)
    return next(new ErrorResponse('Could not verify your account, please sign out then in again.', 400));
      

  try {
    const decoded = JsonWebToken.verify(token, process.env.JWT_SECRET);
    const user =  await User.findById(decoded.id); 
    
    if (!user)
      return next(new ErrorResponse('Could not verify your account, please try again or sign out then in again.', 404));

    if (!user.type || user.type !== 'admin')
      return next(new ErrorResponse('You are not allowed to create a dish.', 403));


    const {type, price, name, detail} = req.body;
    const dish = await Dish.create({
      type,
      price,
      name,
      detail,
      currency: 'EUR',
      available: true
    });
      
    return res.status(200).json({success: true, dish});

  } catch (error) { return next(new ErrorResponse('Could not create dish.', 500)); }
};


exports.editDish = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
    token = req.headers.authorization.split(' ')[1];

  if (!token)
    return next(new ErrorResponse('Could not verify your account, please sign out then in again.', 400));
      

  try {
    const decoded = JsonWebToken.verify(token, process.env.JWT_SECRET);
    const user =  await User.findById(decoded.id); 

    if (!user)
      return next(new ErrorResponse('Could not verify your account, please try again or sign out then in again.', 404));

    if (!user.type || user.type !== 'admin')
      return next(new ErrorResponse('You are not allowed to retrieve staff members.', 403));

    if (!req.params.dishid)
      return next(new ErrorResponse('Could not retrieve dish information.', 400));

      
    const dish = await Dish.findById(req.params.dishid);

    if (!dish)
      return next(new ErrorResponse('Could not find dish, please try again.', 404));


    const {type, price, name, detail} = req.body;
    dish.detail = detail;
    dish.price = price;
    dish.type = type;
    dish.name = name;

    dish.save();
    return res.status(200).json({success: true, dish});
    
  } catch (error) { return next(new ErrorResponse('Could not edit dish.', 500)); }
};


exports.deleteDish = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
    token = req.headers.authorization.split(' ')[1];

  if (!token)
    return next(new ErrorResponse('Could not verify your account, please sign out then in again.', 400));


  try {
    const decoded = JsonWebToken.verify(token, process.env.JWT_SECRET);
    const user =  await User.findById(decoded.id); 
    
    if (!user)
      return next(new ErrorResponse('Could not verify your account, please try again or sign out then in again.', 404));

    if (!user.type || user.type !== 'admin')
      return next(new ErrorResponse('You are not allowed to delete this dish.', 403));

    if (!req.params.dishid)
      return next(new ErrorResponse('Could not retrieve dish information.', 400));
    

    const dish = await Dish.deleteOne({_id: req.params.dishid});

    if (!dish)
      return next(new ErrorResponse('Could not find dish, please try again.', 404));

    return res.status(200).json({success: true});
    
  } catch (error) { return next(new ErrorResponse('Could not delete dish.', 500)); }
};


exports.getDishes = async (req, res, next) => {
  try {
    const dishes = await Dish.find();
    return res.status(200).json({success: true, dishes});

  } catch (error) { return next(new ErrorResponse('Could not retrieve dishes.', 500)); }
};