const express = require('express');

const { getDishes, createDish, updateDish, deleteDish } = require('../controllers/dishes');

const router = express.Router();

router.route('/').get(getDishes);
router.route('/create').post(createDish);
router.route('/update/:id').put(updateDish);
router.route('/delete/:id').delete(deleteDish);

module.exports = router;