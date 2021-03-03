const express = require('express');

const { getUserInfo, getUserAccounts, getSpecialAccounts } = require('../controllers/admin');

const router = express.Router();

router.route('/accounts/user').get(getUserAccounts);
router.route('/accounts/special').get(getSpecialAccounts);
//router.route('/accounts/user/:emailAddress').get(getUserInfo);

module.exports = router;