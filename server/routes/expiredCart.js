const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const ExpiredCartService = require('../services/expiredCartService');
const { CartItem } = require('../database');
const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

/**
 * POST /api/expired-cart/save
 * Sauvegarder les articles expirés du panier
 */
router.post('/save', async (req, res) => {
  try {
    const { items } = req.body;
    const userId = req.user.id;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Articles requis pour la sauvegarde' });
    }

    const expiredItems = await ExpiredCartService.saveExpiredItems(userId, items);
    
    res.json({
      message: `${expiredItems.length} articles sauvegardés dans l'historique`,
      expiredItems: expiredItems.map(item => ({
        id: item.id,
        productVariantId: item.productVariantId,
        quantity: item.quantity,
        originalPrice: item.originalPrice,
        expiredAt: item.expiredAt
      }))
    });
  } catch (error) {
    console.error('Erreur sauvegarde articles expirés:', error);
    res.status(500).json({ error: 'Erreur lors de la sauvegarde des articles expirés' });
  }
});

/**
 * GET /api/expired-cart/history
 * Récupérer l'historique des articles expirés
 */
router.get('/history', async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      limit = 20, 
      offset = 0, 
      onlyNotReordered = false,
      recentOnly = false 
    } = req.query;

    const options = {
      limit: parseInt(limit),
      offset: parseInt(offset),
      onlyNotReordered: onlyNotReordered === 'true',
      recentOnly: recentOnly === 'true'
    };

    const result = await ExpiredCartService.getExpiredItemsHistory(userId, options);
    
    res.json({
      items: result.rows,
      totalCount: result.count,
      hasMore: result.count > (parseInt(offset) + result.rows.length)
    });
  } catch (error) {
    console.error('Erreur récupération historique:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'historique' });
  }
});


/**
 * POST /api/expired-cart/reorder-to-cart/:id
 * Remettre un article expiré dans le panier
 */
router.post('/reorder-to-cart/:id', async (req, res) => {
  try {
    const expiredItemId = parseInt(req.params.id);
    const userId = req.user.id;
    const { quantity = 1 } = req.body;

    if (isNaN(expiredItemId)) {
      return res.status(400).json({ error: 'ID d\'article invalide' });
    }

    // Récupérer l'article expiré directement par ID
    const { ExpiredCartItem, ProductVariant } = require('../database');
    
    const expiredItem = await ExpiredCartItem.findOne({
      where: { 
        id: expiredItemId,
        userId: userId 
      },
      include: [{
        model: ProductVariant,
        as: 'productVariant'
      }]
    });
    
    if (!expiredItem) {
      return res.status(404).json({ error: 'Article expiré non trouvé' });
    }

    if (expiredItem.isReordered) {
      return res.status(400).json({ error: 'Article déjà re-commandé' });
    }

    // Ajouter au panier directement via le modèle
    try {
      // Vérifier s'il existe déjà un item dans le panier pour cette variante
      const existingCartItem = await CartItem.findOne({
        where: { 
          userId: userId, 
          productVariantId: expiredItem.productVariantId 
        }
      });
      
      let cartItem;
      if (existingCartItem) {
        // Mettre à jour la quantité
        await existingCartItem.update({ 
          quantity: existingCartItem.quantity + quantity 
        });
        cartItem = existingCartItem;
      } else {
        // Créer un nouvel item
        cartItem = await CartItem.create({
          userId: userId,
          productVariantId: expiredItem.productVariantId,
          quantity: quantity
        });
      }
      
      // Supprimer de la liste des expirés (au lieu de marquer comme re-commandé)
      await ExpiredCartService.removeExpiredItem(expiredItemId, userId);
      
      res.json({
        message: 'Article remis au panier avec succès',
        cartItem: {
          id: cartItem.id,
          productVariantId: cartItem.productVariantId,
          quantity: cartItem.quantity
        }
      });
    } catch (cartError) {
      console.error('Erreur ajout au panier:', cartError);
      res.status(400).json({ 
        error: 'Impossible d\'ajouter au panier - Vérifiez le stock disponible'
      });
    }
  } catch (error) {
    console.error('Erreur remise au panier:', error);
    res.status(500).json({ error: 'Erreur lors de la remise au panier' });
  }
});


/**
 * DELETE /api/expired-cart/cleanup
 * Nettoyer les anciens articles expirés (admin seulement)
 */
router.delete('/cleanup', async (req, res) => {
  try {
    // Vérifier que l'utilisateur est admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès refusé - Admin requis' });
    }

    const { daysOld = 90 } = req.query;
    const deletedCount = await ExpiredCartService.cleanupOldExpiredItems(parseInt(daysOld));
    
    res.json({
      message: `${deletedCount} articles expirés supprimés`,
      deletedCount
    });
  } catch (error) {
    console.error('Erreur nettoyage articles expirés:', error);
    res.status(500).json({ error: 'Erreur lors du nettoyage' });
  }
});

module.exports = router;
