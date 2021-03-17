const mongoose = require('mongoose');


const DishSchema = new mongoose.Schema({
  type: String,
  price: Number,
  currency: String,
  name: String,
  detail: String,
  available: Boolean
});

const Dish = mongoose.model('Dish', DishSchema, 'dishes');
module.exports = Dish;
