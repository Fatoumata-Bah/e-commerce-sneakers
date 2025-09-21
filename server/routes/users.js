const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const router = express.Router();

router.get('/profile', authenticateToken, (req, res) => {
  res.json({ 
    message: 'Get user profile',
    user: {
      id: req.user.id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      role: req.user.role
    }
  });
});

router.put('/profile', authenticateToken, (req, res) => {
  res.json({ message: 'Update user profile - authenticated user only' });
});

router.get('/', authenticateToken, requireRole(['admin']), (req, res) => {
  res.json({ message: 'Get all users - admin only' });
});

module.exports = router;
