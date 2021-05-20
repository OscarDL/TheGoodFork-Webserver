const express = require('express');

const { authProtection } = require('../middleware/auth');
const { getOrders, getOrder, createOrder, updateOrder, cancelOrder } = require('../controllers/orders');

const router = express.Router();

router.route('/').get(authProtection, getOrders);
router.route('/:id').get(authProtection, getOrder);
router.route('/create').post(authProtection, createOrder);
router.route('/update/:id').put(authProtection, updateOrder);
router.route('/cancel/:id').delete(authProtection, cancelOrder);

module.exports = router;