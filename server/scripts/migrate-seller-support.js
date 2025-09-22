const { sequelize } = require('../database');
const migration = require('../database/migrations/add-seller-support');

async function runMigration() {
  try {
    console.log('🚀 Starting seller support migration...');
    
    await migration.up(sequelize.getQueryInterface(), sequelize);
    
    console.log('✅ Seller support migration completed successfully!');
    console.log('📊 Multi-vendor architecture is now active');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

if (require.main === module) {
  runMigration();
}

module.exports = { runMigration };
