const express = require('express');

const { authProtection } = require('../middleware/auth');
const { createIntent, getIntent, cancelIntent } = require('../controllers/stripe');

const router = express.Router();

router.route('/pay').post(authProtection, createIntent);
router.route('/get/:intent').get(authProtection, getIntent);
router.route('/refund/:intent').get(authProtection, cancelIntent);

module.exports = router;