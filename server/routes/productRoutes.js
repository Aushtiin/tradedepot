const express = require('express');
const { createProduct, getProducts, comment } = require('../controllers/productController');
const protect = require('../middleware/authMiddleware');
const router = express.Router()

router.post('/new', protect, createProduct)
router.get('/', protect, getProducts)
router.post('/comment', protect, comment)

module.exports = router