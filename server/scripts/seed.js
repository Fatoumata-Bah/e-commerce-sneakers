const { Product, ProductVariant } = require('../database');

const essentialSneakers = [
  { name: "Air Max 90", brand: "Nike", category: "men", basePrice: 129.99, sizes: ["40", "41", "42", "43", "44"] },
  { name: "Stan Smith", brand: "Adidas", category: "men", basePrice: 89.99, sizes: ["40", "41", "42", "43", "44"] },
  { name: "Air Force 1", brand: "Nike", category: "women", basePrice: 119.99, sizes: ["36", "37", "38", "39", "40"] },
  { name: "Gazelle", brand: "Adidas", category: "women", basePrice: 79.99, sizes: ["36", "37", "38", "39", "40"] },
  { name: "Air Max Kids", brand: "Nike", category: "kids", basePrice: 69.99, sizes: ["28", "29", "30", "31", "32"] }
];

const randomStock = () => Math.floor(Math.random() * 20) + 1;

async function seed() {
  try {
    console.log('🌱 Seeding essential sneakers...');
    
    await ProductVariant.destroy({ where: {}, force: true });
    await Product.destroy({ where: {}, force: true });
    
    for (const sneaker of essentialSneakers) {
      const { sizes, ...productData } = sneaker;
      const product = await Product.create(productData);
      
      const variants = sizes.map(size => ({
        productId: product.id,
        size,
        sizeType: 'EU',
        stock: randomStock(),
        sku: `${sneaker.brand.toUpperCase()}-${sneaker.name.replace(/\s+/g, '').toUpperCase()}-${sneaker.category.toUpperCase()}-${size}-EU`
      }));
      
      await ProductVariant.bulkCreate(variants);
      console.log(`✅ ${sneaker.brand} ${sneaker.name}`);
    }
    
    console.log(`🎉 Created ${essentialSneakers.length} essential sneakers with variants`);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
}

if (require.main === module) {
  seed();
}

module.exports = seed;
