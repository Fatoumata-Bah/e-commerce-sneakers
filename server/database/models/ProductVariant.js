const { DataTypes } = require('sequelize');
const { isValidSize } = require('../size-ranges');

module.exports = (sequelize) => {
  const ProductVariant = sequelize.define('ProductVariant', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'product_id',
      references: {
        model: 'products',
        key: 'id'
      }
    },
    
    size: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 10]
      }
    },
    
    sizeType: {
      type: DataTypes.ENUM('EU', 'US', 'UK'),
      allowNull: false,
      defaultValue: 'EU',
      field: 'size_type'
    },
    
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    
    sku: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }
    
  }, {
    tableName: 'product_variants',
    
    indexes: [
      {
        unique: true,
        fields: ['product_id', 'size', 'size_type'],
        name: 'product_variant_unique'
      },
      {
        unique: true,
        fields: ['sku']
      }
    ],
    
    hooks: {
      beforeValidate: async (variant) => {
        if (variant.productId) {
          const product = await sequelize.models.Product.findByPk(variant.productId);
          if (product && !isValidSize(product.category, variant.size, variant.sizeType)) {
            throw new Error(`Invalid size ${variant.size} ${variant.sizeType} for category ${product.category}`);
          }
        }
      }
    }
  });
  
  return ProductVariant;
};
