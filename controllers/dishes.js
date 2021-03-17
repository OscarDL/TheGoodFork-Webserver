const JsonWebToken = require('jsonwebtoken');

const User = require('../models/User');
const Dish = require('../models/Dish');
const ErrorResponse = require('../utils/errorResponse');


exports.createDish = async (req, res, next) => {
    let token;
    const {type, price, name, detail} = req.body;
  
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
      token = req.headers.authorization.split(' ')[1];
  
    if (!token)
      return next(new ErrorResponse('Could not create dish, please sign out then in again.', 400));
        
  
    try {
      const decoded = JsonWebToken.verify(token, process.env.JWT_SECRET);
      const user =  await User.findById(decoded.id); 
      
      if (!user)
        return next(new ErrorResponse('Could not retrieve your order information.', 404));
  
      const dish = await Dish.create({
        type,
        price,
        name,
        detail,
        currency: 'EUR',
        available: true
      });
        
      return res.status(200).json({success: true, dish});

    } catch (error) { return next(error); }
};


exports.editDish = async (req, res, next) => {
  let token;
  const {type, price, name, detail} = req.body;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
    token = req.headers.authorization.split(' ')[1];

  if (!token)
    return next(new ErrorResponse('Could not edit dish, please sign out then in again.', 400));
      

  try {
    if (!req.params.dishid)
      return next(new ErrorResponse('Could not retrieve dish information.', 400));

    const dish = await Dish.findById(req.params.dishid);

    if (!dish)
      return next(new ErrorResponse('Could not find dish, please try again.', 404));

    dish.detail = detail;
    dish.price = price;
    dish.type = type;
    dish.name = name;

    dish.save();
    res.status(200).json({success: true, dish});
    
  } catch (error) { return next(error); }
};


exports.deleteDish = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
    token = req.headers.authorization.split(' ')[1];

  if (!token)
    return next(new ErrorResponse('Could not edit dish, please sign out then in again.', 400));


  try {
    if (!req.params.dishid)
      return next(new ErrorResponse('Could not retrieve your order information.', 400));
    
    const dish = await Dish.deleteOne({_id: req.params.dishid});

    if (!dish)
      return next(new ErrorResponse('Could not delete dish, please try again.', 404));

    res.status(200).json({success: true});
    
  } catch (error) { return next(error); }
};


exports.getDishes = async (req, res, next) => {
  try {
    const dishes = await Dish.find();
    return res.status(200).json({success: true, dishes});

  } catch (error) { console.log(error); return next(error); }
};