const express = require('express');

const { deleteStaffAccount, getUserAccounts, getStaffAccounts, updateStaffAccount, registerStaffAccount } = require('../controllers/admin');

const router = express.Router();

router.route('/accounts/user').get(getUserAccounts);
router.route('/accounts/staff').get(getStaffAccounts);
router.route('/accounts/updateStaff/:id').put(updateStaffAccount);
router.route('/accounts/registerStaff').post(registerStaffAccount);
router.route('/accounts/deleteStaff/:id').delete(deleteStaffAccount);

module.exports = router;