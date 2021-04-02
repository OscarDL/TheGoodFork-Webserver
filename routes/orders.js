const express = require('express');

const { createOrder, editOrder, getOrders, deleteOrder } = require('../controllers/orders');

const router = express.Router();

router.route('/').get(getOrders);
router.route('/create').post(createOrder);
router.route('/edit/:orderid').put(editOrder);
router.route('/delete/:orderid').delete(deleteOrder);

module.exports = router;