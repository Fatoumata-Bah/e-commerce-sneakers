const { ExpiredCartItem, ProductVariant, Product, User } = require('../database');
const { Op } = require('sequelize');

class ExpiredCartService {
  /**
   * Sauvegarder les articles du panier avant expiration
   * @param {string} userId - ID de l'utilisateur
   * @param {Array} cartItems - Articles du panier à sauvegarder
   * @returns {Promise<Array>} - Articles expirés créés
   */
  static async saveExpiredItems(userId, cartItems) {
    if (!userId || !cartItems || cartItems.length === 0) {
      console.log('❌ Aucun article à sauvegarder pour l\'expiration');
      return [];
    }

    try {
      console.log(`💾 Sauvegarde de ${cartItems.length} articles expirés pour l'utilisateur ${userId}`);
      
      const expiredItems = [];
      
      for (const item of cartItems) {
        // Récupérer les informations complètes du produit pour le prix
        const productVariant = await ProductVariant.findByPk(item.productVariantId, {
          include: [{
            model: Product,
            as: 'Product'
          }]
        });
        
        if (productVariant) {
          // Vérifier si cet article n'a pas déjà été sauvegardé récemment (dans les 3 dernières minutes)
          // ET vérifier aussi s'il n'y a pas déjà un article non re-commandé pour éviter les vrais doublons
          const recentExpired = await ExpiredCartItem.findOne({
            where: {
              userId: userId,
              productVariantId: item.productVariantId,
              [Op.or]: [
                // Article expiré récemment (3 minutes au lieu de 5)
                {
                  expiredAt: {
                    [Op.gte]: new Date(Date.now() - 3 * 60 * 1000) // 3 minutes
                  }
                },
                // Ou article non re-commandé existant (éviter les vrais doublons)
                {
                  isReordered: false
                }
              ]
            },
            order: [['expiredAt', 'DESC']] // Prendre le plus récent
          });

          if (recentExpired) {
            console.log(`⚠️ Article déjà expiré récemment: ${productVariant.Product.name} - Mise à jour de la quantité`);
            // Mettre à jour la quantité si nécessaire
            if (recentExpired.quantity < item.quantity) {
              await recentExpired.update({ quantity: item.quantity });
            }
            expiredItems.push(recentExpired);
          } else {
            const expiredItem = await ExpiredCartItem.create({
              userId: userId,
              productVariantId: item.productVariantId,
              quantity: item.quantity,
              originalPrice: productVariant.Product.basePrice,
              expiredAt: new Date(),
              isReordered: false
            });
            
            expiredItems.push(expiredItem);
            console.log(`✅ Article expiré sauvegardé: ${productVariant.Product.name} (${item.quantity}x)`);
          }
        }
      }
      
      return expiredItems;
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde des articles expirés:', error);
      throw error;
    }
  }

  /**
   * Récupérer l'historique des articles expirés pour un utilisateur
   * @param {string} userId - ID de l'utilisateur
   * @param {Object} options - Options de filtrage
   * @returns {Promise<Array>} - Liste des articles expirés
   */
  static async getExpiredItemsHistory(userId, options = {}) {
    try {
      const {
        limit = 50,
        offset = 0,
        onlyNotReordered = false,
        recentOnly = false
      } = options;

      const whereClause = { userId };
      
      if (onlyNotReordered) {
        whereClause.isReordered = false;
      }
      
      if (recentOnly) {
        // Articles des 30 derniers jours
        whereClause.expiredAt = {
          [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        };
      }

      const expiredItems = await ExpiredCartItem.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: ProductVariant,
            as: 'productVariant',
            include: [{
              model: Product,
              as: 'Product',
              include: [{
                model: User,
                as: 'Seller',
                attributes: ['firstName', 'lastName', 'sellerInfo']
              }]
            }]
          }
        ],
        order: [['expiredAt', 'DESC']],
        limit,
        offset
      });

      console.log(`📋 Récupération de ${expiredItems.rows.length} articles expirés pour l'utilisateur ${userId}`);
      return expiredItems;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des articles expirés:', error);
      throw error;
    }
  }


  /**
   * Supprimer un article expiré après remise au panier
   * @param {number} expiredItemId - ID de l'article expiré
   * @param {string} userId - ID de l'utilisateur (pour sécurité)
   * @returns {Promise<boolean>} - Succès de l'opération
   */
  static async removeExpiredItem(expiredItemId, userId) {
    try {
      const deletedCount = await ExpiredCartItem.destroy({
        where: {
          id: expiredItemId,
          userId: userId // Sécurité : s'assurer que l'utilisateur est propriétaire
        }
      });

      if (deletedCount > 0) {
        console.log(`✅ Article expiré ${expiredItemId} supprimé après remise au panier`);
        return true;
      } else {
        console.log(`⚠️ Aucun article expiré trouvé avec l'ID ${expiredItemId} pour l'utilisateur ${userId}`);
        return false;
      }
    } catch (error) {
      console.error('❌ Erreur lors de la suppression de l\'article expiré:', error);
      throw error;
    }
  }

  /**
   * Supprimer les anciens articles expirés (nettoyage automatique)
   * @param {number} daysOld - Nombre de jours d'ancienneté pour suppression
   * @returns {Promise<number>} - Nombre d'articles supprimés
   */
  static async cleanupOldExpiredItems(daysOld = 90) {
    try {
      const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
      
      const deletedCount = await ExpiredCartItem.destroy({
        where: {
          expiredAt: {
            [Op.lt]: cutoffDate
          }
        }
      });

      console.log(`🧹 Nettoyage: ${deletedCount} articles expirés de plus de ${daysOld} jours supprimés`);
      return deletedCount;
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage des articles expirés:', error);
      throw error;
    }
  }

}

module.exports = ExpiredCartService;
