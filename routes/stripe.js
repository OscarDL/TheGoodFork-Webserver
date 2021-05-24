const express = require('express');

const { authProtection } = require('../middleware/auth');
const { create, intent, cancel } = require('../controllers/stripe');

const router = express.Router();

router.route('/').post(authProtection, create);
router.route('/:intent').get(authProtection, intent);
router.route('/refund/:intent').get(authProtection, cancel);

module.exports = router;