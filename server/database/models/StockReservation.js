const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
const StockReservation = sequelize.define('StockReservation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true, // Peut être null pour les utilisateurs anonymes
    comment: 'ID de l\'utilisateur (null pour anonyme)'
  },
  sessionId: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'ID de session pour les utilisateurs anonymes'
  },
  productVariantId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'ProductVariants',
      key: 'id'
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Date d\'expiration de la réservation'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Réservation active ou libérée'
  }
}, {
  tableName: 'StockReservations',
  timestamps: true,
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['session_id']
    },
    {
      fields: ['product_variant_id']
    },
    {
      fields: ['expires_at']
    },
    {
      fields: ['is_active']
    }
  ]
});

// Associations
StockReservation.associate = (models) => {
  StockReservation.belongsTo(models.User, { 
    foreignKey: 'userId', 
    as: 'user',
    allowNull: true
  });
  StockReservation.belongsTo(models.ProductVariant, { 
    foreignKey: 'productVariantId', 
    as: 'productVariant' 
  });
};

return StockReservation;
};
