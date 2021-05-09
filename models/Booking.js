const mongoose = require('mongoose');


const BookingSchema = new mongoose.Schema({
  user: {
    type: Object,
    required: [true]
  },
  dateSent: {
    type: Number,
    required: [true]
  },
  dateBooked: {
    type: Number,
    required: [true]
  },
  period: {
    type: Number,
    required: [true]
  },
  table: {
    type: Number,
    required: [true]
  }
});

const Booking = mongoose.model('Booking', BookingSchema, 'bookings');
module.exports = Booking;