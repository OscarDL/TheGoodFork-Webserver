require('dotenv').config({path: './config.env'});

const stripe = require('stripe')(process.env.STRIPE_SK);

const Dish = require('../models/Dish');
const User = require('../models/User');
const Order = require('../models/Order');
const ErrorResponse = require('../utils/errorResponse');


const updateStock = async (type, operation) => {
  if (!type.length) return;

  for (const item of type) {
    const dish = await Dish.findById(item._id);

    if (dish.stock !== null) {
      if (dish.stock + item.quantity*operation < 0)
        throw `Il n'y a plus que ${dish.stock} ${dish.name} en stock, veuillez en retirer ${item.quantity - dish.stock} de votre commande.`
      
      dish.stock += item.quantity*operation;
      await dish.save();
    }
  }
};


const updateStockEdit = async (type, oldType) => {
  if (!type.length && !oldType.length) return;

  await updateStock(oldType, 1); // add all dishes stock from old order state back to the db
  await updateStock(type, -1); // decrease necessary dishes stock from new order with update 
};


exports.orders = async (req, res, next) => {
  try {
    const orders = await Order.find(req.user.type === 'user' ? {'user.email': req.user.email} : {});

    return res.status(200).json({success: true, orders});

  } catch (error) { return next(new ErrorResponse('Erreur de récupération des commandes.', 500)); }
};


exports.order = async (req, res, next) => {
  if (!req.params.id)
    return next(new ErrorResponse('Erreur de récupération de la commande.', 400));


  try {      
    const order = await Order.findById(req.params.id);

    if (!order)
      return next(new ErrorResponse("Cette commande n'existe plus.", 404));

    if (req.user.type === 'user' && order.user.email !== req.user.email)
      return next(new ErrorResponse('Vous ne pouvez pas accéder à cette commande.', 403));

    return res.status(200).json({success: true, order});

  } catch (error) { return next(new ErrorResponse('Erreur de récupération de la commande.', 500)); }
};


exports.create = async (req, res, next) => {
  const {
    user, appetizer, mainDish, dessert, drink, alcohol, details,
    price, tip, currency = 'EUR', orderedBy, type, stripePi = null
  } = req.body;
  
  if (!price)
    return next(new ErrorResponse('Votre commande ne peut pas être vide.', 400));

  if (user.type === 'waiter' && (!user.firstName || !user.lastName || !user.email))
    return next(new ErrorResponse('Veuillez fournir le nom, prénom et adresse email de votre client.', 400));

  
  let dishesBackup;

  try {
    let matchUser = await User.findOne({email: user.type === 'waiter' ? user.email : req.user.email}); // Find by email for waiters
    
    if (!matchUser && user.type === 'waiter')
      matchUser = {...user, type: 'user'}; // If user isn't registered

    if (!matchUser)
      return next(new ErrorResponse('Could not retrieve your order information.', 404));

    
    dishesBackup = await Dish.find({}, {stock:1});
    
    try {
      await updateStock(appetizer, -1);
      await updateStock(mainDish, -1);
      await updateStock(dessert, -1);
      await updateStock(drink, -1);
      await updateStock(alcohol, -1);
    } catch (error) {
      for (const backup of dishesBackup) {
        const dish = await Dish.findById(backup._id);
        dish.stock = dishesBackup.find(d => String(d._id) === String(dish._id)).stock;
        await dish.save();
      }
      return next(new ErrorResponse(error, 500));
    }

      
    const order = await Order.create({
      user: matchUser,

      appetizer, mainDish, dessert, drink, alcohol,
      
      details, paid: stripePi ? true : false, price: Number(price).toFixed(2),
      tip: Number(tip).toFixed(2), dateOrdered: Date.now(), orderedBy, type,
      currency, validated: user.type !== 'user', status: 'pending', stripePi
    });

    return res.status(200).json({success: true, order});
    
  } catch (error) { return next(new ErrorResponse('Erreur de création de la commande.', 500)); }
};


