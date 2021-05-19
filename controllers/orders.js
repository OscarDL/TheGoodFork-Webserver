const jwt = require('jsonwebtoken');

const User = require('../models/User');
const Order = require('../models/Order');
//const sendEmail = require('../utils/sendEmail');
const ErrorResponse = require('../utils/errorResponse');


exports.getOrders = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
    token = req.headers.authorization.split(' ')[1];

  if (!token)
    return next(new ErrorResponse('Could not retrieve your orders, please try again or sign out then in again.', 401));


  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user)
      return next(new ErrorResponse('Could not retrieve your orders, please try again.', 404));

    // user.type !== 'waiter' -> gives unvalidated orders for waiters to validate later on, and gives validated orders to cooks and barmen.
    const orders = await (user.type === 'user' ? Order.find({'user.email': user.email}) : Order.find({validated: user.type !== 'waiter'}));

    return res.status(200).json({success: true, orders});

  } catch (error) { return next(new ErrorResponse('Could not retrieve orders.', 500)); }
};


exports.getOrder = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
    token = req.headers.authorization.split(' ')[1];

  if (!token)
    return next(new ErrorResponse('Could not retrieve this order, please try again or sign out then in again.', 401));

  if (!req.params.id)
    return next(new ErrorResponse('Could not retrieve your order information.', 400));


  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user)
      return next(new ErrorResponse('Could not retrieve this order, please try again.', 404));

      
    const order = await Order.findById(req.params.id);

    if (user.type === 'user' && order.user.email !== user.email)
      return next(new ErrorResponse('You are not allowed to view this order.', 403));

    return res.status(200).json({success: true, order});

  } catch (error) { return next(new ErrorResponse('Could not retrieve this order.', 500)); }
};


exports.createOrder = async (req, res, next) => {
  let token;
  const {user, appetizer, mainDish, dessert, drink, alcohol, details, price, orderedBy, type, paid} = req.body;
  
  if (price === 0)
    return next(new ErrorResponse('Your order cannot be empty.', 400));

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
    token = req.headers.authorization.split(' ')[1];

  if (!token || !user)
    return next(new ErrorResponse('Could not verify your account, please sign out then in again.', 401));

  if (user.type === 'waiter' && (!user.firstName || !user.lastName || !user.email))
    return next(new ErrorResponse("Please provide your customer's first name, last name & email address.", 400));


  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    let matchUser = await (user.type === 'waiter' ? User.findOne({email: user.email}) : User.findById(decoded.id)); // Find by email for waiters
    
    if (!matchUser && user.type === 'waiter')
      matchUser = {...user, type: 'user'}; // If user isn't registered

    if (!matchUser)
      return next(new ErrorResponse('Could not retrieve your order information.', 404));

    const order = await Order.create({
      user: matchUser,

      appetizer, mainDish, dessert, drink, alcohol,

      details, paid, price, currency: 'EUR',
      dateOrdered: Date.now(), validated: false,
      type, orderedBy, status: paid ? 'paid' : 'pending'
    });

    return res.status(200).json({success: true, order});
    
  } catch (error) { return next(new ErrorResponse('Could not place your order.', 500)); }
};


exports.updateOrder = async (req, res, next) => {
  let token;
  const newOrder = req.body;

  if (newOrder.price === 0)
    return next(new ErrorResponse('Your order cannot be empty.', 400));

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
    token = req.headers.authorization.split(' ')[1];

  if (!token)
    return next(new ErrorResponse('Could not verify your account, please sign out then in again.', 401));

  if (!req.params.id)
    return next(new ErrorResponse('Could not retrieve your order information.', 400));

    
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user)
      return next(new ErrorResponse('Could not retrieve your order information.', 404));

      
    const order = await Order.findById(req.params.id);

    if (!order)
      return next(new ErrorResponse('Could not find your order, please try again.', 404));

    if (!order.validated) {
      order.appetizer = newOrder.appetizer;
      order.mainDish = newOrder.mainDish;
      order.dessert = newOrder.dessert;
      order.drink =  newOrder.drink;
      order.alcohol = newOrder.alcohol;

      order.validated = newOrder.validated;
      order.details = newOrder.details;
      order.status = newOrder.status;
      order.price = newOrder.price;
      order.paid = newOrder.paid;

      order.save();
      return res.status(200).json({success: true, order});

    } else return next(new ErrorResponse('Your order was validated, you cannot edit it anymore. Please contact a waiter or barman.', 429));
    
  } catch (error) { return next(new ErrorResponse('Could not edit your order.', 500)); }
};


exports.deleteOrder = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
    token = req.headers.authorization.split(' ')[1];

  if (!token)
    return next(new ErrorResponse('Could not get your orders, please sign out then in again.', 401));

  if (!req.params.id)
    return next(new ErrorResponse('Could not retrieve your order information.', 400));

    
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user)
      return next(new ErrorResponse('Could not retrieve your order information.', 404));


    const order = await Order.findById(req.params.id);

    if (!order)
      return next(new ErrorResponse('Could not delete your order, please try again.', 404));
    
    if (order.validated)
      return next(new ErrorResponse('Your order was validated, you cannot cancel it anymore. Please contact a waiter or barman.', 429));

    await Order.findByIdAndDelete(order._id);

    return res.status(200).json({success: true});
    
  } catch (error) { return next(new ErrorResponse('Could not delete your order.', 500)); }
};