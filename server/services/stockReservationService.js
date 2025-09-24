const { StockReservation, ProductVariant } = require('../database');
const { Op } = require('sequelize');

class StockReservationService {
  
  /**
   * Réserver du stock pour un utilisateur/session
   * @param {Object} params - Paramètres de réservation
   * @param {number|null} params.userId - ID utilisateur (null si anonyme)
   * @param {string|null} params.sessionId - ID de session (pour utilisateurs anonymes)
   * @param {number} params.productVariantId - ID de la variante de produit
   * @param {number} params.quantity - Quantité à réserver
   * @param {number} params.durationMinutes - Durée de réservation en minutes
   * @returns {Promise<Object>} Résultat de la réservation
   */
  static async reserveStock({ userId, sessionId, productVariantId, quantity, durationMinutes = 15 }) {
    try {
      // Vérifier le stock disponible
      const variant = await ProductVariant.findByPk(productVariantId);
      if (!variant) {
        throw new Error('Variante de produit introuvable');
      }

      // Calculer le stock réellement disponible (stock - réservations actives - commandes)
      const availableStock = await this.getAvailableStock(productVariantId);
      
      if (availableStock < quantity) {
        throw new Error(`Stock insuffisant. Disponible: ${availableStock}, Demandé: ${quantity}`);
      }

      // Libérer les anciennes réservations de cet utilisateur/session pour ce produit
      await this.releaseUserReservations({ userId, sessionId, productVariantId });

      // Créer la nouvelle réservation
      const expiresAt = new Date(Date.now() + (durationMinutes * 60 * 1000));
      
      const reservation = await StockReservation.create({
        userId,
        sessionId,
        productVariantId,
        quantity,
        expiresAt,
        isActive: true
      });

      return {
        success: true,
        reservation,
        message: `Stock réservé pour ${durationMinutes} minutes`
      };

    } catch (error) {
      console.error('Erreur lors de la réservation:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Prolonger une réservation existante
   * @param {Object} params - Paramètres de prolongation
   * @param {number|null} params.userId - ID utilisateur
   * @param {string|null} params.sessionId - ID de session
   * @param {number} params.productVariantId - ID de la variante
   * @param {number} params.additionalMinutes - Minutes supplémentaires
   * @returns {Promise<Object>} Résultat de la prolongation
   */
  static async extendReservation({ userId, sessionId, productVariantId, additionalMinutes = 15 }) {
    try {
      const whereClause = {
        productVariantId,
        isActive: true,
        expiresAt: { [Op.gt]: new Date() }
      };

      if (userId) {
        whereClause.userId = userId;
      } else {
        whereClause.sessionId = sessionId;
      }

      const reservation = await StockReservation.findOne({ where: whereClause });
      
      if (!reservation) {
        throw new Error('Aucune réservation active trouvée');
      }

      // Prolonger la réservation
      const newExpiresAt = new Date(reservation.expiresAt.getTime() + (additionalMinutes * 60 * 1000));
      await reservation.update({ expiresAt: newExpiresAt });

      return {
        success: true,
        reservation,
        message: `Réservation prolongée de ${additionalMinutes} minutes`
      };

    } catch (error) {
      console.error('Erreur lors de la prolongation:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Libérer les réservations d'un utilisateur/session pour un produit spécifique
   */
  static async releaseUserReservations({ userId, sessionId, productVariantId }) {
    const whereClause = {
      productVariantId,
      isActive: true
    };

    if (userId) {
      whereClause.userId = userId;
    } else {
      whereClause.sessionId = sessionId;
    }

    await StockReservation.update(
      { isActive: false },
      { where: whereClause }
    );
  }

  /**
   * Libérer toutes les réservations d'un utilisateur/session
   */
  static async releaseAllUserReservations({ userId, sessionId }) {
    const whereClause = { isActive: true };

    if (userId) {
      whereClause.userId = userId;
    } else {
      whereClause.sessionId = sessionId;
    }

    await StockReservation.update(
      { isActive: false },
      { where: whereClause }
    );
  }

  /**
   * Nettoyer les réservations expirées
   */
  static async cleanExpiredReservations() {
    const expiredCount = await StockReservation.update(
      { isActive: false },
      {
        where: {
          isActive: true,
          expiresAt: { [Op.lt]: new Date() }
        }
      }
    );

    console.log(`${expiredCount[0]} réservations expirées nettoyées`);
    return expiredCount[0];
  }

  /**
   * Calculer le stock disponible réel (en tenant compte des réservations)
   */
  static async getAvailableStock(productVariantId) {
    const variant = await ProductVariant.findByPk(productVariantId);
    if (!variant) return 0;

    // Calculer les réservations actives
    const activeReservations = await StockReservation.sum('quantity', {
      where: {
        productVariantId,
        isActive: true,
        expiresAt: { [Op.gt]: new Date() }
      }
    });

    const reservedQuantity = activeReservations || 0;
    return Math.max(0, variant.stock - reservedQuantity);
  }

  /**
   * Obtenir les réservations d'un utilisateur/session
   */
  static async getUserReservations({ userId, sessionId }) {
    const whereClause = {
      isActive: true,
      expiresAt: { [Op.gt]: new Date() }
    };

    if (userId) {
      whereClause.userId = userId;
    } else {
      whereClause.sessionId = sessionId;
    }

    return await StockReservation.findAll({
      where: whereClause,
      include: [{
        model: ProductVariant,
        as: 'productVariant',
        include: ['Product']
      }]
    });
  }
}

module.exports = StockReservationService;
