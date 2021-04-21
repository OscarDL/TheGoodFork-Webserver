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
    retuired: [true]
  },
  currency: {
    type: String,
    retuired: [true]
  },
  dateOrdered: {
    type: Number,
    retuired: [true]
  },
  orderedBy: {
    type: String,
    retuired: [true]
  },
  status: {
    type: String,
    retuired: [true]
  },
  validated: {
    type: Boolean,
    retuired: [true]
  },
});

const Order = mongoose.model('Order', OrderSchema, 'orders');
module.exports = Order;