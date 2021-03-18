const mongoose = require('mongoose');


const OrderSchema = new mongoose.Schema({
  user: {
    type: Object,
    required: [true]
  },
  orderContent: {
    type: Object,
    required: [true, "Order must not be empty"]
  },
  price: Number,
  currency: String,
  dateOrdered: Number,
  orderStatus: String,
  validated: Boolean
});

const Order = mongoose.model('Order', OrderSchema, 'orders');
module.exports = Order;