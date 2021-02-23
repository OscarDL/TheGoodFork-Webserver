const express = require('express');

const { login, register, forgotpw, resetpw, userinfo } = require('../controllers/auth');

const router = express.Router();

router.route('/login').post(login);
router.route('/userinfo').get(userinfo);
router.route('/register').post(register);
router.route('/forgotpassword').post(forgotpw);
router.route('/resetpassword/:resetToken').put(resetpw);

module.exports = router;