const express = require('express');
const router = express.Router();

// Routes produits
router.get('/', (req, res) => {
  res.json({ message: 'Get all products - à implémenter' });
});

router.get('/:id', (req, res) => {
  res.json({ message: `Get product ${req.params.id} - à implémenter` });
});

router.post('/', (req, res) => {
  res.json({ message: 'Create product - à implémenter' });
});

router.put('/:id', (req, res) => {
  res.json({ message: `Update product ${req.params.id} - à implémenter` });
});

router.delete('/:id', (req, res) => {
  res.json({ message: `Delete product ${req.params.id} - à implémenter` });
});

module.exports = router;
