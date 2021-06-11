const express = require('express');

const { adminProtection } = require('../middleware/admin');
const { dishes, create, update, remove } = require('../controllers/dishes');

const router = express.Router();

router.route('/').get(dishes);
router.route('/').post(adminProtection, create);
router.route('/:id').put(adminProtection, update);
router.route('/:id').delete(adminProtection, remove);

module.exports = router;