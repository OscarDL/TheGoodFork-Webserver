const express = require('express');

const { authProtection } = require('../middleware/auth');
const { login, logout, register, forgot, reset, remove, data, updateData, updatePw } = require('../controllers/user');

const router = express.Router();

router.route('/login').post(login);
router.route('/logout').get(logout);
router.route('/register').post(register);

router.route('/forgot').put(forgot);
router.route('/reset/:token').put(reset);

router.route('/').get(authProtection, data);
router.route('/').delete(authProtection, remove);
router.route('/data').put(authProtection, updateData);
router.route('/password').put(authProtection, updatePw);

module.exports = router;