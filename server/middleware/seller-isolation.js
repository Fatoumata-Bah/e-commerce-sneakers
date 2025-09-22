/**
 * MIDDLEWARE D'ISOLATION MULTI-VENDEURS
 * =====================================
 * 
 * Ce middleware assure l'isolation complète des données par seller:
 * - Les sellers ne voient que leurs propres produits
 * - Les commandes sont filtrées par produits du seller
 * - Les admins ont accès global
 * - Les clients voient tous les produits actifs
 */

const { Product, User, Order, OrderItem, ProductVariant } = require('../database');
const { Op } = require('sequelize');

/**
 * Middleware pour filtrer les produits par seller
 * Applique automatiquement le filtre selon le rôle de l'utilisateur
 */
const filterProductsBySeller = (req, res, next) => {
  // Ajouter les conditions de filtrage selon le rôle
  if (!req.user) {
    // Utilisateur non connecté - voir tous les produits actifs
    req.sellerFilter = {
      isActive: true,
      '$Seller.seller_status$': 'approved'
    };
  } else if (req.user.role === 'seller') {
    // Seller - voir uniquement ses propres produits
    req.sellerFilter = {
      sellerId: req.user.id
    };
  } else if (req.user.role === 'admin') {
    // Admin - voir tous les produits
    req.sellerFilter = {};
  } else {
    // Customer - voir tous les produits actifs des sellers approuvés
    req.sellerFilter = {
      isActive: true,
      '$Seller.seller_status$': 'approved'
    };
  }
  
  next();
};

/**
 * Middleware pour filtrer les commandes par seller
 * Les sellers ne voient que les commandes contenant leurs produits
 */
