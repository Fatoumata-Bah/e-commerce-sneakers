const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 200]
      }
    },
    
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    
    brand: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 50]
      }
    },
    
    category: {
      type: DataTypes.ENUM('men', 'women', 'kids'),
      allowNull: false
    },
    
    basePrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    
    images: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    
    sellerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      validate: {
        notEmpty: true
      }
    },
    
    sellerProductCode: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: false // Unique par seller, pas globalement
    },
    
    commissionRate: {
      type: DataTypes.DECIMAL(5, 4), // e.g., 0.1000 for 10%
      allowNull: false,
      defaultValue: 0.10,
      validate: {
        min: 0,
        max: 1
      }
    }
    
  }, {
    tableName: 'products',
    
    indexes: [
      { fields: ['brand'] },
      { fields: ['category'] },
      { fields: ['is_active'] },
      { fields: ['seller_id'] },
      { fields: ['seller_id', 'is_active'] },
      { fields: ['seller_product_code'] },
      { 
        fields: ['seller_id', 'seller_product_code'],
        unique: true,
        name: 'unique_seller_product_code'
      }
    ]
  });
  
  return Product;
};
