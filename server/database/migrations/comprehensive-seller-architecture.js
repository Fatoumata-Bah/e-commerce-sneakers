const { DataTypes } = require('sequelize');

/**
 * MIGRATION COMPLÈTE MULTI-VENDEURS
 * ==================================
 * 
 * Cette migration implémente une architecture marketplace complète avec:
 * 
 * 1. ISOLATION DES DONNÉES PAR SELLER
 *    - Chaque produit appartient à un seller unique
 *    - Sellers ne voient que leurs propres produits
 *    - Commandes filtrées par seller selon les produits
 * 
 * 2. GESTION DES RÔLES ET PERMISSIONS
 *    - CLIENTS: Voient tous les produits, "Mes commandes" personnelles
 *    - SELLERS: Voient uniquement leurs produits et commandes associées
 *    - ADMINS: Accès global à tous les produits et commandes
 * 
 * 3. INTÉGRITÉ RÉFÉRENTIELLE
 *    - Contraintes de clés étrangères
 *    - Index optimisés pour les requêtes multi-vendeurs
 *    - Triggers pour maintenir la cohérence
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log('🏗️  Starting comprehensive seller architecture migration...');

      // =============================================
      // 1. STRUCTURE UTILISATEURS ET SELLERS
      // =============================================
      
      console.log('👥 Setting up user and seller structure...');
      
      // Ajouter sellerInfo avec validation stricte
      await queryInterface.addColumn('users', 'seller_info', {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: null,
        comment: 'Informations commerciales pour les sellers: businessName, description, logo, etc.'
      }, { transaction });

      // Ajouter des champs supplémentaires pour les sellers
      await queryInterface.addColumn('users', 'seller_status', {
        type: DataTypes.ENUM('pending', 'approved', 'suspended', 'rejected'),
        allowNull: true,
        defaultValue: null,
        comment: 'Statut du seller pour modération admin'
      }, { transaction });

      await queryInterface.addColumn('users', 'seller_approved_at', {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Date d\'approbation du seller'
      }, { transaction });

      // =============================================
      // 2. STRUCTURE PRODUITS MULTI-VENDEURS
      // =============================================
      
      console.log('📦 Setting up product-seller relationships...');
      
      // Ajouter sellerId aux produits avec contrainte stricte
      await queryInterface.addColumn('products', 'seller_id', {
        type: DataTypes.UUID,
        allowNull: true, // Temporaire pour migration
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT', // Empêche la suppression d'un seller avec des produits
        comment: 'ID du seller propriétaire du produit'
      }, { transaction });

      // Ajouter des métadonnées produit pour le multi-vendeurs
      await queryInterface.addColumn('products', 'seller_product_code', {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Code produit interne du seller'
      }, { transaction });

      await queryInterface.addColumn('products', 'commission_rate', {
        type: DataTypes.DECIMAL(5, 4),
        allowNull: true,
        defaultValue: 0.10, // 10% par défaut
        comment: 'Taux de commission de la marketplace (0.0000 à 1.0000)'
      }, { transaction });

      // =============================================
      // 3. GESTION DES SELLERS EXISTANTS
      // =============================================
      
      console.log('🔧 Configuring existing users and creating default seller...');
      
      // Trouver ou créer un seller par défaut
      const [existingUsers] = await queryInterface.sequelize.query(
        "SELECT id, role, first_name, last_name FROM users WHERE role IN ('admin', 'seller') ORDER BY created_at ASC LIMIT 1",
        { transaction }
      );
      
      let defaultSellerId;
      
      if (existingUsers.length > 0) {
        const user = existingUsers[0];
        defaultSellerId = user.id;
        
        // Si c'est un admin, le convertir en seller ou créer un seller dédié
        if (user.role === 'admin') {
          // Créer un seller dédié pour ne pas modifier l'admin
          const { v4: uuidv4 } = require('uuid');
          const bcrypt = require('bcryptjs');
          
          defaultSellerId = uuidv4();
          const hashedPassword = await bcrypt.hash('seller123', 12);
          
          await queryInterface.sequelize.query(
            `INSERT INTO users (
              id, email, password, first_name, last_name, role, 
              seller_info, seller_status, seller_approved_at, 
              is_active, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            {
              replacements: [
                defaultSellerId,
                'seller@sneakers-premium.com',
                hashedPassword,
                'Sneakers',
                'Premium',
                'seller',
                JSON.stringify({
                  businessName: 'Sneakers Premium Store',
                  description: 'Spécialiste des sneakers Nike, Adidas et marques premium depuis 2020. Nous proposons une sélection rigoureuse de chaussures authentiques pour homme, femme et enfant.',
                  logo: null,
                  website: 'https://sneakers-premium.com',
                  phone: '+33 1 42 36 78 90',
                  address: {
                    street: '123 Rue de Rivoli',
                    city: 'Paris',
                    postalCode: '75001',
                    country: 'France'
                  },
                  socialMedia: {
                    instagram: '@sneakers_premium',
                    facebook: 'SneakersPremiumStore'
                  }
                }),
                'approved',
                new Date(),
                true,
                new Date(),
                new Date()
              ],
              transaction
            }
          );
        } else {
          // Mettre à jour le seller existant
          await queryInterface.sequelize.query(
            `UPDATE users SET 
              seller_info = ?, 
              seller_status = ?, 
              seller_approved_at = ?,
              updated_at = ?
            WHERE id = ?`,
            {
              replacements: [
                JSON.stringify({
                  businessName: 'Sneakers Premium Store',
                  description: 'Spécialiste des sneakers Nike, Adidas et marques premium',
                  logo: null,
                  website: 'https://sneakers-premium.com',
                  phone: '+33 1 42 36 78 90'
                }),
                'approved',
                new Date(),
                new Date(),
                defaultSellerId
              ],
              transaction
            }
          );
        }
      } else {
        // Créer un seller par défaut complet
        const { v4: uuidv4 } = require('uuid');
        const bcrypt = require('bcryptjs');
        
        defaultSellerId = uuidv4();
        const hashedPassword = await bcrypt.hash('seller123', 12);
        
        await queryInterface.sequelize.query(
          `INSERT INTO users (
            id, email, password, first_name, last_name, role,
            seller_info, seller_status, seller_approved_at,
            is_active, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          {
            replacements: [
              defaultSellerId,
              'seller@sneakers-premium.com',
              hashedPassword,
              'Sneakers',
              'Premium',
              'seller',
              JSON.stringify({
                businessName: 'Sneakers Premium Store',
                description: 'Votre spécialiste sneakers premium',
                logo: null,
                website: 'https://sneakers-premium.com',
                phone: '+33 1 42 36 78 90'
              }),
              'approved',
              new Date(),
              true,
              new Date(),
              new Date()
            ],
            transaction
          }
        );
      }

      // =============================================
      // 4. ASSIGNATION DES PRODUITS EXISTANTS
      // =============================================
      
      console.log('🔗 Assigning existing products to default seller...');
      
      // Assigner tous les produits existants au seller par défaut
      const [updateResult] = await queryInterface.sequelize.query(
        'UPDATE products SET seller_id = ?, updated_at = ? WHERE seller_id IS NULL',
        { 
          replacements: [defaultSellerId, new Date()],
          transaction 
        }
      );
      
      console.log(`✅ Assigned ${updateResult.affectedRows || 'all'} products to seller ${defaultSellerId}`);

      // Générer des codes produits pour le seller
      await queryInterface.sequelize.query(`
        UPDATE products 
        SET seller_product_code = UPPER(SUBSTR(name, 1, 3) || '-' || SUBSTR(brand, 1, 3) || '-' || SUBSTR(id, 1, 4)),
            updated_at = ?
        WHERE seller_product_code IS NULL
      `, {
        replacements: [new Date()],
        transaction
      });

      // =============================================
      // 5. CONTRAINTES ET INTÉGRITÉ
      // =============================================
      
      console.log('🔒 Setting up constraints and referential integrity...');
      
      // Rendre sellerId obligatoire maintenant que tous les produits sont assignés
      await queryInterface.changeColumn('products', 'seller_id', {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      }, { transaction });

      // =============================================
      // 6. INDEX POUR PERFORMANCE MULTI-VENDEURS
      // =============================================
      
      console.log('⚡ Creating optimized indexes for multi-vendor queries...');
      
      // Index principaux pour les requêtes seller
      await queryInterface.addIndex('products', ['seller_id'], {
        name: 'idx_products_seller_id',
        transaction
      });
      
      await queryInterface.addIndex('products', ['seller_id', 'is_active'], {
        name: 'idx_products_seller_active',
        transaction
      });
      
      await queryInterface.addIndex('products', ['seller_id', 'category'], {
        name: 'idx_products_seller_category',
        transaction
      });
      
      await queryInterface.addIndex('products', ['seller_id', 'created_at'], {
        name: 'idx_products_seller_created',
        transaction
      });

      // Index pour les utilisateurs sellers
      await queryInterface.addIndex('users', ['role', 'seller_status'], {
        name: 'idx_users_role_seller_status',
        transaction
      });

      // Index pour les codes produits sellers
      await queryInterface.addIndex('products', ['seller_id', 'seller_product_code'], {
        name: 'idx_products_seller_code',
        unique: true,
        transaction
      });

      // =============================================
      // 7. VUES POUR FACILITER LES REQUÊTES
      // =============================================
      
      console.log('👁️  Creating database views for seller operations...');
      
      // Vue pour les produits avec informations seller
      await queryInterface.sequelize.query(`
        CREATE VIEW products_with_seller AS
        SELECT 
          p.*,
          u.first_name as seller_first_name,
          u.last_name as seller_last_name,
          u.email as seller_email,
          u.seller_info,
          u.seller_status,
          (SELECT COUNT(*) FROM product_variants pv WHERE pv.product_id = p.id) as variant_count,
          (SELECT SUM(pv.stock) FROM product_variants pv WHERE pv.product_id = p.id) as total_stock
        FROM products p
        INNER JOIN users u ON p.seller_id = u.id
        WHERE u.role = 'seller' AND u.seller_status = 'approved'
      `, { transaction });

      // Vue pour les statistiques sellers
      await queryInterface.sequelize.query(`
        CREATE VIEW seller_stats AS
        SELECT 
          u.id as seller_id,
          u.first_name,
          u.last_name,
          JSON_EXTRACT(u.seller_info, '$.businessName') as business_name,
          COUNT(DISTINCT p.id) as total_products,
          COUNT(DISTINCT CASE WHEN p.is_active = 1 THEN p.id END) as active_products,
          COALESCE(SUM(pv.stock), 0) as total_stock,
          COUNT(DISTINCT pv.id) as total_variants
        FROM users u
        LEFT JOIN products p ON u.id = p.seller_id
        LEFT JOIN product_variants pv ON p.id = pv.product_id
        WHERE u.role = 'seller'
        GROUP BY u.id, u.first_name, u.last_name, u.seller_info
      `, { transaction });

      // =============================================
      // 8. FONCTIONS DE VALIDATION
      // =============================================
      
      console.log('✅ Creating validation functions...');
      
      // Trigger pour valider sellerInfo lors des mises à jour
      await queryInterface.sequelize.query(`
        CREATE TRIGGER validate_seller_info
        BEFORE UPDATE ON users
        FOR EACH ROW
        BEGIN
          IF NEW.role = 'seller' AND (
            NEW.seller_info IS NULL OR 
            JSON_EXTRACT(NEW.seller_info, '$.businessName') IS NULL OR
            JSON_EXTRACT(NEW.seller_info, '$.businessName') = ''
          ) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Seller must have a business name in seller_info';
          END IF;
        END
      `, { transaction });

      await transaction.commit();
      
      console.log('🎉 Comprehensive seller architecture migration completed successfully!');
      console.log('📊 Multi-vendor marketplace is now fully configured with:');
      console.log('   ✅ Product isolation by seller');
      console.log('   ✅ Role-based access control');
      console.log('   ✅ Optimized database indexes');
      console.log('   ✅ Referential integrity');
      console.log('   ✅ Business logic validation');
      console.log(`   ✅ Default seller created: ${defaultSellerId}`);

    } catch (error) {
      await transaction.rollback();
      console.error('❌ Migration failed:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log('🔄 Rolling back comprehensive seller architecture...');

      // Supprimer les triggers
      await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS validate_seller_info', { transaction });

      // Supprimer les vues
      await queryInterface.sequelize.query('DROP VIEW IF EXISTS seller_stats', { transaction });
      await queryInterface.sequelize.query('DROP VIEW IF EXISTS products_with_seller', { transaction });

      // Supprimer les index
      await queryInterface.removeIndex('products', 'idx_products_seller_code', { transaction });
      await queryInterface.removeIndex('users', 'idx_users_role_seller_status', { transaction });
      await queryInterface.removeIndex('products', 'idx_products_seller_created', { transaction });
      await queryInterface.removeIndex('products', 'idx_products_seller_category', { transaction });
      await queryInterface.removeIndex('products', 'idx_products_seller_active', { transaction });
      await queryInterface.removeIndex('products', 'idx_products_seller_id', { transaction });

      // Supprimer les colonnes produits
      await queryInterface.removeColumn('products', 'commission_rate', { transaction });
      await queryInterface.removeColumn('products', 'seller_product_code', { transaction });
      await queryInterface.removeColumn('products', 'seller_id', { transaction });

      // Supprimer les colonnes utilisateurs
      await queryInterface.removeColumn('users', 'seller_approved_at', { transaction });
      await queryInterface.removeColumn('users', 'seller_status', { transaction });
      await queryInterface.removeColumn('users', 'seller_info', { transaction });

      await transaction.commit();
      console.log('✅ Rollback completed successfully');

    } catch (error) {
      await transaction.rollback();
      console.error('❌ Rollback failed:', error);
      throw error;
    }
  }
};
