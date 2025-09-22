const { Product, ProductVariant } = require('../database');
const { getSizesForCategory } = require('../database/size-ranges');

async function fixRemainingVariants() {
  try {
    console.log('🔧 Fixing remaining products without variants...');
    
    const products = await Product.findAll({
      include: [{ model: ProductVariant }]
    });

    const productsWithoutVariants = products.filter(p => p.ProductVariants.length === 0);
    console.log(`📦 Found ${productsWithoutVariants.length} products without variants`);

    for (const product of productsWithoutVariants) {
      console.log(`\n🏷️  Creating variants for: ${product.name} (${product.category})`);
      
      // Obtenir les tailles par défaut pour la catégorie
      const popularSizes = product.category === 'men' 
        ? ['41', '42', '43', '44', '45']
        : product.category === 'women'
        ? ['37', '38', '39', '40', '41'] 
        : ['30', '31', '32', '33', '34']; // kids
      
      const variantsToCreate = [];
      
      for (const size of popularSizes) {
        const stock = Math.floor(Math.random() * 15) + 5; // Stock entre 5 et 19
        
        // SKU unique avec timestamp pour éviter les conflits
        const timestamp = Date.now().toString().slice(-4);
        const sku = `${product.brand.toUpperCase()}-${product.name.replace(/\s+/g, '').toUpperCase()}-${size}-EU-${timestamp}`;
        
        variantsToCreate.push({
          productId: product.id,
          size: size,
          sizeType: 'EU',
          stock: stock,
          sku: sku
        });
        console.log(`   ✅ Size ${size} EU: ${stock} stock (${sku})`);
      }
      
      if (variantsToCreate.length > 0) {
        await ProductVariant.bulkCreate(variantsToCreate);
        console.log(`   🎯 Created ${variantsToCreate.length} variants`);
      }
    }
    
    console.log('\n🎉 All remaining variants created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating remaining variants:', error);
    throw error;
  }
}

if (require.main === module) {
  fixRemainingVariants()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { fixRemainingVariants };
