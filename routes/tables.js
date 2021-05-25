const express = require('express');

const { adminProtection } = require('../middleware/admin');
const { tables, update } = require('../controllers/tables');

const router = express.Router();

router.route('/').get(adminProtection, tables);
router.route('/').put(adminProtection, update);

module.exports = router;