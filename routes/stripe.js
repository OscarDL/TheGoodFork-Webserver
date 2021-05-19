const express = require('express');

const { authProtection } = require('../middleware/auth');
const { createIntent, confirmIntent } = require('../controllers/stripe');

const router = express.Router();

router.route('/pay').post(authProtection, createIntent);
router.route('/confirm/:intent').get(authProtection, confirmIntent);

module.exports = router;