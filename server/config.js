module.exports = {
  port: 4000,
  nodeEnv: 'development',
  
  database: {
    dialect: 'sqlite',
    storage: './database/dev.sqlite'
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'sk_dev_' + require('crypto').randomBytes(32).toString('hex'),
    expiresIn: '24h'
  }
};
