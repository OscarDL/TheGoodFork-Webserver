require('dotenv').config({path: './config.env'});

const stripe = require('stripe')(process.env.STRIPE_SK);

const User = require('../models/User');
const Order = require('../models/Order');
const ErrorResponse = require('../utils/errorResponse');


exports.orders = async (req, res, next) => {
  try {
    const orders = await Order.find(req.user.type === 'user' ? {'user.email': req.user.email} : {});

    return res.status(200).json({success: true, orders});

  } catch (error) { console.log(error); return next(new ErrorResponse('Could not retrieve orders.', 500)); }
};


exports.order = async (req, res, next) => {
  if (!req.params.id)
    return next(new ErrorResponse('Could not retrieve your order information.', 400));


  try {      
    const order = await Order.findById(req.params.id);

    if (req.user.type === 'user' && order.user.email !== req.user.email)
      return next(new ErrorResponse('You are not allowed to view this order.', 403));

    return res.status(200).json({success: true, order});

  } catch (error) { return next(new ErrorResponse('Could not retrieve this order.', 500)); }
};


exports.create = async (req, res, next) => {
  const {
    user, appetizer, mainDish, dessert, drink, alcohol, details,
    price, tip, currency = 'EUR', orderedBy, type, stripePi = null
  } = req.body;
  
  if (!price)
    return next(new ErrorResponse('Your order cannot be empty.', 400));

  if (user.type === 'waiter' && (!user.firstName || !user.lastName || !user.email))
    return next(new ErrorResponse("Please provide your customer's first name, last name & email address.", 400));


  try {
    let matchUser = await User.findOne({email: user.type === 'waiter' ? user.email : req.user.email}); // Find by email for waiters
    
    if (!matchUser && user.type === 'waiter')
      matchUser = {...user, type: 'user'}; // If user isn't registered

    if (!matchUser)
      return next(new ErrorResponse('Could not retrieve your order information.', 404));
      
    const order = await Order.create({
      user: matchUser,

      appetizer, mainDish, dessert, drink, alcohol,
      
      details, paid: stripePi ? true : false, price: Number(price).toFixed(2),
      tip: Number(tip).toFixed(2), currency, dateOrdered: Date.now(), orderedBy, 
      type, validated: false, status: stripePi ? 'paid' : 'pending', stripePi
    });

    return res.status(200).json({success: true, order});
    
  } catch (error) { return next(new ErrorResponse('Could not place your order.', 500)); }
};


exports.update = async (req, res, next) => {
  const newOrder = req.body;

  if (!req.params.id)
    return next(new ErrorResponse('Could not retrieve your order information.', 400));

  if (!newOrder.price)
    return next(new ErrorResponse('Your order cannot be empty.', 400));


  try {
    const order = await Order.findById(req.params.id);

    if (!order)
      return next(new ErrorResponse('Could not find your order, please try again.', 404));

    if (order.paid)
      return next(new ErrorResponse('You paid your order, it cannot be modified. Please contact a waiter or barman.', 429));
    
    if (order.validated)
      return next(new ErrorResponse('Your order was validated, it cannot be modified. Please contact a waiter or barman.', 429));
    
    order.appetizer = newOrder.appetizer;
    order.mainDish = newOrder.mainDish;
    order.dessert = newOrder.dessert;
    order.drink =  newOrder.drink;
    order.alcohol = newOrder.alcohol;

    order.validated = newOrder.validated;
    order.stripePi = newOrder.stripePi;
    order.details = newOrder.details;
    order.status = newOrder.status;
    order.paid = newOrder.paid;

    order.price = Number(newOrder.price).toFixed(2);
    order.tip = Number(newOrder.tip).toFixed(2);

    order.save();
    return res.status(200).json({success: true, order});
    
  } catch (error) { return next(new ErrorResponse('Could not edit your order.', 500)); }
};


exports.cancel = async (req, res, next) => {
  if (!req.params.id)
    return next(new ErrorResponse('Could not retrieve your order information.', 400));
    
  try {
    const order = await Order.findById(req.params.id);

    if (!order)
      return next(new ErrorResponse('Could not delete your order, please try again.', 404));
    
    if (order.validated)
      return next(new ErrorResponse('Your order was validated, you cannot cancel it anymore. Please contact a waiter.', 409));

    if (order.paid) await stripe.refunds.create({payment_intent: order.stripePi});

    await Order.findByIdAndDelete(order._id);

    return res.status(200).json({success: true});
    
  } catch (error) { return next(new ErrorResponse('Could not delete your order.', 500)); }
};