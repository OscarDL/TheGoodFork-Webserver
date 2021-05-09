const express = require('express');

const { getBookings, getDayBookings, getBooking, createBooking, updateBooking, deleteBooking } = require('../controllers/bookings');

const router = express.Router();

router.route('/').get(getBookings);
router.route('/:id').get(getBooking);
router.route('/create').post(createBooking);
router.route('/day/:day').get(getDayBookings);
router.route('/update/:id').put(updateBooking);
router.route('/delete/:id').delete(deleteBooking);

module.exports = router;