require('dotenv').config({path: './config.env'});

const stripe = require('stripe')(process.env.STRIPE_SK);

const ErrorResponse = require('../utils/errorResponse');


exports.createIntent = async (req, res, next) => {
  const {card, order} = req.body;
  
  try {
    const paymentMethod = await stripe.paymentMethods.create({ type: 'card', card });

    const payment = await stripe.paymentIntents.create({
      currency: 'eur',
      customer: req.user.stripeId,
      amount: ~~(order.price * 100),
      payment_method: paymentMethod.id
    });

    const intent = await stripe.paymentIntents.confirm(payment.id);

    return res.status(200).json({success: true, intent});

  } catch (error) { next(new ErrorResponse(error?.raw?.message ?? 'Could not process your stripe payment.', 500)); }
};


exports.getIntent = async (req, res, next) => {
  try {
    const intent = await stripe.paymentIntents.retrieve(req.params.intent);

    return res.status(200).json({success: true, intent});

  } catch (error) { console.log(error); next(new ErrorResponse(error?.raw?.message ?? 'Could not retrieve your stripe payment.', 500)); }
};


exports.cancelIntent = async (req, res, next) => {
  try {
    await stripe.refunds.create({payment_intent: req.params.intent});

    return res.status(200).json({success: true});

  } catch (error) { next(new ErrorResponse(error?.raw?.message ?? 'Could not retrieve your stripe payment.', 500)); }
};