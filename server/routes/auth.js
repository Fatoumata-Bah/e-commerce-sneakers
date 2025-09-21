const express = require('express');
const router = express.Router();

// Routes d'authentification (à implémenter)
router.post('/register', (req, res) => {
  res.json({ message: 'Register route - à implémenter' });
});

router.post('/login', (req, res) => {
  res.json({ message: 'Login route - à implémenter' });
});

router.post('/logout', (req, res) => {
  res.json({ message: 'Logout route - à implémenter' });
});

module.exports = router;
