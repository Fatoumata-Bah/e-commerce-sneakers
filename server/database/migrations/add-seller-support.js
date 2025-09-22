const { DataTypes } = require('sequelize');

/**
 * Migration pour ajouter le support multi-vendeurs
 * - Ajoute sellerId aux produits
 * - Ajoute sellerInfo aux utilisateurs
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Ajouter sellerInfo aux utilisateurs
    await queryInterface.addColumn('users', 'seller_info', {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null
    });

    // Ajouter sellerId aux produits
    await queryInterface.addColumn('products', 'seller_id', {
      type: DataTypes.UUID,
      allowNull: true, // Temporairement nullable pour la migration
      references: {
        model: 'users',
        key: 'id'
      }
    });

    // Créer un seller par défaut pour les produits existants
    const [users] = await queryInterface.sequelize.query(
      "SELECT id FROM users WHERE role = 'admin' LIMIT 1"
    );
    
    let defaultSellerId;
    if (users.length > 0) {
      defaultSellerId = users[0].id;
    } else {
      // Créer un seller par défaut si aucun admin n'existe
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      const [result] = await queryInterface.sequelize.query(
        `INSERT INTO users (id, email, password, first_name, last_name, role, seller_info, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        {
          replacements: [
            require('uuid').v4(),
            'admin@sneakers.com',
            hashedPassword,
            'Admin',
            'Store',
            'seller',
            JSON.stringify({
              businessName: 'Default Store',
              description: 'Store par défaut pour les produits existants',
              logo: null
            }),
            new Date(),
            new Date()
          ]
        }
      );
      
      defaultSellerId = result;
    }

    // Assigner tous les produits existants au seller par défaut
    await queryInterface.sequelize.query(
      'UPDATE products SET seller_id = ? WHERE seller_id IS NULL',
      { replacements: [defaultSellerId] }
    );

    // Rendre sellerId obligatoire
    await queryInterface.changeColumn('products', 'seller_id', {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    });

    // Ajouter les index
    await queryInterface.addIndex('products', ['seller_id']);
    await queryInterface.addIndex('products', ['seller_id', 'is_active']);
  },

  down: async (queryInterface, Sequelize) => {
    // Supprimer les index
    await queryInterface.removeIndex('products', ['seller_id', 'is_active']);
    await queryInterface.removeIndex('products', ['seller_id']);
    
    // Supprimer les colonnes
    await queryInterface.removeColumn('products', 'seller_id');
    await queryInterface.removeColumn('users', 'seller_info');
  }
};
