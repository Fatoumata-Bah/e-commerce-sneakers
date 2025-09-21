const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { Product, ProductVariant } = require('../database');
const { getSizesForCategory } = require('../database/size-ranges');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { category, brand, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const where = { isActive: true };
    if (category) where.category = category;
    if (brand) where.brand = brand;
    if (search) {
      where[require('sequelize').Op.or] = [
        { name: { [require('sequelize').Op.like]: `%${search}%` } },
        { description: { [require('sequelize').Op.like]: `%${search}%` } }
      ];
    }

    const products = await Product.findAndCountAll({
      where,
      include: [{
        model: ProductVariant,
        attributes: ['id', 'size', 'sizeType', 'stock', 'sku']
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
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

    const product = await Product.create({
      name,
      description,
      brand,
      category,
      basePrice,
      images: images || []
    });

    if (variants && variants.length > 0) {
      const validSizes = getSizesForCategory(category);
      const productVariants = [];

      for (const variant of variants) {
        if (!validSizes.includes(variant.size)) {
          return res.status(400).json({ 
            error: `Invalid size ${variant.size} for category ${category}. Valid sizes: ${validSizes.join(', ')}` 
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
    const { name, description, brand, category, basePrice, images, isActive } = req.body;

    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
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

router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await product.update({ isActive: false });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

module.exports = router;
