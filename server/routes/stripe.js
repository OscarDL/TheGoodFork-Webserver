const express = require('express');

const { authProtection } = require('../middleware/auth');
const { create, intent } = require('../controllers/stripe');

const router = express.Router();

router.route('/').post(authProtection, create);
router.route('/:intent').get(authProtection, intent);

module.exports = router;