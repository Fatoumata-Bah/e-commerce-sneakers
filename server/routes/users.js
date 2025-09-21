const express = require('express');
const router = express.Router();

// Routes utilisateurs
router.get('/profile', (req, res) => {
  res.json({ message: 'Get user profile - à implémenter' });
});

router.put('/profile', (req, res) => {
  res.json({ message: 'Update user profile - à implémenter' });
});

router.get('/', (req, res) => {
  res.json({ message: 'Get all users (admin only) - à implémenter' });
});

module.exports = router;
