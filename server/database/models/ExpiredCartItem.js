const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ExpiredCartItem = sequelize.define('ExpiredCartItem', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.UUID,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      allowNull: false,
      comment: 'ID de l\'utilisateur propriétaire de l\'article expiré'
    },
    productVariantId: {
      type: DataTypes.INTEGER,
      field: 'product_variant_id',
      references: {
        model: 'ProductVariants',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      allowNull: false,
      comment: 'ID de la variante de produit expirée'
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1
      },
      comment: 'Quantité qui était dans le panier avant expiration'
    },
    originalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      field: 'original_price',
      allowNull: false,
      comment: 'Prix du produit au moment de l\'expiration'
    },
    expiredAt: {
      type: DataTypes.DATE,
      field: 'expired_at',
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Date et heure d\'expiration du panier'
    },
    isReordered: {
      type: DataTypes.BOOLEAN,
      field: 'is_reordered',
      allowNull: false,
      defaultValue: false,
      comment: 'Indique si l\'article a été remis au panier depuis l\'expiration'
    },
    reorderedAt: {
      type: DataTypes.DATE,
      field: 'reordered_at',
      allowNull: true,
      comment: 'Date et heure de remise au panier (si applicable)'
    },
    sessionId: {
      type: DataTypes.STRING,
      field: 'session_id',
      allowNull: true,
      comment: 'ID de session pour les utilisateurs anonymes (pour migration future)'
    }
  }, {
    tableName: 'ExpiredCartItems',
    timestamps: true,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['product_variant_id'] },
      { fields: ['expired_at'] },
      { fields: ['is_reordered'] },
      { fields: ['user_id', 'expired_at'] }, // Index composé pour requêtes utilisateur
      { fields: ['user_id', 'is_reordered'] } // Index composé pour articles non re-commandés
    ],
    // Ajouter des scopes pour faciliter les requêtes
    scopes: {
      // Articles non encore re-commandés
      notReordered: {
        where: {
          isReordered: false
        }
      },
      // Articles récents (moins de 30 jours)
      recent: {
        where: {
          expiredAt: {
            [sequelize.Sequelize.Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      },
      // Articles d'un utilisateur spécifique
      forUser: (userId) => ({
        where: {
          userId: userId
        }
      })
    }
  });

  // Associations
  ExpiredCartItem.associate = (models) => {
    ExpiredCartItem.belongsTo(models.User, { 
      foreignKey: 'user_id', 
      as: 'user' 
    });
    ExpiredCartItem.belongsTo(models.ProductVariant, { 
      foreignKey: 'product_variant_id', 
      as: 'productVariant' 
    });
  };

  return ExpiredCartItem;
};
