require('dotenv').config({path: './config.env'});

const stripe = require('stripe')(process.env.STRIPE_SK);

const ErrorResponse = require('../utils/errorResponse');


exports.createIntent = async (req, res, next) => {
  const {card, order} = req.body;
  
  try {
    const paymentMethod = await stripe.paymentMethods.create({ type: 'card', card });

    const intent = await stripe.paymentIntents.create({
      currency: 'eur',
      amount: order.price * 100,
      customer: req.user.stripeId,
      payment_method: paymentMethod.id
    });

    return res.status(200).json({success: true, intent});

  } catch (error) { next(new ErrorResponse(error?.raw?.message ?? 'Could not create your stripe order.', 500)); }
};


exports.confirmIntent = async (req, res, next) => {
  try {
    const intent = await stripe.paymentIntents.confirm(req.params.intent);

    return res.status(200).json({success: true, intent});

  } catch (error) { next(new ErrorResponse(error?.raw?.message ?? 'Could not confirm stripe payment.', 500)); }
};