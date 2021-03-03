const express = require('express');

const { getUserAccounts, getStaffAccounts, updateStaffAccount } = require('../controllers/admin');

const router = express.Router();

router.route('/accounts/user').get(getUserAccounts);
router.route('/accounts/special').get(getStaffAccounts);
router.route('/accounts/update/:email').put(updateStaffAccount);

module.exports = router;