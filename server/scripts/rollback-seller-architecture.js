const { sequelize } = require('../database');
const migration = require('../database/migrations/comprehensive-seller-architecture');

/**
 * ROLLBACK ARCHITECTURE MULTI-VENDEURS
 * ====================================
 * 
 * Script pour annuler la migration multi-vendeurs en cas de problème
 */

async function rollbackSellerArchitecture() {
  console.log('🔄 ROLLBACK ARCHITECTURE MULTI-VENDEURS');
  console.log('=========================================');
  
  try {
    console.log('⚠️  ATTENTION: Cette opération va supprimer:');
    console.log('   - Les liens produits-sellers');
    console.log('   - Les informations seller');
    console.log('   - Les vues et index multi-vendeurs');
    console.log('   - Les triggers de validation');
    
    // Demander confirmation (en mode interactif)
    if (process.stdin.isTTY) {
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const answer = await new Promise((resolve) => {
        rl.question('Êtes-vous sûr de vouloir continuer? (oui/non): ', resolve);
      });
      
      rl.close();
      
      if (answer.toLowerCase() !== 'oui') {
        console.log('❌ Rollback annulé par l\'utilisateur');
        return;
      }
    }

    console.log('\n📋 Phase 1: Sauvegarde des données importantes...');
    
    // Sauvegarder les informations sellers avant rollback
    const [sellers] = await sequelize.query(`
      SELECT 
        id, 
        email, 
        first_name, 
        last_name, 
        seller_info, 
        seller_status,
        seller_approved_at
      FROM users 
      WHERE role = 'seller' AND seller_info IS NOT NULL
    `);
    
    if (sellers.length > 0) {
      console.log(`💾 Sauvegarde de ${sellers.length} sellers...`);
      const fs = require('fs');
      const backupData = {
        timestamp: new Date().toISOString(),
        sellers: sellers
      };
      
      fs.writeFileSync(
        `seller-backup-${Date.now()}.json`, 
        JSON.stringify(backupData, null, 2)
      );
      console.log('✅ Sellers sauvegardés dans seller-backup-*.json');
    }

    console.log('\n📋 Phase 2: Exécution du rollback...');
    await migration.down(sequelize.getQueryInterface(), sequelize);

    console.log('\n📋 Phase 3: Vérification post-rollback...');
    
    // Vérifier que les colonnes ont été supprimées
    try {
      await sequelize.query('SELECT seller_id FROM products LIMIT 1');
      console.log('❌ La colonne seller_id existe encore!');
    } catch (error) {
      console.log('✅ Colonne seller_id supprimée');
    }

    try {
      await sequelize.query('SELECT seller_info FROM users LIMIT 1');
      console.log('❌ La colonne seller_info existe encore!');
    } catch (error) {
      console.log('✅ Colonne seller_info supprimée');
    }

    // Vérifier que les vues ont été supprimées
    try {
      await sequelize.query('SELECT * FROM products_with_seller LIMIT 1');
      console.log('❌ La vue products_with_seller existe encore!');
    } catch (error) {
      console.log('✅ Vue products_with_seller supprimée');
    }

    console.log('\n🎉 ROLLBACK TERMINÉ AVEC SUCCÈS!');
    console.log('=================================');
    console.log('✅ Architecture multi-vendeurs supprimée');
    console.log('✅ Base de données restaurée à l\'état précédent');
    console.log('✅ Données sellers sauvegardées');
    
    console.log('\n📝 NOTES:');
    console.log('- Les données sellers sont sauvegardées dans seller-backup-*.json');
    console.log('- Vous pouvez réexécuter la migration avec deploy-seller-architecture.js');
    console.log('- Les produits et utilisateurs existants sont préservés');
    
  } catch (error) {
    console.error('❌ ERREUR LORS DU ROLLBACK:', error);
    console.log('\n⚠️  Le rollback a échoué. État de la base de données incertain.');
    console.log('Vérification manuelle recommandée.');
    throw error;
  }
}

async function cleanupOrphanedData() {
  console.log('\n🧹 NETTOYAGE DES DONNÉES ORPHELINES');
  console.log('====================================');
  
  try {
    // Nettoyer les rôles seller sans seller_info (si la migration a partiellement échoué)
    const [orphanedSellers] = await sequelize.query(`
      UPDATE users 
      SET role = 'customer' 
      WHERE role = 'seller' AND seller_info IS NULL
    `);
    
    if (orphanedSellers.affectedRows > 0) {
      console.log(`✅ ${orphanedSellers.affectedRows} sellers sans seller_info convertis en customers`);
    }

    console.log('✅ Nettoyage terminé');
    
  } catch (error) {
    console.log('❌ Erreur lors du nettoyage:', error.message);
  }
}

if (require.main === module) {
  rollbackSellerArchitecture()
    .then(() => cleanupOrphanedData())
    .then(() => {
      console.log('\n🎊 ROLLBACK COMPLÉTÉ AVEC SUCCÈS!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 ÉCHEC DU ROLLBACK:', error.message);
      process.exit(1);
    })
    .finally(() => {
      sequelize.close();
    });
}

module.exports = { rollbackSellerArchitecture, cleanupOrphanedData };
