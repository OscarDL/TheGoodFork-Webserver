const mongoose = require('mongoose');


const DishSchema = new mongoose.Schema({
  // necessary dish info
});

const Dish = mongoose.model('Dish', DishSchema, 'dishes');
module.exports = Dish;