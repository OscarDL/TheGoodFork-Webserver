const express = require('express');

const { authProtection } = require('../middleware/auth');
const { orders, order, create, update, cancel } = require('../controllers/orders');

const router = express.Router();

router.route('/').get(authProtection, orders);
router.route('/:id').get(authProtection, order);

router.route('/').post(authProtection, create);
router.route('/:id').put(authProtection, update);
router.route('/:id').delete(authProtection, cancel);

module.exports = router;