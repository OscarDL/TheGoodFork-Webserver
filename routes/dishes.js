const express = require('express');

const { createDish, editDish, getDishes, deleteDish } = require('../controllers/dishes');

const router = express.Router();

router.route('/').get(getDishes);
router.route('/create').post(createDish);
router.route('/edit/:dishid').put(editDish);
router.route('/delete/:dishid').delete(deleteDish);

module.exports = router;