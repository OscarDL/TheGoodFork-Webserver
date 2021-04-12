const JsonWebToken = require('jsonwebtoken');

const User = require('../models/User');
const Order = require('../models/Order');
//const sendEmail = require('../utils/sendEmail');
const ErrorResponse = require('../utils/errorResponse');


exports.createOrder = async (req, res, next) => {
  let token;
  const {user, appetizer, mainDish, dessert, drink, alcohol, price} = req.body;

  if (price === 0)
    return next(new ErrorResponse('Your order cannot be empty.', 400));

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
    token = req.headers.authorization.split(' ')[1];

  if (!token || !user)
    return next(new ErrorResponse('Could not verify your account, please sign out then in again.', 401));


  try {
    const decoded = JsonWebToken.verify(token, process.env.JWT_SECRET);
    let matchUser = await (user.type === 'waiter' ? User.findOne({email: user.email}) : User.findById(decoded.id)); // Find by email for waiters
    
    if (!matchUser && user.type === 'waiter')
      matchUser = {...user, type: 'user'};

    if (!matchUser)
      return next(new ErrorResponse('Could not retrieve your order information.', 404));

    /*const content = `
      <h2>${matchUser?.firstName || matchUser?.email?.substr(0, matchUser?.email?.indexOf('@'))},</h2>
      <br/><h3>Your order has been placed successfully.</h3>
      <p>Our cooks will deliver your order as soon as it's ready.</p><br/>
      For recall, here's your order details:
      <ul>
        ${orderContent?.appetizer?.length > 0 ? `<li>Appetizers:
          <ul>
            ${orderContent.appetizer.map(appe => `<li>${appe}</li>`)}
          </ul>
        </li>` : ''}
        ${orderContent?.mainDish?.length > 0 ? `<li>Main dish:
          <ul>
            ${orderContent.mainDish.map(dish => `<li>${dish}</li>`)}
          </ul>
        </li>` : ''}
        ${orderContent?.dessert?.length > 0 ? `<li>Dessert:
          <ul>
            ${orderContent.dessert.map(dess => `<li>${dess}</li>`)}
          </ul>
        </li>` : ''}
      </ul><br/>
      <h4>Thank you for your support, we hope you enjoy your meal and comeback for future ones.</h4>
      <p>The Good Fork &copy; - 2021</p>
    `;*/
    
    const order = await Order.create({
      user: matchUser,

      appetizer: appetizer.length === 0 ? null : appetizer,
      mainDish: mainDish.length === 0 ? null : mainDish,
      dessert: dessert.length === 0 ? null : dessert,
      drink: drink.length === 0 ? null : drink,
      alcohol: alcohol.length === 0 ? null : alcohol,

      price,
      currency: 'EUR',
      dateOrdered: Date.now(),
      status: 'pending',
      validated: false
    });

    //sendEmail({email: matchUser.email, subject: 'The Good Fork - Meal Order', content});
    return res.status(200).json({success: true, order});
    
  } catch (error) { console.log(error); return next(new ErrorResponse('Could not place your order.', 500)); }
};


exports.editOrder = async (req, res, next) => {
  let token;
  const newOrder = req.body;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
    token = req.headers.authorization.split(' ')[1];

  if (!token)
    return next(new ErrorResponse('Could not verify your account, please sign out then in again.', 401));

  if (!req.params.orderid)
    return next(new ErrorResponse('Could not retrieve your order information.', 400));

    
  try {
    const order = await Order.findById(req.params.orderid);

    if (!order)
      return next(new ErrorResponse('Could not find your order, please try again.', 404));

    if (!order.validated) {
      order.appetizer = newOrder.appetizer;
      order.mainDish = newOrder.mainDish;
      order.dessert = newOrder.dessert;
      order.drink = newOrder.drink;
      order.alcohol = newOrder.alcohol;

      order.price = newOrder.price;
      order.status = newOrder.status;
      order.validated = newOrder.validated;

      order.save();
      return res.status(200).json({success: true, order});

    } else return res.status(423).json({success: false, error: 'You cannot edit your order anymore.'});
    
  } catch (error) { return next(new ErrorResponse('Could not edit your order.', 500)); }
};


exports.deleteOrder = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
    token = req.headers.authorization.split(' ')[1];

  if (!token)
    return next(new ErrorResponse('Could not get your orders, please sign out then in again.', 401));

  if (!req.params.orderid)
    return next(new ErrorResponse('Could not retrieve your order information.', 400));

    
  try {
    const order = await Order.findByIdAndDelete(req.params.orderid);

    if (!order)
      return next(new ErrorResponse('Could not delete your order, please try again.', 404));

    return res.status(200).json({success: true});
    
  } catch (error) { return next(new ErrorResponse('Could not delete your order.', 500)); }
};


exports.getOrders = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
    token = req.headers.authorization.split(' ')[1];

  if (!token)
    return next(new ErrorResponse('Could not get your orders, please try again or sign out then in again.', 401));


  try {
    const decoded = JsonWebToken.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user)
      return next(new ErrorResponse('Could not get your orders, please try again.', 404));

    const orders = await (user.type === 'user' ? Order.find({user: user.email}) : Order.find({validated: user.type !== 'waiter'}));

    return res.status(200).json({success: true, orders});

  } catch (error) { return next(new ErrorResponse('Could not retrieve orders.', 500)); }
};