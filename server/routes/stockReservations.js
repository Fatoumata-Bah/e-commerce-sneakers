const express = require('express');
const router = express.Router();
const StockReservationService = require('../services/stockReservationService');
const { authenticateToken } = require('../middleware/auth');

/**
 * POST /api/stock-reservations/reserve
 * Réserver du stock pour un produit
 */
router.post('/reserve', async (req, res) => {
  try {
    const { productVariantId, quantity, durationMinutes = 2 } = req.body; // 2 minutes pour les tests
    
    // Obtenir userId ou sessionId
    const userId = req.user?.id || null;
    const sessionId = userId ? null : (req.headers['x-session-id'] || req.sessionID);

    if (!productVariantId || !quantity) {
      return res.status(400).json({
        error: 'productVariantId et quantity sont requis'
      });
    }

    const result = await StockReservationService.reserveStock({
      userId,
      sessionId,
      productVariantId,
      quantity,
      durationMinutes
    });

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }

  } catch (error) {
    console.error('Erreur lors de la réservation:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la réservation' 
    });
  }
});

/**
 * POST /api/stock-reservations/extend
 * Prolonger une réservation existante
 */
router.post('/extend', async (req, res) => {
  try {
    const { productVariantId, additionalMinutes = 2 } = req.body; // 2 minutes pour les tests
    
    const userId = req.user?.id || null;
    const sessionId = userId ? null : (req.headers['x-session-id'] || req.sessionID);

    if (!productVariantId) {
      return res.status(400).json({
        error: 'productVariantId est requis'
      });
    }

    const result = await StockReservationService.extendReservation({
      userId,
      sessionId,
      productVariantId,
      additionalMinutes
    });

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }

  } catch (error) {
    console.error('Erreur lors de la prolongation:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la prolongation' 
    });
  }
});

/**
 * POST /api/stock-reservations/release
 * Libérer une réservation spécifique
 */
router.post('/release', async (req, res) => {
  try {
    const { productVariantId } = req.body;
    
    const userId = req.user?.id || null;
    const sessionId = userId ? null : (req.headers['x-session-id'] || req.sessionID);

    if (!productVariantId) {
      return res.status(400).json({
        error: 'productVariantId est requis'
      });
    }

    await StockReservationService.releaseUserReservations({
      userId,
      sessionId,
      productVariantId
    });

    res.json({
      success: true,
      message: 'Réservation libérée'
    });

  } catch (error) {
    console.error('Erreur lors de la libération:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la libération' 
    });
  }
});

/**
 * POST /api/stock-reservations/release-all
 * Libérer toutes les réservations d'un utilisateur/session
 */
router.post('/release-all', async (req, res) => {
  try {
    const userId = req.user?.id || null;
    const sessionId = userId ? null : (req.headers['x-session-id'] || req.sessionID);

    await StockReservationService.releaseAllUserReservations({
      userId,
      sessionId
    });

    res.json({
      success: true,
      message: 'Toutes les réservations libérées'
    });

  } catch (error) {
    console.error('Erreur lors de la libération:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la libération' 
    });
  }
});

/**
 * GET /api/stock-reservations/my-reservations
 * Obtenir les réservations de l'utilisateur/session
 */
router.get('/my-reservations', async (req, res) => {
  try {
    const userId = req.user?.id || null;
    const sessionId = userId ? null : (req.headers['x-session-id'] || req.sessionID);

    const reservations = await StockReservationService.getUserReservations({
      userId,
      sessionId
    });

    res.json({
      success: true,
      reservations
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des réservations:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la récupération' 
    });
  }
});

/**
 * GET /api/stock-reservations/available-stock/:productVariantId
 * Obtenir le stock disponible réel pour une variante
 */
router.get('/available-stock/:productVariantId', async (req, res) => {
  try {
    const { productVariantId } = req.params;
    
    const availableStock = await StockReservationService.getAvailableStock(
      parseInt(productVariantId)
    );

    res.json({
      success: true,
      productVariantId: parseInt(productVariantId),
      availableStock
    });

  } catch (error) {
    console.error('Erreur lors de la vérification du stock:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la vérification du stock' 
    });
  }
});

/**
 * POST /api/stock-reservations/cleanup-expired
 * Nettoyer les réservations expirées (route admin/cron)
 */
router.post('/cleanup-expired', async (req, res) => {
  try {
    const cleanedCount = await StockReservationService.cleanExpiredReservations();
    
    res.json({
      success: true,
      message: `${cleanedCount} réservations expirées nettoyées`
    });

  } catch (error) {
    console.error('Erreur lors du nettoyage:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors du nettoyage' 
    });
  }
});

module.exports = router;
