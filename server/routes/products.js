const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { Product, ProductVariant, User } = require('../database');
const { getSizesForCategory } = require('../database/size-ranges');
const router = express.Router();

// Route pour les sellers - uniquement leurs produits
router.get('/my-products', authenticateToken, requireRole(['seller', 'admin']), async (req, res) => {
  try {
    const { category, brand, search, page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;

    const where = { isActive: true };
    
    // Les sellers ne voient que leurs produits, les admins voient tout
    if (req.user.role === 'seller') {
      where.sellerId = req.user.id;
    }
    
    if (category) where.category = category;
    if (brand) where.brand = brand;
    if (search) {
      // Vérifier si le terme de recherche correspond à une marque connue
      const knownBrands = ['Nike', 'Jordan', 'adidas', 'New Balance', 'ASICS', 'Under Armour', 'Maison Mihara Yasuhiro'];
      const matchingBrand = knownBrands.find(brandName => 
        brandName.toLowerCase() === search.toLowerCase()
      );
      
      if (matchingBrand) {
        // Si c'est une marque connue, chercher seulement dans cette marque
        where.brand = matchingBrand;
      } else {
        // Sinon, recherche générale dans le nom et la description
        where[require('sequelize').Op.or] = [
          { name: { [require('sequelize').Op.like]: `%${search}%` } },
          { description: { [require('sequelize').Op.like]: `%${search}%` } }
        ];
      }
    }

    const products = await Product.findAndCountAll({
      where,
      include: [
        {
          model: ProductVariant,
          attributes: ['id', 'size', 'sizeType', 'stock', 'sku']
        },
        {
          model: User,
          as: 'Seller',
          attributes: ['id', 'firstName', 'lastName', 'sellerInfo', 'role']
        }
      ],
      distinct: true, // Important: compte seulement les produits uniques
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: (() => {
        switch (sortBy) {
          case 'price-asc': return [['basePrice', 'ASC']];
          case 'price-desc': return [['basePrice', 'DESC']];
          case 'name': return [['name', 'ASC']];
          case 'name-desc': return [['name', 'DESC']];
          case 'newest': return [['createdAt', 'DESC']];
          default: return [require('sequelize').fn('RANDOM')]; // Ordre aléatoire par défaut
        }
      })()
    });

    res.json({
      products: products.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(products.count / limit),
        totalItems: products.count,
        hasNext: offset + products.rows.length < products.count,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get seller products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.get('/', async (req, res) => {
  try {
    const { category, brand, search, page = 1, limit = 12, sortBy = 'newest' } = req.query;
    const offset = (page - 1) * limit;

    const where = { isActive: true };
    if (category) where.category = category;
    if (brand) where.brand = brand;
    if (search) {
      // Vérifier si le terme de recherche correspond à une marque connue
      const knownBrands = ['Nike', 'Jordan', 'adidas', 'New Balance', 'ASICS', 'Under Armour', 'Maison Mihara Yasuhiro'];
      const matchingBrand = knownBrands.find(brandName => 
        brandName.toLowerCase() === search.toLowerCase()
      );
      
      if (matchingBrand) {
        // Si c'est une marque connue, chercher seulement dans cette marque
        where.brand = matchingBrand;
      } else {
        // Sinon, recherche générale dans le nom et la description
        where[require('sequelize').Op.or] = [
          { name: { [require('sequelize').Op.like]: `%${search}%` } },
          { description: { [require('sequelize').Op.like]: `%${search}%` } }
        ];
      }
    }

    const products = await Product.findAndCountAll({
      where,
      include: [
        {
          model: ProductVariant,
          attributes: ['id', 'size', 'sizeType', 'stock', 'sku']
        },
        {
          model: User,
          as: 'Seller',
          attributes: ['id', 'firstName', 'lastName', 'sellerInfo', 'role']
        }
      ],
      distinct: true, // Important: compte seulement les produits uniques
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: (() => {
        switch (sortBy) {
          case 'price-asc': return [['basePrice', 'ASC']];
          case 'price-desc': return [['basePrice', 'DESC']];
          case 'name': return [['name', 'ASC']];
          case 'name-desc': return [['name', 'DESC']];
          case 'newest': return [['createdAt', 'DESC']];
          default: return [require('sequelize').fn('RANDOM')]; // Ordre aléatoire par défaut
        }
      })()
    });

    res.json({
      products: products.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(products.count / limit),
        totalItems: products.count,
        hasNext: offset + products.rows.length < products.count,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findOne({
      where: { id: req.params.id, isActive: true },
      include: [{
        model: ProductVariant,
        attributes: ['id', 'size', 'sizeType', 'stock', 'sku']
      }]
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ product });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

router.post('/', authenticateToken, requireRole(['admin', 'seller']), async (req, res) => {
  try {
    const { name, description, brand, category, basePrice, images, variants } = req.body;

    if (!name || !brand || !category || !basePrice) {
      return res.status(400).json({ error: 'Name, brand, category, and basePrice are required' });
    }

    if (!['men', 'women', 'kids'].includes(category)) {
      return res.status(400).json({ error: 'Category must be men, women, or kids' });
    }

    // Générer automatiquement le seller_product_code
    const generateSellerProductCode = (name, brand) => {
      const nameCode = name.replace(/\s+/g, '').substring(0, 3).toUpperCase();
      const brandCode = brand.replace(/\s+/g, '').substring(0, 3).toUpperCase();
      const timestamp = Date.now().toString().slice(-4);
      return `${nameCode}-${brandCode}-${timestamp}`;
    };

    const sellerProductCode = generateSellerProductCode(name, brand);

    const product = await Product.create({
      name,
      description,
      brand,
      category,
      basePrice,
      images: images || [],
      sellerId: req.user.id,  // Assigner automatiquement le seller connecté
      sellerProductCode  // Générer automatiquement le code produit
    });

    if (variants && variants.length > 0) {
      const productVariants = [];

      for (const variant of variants) {
        // Validation de la taille selon le type
        const validSizes = getSizesForCategory(category, variant.sizeType || 'EU');
        if (!validSizes.includes(variant.size)) {
          return res.status(400).json({ 
            error: `Taille ${variant.size} invalide pour la catégorie ${category} en ${variant.sizeType || 'EU'}. Tailles valides: ${validSizes.join(', ')}` 
          });
        }

        productVariants.push({
          productId: product.id,
          size: variant.size,
          sizeType: variant.sizeType || 'EU',
          stock: variant.stock || 0,
          sku: `${brand.toUpperCase()}-${name.replace(/\s+/g, '').toUpperCase()}-${variant.size}-${variant.sizeType || 'EU'}`
        });
      }

      await ProductVariant.bulkCreate(productVariants);
    }

    const createdProduct = await Product.findByPk(product.id, {
      include: [{ model: ProductVariant }]
    });

    res.status(201).json({
      message: 'Product created successfully',
      product: createdProduct
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

router.put('/:id', authenticateToken, requireRole(['admin', 'seller']), async (req, res) => {
  try {
    
    const { name, description, brand, category, basePrice, images, isActive, variants } = req.body;

    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Vérifier que le seller ne peut modifier que ses propres produits
    if (req.user.role === 'seller' && product.sellerId !== req.user.id) {
      return res.status(403).json({ error: 'You can only modify your own products' });
    }

    if (category && !['men', 'women', 'kids'].includes(category)) {
      return res.status(400).json({ error: 'Category must be men, women, or kids' });
    }

    await product.update({
      name: name || product.name,
      description: description !== undefined ? description : product.description,
      brand: brand || product.brand,
      category: category || product.category,
      basePrice: basePrice || product.basePrice,
      images: images !== undefined ? images : product.images,
      isActive: isActive !== undefined ? isActive : product.isActive
    });

    // Gestion des variants si fournis
    if (variants && Array.isArray(variants) && variants.length > 0) {
      const currentCategory = category || product.category;
      
      // Traitement séquentiel des variants avec gestion d'erreur
      for (let i = 0; i < variants.length; i++) {
        const variant = variants[i];
        try {
          // Validation de base
          if (!variant.size || !variant.sizeType) {
            continue; // Skip ce variant
          }
          
          // Validation de la taille selon le type
          const validSizes = getSizesForCategory(currentCategory, variant.sizeType);
          
          if (!validSizes.includes(variant.size.toString())) {
            console.error(`Invalid size ${variant.size} for category ${currentCategory} and type ${variant.sizeType}`);
            return res.status(400).json({ 
              error: `Taille ${variant.size} invalide pour la catégorie ${currentCategory} en ${variant.sizeType}. Tailles valides: ${validSizes.join(', ')}` 
            });
          }

          if (variant.id && !variant.id.toString().startsWith('new-')) {
            // Mise à jour d'un variant existant
            const existingVariant = await ProductVariant.findByPk(variant.id);
            if (existingVariant && existingVariant.productId === product.id) {
              await existingVariant.update({
                size: variant.size.toString(),
                sizeType: variant.sizeType,
                stock: parseInt(variant.stock) || 0
              });
            }
          } else {
            // Création d'un nouveau variant
            const existingVariant = await ProductVariant.findOne({
              where: {
                productId: product.id,
                size: variant.size.toString(),
                sizeType: variant.sizeType
              }
            });

            if (!existingVariant) {
              await ProductVariant.create({
                productId: product.id,
                size: variant.size.toString(),
                sizeType: variant.sizeType,
                stock: parseInt(variant.stock) || 0,
                sku: `${(product.brand || 'BRAND').toUpperCase()}-${(product.name || 'PRODUCT').replace(/\s+/g, '').toUpperCase()}-${variant.size}-${variant.sizeType}`
              });
            } else {
              await existingVariant.update({
                stock: parseInt(variant.stock) || 0
              });
            }
          }
        } catch (variantError) {
          // Continue avec les autres variants au lieu d'arrêter tout
        }
      }
    }

    const updatedProduct = await Product.findByPk(product.id, {
      include: [{ model: ProductVariant }]
    });

    res.json({
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

router.delete('/:id', authenticateToken, requireRole(['admin', 'seller']), async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Vérifier que le seller ne peut supprimer que ses propres produits
    if (req.user.role === 'seller' && product.sellerId !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete your own products' });
    }

    await product.update({ isActive: false });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

router.put('/variants/:variantId/stock', authenticateToken, requireRole(['admin', 'seller']), async (req, res) => {
  try {
    const { stock } = req.body;
    const variantId = req.params.variantId;

    if (stock < 0) {
      return res.status(400).json({ error: 'Stock cannot be negative' });
    }

    const variant = await ProductVariant.findByPk(variantId, {
      include: [{ model: Product }]
    });
    if (!variant) {
      return res.status(404).json({ error: 'Product variant not found' });
    }

    // Vérifier que le seller ne peut modifier que ses propres produits
    if (req.user.role === 'seller' && variant.Product.sellerId !== req.user.id) {
      return res.status(403).json({ error: 'You can only modify variants of your own products' });
    }

    await variant.update({ stock: parseInt(stock) });

    res.json({
      message: 'Stock updated successfully',
      variant: {
        id: variant.id,
        size: variant.size,
        stock: variant.stock
      }
    });
  } catch (error) {
    console.error('Update variant stock error:', error);
    res.status(500).json({ error: 'Failed to update stock' });
  }
});

// Route pour supprimer un variant
router.delete('/variants/:variantId', authenticateToken, requireRole(['admin', 'seller']), async (req, res) => {
  try {
    const variantId = req.params.variantId;

    const variant = await ProductVariant.findByPk(variantId, {
      include: [{ model: Product }]
    });

    if (!variant) {
      return res.status(404).json({ error: 'Product variant not found' });
    }

    // Vérifier que le seller ne peut supprimer que ses propres variants
    if (req.user.role === 'seller' && variant.Product.sellerId !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete variants of your own products' });
    }

    // Vérifier qu'il reste au moins un variant après suppression
    const totalVariants = await ProductVariant.count({
      where: { productId: variant.productId }
    });

    if (totalVariants <= 1) {
      return res.status(400).json({ 
        error: 'Cannot delete the last variant. A product must have at least one size.' 
      });
    }

    await variant.destroy();

    res.json({
      message: 'Variant deleted successfully',
      deletedVariant: {
        id: variant.id,
        size: variant.size,
        sizeType: variant.sizeType
      }
    });
  } catch (error) {
    console.error('Delete variant error:', error);
    res.status(500).json({ error: 'Failed to delete variant' });
  }
});

module.exports = router;
