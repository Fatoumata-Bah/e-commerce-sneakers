const express = require('express');
const router = express.Router();

router.post('/register', (req, res) => {
  res.json({ message: 'Register' });
});

router.post('/login', (req, res) => {
  res.json({ message: 'Login' });
});

router.post('/logout', (req, res) => {
  res.json({ message: 'Logout' });
});

module.exports = router;
