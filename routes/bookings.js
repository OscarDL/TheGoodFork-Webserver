const express = require('express');

const { authProtection } = require('../middleware/auth');
const { bookings, dayBookings, booking, create, update, remove } = require('../controllers/bookings');

const router = express.Router();

router.route('/').get(bookings);
router.route('/:id').get(authProtection, booking);
router.route('/day/:day').get(authProtection, dayBookings);

router.route('/').post(authProtection, create);
router.route('/:id').put(authProtection, update);
router.route('/:id').delete(authProtection, remove);

module.exports = router;