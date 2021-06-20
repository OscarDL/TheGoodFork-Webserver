require('dotenv').config({path: './config.env'});

const stripe = require('stripe')(process.env.STRIPE_SK);

const ErrorResponse = require('../utils/errorResponse');


exports.create = async (req, res, next) => {
  const {card, order} = req.body;
  
  try {
    const paymentMethod = await stripe.paymentMethods.create({ type: 'card', card });

    const payment = await stripe.paymentIntents.create({
      currency: 'eur',
      customer: req.user.stripeId,
      payment_method: paymentMethod.id,
      amount: Math.round((order.price + order.tip)*100)
    });

    const intent = await stripe.paymentIntents.confirm(payment.id);

    return res.status(200).json({success: true, intent});

  } catch (error) {
    return next(new ErrorResponse('Erreur de traitement du paiement.', 500));
  }
};


exports.intent = async (req, res, next) => {
  try {
    const intent = await stripe.paymentIntents.retrieve(req.params.intent);

    return res.status(200).json({success: true, intent});

  } catch (error) {
    return next(new ErrorResponse("Erreur de récupération de l'état du paiement.", 500));
  }
};