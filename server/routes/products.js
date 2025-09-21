const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Get all products - public access' });
});

router.get('/:id', (req, res) => {
  res.json({ message: `Get product ${req.params.id} - public access` });
});

router.post('/', authenticateToken, requireRole(['admin', 'seller']), (req, res) => {
  res.json({ message: 'Create product - admin/seller only' });
});

router.put('/:id', authenticateToken, requireRole(['admin', 'seller']), (req, res) => {
  res.json({ message: `Update product ${req.params.id} - admin/seller only` });
});

router.delete('/:id', authenticateToken, requireRole(['admin']), (req, res) => {
  res.json({ message: `Delete product ${req.params.id} - admin only` });
});

module.exports = router;
