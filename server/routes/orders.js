const express = require('express');
const router = express.Router();

// Routes commandes
router.get('/', (req, res) => {
  res.json({ message: 'Get user orders - à implémenter' });
});

router.post('/', (req, res) => {
  res.json({ message: 'Create order - à implémenter' });
});

router.get('/:id', (req, res) => {
  res.json({ message: `Get order ${req.params.id} - à implémenter` });
});

router.put('/:id/status', (req, res) => {
  res.json({ message: `Update order ${req.params.id} status - à implémenter` });
});

module.exports = router;
