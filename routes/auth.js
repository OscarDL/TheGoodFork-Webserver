const express = require('express');

const { login, register, forgotpw, resetpw } = require('../controllers/auth');

const router = express.Router();

router.route('/login').post(login);
router.route('/register').post(register);
router.route('/forgotpassword').post(forgotpw);
router.route('/resetpassword/:resetToken').put(resetpw);

module.exports = router;