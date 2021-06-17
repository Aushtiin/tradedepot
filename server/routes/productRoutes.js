const express = require('express');
const { createProduct, getProducts, comment, getProduct, getComments, } = require('../controllers/productController');
const protect = require('../middleware/authMiddleware');
const router = express.Router()

router.post('/new', protect, createProduct)
router.get('/', protect, getProducts)
router.post('/comment', protect, comment)
router.route('/:id').get(getProduct).get(getComments)
// router.get('/:id', getComments)

module.exports = router