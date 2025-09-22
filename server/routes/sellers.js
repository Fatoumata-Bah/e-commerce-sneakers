const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { User } = require('../database');
const router = express.Router();

// Route pour obtenir les informations du seller connecté
router.get('/me', authenticateToken, requireRole(['seller']), async (req, res) => {
  try {
    const seller = await User.findByPk(req.user.id, {
      attributes: ['id', 'firstName', 'lastName', 'email', 'sellerInfo']
    });

    if (!seller) {
      return res.status(404).json({ error: 'Seller not found' });
    }

    res.json({ seller });
  } catch (error) {
    console.error('Get seller info error:', error);
    res.status(500).json({ error: 'Failed to fetch seller information' });
  }
});

// Route pour mettre à jour les informations du seller
router.put('/me', authenticateToken, requireRole(['seller']), async (req, res) => {
  try {
    const { businessName, description, logo, website, phone } = req.body;

    if (!businessName) {
      return res.status(400).json({ error: 'Business name is required' });
    }

    const seller = await User.findByPk(req.user.id);
    if (!seller) {
      return res.status(404).json({ error: 'Seller not found' });
    }

    const sellerInfo = {
      businessName,
      description: description || null,
      logo: logo || null,
      website: website || null,
      phone: phone || null
    };

    await seller.update({ sellerInfo });

    res.json({
      message: 'Seller information updated successfully',
      seller: {
        id: seller.id,
        firstName: seller.firstName,
        lastName: seller.lastName,
        email: seller.email,
        sellerInfo: seller.sellerInfo
      }
    });
  } catch (error) {
    console.error('Update seller info error:', error);
    res.status(500).json({ error: 'Failed to update seller information' });
  }
});

// Route pour obtenir la liste des sellers (admin uniquement)
router.get('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const sellers = await User.findAll({
      where: { role: 'seller' },
      attributes: ['id', 'firstName', 'lastName', 'email', 'sellerInfo', 'isActive', 'createdAt']
    });

    res.json({ sellers });
  } catch (error) {
    console.error('Get sellers error:', error);
    res.status(500).json({ error: 'Failed to fetch sellers' });
  }
});

module.exports = router;
