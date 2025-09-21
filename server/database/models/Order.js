const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    
    orderNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: 'order_number'
    },
    
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending'
    },
    
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'total_amount',
      validate: {
        min: 0
      }
    },
    
    shippingAddress: {
      type: DataTypes.JSON,
      allowNull: false,
      field: 'shipping_address'
    },
    
    billingAddress: {
      type: DataTypes.JSON,
      allowNull: true,
      field: 'billing_address'
    },
    
    paymentStatus: {
      type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
      allowNull: false,
      defaultValue: 'pending',
      field: 'payment_status'
    },
    
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'payment_method'
    },
    
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
    
  }, {
    tableName: 'orders',
    
    indexes: [
      { fields: ['user_id'] },
      { fields: ['status'] },
      { fields: ['payment_status'] },
      { fields: ['order_number'] }
    ],
    
    hooks: {
      beforeCreate: async (order) => {
        if (!order.orderNumber) {
          const date = new Date();
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          
          const todayStart = new Date(year, date.getMonth(), date.getDate());
          const todayEnd = new Date(todayStart);
          todayEnd.setDate(todayEnd.getDate() + 1);
          
          const todayOrdersCount = await sequelize.models.Order.count({
            where: {
              createdAt: {
                [sequelize.Sequelize.Op.gte]: todayStart,
                [sequelize.Sequelize.Op.lt]: todayEnd
              }
            }
          });
          
          const sequence = String(todayOrdersCount + 1).padStart(4, '0');
          order.orderNumber = `ORD${year}${month}${day}${sequence}`;
        }
      }
    }
  });
  
  return Order;
};
