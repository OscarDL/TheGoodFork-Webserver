const mongoose = require('mongoose');


const OrderSchema = new mongoose.Schema({
  user: {
    type: Object,
    required: [true]
  },
  
  appetizer: Array,
  mainDish: Array,
  dessert: Array,
  drink: Array,
  alcohol: Array,
  details: String,
  
  price: {
    type: Number,
    required: [true]
  },
  currency: {
    type: String,
    required: [true]
  },
  dateOrdered: {
    type: Number,
    required: [true]
  },
  orderedBy: {
    type: String,
    required: [true]
  },
  type: {
    type: Object,
    required: [true]
  },
  status: {
    type: String,
    required: [true]
  },
  validated: {
    type: Boolean,
    required: [true]
  },
  paid: {
    type: Boolean,
    required: [true]
  },
  stripePi: String
});

const Order = mongoose.model('Order', OrderSchema, 'orders');
module.exports = Order;