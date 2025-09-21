const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const OrderItem = sequelize.define('OrderItem', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    
    orderId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'order_id',
      references: {
        model: 'orders',
        key: 'id'
      }
    },
    
    productVariantId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'product_variant_id',
      references: {
        model: 'product_variants',
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
    
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'unit_price',
      validate: {
        min: 0
      }
    },
    
    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'total_price',
      validate: {
        min: 0
      }
    }
    
  }, {
    tableName: 'order_items',
    
    indexes: [
      { fields: ['order_id'] },
      { fields: ['product_variant_id'] }
    ],
    
    hooks: {
      beforeSave: (orderItem) => {
        orderItem.totalPrice = orderItem.unitPrice * orderItem.quantity;
      }
    }
  });
  
  return OrderItem;
};
