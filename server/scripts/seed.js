const { Product, ProductVariant, User } = require('../database');

const sneakers = [
  { name: "Air Max 90", brand: "Nike", category: "men", basePrice: 129.99, sizes: ["40", "41", "42", "43", "44"] },
  { name: "Stan Smith", brand: "Adidas", category: "men", basePrice: 89.99, sizes: ["40", "41", "42", "43", "44"] },
  { name: "Air Force 1", brand: "Nike", category: "women", basePrice: 119.99, sizes: ["36", "37", "38", "39", "40"] },
  { name: "Gazelle", brand: "Adidas", category: "women", basePrice: 79.99, sizes: ["36", "37", "38", "39", "40"] },
  { name: "Air Max Kids", brand: "Nike", category: "kids", basePrice: 69.99, sizes: ["28", "29", "30", "31", "32"] }
];

const users = [
  { email: 'admin@sneakers.com', password: 'admin123', firstName: 'Admin', lastName: 'User', role: 'admin' },
  { 
    email: 'seller@sneakers.com', 
    password: 'seller123', 
    firstName: 'Seller', 
    lastName: 'User', 
    role: 'seller',
    sellerInfo: {
      businessName: 'Sneakers Premium Store',
      description: 'Boutique premium de sneakers haut de gamme',
      phone: '+33 1 23 45 67 89',
      address: '123 Rue de la Mode, 75001 Paris'
    },
    seller_status: 'approved'
  },
  { email: 'customer@sneakers.com', password: 'customer123', firstName: 'Customer', lastName: 'User', role: 'customer' }
];

async function seed() {
  try {
    const { sequelize } = require('../database');
    await sequelize.sync();
    
    await ProductVariant.destroy({ where: {}, force: true });
    await Product.destroy({ where: {}, force: true });
    await User.destroy({ where: {}, force: true });
    
    // Créer les utilisateurs
    const createdUsers = [];
    for (const userData of users) {
      const user = await User.create(userData);
      createdUsers.push(user);
    }
    
    // Récupérer le seller pour associer les produits
    const seller = createdUsers.find(user => user.role === 'seller');
    
    for (const sneaker of sneakers) {
      const { sizes, ...productData } = sneaker;
      
      // Associer le produit au seller et ajouter les champs requis
      const product = await Product.create({
        ...productData,
        sellerId: seller.id,
        sellerProductCode: `${sneaker.brand.toUpperCase().substring(0, 3)}-${Date.now()}`,
        commissionRate: 0.15, // 15% de commission
        isActive: true
      });
      
      const variants = sizes.map(size => ({
        productId: product.id,
        size,
        sizeType: 'EU',
        stock: Math.floor(Math.random() * 20) + 1,
        sku: `${sneaker.brand.toUpperCase()}-${sneaker.name.replace(/\s+/g, '').toUpperCase()}-${sneaker.category.toUpperCase()}-${size}-EU`
      }));
      
      await ProductVariant.bulkCreate(variants);
    }
    
    console.log('✅ Seeding completed successfully!');
    console.log(`📊 Created: ${users.length} users, ${sneakers.length} products`);
    console.log(`🏪 Seller: ${seller.sellerInfo.businessName}`);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

if (require.main === module) {
  seed();
}

module.exports = seed;
