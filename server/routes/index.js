const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth'));
router.use('/products', require('./products'));
router.use('/cart', require('./cart'));
router.use('/orders', require('./orders'));
router.use('/sellers', require('./sellers'));
router.use('/stock-reservations', require('./stockReservations'));
router.use('/expired-cart', require('./expiredCart'));

module.exports = router;
