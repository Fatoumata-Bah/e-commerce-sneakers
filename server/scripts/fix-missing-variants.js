const { Product, ProductVariant } = require('../database');
const { getSizesForCategory } = require('../database/size-ranges');

async function createMissingVariants() {
  try {
    console.log('🔧 Starting to fix missing variants...');
    
    const products = await Product.findAll({
      include: [{ model: ProductVariant }]
    });

    console.log(`📦 Found ${products.length} products`);

    for (const product of products) {
      if (product.ProductVariants.length === 0) {
        console.log(`\n🏷️  Creating variants for: ${product.name} (${product.category})`);
        
        // Obtenir les tailles par défaut pour la catégorie
        const euSizes = getSizesForCategory(product.category, 'EU');
        
        // Créer 3-5 variants populaires avec du stock
        const popularSizes = product.category === 'men' 
          ? ['41', '42', '43', '44', '45']
          : product.category === 'women'
          ? ['37', '38', '39', '40', '41'] 
          : ['30', '31', '32', '33', '34']; // kids
        
        const variantsToCreate = [];
        
        for (const size of popularSizes) {
          if (euSizes.includes(size)) {
            const stock = Math.floor(Math.random() * 15) + 5; // Stock entre 5 et 19
            variantsToCreate.push({
              productId: product.id,
              size: size,
              sizeType: 'EU',
              stock: stock,
              sku: `${product.brand.toUpperCase()}-${product.name.replace(/\s+/g, '').toUpperCase()}-${size}-EU`
            });
            console.log(`   ✅ Size ${size} EU: ${stock} stock`);
          }
        }
        
        if (variantsToCreate.length > 0) {
          await ProductVariant.bulkCreate(variantsToCreate);
          console.log(`   🎯 Created ${variantsToCreate.length} variants`);
        }
      } else {
        console.log(`✅ ${product.name} already has ${product.ProductVariants.length} variants`);
      }
    }
    
    console.log('\n🎉 All missing variants created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating variants:', error);
    throw error;
  }
}

if (require.main === module) {
  createMissingVariants()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { createMissingVariants };
