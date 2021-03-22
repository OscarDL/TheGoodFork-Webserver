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

  price: Number,
  currency: String,
  dateOrdered: Number,
  orderStatus: String,
  validated: Boolean
});

const Order = mongoose.model('Order', OrderSchema, 'orders');
module.exports = Order;