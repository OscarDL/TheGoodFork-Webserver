const express = require('express');

const { authProtection } = require('../middleware/auth');
const { login, register, forgot, reset, remove, data } = require('../controllers/auth');

const router = express.Router();

router.route('/login').post(login);
router.route('/register').post(register);

router.route('/forgot').post(forgot);
router.route('/reset/:token').put(reset);

router.route('/').get(authProtection, data);
router.route('/').delete(authProtection, remove);

module.exports = router;