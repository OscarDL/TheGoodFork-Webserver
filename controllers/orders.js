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
    return next(new ErrorResponse('Could not place your order, please sign out then in again.', 401));


  try {
    const decoded = JsonWebToken.verify(token, process.env.JWT_SECRET);
    const matchUser = user.type === 'waiter' ? await User.findOne({email: user?.email}) : await User.findById(decoded.id); // Find by email for waiters
    
    if (!matchUser)
      return next(new ErrorResponse('Could not retrieve your order information.', 404));

    /*const content = `
      <h2>${matchUser?.firstName || matchUser?.email},</h2>
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

      appetizer,
      mainDish,
      dessert,
      drink,
      alcohol,

      price,
      currency: 'EUR',
      dateOrdered: Date.now(),
      status: 'pending',
      validated: false
    });

    //sendEmail({email: matchUser.email, subject: 'The Good Fork - Meal Order', content});
    return res.status(200).json({success: true, order});
    
  } catch (error) { return next(error); }
};


exports.editOrder = async (req, res, next) => {
  let token;
  const newOrder = req.body;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
    token = req.headers.authorization.split(' ')[1];

  if (!token)
    return next(new ErrorResponse('Could not get your orders, please try again or sign out then in again.', 401));

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
      res.status(200).json({success: true, order});

    } else res.status(423).json({success: false, error: 'You cannot edit your order anymore.'});
    
  } catch (error) { return next(error); }
};


exports.deleteOrder = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
    token = req.headers.authorization.split(' ')[1];

  if (!token)
    return next(new ErrorResponse('Could not get your orders, please try again or sign out then in again.', 401));

  if (!req.params.orderid)
    return next(new ErrorResponse('Could not retrieve your order information.', 400));

    
  try {
    const order = await Order.deleteOne({_id: req.params.orderid});

    if (!order)
      return next(new ErrorResponse('Could not delete your order, please try again.', 404));

    res.status(200).json({success: true});
    
  } catch (error) { return next(error); }
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

    let orders;

    if (user.type === 'user') {
      orders = await Order.find({user: user.email});
    } else if (user.type === 'waiter') {
      orders = await Order.find({validated: false});
    } else {
      orders = await Order.find({validated: true});
    }

    return res.status(200).json({success: true, orders});

  } catch (error) { return next(error); }
};