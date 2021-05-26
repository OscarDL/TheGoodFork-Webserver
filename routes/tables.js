const express = require('express');

const { authProtection } = require('../middleware/auth');
const { adminProtection } = require('../middleware/admin');
const { tables, update } = require('../controllers/tables');

const router = express.Router();

router.route('/').get(authProtection, tables);
router.route('/').put(adminProtection, update);

module.exports = router;