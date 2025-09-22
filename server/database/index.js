const { Sequelize } = require('sequelize');
const config = require('../config');

const sequelize = new Sequelize(
  config.database.storage,
  null,
  null,
  {
    dialect: config.database.dialect,
    storage: config.database.storage,
    logging: config.nodeEnv === 'development' ? console.log : false,
    
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    }
  }
);
const User = require('./models/User')(sequelize);
const Product = require('./models/Product')(sequelize);
const ProductVariant = require('./models/ProductVariant')(sequelize);
const Order = require('./models/Order')(sequelize);
const OrderItem = require('./models/OrderItem')(sequelize);
const CartItem = require('./models/CartItem')(sequelize);

const setupAssociations = () => {
  // User associations
  User.hasMany(Order, { foreignKey: 'user_id' });
  User.hasMany(CartItem, { foreignKey: 'user_id' });
  User.hasMany(Product, { foreignKey: 'seller_id', as: 'SellerProducts' });
  
  // Product associations
  Product.hasMany(ProductVariant, { foreignKey: 'product_id' });
  Product.belongsTo(User, { foreignKey: 'seller_id', as: 'Seller' });
  
  // ProductVariant associations
  ProductVariant.belongsTo(Product, { foreignKey: 'product_id' });
  ProductVariant.hasMany(OrderItem, { foreignKey: 'product_variant_id' });
  ProductVariant.hasMany(CartItem, { foreignKey: 'product_variant_id' });
  
  // Order associations
  Order.belongsTo(User, { foreignKey: 'user_id' });
  Order.hasMany(OrderItem, { foreignKey: 'order_id' });
  
  // OrderItem associations
  OrderItem.belongsTo(Order, { foreignKey: 'order_id' });
  OrderItem.belongsTo(ProductVariant, { foreignKey: 'product_variant_id' });
  
  // CartItem associations
  CartItem.belongsTo(User, { foreignKey: 'user_id' });
  CartItem.belongsTo(ProductVariant, { foreignKey: 'product_variant_id' });
};

setupAssociations();

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error.message);
  }
};
module.exports = {
  sequelize,
  User,
  Product,
  ProductVariant,
  Order,
  OrderItem,
  CartItem,
  testConnection
};
