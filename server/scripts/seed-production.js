const { User, Product, ProductVariant, sequelize } = require('../database');
const bcryptjs = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Fonction pour lire un fichier CSV
const readCSVFile = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv({
        headers: ['id', 'name', 'brand', 'model', 'slug', 'image_url', 'stockx_url', 'retail_price', 'category', 'description', 'total_sales', 'average_sale_price', 'highest_sale_price']
      }))
      .on('data', (data) => {
        // Nettoyer et valider les données
        if (data.name && data.brand && data.image_url) {
          results.push({
            id: data.id,
            name: data.name.trim(),
            brand: data.brand.trim(),
            model: data.model ? data.model.trim() : data.name.trim(),
            slug: data.slug ? data.slug.trim() : '',
            imageUrl: data.image_url.trim(),
            stockxUrl: data.stockx_url ? data.stockx_url.trim() : '',
            retailPrice: parseFloat(data.retail_price) || 150,
            category: data.category ? data.category.trim() : 'sneakers',
            description: data.description ? data.description.replace(/<br>/g, '\n').trim() : '',
            totalSales: parseInt(data.total_sales) || 0,
            averageSalePrice: parseFloat(data.average_sale_price) || 150,
            highestSalePrice: parseFloat(data.highest_sale_price) || 200
          });
        }
      })
      .on('end', () => {
        resolve(results);
      })
      .on('error', reject);
  });
};

// Fonction pour lire tous les fichiers CSV
const readAllCSVFiles = async () => {
  const dataDir = path.join(__dirname, '../database/data');
  const csvFiles = fs.readdirSync(dataDir).filter(file => file.endsWith('.csv') && file.startsWith('sneakers_data_'));
  
  console.log(`📁 Fichiers CSV trouvés: ${csvFiles.length}`);
  csvFiles.forEach(file => console.log(`   - ${file}`));
  
  const allSneakers = [];
  
  for (const file of csvFiles) {
    const filePath = path.join(dataDir, file);
    try {
      const sneakers = await readCSVFile(filePath);
      allSneakers.push(...sneakers);
    } catch (error) {
      console.error(`❌ Erreur lors de la lecture de ${file}:`, error);
    }
  }
  
  console.log(`\n📊 TOTAL: ${allSneakers.length} sneakers chargées depuis ${csvFiles.length} fichiers\n`);
  return allSneakers;
};

// Données des utilisateurs (inchangé)
const usersData = [
  // ADMIN
  {
    firstName: 'Fatoumata',
    lastName: 'Bah',
    email: 'admin@sneakersshop.com',
    password: 'SneakersShop2025!Admin',
    role: 'admin'
  },
  // SELLERS
  {
    firstName: 'Marie',
    lastName: 'Dubois',
    email: 'marie.dubois@sneakerpro.fr',
    password: 'SneakerPro2025!',
    role: 'seller',
    sellerInfo: {
      businessName: 'SneakerPro Paris',
      siret: '12345678901234',
      address: '15 Rue de Rivoli, 75001 Paris',
      phone: '+33 1 42 36 78 90'
    }
  },
  {
    firstName: 'Thomas',
    lastName: 'Bernard',
    email: 'thomas.bernard@urbanstyle.fr',
    password: 'UrbanStyle2025!',
    role: 'seller',
    sellerInfo: {
      businessName: 'Urban Style Lyon',
      siret: '23456789012345',
      address: '25 Cours Lafayette, 69003 Lyon',
      phone: '+33 4 78 95 12 34'
    }
  },
  {
    firstName: 'Alpha',
    lastName: 'Diallo',
    email: 'alpha.diallo@kicksstore.fr',
    password: 'KicksStore2025!',
    role: 'seller',
    sellerInfo: {
      businessName: 'Kicks Store Marseille',
      siret: '34567890123456',
      address: '10 La Canebière, 13001 Marseille',
      phone: '+33 4 91 54 32 10'
    }
  },
  {
    firstName: 'Julien',
    lastName: 'Petit',
    email: 'julien.petit@streetsneakers.fr',
    password: 'StreetSneakers2025!',
    role: 'seller',
    sellerInfo: {
      businessName: 'Street Sneakers Toulouse',
      siret: '45678901234567',
      address: '5 Place du Capitole, 31000 Toulouse',
      phone: '+33 5 61 23 45 67'
    }
  },
  // CLIENTS
  {
    firstName: 'Lucas',
    lastName: 'Moreau',
    email: 'lucas.moreau@gmail.com',
    password: 'Lucas2025!',
    role: 'customer'
  },
  {
    firstName: 'Emma',
    lastName: 'Rousseau',
    email: 'emma.rousseau@yahoo.fr',
    password: 'Emma2025!',
    role: 'customer'
  },
  {
    firstName: 'Antoine',
    lastName: 'Garcia',
    email: 'antoine.garcia@hotmail.fr',
    password: 'Antoine2025!',
    role: 'customer'
  },
  {
    firstName: 'Chloé',
    lastName: 'Martinez',
    email: 'chloe.martinez@gmail.com',
    password: 'Chloe2025!',
    role: 'customer'
  },
  {
    firstName: 'Maxime',
    lastName: 'Lopez',
    email: 'maxime.lopez@outlook.fr',
    password: 'Maxime2025!',
    role: 'customer'
  },
  {
    firstName: 'Léa',
    lastName: 'Gonzalez',
    email: 'lea.gonzalez@gmail.com',
    password: 'Lea2025!',
    role: 'customer'
  }
];

