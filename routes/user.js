const express = require('express');

const { authProtection } = require('../middleware/auth');
const { login, register, forgot, reset, remove, data, update } = require('../controllers/user');

const router = express.Router();

router.route('/login').post(login);
router.route('/register').post(register);

router.route('/forgot').put(forgot);
router.route('/reset/:token').put(reset);

router.route('/').get(authProtection, data);
router.route('/').put(authProtection, update);
router.route('/').delete(authProtection, remove);

module.exports = router;