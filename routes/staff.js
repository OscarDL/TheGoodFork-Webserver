const express = require('express');

const { adminProtection } = require('../middleware/admin');
const { staff, create, update, remove } = require('../controllers/staff');

const router = express.Router();

router.route('/').get(adminProtection, staff);
router.route('/').post(adminProtection, create);
router.route('/:id').put(adminProtection, update);
router.route('/:id').delete(adminProtection, remove);

module.exports = router;