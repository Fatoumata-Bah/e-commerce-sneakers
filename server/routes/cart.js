const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { CartItem, ProductVariant, Product } = require('../database');
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

    if (variant.stock < quantity) {
      return res.status(400).json({ 
        error: `Stock insuffisant. Stock disponible: ${variant.stock}` 
      });
    }

    const existingItem = await CartItem.findOne({
      where: { userId: req.user.id, productVariantId }
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (variant.stock < newQuantity) {
        return res.status(400).json({ 
          error: `Stock insuffisant. Stock disponible: ${variant.stock}` 
        });
      }
      await existingItem.update({ quantity: newQuantity });
    } else {
      await CartItem.create({
        userId: req.user.id,
        productVariantId,
        quantity
      });
    }

    res.json({ message: 'Item added to cart' });
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
