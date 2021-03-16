const mongoose = require('mongoose');


const OrderSchema = new mongoose.Schema({
  token: {
    type: String,
    required: [true]
  },
  orderContent: {
    type: Object,
    required: [true, "Order must not be empty"]
  },
  dateOrdered: Date,
  orderStatus: String,
  validated: Boolean
});

const Order = mongoose.model('Order', OrderSchema, 'orders');
module.exports = Order;