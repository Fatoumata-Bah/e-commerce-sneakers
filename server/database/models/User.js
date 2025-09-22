const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

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
    },
    
    // Informations spécifiques aux sellers
    sellerInfo: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null,
      validate: {
        isSellerInfoValid(value) {
          if (this.role === 'seller' && (!value || !value.businessName)) {
            throw new Error('Business name is required for sellers');
          }
        }
      }
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
    },
    
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      }
    }
  });
  
  User.prototype.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  };
  
  return User;
};
