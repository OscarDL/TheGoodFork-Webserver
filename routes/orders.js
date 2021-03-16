const express = require('express');

const { createOrder, editOrder, getOrders, validateOrder } = require('../controllers/orders');

const router = express.Router();

router.route('/').get(getOrders);
router.route('/create').post(createOrder);
router.route('/edit/:orderid').put(editOrder);
router.route('/validate/:orderid').put(validateOrder);

module.exports = router;