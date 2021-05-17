const express = require('express');

const { getOrders, getOrder, payOrder, createOrder, updateOrder, deleteOrder } = require('../controllers/orders');

const router = express.Router();

router.route('/').get(getOrders);
router.route('/:id').get(getOrder);
router.route('/pay').post(payOrder);
router.route('/create').post(createOrder);
router.route('/update/:id').put(updateOrder);
router.route('/delete/:id').delete(deleteOrder);

module.exports = router;