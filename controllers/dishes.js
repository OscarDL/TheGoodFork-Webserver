const jwt = require('jsonwebtoken');

const User = require('../models/User');
const Dish = require('../models/Dish');
const ErrorResponse = require('../utils/errorResponse');


exports.getDishes = async (req, res, next) => {
  try {
    const dishes = await Dish.find();
    return res.status(200).json({success: true, dishes});

  } catch (error) { return next(new ErrorResponse('Could not retrieve dishes.', 500)); }
};


exports.createDish = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
    token = req.headers.authorization.split(' ')[1];

  if (!token)
    return next(new ErrorResponse('Could not verify your account, please sign out then in again.', 400));
      

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id); 
    
    if (!user)
      return next(new ErrorResponse('Could not verify your account, please try again or sign out then in again.', 404));

    if (user.type !== 'admin')
      return next(new ErrorResponse('You are not allowed to create a dish.', 403));


    const {name, type, price, stock, detail} = req.body;

    if (!name || !type || !price)
      return next(new ErrorResponse('Please fill in all the necessary fields.', 400));

    const dish = await Dish.create({
      name,
      type,
      stock,
      detail,
      currency: 'EUR',
      available: stock !== 0,
      price: ~~(price*100)/100
    });
      
    return res.status(200).json({success: true, dish});

  } catch (error) { return next(new ErrorResponse('Could not create dish.', 500)); }
};


exports.updateDish = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
    token = req.headers.authorization.split(' ')[1];

  if (!token)
    return next(new ErrorResponse('Could not verify your account, please sign out then in again.', 400));
      

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user =  await User.findById(decoded.id); 

    if (!user)
      return next(new ErrorResponse('Could not verify your account, please try again or sign out then in again.', 404));

    if (!req.params.id)
      return next(new ErrorResponse('Could not retrieve dish information.', 400));

      
    const dish = await Dish.findById(req.params.id);

    if (!dish)
      return next(new ErrorResponse('Could not find dish, please try again.', 404));


    const {name, type, price, stock, detail} = req.body;

    if (!name || !type || !price)
      return next(new ErrorResponse('Please fill in all the necessary fields.', 400));

    dish.name = name;
    dish.type = type;
    dish.stock = stock;
    dish.detail = detail;
    dish.price = ~~(price*100)/100;

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
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user =  await User.findById(decoded.id); 
    
    if (!user)
      return next(new ErrorResponse('Could not verify your account, please try again or sign out then in again.', 404));

    if (!user.type || user.type !== 'admin')
      return next(new ErrorResponse('You are not allowed to delete this dish.', 403));

    if (!req.params.id)
      return next(new ErrorResponse('Could not retrieve dish information.', 400));
    

    await Dish.findByIdAndDelete(req.params.id);

    return res.status(200).json({success: true});
    
  } catch (error) { return next(new ErrorResponse('Could not delete dish.', 500)); }
};