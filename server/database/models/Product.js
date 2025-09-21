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
    }
    
  }, {
    tableName: 'products',
    
    indexes: [
      { fields: ['brand'] },
      { fields: ['category'] },
      { fields: ['is_active'] }
    ]
  });
  
  return Product;
};