const filterOrdersBySeller = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.user.role === 'customer') {
      // Clients - voir uniquement leurs propres commandes
      req.orderFilter = {
        userId: req.user.id
      };
    } else if (req.user.role === 'seller') {
      // Sellers - voir les commandes contenant leurs produits
      // Ceci sera appliqué au niveau de la requête avec des joins
      req.orderFilter = {
        sellerSpecific: true,
        sellerId: req.user.id
      };
    } else if (req.user.role === 'admin') {
      // Admin - voir toutes les commandes
      req.orderFilter = {};
    }
    
    next();
  } catch (error) {
    console.error('Error in filterOrdersBySeller:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Middleware pour vérifier la propriété d'un produit
 * Assure qu'un seller ne peut modifier que ses propres produits
 */
const verifyProductOwnership = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Les admins peuvent tout modifier
    if (req.user.role === 'admin') {
      return next();
    }

    // Pour les sellers, vérifier la propriété
    if (req.user.role === 'seller') {
      const productId = req.params.id || req.params.productId;
      
      if (!productId) {
        return res.status(400).json({ error: 'Product ID required' });
      }

      const product = await Product.findOne({
        where: { 
          id: productId,
          sellerId: req.user.id 
        }
      });

      if (!product) {
        return res.status(404).json({ 
          error: 'Product not found or you do not have permission to access it' 
        });
      }

      // Stocker le produit pour éviter une requête supplémentaire
      req.verifiedProduct = product;
    }

    next();
  } catch (error) {
    console.error('Error in verifyProductOwnership:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Middleware pour vérifier l'accès à une commande
 * Assure que chaque rôle ne voit que les commandes appropriées
 */
const verifyOrderAccess = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const orderId = req.params.id || req.params.orderId;
    
    if (!orderId) {
      return res.status(400).json({ error: 'Order ID required' });
    }

    // Les admins peuvent accéder à toutes les commandes
    if (req.user.role === 'admin') {
      return next();
    }

    // Pour les clients, vérifier que c'est leur commande
    if (req.user.role === 'customer') {
      const order = await Order.findOne({
        where: { 
          id: orderId,
          userId: req.user.id 
        }
      });

      if (!order) {
        return res.status(404).json({ 
          error: 'Order not found or you do not have permission to access it' 
        });
      }

      req.verifiedOrder = order;
      return next();
    }

    // Pour les sellers, vérifier qu'ils ont des produits dans cette commande
    if (req.user.role === 'seller') {
      const order = await Order.findOne({
        where: { id: orderId },
        include: [{
          model: OrderItem,
          include: [{
            model: ProductVariant,
            include: [{
              model: Product,
              where: { sellerId: req.user.id }
            }]
          }]
        }]
      });

      if (!order || order.OrderItems.length === 0) {
        return res.status(404).json({ 
          error: 'Order not found or you do not have products in this order' 
        });
      }

      // Filtrer les items pour ne garder que ceux du seller
      order.OrderItems = order.OrderItems.filter(item => 
        item.ProductVariant.Product.sellerId === req.user.id
      );

      req.verifiedOrder = order;
      return next();
    }

    res.status(403).json({ error: 'Insufficient permissions' });
  } catch (error) {
    console.error('Error in verifyOrderAccess:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Utilitaire pour construire les requêtes de produits avec filtrage seller
 */
const buildProductQuery = (req, additionalWhere = {}) => {
  const baseQuery = {
    where: {
      ...additionalWhere,
      ...req.sellerFilter
    },
    include: [{
      model: User,
      as: 'Seller',
      attributes: ['id', 'firstName', 'lastName', 'sellerInfo', 'sellerStatus']
    }, {
      model: ProductVariant,
      attributes: ['id', 'size', 'sizeType', 'stock', 'sku']
    }]
  };

  // Pour les utilisateurs non connectés et les customers, inclure seulement les sellers approuvés
  if (!req.user || req.user.role === 'customer') {
    baseQuery.include[0].where = { sellerStatus: 'approved' };
  }

  return baseQuery;
};

/**
 * Utilitaire pour construire les requêtes de commandes avec filtrage seller
 */
const buildOrderQuery = (req, additionalWhere = {}) => {
  const baseQuery = {
    where: {
      ...additionalWhere,
      ...req.orderFilter
    },
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
    }]
  };

  // Pour les sellers, ajouter un filtre spécial
  if (req.user?.role === 'seller' && req.orderFilter?.sellerSpecific) {
    baseQuery.include[0].include[0].include[0].where = {
      sellerId: req.user.id
    };
    delete baseQuery.where.sellerSpecific;
    delete baseQuery.where.sellerId;
  }

  return baseQuery;
};

/**
 * Middleware pour valider le statut d'un seller
 */
const validateSellerStatus = async (req, res, next) => {
  try {
    if (req.user?.role === 'seller') {
      const seller = await User.findByPk(req.user.id, {
        attributes: ['sellerStatus', 'sellerInfo']
      });

      if (!seller) {
        return res.status(404).json({ error: 'Seller not found' });
      }

      if (seller.sellerStatus !== 'approved') {
        return res.status(403).json({ 
          error: 'Seller account not approved. Please contact support.',
          status: seller.sellerStatus
        });
      }

      if (!seller.sellerInfo || !seller.sellerInfo.businessName) {
        return res.status(400).json({ 
          error: 'Seller profile incomplete. Please update your business information.' 
        });
      }
    }

    next();
  } catch (error) {
    console.error('Error in validateSellerStatus:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Fonction utilitaire pour obtenir les statistiques d'un seller
 */
const getSellerStats = async (sellerId) => {
  try {
    const [stats] = await req.sequelize.query(`
      SELECT 
        COUNT(DISTINCT p.id) as total_products,
        COUNT(DISTINCT CASE WHEN p.is_active = 1 THEN p.id END) as active_products,
        COALESCE(SUM(pv.stock), 0) as total_stock,
        COUNT(DISTINCT pv.id) as total_variants,
        COUNT(DISTINCT oi.order_id) as total_orders,
        COALESCE(SUM(oi.total_price), 0) as total_revenue
      FROM users u
      LEFT JOIN products p ON u.id = p.seller_id
      LEFT JOIN product_variants pv ON p.id = pv.product_id
      LEFT JOIN order_items oi ON pv.id = oi.product_variant_id
      WHERE u.id = ?
      GROUP BY u.id
    `, {
      replacements: [sellerId],
      type: QueryTypes.SELECT
    });

    return stats[0] || {
      total_products: 0,
      active_products: 0,
      total_stock: 0,
      total_variants: 0,
      total_orders: 0,
      total_revenue: 0
    };
  } catch (error) {
    console.error('Error getting seller stats:', error);
    return null;
  }
};

module.exports = {
  filterProductsBySeller,
  filterOrdersBySeller,
  verifyProductOwnership,
  verifyOrderAccess,
  validateSellerStatus,
  buildProductQuery,
  buildOrderQuery,
  getSellerStats
};
