const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { Order, OrderItem, CartItem, ProductVariant, Product, User, sequelize } = require('../database');
const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    let orders;

    if (req.user.role === 'customer') {
      // Les clients voient uniquement leurs propres commandes
      orders = await Order.findAll({
        where: { userId: req.user.id },
        include: [{
          model: OrderItem,
          include: [{
            model: ProductVariant,
            include: [{
              model: Product,
              include: [{
                model: User,
                as: 'Seller',
                attributes: ['id', 'firstName', 'lastName', 'sellerInfo', 'role']
              }]
            }]
          }]
        }, {
          model: User, // ✅ Inclure les données du client
          attributes: ['id', 'firstName', 'lastName', 'email', 'role']
        }],
        order: [['createdAt', 'DESC']]
      });
    } else if (req.user.role === 'seller') {
      // Les sellers voient uniquement les commandes contenant leurs produits
      // Approche simplifiée : récupérer toutes les commandes puis filtrer
      const allOrders = await Order.findAll({
        include: [{
          model: OrderItem,
          include: [{
            model: ProductVariant,
            include: [{
              model: Product,
              include: [{
                model: User,
                as: 'Seller',
                attributes: ['id', 'firstName', 'lastName', 'sellerInfo', 'role']
              }]
            }]
          }]
        }, {
          model: User, // ✅ Inclure les données du client
          attributes: ['id', 'firstName', 'lastName', 'email', 'role']
        }],
        order: [['createdAt', 'DESC']]
      });
      
      // Filtrer les commandes et leurs items pour ce seller
      orders = allOrders.map(order => {
        const sellerItems = order.OrderItems.filter(item => 
          item.ProductVariant && 
          item.ProductVariant.Product && 
          item.ProductVariant.Product.sellerId === req.user.id
        );
        
        return {
          ...order.toJSON(),
          OrderItems: sellerItems
        };
      }).filter(order => order.OrderItems.length > 0);
      
    } else {
      // Les admins voient toutes les commandes
      orders = await Order.findAll({
        include: [{
          model: OrderItem,
          include: [{
            model: ProductVariant,
            include: [{
              model: Product,
              include: [{
                model: User,
                as: 'Seller',
                attributes: ['id', 'firstName', 'lastName', 'sellerInfo', 'role']
              }]
            }]
          }]
        }, {
          model: User, // ✅ Inclure les données du client
          attributes: ['id', 'firstName', 'lastName', 'email', 'role']
        }],
        order: [['createdAt', 'DESC']]
      });
    }

    res.json({ orders });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { shippingAddress, paymentMethod, paymentDetails } = req.body;

    if (!shippingAddress || !paymentMethod) {
      return res.status(400).json({ error: 'Shipping address and payment method required' });
    }

    const cartItems = await CartItem.findAll({
      where: { userId: req.user.id },
      include: [{
        model: ProductVariant,
        include: [{ model: Product }]
      }],
      transaction
    });

    if (cartItems.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Vérifier la disponibilité du stock avant de créer la commande
    for (const item of cartItems) {
      // Re-vérifier le stock en temps réel avec un verrou
      const currentVariant = await ProductVariant.findByPk(item.ProductVariant.id, {
        lock: true,
        transaction
      });
      
      if (currentVariant.stock < item.quantity) {
        await transaction.rollback();
        return res.status(400).json({ 
          error: `Stock insuffisant pour ${item.ProductVariant.Product.name} taille ${item.ProductVariant.size} ${item.ProductVariant.sizeType}. Stock disponible: ${currentVariant.stock}` 
        });
      }
    }

    const totalAmount = Math.round(cartItems.reduce((sum, item) => {
      return sum + (item.quantity * item.ProductVariant.Product.basePrice);
    }, 0) * 100) / 100;

    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const timestamp = Date.now().toString().slice(-4);
    const orderNumber = `ORD${year}${month}${day}${timestamp}`;

    const order = await Order.create({
      userId: req.user.id,
      orderNumber,
      totalAmount,
      shippingAddress,
      billingAddress: shippingAddress,
      paymentMethod,
      paymentStatus: 'paid'
    }, { transaction });

    const orderItems = cartItems.map(item => ({
      orderId: order.id,
      productVariantId: item.productVariantId,
      quantity: item.quantity,
      unitPrice: Math.round(item.ProductVariant.Product.basePrice * 100) / 100,
      totalPrice: Math.round((item.quantity * item.ProductVariant.Product.basePrice) * 100) / 100
    }));

    await OrderItem.bulkCreate(orderItems, { transaction });
    
    // Déduire le stock pour chaque variant commandé (transaction atomique)
    for (const item of cartItems) {
      const newStock = item.ProductVariant.stock - item.quantity;
      await item.ProductVariant.update({
        stock: newStock
      }, { transaction });
      console.log(`📦 Stock déduit: ${item.ProductVariant.Product.name} ${item.ProductVariant.size}${item.ProductVariant.sizeType} - Quantité: ${item.quantity}, Nouveau stock: ${newStock}`);
    }
    
    await CartItem.destroy({ where: { userId: req.user.id }, transaction });

    // Valider la transaction
    await transaction.commit();

    const completeOrder = await Order.findByPk(order.id, {
      include: [{
        model: OrderItem,
        include: [{
          model: ProductVariant,
          include: [{ model: Product }]
        }]
      }]
    });

    res.status(201).json({
      message: 'Order created successfully',
      order: completeOrder
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    let whereClause = { id: req.params.id };
    
    // Les clients ne peuvent voir que leurs propres commandes
    if (req.user.role === 'customer') {
      whereClause.userId = req.user.id;
    }

    const order = await Order.findOne({
      where: whereClause,
      include: [{
        model: OrderItem,
        include: [{
          model: ProductVariant,
          include: [{
            model: Product,
            include: [{
              model: User,
              as: 'Seller',
              attributes: ['id', 'firstName', 'lastName', 'sellerInfo']
            }]
          }]
        }]
      }, {
        model: User, // ✅ Inclure les données du client
        attributes: ['id', 'firstName', 'lastName', 'email']
      }]
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Pour les sellers, filtrer uniquement leurs produits dans la commande
    if (req.user.role === 'seller') {
      const sellerItems = order.OrderItems.filter(item => 
        item.ProductVariant && 
        item.ProductVariant.Product && 
        item.ProductVariant.Product.sellerId === req.user.id
      );
      
      if (sellerItems.length === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      // Retourner la commande avec uniquement les items du seller
      const filteredOrder = {
        ...order.toJSON(),
        OrderItems: sellerItems
      };
      
      return res.json({ order: filteredOrder });
    }

    res.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const whereClause = { id: req.params.id };
    
    if (req.user.role === 'customer') {
      if (status !== 'cancelled') {
        return res.status(403).json({ error: 'Customers can only cancel orders' });
      }
      whereClause.userId = req.user.id;
    }

    const order = await Order.findOne({ 
      where: whereClause,
      include: [{
        model: OrderItem,
        include: [{
          model: ProductVariant,
          include: [{ model: Product }]
        }]
      }, {
        model: User, // ✅ Inclure les données du client
        attributes: ['id', 'firstName', 'lastName', 'email']
      }]
    });
    
    // Vérification supplémentaire pour les sellers
    if (req.user.role === 'seller' && order) {
      const hasSellerProducts = order.OrderItems.some(item => 
        item.ProductVariant && 
        item.ProductVariant.Product && 
        item.ProductVariant.Product.sellerId === req.user.id
      );
      
      if (!hasSellerProducts) {
        return res.status(404).json({ error: 'Order not found' });
      }
    }
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (status === 'cancelled' && !['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({ error: 'Cannot cancel order in current status' });
    }

    // Si la commande est annulée, remettre le stock
    if (status === 'cancelled' && order.status !== 'cancelled') {
      const orderItems = await OrderItem.findAll({
        where: { orderId: order.id },
        include: [{ model: ProductVariant, include: [{ model: Product }] }]
      });

      for (const orderItem of orderItems) {
        await orderItem.ProductVariant.update({
          stock: orderItem.ProductVariant.stock + orderItem.quantity
        });
        console.log(`🔄 Stock restauré: ${orderItem.ProductVariant.Product.name} ${orderItem.ProductVariant.size}${orderItem.ProductVariant.sizeType} - Quantité: ${orderItem.quantity}, Nouveau stock: ${orderItem.ProductVariant.stock + orderItem.quantity}`);
      }
    }

    await order.update({ status });

    res.json({ message: 'Order status updated', order });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

module.exports = router;