// Fonction pour déterminer la catégorie basée sur le nom/description
const determineCategory = (name, description) => {
  const nameAndDesc = (name + ' ' + (description || '')).toLowerCase();
  
  if (nameAndDesc.includes('kids') || nameAndDesc.includes('enfant') || nameAndDesc.includes('child') || 
      nameAndDesc.includes('junior') || nameAndDesc.includes('youth') || nameAndDesc.includes('ps') || 
      nameAndDesc.includes('td') || nameAndDesc.includes('toddler') || nameAndDesc.includes('(gs)')) {
    return 'kids';
  }
  
  if (nameAndDesc.includes("(women's)") || nameAndDesc.includes('women') || nameAndDesc.includes('femme')) {
    return 'women';
  }
  
  // Par défaut, catégorie hommes
  return 'men';
};

// Fonction principale de seeding
const seedProductionData = async () => {
  try {
    console.log('🔧 INITIALISATION DE LA BASE DE DONNÉES...');
    
    // Créer les tables si elles n'existent pas
    await sequelize.sync({ force: true }); // force: true recrée les tables
    console.log('✅ Tables créées avec succès');

    // Les tables sont maintenant créées, pas besoin de nettoyer

    // Lire tous les fichiers CSV
    console.log('📖 LECTURE DES FICHIERS CSV...');
    const allSneakersData = await readAllCSVFiles();

    if (allSneakersData.length === 0) {
      console.error('❌ Aucune donnée de sneakers trouvée dans les fichiers CSV');
      return;
    }

    // Créer les utilisateurs
    console.log('👥 CRÉATION DES UTILISATEURS...');
    const createdUsers = [];
    const userPasswords = {}; // Pour stocker les mots de passe en clair

    for (const userData of usersData) {
      userPasswords[userData.email] = userData.password;
      
      // Le modèle User hache automatiquement le mot de passe via beforeCreate hook
      
      const user = await User.create({
        ...userData
        // password sera haché automatiquement par le hook beforeCreate
      });
      
      createdUsers.push(user);
    }

    // Séparer les sellers
    const sellers = createdUsers.filter(user => user.role === 'seller');
    console.log(`\n🏪 SELLERS CRÉÉS: ${sellers.length}`);

    // Créer les produits depuis les CSV
    console.log('\n👟 CRÉATION DES PRODUITS...');
    const createdProducts = [];
    let sellerIndex = 0;

    for (const sneaker of allSneakersData) {
      try {
        const seller = sellers[sellerIndex % sellers.length];
        sellerIndex++;

        const product = await Product.create({
          name: sneaker.name,
          description: sneaker.description || `${sneaker.brand} ${sneaker.name} - Sneakers authentiques de qualité premium.`,
          brand: sneaker.brand,
          category: determineCategory(sneaker.name, sneaker.description),
          basePrice: sneaker.retailPrice || 150,
          images: [sneaker.imageUrl],
          sellerId: seller.id,
          sellerProductCode: `${sneaker.brand.toUpperCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          commissionRate: 0.10,
          isActive: true
        });

        createdProducts.push(product);

        // Créer les variantes pour chaque produit selon la catégorie
        const sizeTypes = ['EU', 'UK', 'US'];
        
        // Définir les tailles valides par catégorie (selon size-ranges.js)
        const validSizes = {
          'men': {
            'EU': ['39', '40', '41', '42', '43', '44', '45', '46', '47', '48'],
            'US': ['6', '7', '8', '9', '10', '11', '12', '13', '14', '15'],
            'UK': ['6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '12.5', '13']
          },
          'women': {
            'EU': ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44'],
            'US': ['5', '6', '7', '8', '9', '10', '11', '12'],
            'UK': ['2.5', '3', '3.5', '4', '4.5', '5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9']
          },
          'kids': {
            'EU': ['28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38'],
            'US': ['11', '11.5', '12', '12.5', '13', '13.5', '1', '2', '3', '4', '5'],
            'UK': ['10', '10.5', '11', '11.5', '12', '12.5', '13', '1', '2', '3', '4']
          }
        };

        for (const sizeType of sizeTypes) {
          const availableSizes = validSizes[product.category]?.[sizeType] || [];
          const numSizes = Math.min(Math.floor(Math.random() * 8) + 5, availableSizes.length); // 5-12 tailles ou maximum disponible
          
          // Sélectionner des tailles aléatoires parmi les tailles valides
          const selectedSizes = availableSizes
            .sort(() => 0.5 - Math.random()) // Mélanger
            .slice(0, numSizes); // Prendre les premières
          
          for (const size of selectedSizes) {
            const stock = Math.floor(Math.random() * 15) + 1; // 1-15 en stock
            
            try {
              await ProductVariant.create({
                productId: product.id,
                size: size,
                sizeType: sizeType,
                stock: stock,
                sku: `${sneaker.brand.toUpperCase()}-${sneaker.name.replace(/\s+/g, '').toUpperCase().substring(0, 15)}-${size}-${sizeType}`
              });
            } catch (error) {
              // Si erreur de création (ex: SKU duplicate), continuer
            }
          }
        }

        if ((createdProducts.length) % 10 === 0) {
        }

      } catch (error) {
        console.error(`❌ Erreur lors de la création du produit ${sneaker.name}:`, error.message);
      }
    }

    // Statistiques finales
    console.log('\n📊 STATISTIQUES FINALES:');
    console.log(`👥 Utilisateurs créés: ${createdUsers.length}`);
    console.log(`👟 Produits créés: ${createdProducts.length}`);
    
    const totalVariants = await ProductVariant.count();
    console.log(`📏 Variantes créées: ${totalVariants}`);

    // Statistiques par marque
    const brandStats = {};
    createdProducts.forEach(product => {
      brandStats[product.brand] = (brandStats[product.brand] || 0) + 1;
    });
    
    Object.entries(brandStats).forEach(([brand, count]) => {
      console.log(`   ${brand}: ${count} produits`);
    });

    // Afficher les credentials
    console.log('\n🔐 CREDENTIALS DES UTILISATEURS:');
    console.log('=' .repeat(50));
    
    console.log('\n👑 ADMIN:');
    const admin = createdUsers.find(u => u.role === 'admin');
    console.log(`Email: ${admin.email}`);
    console.log(`Mot de passe: ${userPasswords[admin.email]}`);
    
    console.log('\n🏪 SELLERS:');
    sellers.forEach(seller => {
      console.log(`\nEmail: ${seller.email}`);
      console.log(`Mot de passe: ${userPasswords[seller.email]}`);
      console.log(`Entreprise: ${seller.sellerInfo.businessName}`);
    });
    
    console.log('\n👤 CLIENTS:');
    createdUsers.filter(u => u.role === 'customer').forEach(customer => {
      console.log(`Email: ${customer.email} | Mot de passe: ${userPasswords[customer.email]}`);
    });

    console.log('\n🎉 SEEDING TERMINÉ AVEC SUCCÈS !');

  } catch (error) {
    console.error('❌ ERREUR LORS DU SEEDING:', error);
    throw error;
  }
};

// Exécution du script
if (require.main === module) {
  seedProductionData()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script échoué:', error);
      process.exit(1);
    });
}

module.exports = seedProductionData;
