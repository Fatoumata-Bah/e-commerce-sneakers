const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [6, 255]
      }
    },
    
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 50]
      }
    },
    
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 50]
      }
    },
    
    role: {
      type: DataTypes.ENUM('admin', 'seller', 'customer'),
      allowNull: false,
      defaultValue: 'customer'
    },
    
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
    
  }, {
    tableName: 'users',
    
    scopes: {
      defaultScope: {
        attributes: { exclude: ['password'] }
      },
      withPassword: {
        attributes: { include: ['password'] }
      }
    }
  });
  
  return User;
};
