const mongoose = require('mongoose');


const DishSchema = new mongoose.Schema({
  name: String,
  type: String,
  price: Number,
  stock: Number,
  detail: String,
  currency: String,
  available: Boolean
});

const Dish = mongoose.model('Dish', DishSchema, 'dishes');
module.exports = Dish;