exports.update = async (req, res, next) => {
  const newOrder = req.body.order;

  if (!req.params.id)
    return next(new ErrorResponse('Erreur de modification de la commande.', 400));

  if (!newOrder.price)
    return next(new ErrorResponse('Votre commande ne peut pas être vide.', 400));

  
  let dishesBackup;
    
  try {
    const order = await Order.findById(req.params.id);

    if (!order)
      return next(new ErrorResponse("Cette commande n'existe plus.", 404));

    if (!req.body.pay && (order.paid || order.validated)) // still let user pay after order is validated
      return next(new ErrorResponse(
        'Vous ne pouvez plus modifier votre commande après '
        + (order.paid ? 'le paiement' : 'validation')
        + '. Veuillez contacter un serveur.', 429
      ));
    

    dishesBackup = await Dish.find({}, {stock:1});

    try {
      if (newOrder.appetizer !== order.appetizer)
        await updateStockEdit(newOrder.appetizer, order.appetizer);
        order.appetizer = newOrder.appetizer;

      if (newOrder.mainDish !== order.mainDish)
        await updateStockEdit(newOrder.mainDish, order.mainDish);
        order.mainDish = newOrder.mainDish;

      if (newOrder.dessert !== order.dessert)
        await updateStockEdit(newOrder.dessert, order.dessert);
        order.dessert = newOrder.dessert;

      if (newOrder.drink !== order.drink)
        await updateStockEdit(newOrder.drink, order.drink);
        order.drink =  newOrder.drink;

      if (newOrder.alcohol !== order.alcohol)
        await updateStockEdit(newOrder.alcohol, order.alcohol);
        order.alcohol = newOrder.alcohol;

    } catch (error) {

      for (const backup of dishesBackup) {
        const dish = await Dish.findById(backup._id);
        dish.stock = dishesBackup.find(d => String(d._id) === String(dish._id)).stock;
        await dish.save();
      }
      return next(new ErrorResponse(error, 500));
    }


    order.price = Number(newOrder.price).toFixed(2);
    order.tip = Number(newOrder.tip).toFixed(2);
    order.validated = newOrder.validated;
    order.stripePi = newOrder.stripePi;
    order.details = newOrder.details;
    order.status = newOrder.status;
    order.paid = newOrder.paid;

    order.save();
    return res.status(200).json({success: true, order});
    
  } catch (error) { return next(new ErrorResponse('Erreur de modification de la commande.', 500)); }
};


exports.staffUpdate = async (req, res, next) => {
  const newOrder = req.body.order;

  if (!req.params.id)
    return next(new ErrorResponse('Erreur de modification de la commande.', 400));

  if (!newOrder.price)
    return next(new ErrorResponse('La commande ne peut pas être vide.', 400));

  
  let dishesBackup;
    
  try {
    const order = await Order.findById(req.params.id);

    if (!order)
      return next(new ErrorResponse("Cette commande n'existe plus.", 404));
    

    dishesBackup = await Dish.find({}, {stock:1});

    try {
      if (newOrder.appetizer !== order.appetizer)
        await updateStockEdit(newOrder.appetizer, order.appetizer);
        order.appetizer = newOrder.appetizer;

      if (newOrder.mainDish !== order.mainDish)
        await updateStockEdit(newOrder.mainDish, order.mainDish);
        order.mainDish = newOrder.mainDish;

      if (newOrder.dessert !== order.dessert)
        await updateStockEdit(newOrder.dessert, order.dessert);
        order.dessert = newOrder.dessert;

      if (newOrder.drink !== order.drink)
        await updateStockEdit(newOrder.drink, order.drink);
        order.drink =  newOrder.drink;

      if (newOrder.alcohol !== order.alcohol)
        await updateStockEdit(newOrder.alcohol, order.alcohol);
        order.alcohol = newOrder.alcohol;

    } catch (error) {

      for (const backup of dishesBackup) {
        const dish = await Dish.findById(backup._id);
        dish.stock = dishesBackup.find(d => String(d._id) === String(dish._id)).stock;
        await dish.save();
      }
      return next(new ErrorResponse(error, 500));
    }


    order.price = Number(newOrder.price).toFixed(2);
    order.tip = Number(newOrder.tip).toFixed(2);
    order.validated = newOrder.validated;
    order.stripePi = newOrder.stripePi;
    order.details = newOrder.details;
    order.status = newOrder.status;
    order.paid = newOrder.paid;

    order.save();
    return res.status(200).json({success: true, order});
    
  } catch (error) { return next(new ErrorResponse('Erreur de modification de la commande.', 500)); }
};


exports.cancel = async (req, res, next) => {
  if (!req.params.id)
    return next(new ErrorResponse("Erreur d'annulation de la commande.", 400));
  
  let dishesBackup;

  try {
    const order = await Order.findById(req.params.id);

    if (!order)
      return next(new ErrorResponse("Cette commande n'existe plus.", 404));
    
    if (order.validated)
      return next(new ErrorResponse('Vous ne pouvez plus modifier votre commande après validation. Veuillez contacter un serveur.', 429, 409));

    if (order.paid) await stripe.refunds.create({payment_intent: order.stripePi});


    dishesBackup = await Dish.find({}, {stock:1});
    
    try {
      await updateStock(order.appetizer, 1);
      await updateStock(order.mainDish, 1);
      await updateStock(order.dessert, 1);
      await updateStock(order.drink, 1);
      await updateStock(order.alcohol, 1);
    } catch (error) {
      for (const backup of dishesBackup) {
        const dish = await Dish.findById(backup._id);
        dish.stock = dishesBackup.find(d => String(d._id) === String(dish._id)).stock;
        await dish.save();
      }
      return next(new ErrorResponse(error, 500));
    }


    await Order.findByIdAndDelete(order._id);

    return res.status(200).json({success: true});
    
  } catch (error) { return next(new ErrorResponse("Erreur d'annulation de la commande.", 500)); }
};