const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  res.json({ message: 'Get user orders - authenticated user only' });
});

router.post('/', authenticateToken, (req, res) => {
  res.json({ message: 'Create order - authenticated user only' });
});

router.get('/:id', authenticateToken, (req, res) => {
  res.json({ message: `Get order ${req.params.id} - authenticated user only` });
});

router.put('/:id/status', authenticateToken, requireRole(['admin', 'seller']), (req, res) => {
  res.json({ message: `Update order ${req.params.id} status - admin/seller only` });
});

module.exports = router;
