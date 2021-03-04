const express = require('express');

const { deleteStaffAccount, getUserAccounts, getStaffAccounts, updateStaffAccount } = require('../controllers/admin');

const router = express.Router();

router.route('/accounts/user').get(getUserAccounts);
router.route('/accounts/staff').get(getStaffAccounts);
router.route('/accounts/deleteStaff').get(deleteStaffAccount);
router.route('/accounts/updateStaff/:id').put(updateStaffAccount);

module.exports = router;