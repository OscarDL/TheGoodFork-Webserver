const jwt = require('jsonwebtoken');

const User = require('../models/User');
const Dish = require('../models/Dish');
const ErrorResponse = require('../utils/errorResponse');


exports.dishes = async (req, res, next) => {
  try {
    const dishes = await Dish.find();
    return res.status(200).json({success: true, dishes});

  } catch (error) { return next(new ErrorResponse('Could not retrieve dishes.', 500)); }
};


exports.create = async (req, res, next) => {
  try {
    const {name, type, price, stock, detail} = req.body;

    if (!name || !type || !price)
      return next(new ErrorResponse('Please fill in all the necessary fields.', 400));

    const dish = await Dish.create({
      name,
      type,
      price,
      stock,
      detail,
      currency: 'EUR',
      available: stock !== 0,
    });
      
    return res.status(200).json({success: true, dish});

  } catch (error) { return next(new ErrorResponse('Could not create dish.', 500)); }
};


exports.update = async (req, res, next) => {
  try {
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
    dish.price = price;
    dish.stock = stock;
    dish.detail = detail;

    dish.save();
    return res.status(200).json({success: true, dish});
    
  } catch (error) { return next(new ErrorResponse('Could not edit dish.', 500)); }
};


exports.remove = async (req, res, next) => {
  try {
    if (!req.params.id)
      return next(new ErrorResponse('Could not retrieve dish information.', 400));

    await Dish.findByIdAndDelete(req.params.id);

    return res.status(200).json({success: true});
    
  } catch (error) { return next(new ErrorResponse('Could not delete dish.', 500)); }
};