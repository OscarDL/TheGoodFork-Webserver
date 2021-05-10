const express = require('express');

const { adminProtection } = require('../middleware/admin');
const { deleteStaffAccount, getUserAccounts, getStaffAccounts, updateStaffAccount, registerStaffAccount } = require('../controllers/admin');

const router = express.Router();

router.route('/accounts/user').get(adminProtection, getUserAccounts);
router.route('/accounts/staff').get(adminProtection, getStaffAccounts);
router.route('/accounts/update/:id').put(adminProtection, updateStaffAccount);
router.route('/accounts/register').post(adminProtection, registerStaffAccount);
router.route('/accounts/delete/:id').delete(adminProtection, deleteStaffAccount);

module.exports = router;