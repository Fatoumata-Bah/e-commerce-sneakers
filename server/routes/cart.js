const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { CartItem, ProductVariant, Product } = require('../database');
const StockReservationService = require('../services/stockReservationService');
const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const cartItems = await CartItem.findAll({
      where: { userId: req.user.id },
      include: [{
        model: ProductVariant,
        include: [{ model: Product }]
      }]
    });

    const total = cartItems.reduce((sum, item) => {
      return sum + (item.quantity * item.ProductVariant.Product.basePrice);
    }, 0);

    res.json({
      items: cartItems,
      total: parseFloat(total.toFixed(2)),
      count: cartItems.reduce((sum, item) => sum + item.quantity, 0)
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { productVariantId, quantity = 1 } = req.body;

    if (!productVariantId) {
      return res.status(400).json({ error: 'Product variant ID required' });
    }

    const variant = await ProductVariant.findByPk(productVariantId);
    if (!variant) {
      return res.status(404).json({ error: 'Product variant not found' });
    }

    // Vérifier le stock disponible réel (tenant compte des réservations)
    const availableStock = await StockReservationService.getAvailableStock(productVariantId);
    
    if (availableStock < quantity) {
      return res.status(400).json({ 
        error: `Stock insuffisant. Stock disponible: ${availableStock}` 
      });
    }

    const existingItem = await CartItem.findOne({
      where: { userId: req.user.id, productVariantId }
    });

    let finalQuantity = quantity;
    
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      // Vérifier le stock disponible réel pour la nouvelle quantité totale
      if (availableStock < newQuantity - existingItem.quantity) {
        return res.status(400).json({ 
          error: `Stock insuffisant. Stock disponible: ${availableStock}` 
        });
      }
      await existingItem.update({ quantity: newQuantity });
      finalQuantity = newQuantity;
    } else {
      await CartItem.create({
        userId: req.user.id,
        productVariantId,
        quantity
      });
      finalQuantity = quantity;
    }

    // Réserver le stock pour cet utilisateur (2 minutes pour les tests)
    const reservationResult = await StockReservationService.reserveStock({
      userId: req.user.id,
      sessionId: null,
      productVariantId,
      quantity: finalQuantity,
      durationMinutes: 2 // 2 minutes pour les tests
    });

    if (reservationResult.success) {
      res.json({ 
        message: 'Item added to cart and stock reserved',
        reservation: reservationResult.reservation
      });
    } else {
      // Si la réservation échoue, on garde quand même l'article dans le panier
      // mais on avertit l'utilisateur
      res.json({ 
        message: 'Item added to cart',
        warning: 'Stock reservation failed: ' + reservationResult.error
      });
    }
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: 'Failed to add to cart' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: 'Valid quantity required' });
    }

    const cartItem = await CartItem.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [{ model: ProductVariant }]
    });

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    if (cartItem.ProductVariant.stock < quantity) {
      return res.status(400).json({ 
        error: `Stock insuffisant. Stock disponible: ${cartItem.ProductVariant.stock}` 
      });
    }

    await cartItem.update({ quantity });
    res.json({ message: 'Cart item updated' });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ error: 'Failed to update cart' });
  }
});

// Route pour vider complètement le panier (AVANT /:id pour éviter les conflits)
router.delete('/clear', authenticateToken, async (req, res) => {
  try {
    await CartItem.destroy({
      where: { userId: req.user.id }
    });

    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const cartItem = await CartItem.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    await cartItem.destroy();
    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ error: 'Failed to remove from cart' });
  }
});

module.exports = router;
