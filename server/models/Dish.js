const mongoose = require('mongoose');


const DishSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true]
  },
  type: {
    type: String,
    required: [true]
  },
  price: {
    type: Number,
    required: [true]
  },

  image: String,
  stock: Number,
  detail: String,
  currency: String,

  available: {
    type: Boolean,
    required: [true]
  }
});

const Dish = mongoose.model('Dish', DishSchema, 'dishes');
module.exports = Dish;
