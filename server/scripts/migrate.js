const { sequelize, testConnection } = require('../database');

async function migrate() {
  try {
    console.log('Testing database connection...');
    await testConnection();
    
    console.log('Creating database tables...');
    await sequelize.sync({ 
      force: false,
      alter: true 
    });
    
    console.log('Migration completed successfully!');
    
    const tables = await sequelize.getQueryInterface().showAllTables();
    console.log('Tables created:', tables);
    
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

if (require.main === module) {
  migrate();
}

module.exports = migrate;
