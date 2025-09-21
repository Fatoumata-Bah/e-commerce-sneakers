const express = require('express');
const router = express.Router();

// Routes principales (à implémenter progressivement)
router.use('/auth', require('./auth'));
router.use('/products', require('./products'));
router.use('/users', require('./users'));
router.use('/orders', require('./orders'));

module.exports = router;
