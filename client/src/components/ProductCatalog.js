import React, { useState, useEffect, useMemo } from 'react';
import { Grid, Card, CardMedia, CardContent, Typography, Button, Chip, Box, CircularProgress, Alert, Fade } from '@mui/material';
import { LocalOffer, Star, ShoppingCart, Inventory2 } from '@mui/icons-material';
import { productService } from '../services/api';
import { useCart } from '../contexts/CartContext';
import { useNotification } from '../contexts/NotificationContext';
import ProductFilters from './ProductFilters';
import SizeSelectionDialog from './SizeSelectionDialog';

const ProductCatalog = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [sizeFilter, setSizeFilter] = useState([]);
  const [sortBy, setSortBy] = useState('name');
  
  // États pour le dialog de sélection de pointure
  const [sizeDialogOpen, setSizeDialogOpen] = useState(false);
  const [selectedProductForSize, setSelectedProductForSize] = useState(null);
  const [addToCartLoading, setAddToCartLoading] = useState(false);
  
  const { addToCart } = useCart();
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productService.getAll();
        setProducts(response.data.products);
      } catch (err) {
        setError('Erreur lors du chargement des produits');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const getCategoryColor = (category) => {
    const colors = { men: 'primary', women: 'secondary', kids: 'success' };
    return colors[category] || 'default';
  };


  // Nouvelle fonction pour ouvrir le dialog de sélection de pointure
  const handleAddToCartRequest = (product) => {
    // Vérifier s'il y a des pointures disponibles
    const availableVariants = product.ProductVariants?.filter(v => v.stock > 0) || [];
    
    if (availableVariants.length === 0) {
      showNotification('Aucune pointure disponible pour ce produit', 'warning');
      return;
    }

    setSelectedProductForSize(product);
    setSizeDialogOpen(true);
  };

  // Fonction pour confirmer l'ajout au panier avec la pointure sélectionnée
  const handleConfirmAddToCart = async (product, variantId, quantity = 1) => {
    setAddToCartLoading(true);
    
    try {
      const selectedVariant = product.ProductVariants.find(v => v.id === variantId);
      const productInfo = {
        id: product.id,
        name: product.name,
        brand: product.brand,
        basePrice: product.basePrice,
        variant: selectedVariant
      };

      const result = await addToCart(variantId, quantity, productInfo);
      if (result.success) {
        showNotification(`${quantity} produit(s) ajouté(s) au panier !`, 'success');
        setSizeDialogOpen(false);
        setSelectedProductForSize(null);
      } else {
        showNotification(result.error, 'error');
      }
    } catch (error) {
      showNotification('Erreur lors de l\'ajout au panier', 'error');
    } finally {
      setAddToCartLoading(false);
    }
  };

  // Extraction des marques et pointures uniques
  const availableBrands = useMemo(() => {
    const brands = [...new Set(products.map(p => p.brand))];
    return brands.sort();
  }, [products]);

  const availableSizes = useMemo(() => {
    const sizeMap = new Map();
    products.forEach(product => {
      product.ProductVariants?.forEach(variant => {
        if (variant.stock > 0) {
          // Créer une clé unique combinant pointure et type
          const sizeKey = `${variant.size}-${variant.sizeType}`;
          const displaySize = `${variant.size} ${variant.sizeType}`;
          sizeMap.set(sizeKey, {
            key: sizeKey,
            size: variant.size,
            sizeType: variant.sizeType,
            display: displaySize
          });
        }
      });
    });
    
    // Convertir en tableau et trier par type puis par pointure
    return Array.from(sizeMap.values()).sort((a, b) => {
      // D'abord trier par type (EU, UK, US)
      const typeOrder = { 'EU': 1, 'UK': 2, 'US': 3 };
      const typeCompare = (typeOrder[a.sizeType] || 4) - (typeOrder[b.sizeType] || 4);
      
      if (typeCompare !== 0) {
        return typeCompare;
      }
      
      // Puis trier par pointure numériquement
      const numA = parseFloat(a.size);
      const numB = parseFloat(b.size);
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      return a.size.localeCompare(b.size);
    });
  }, [products]);

  // Filtrage et tri des produits
  const filteredProducts = useMemo(() => {
    let filtered = products.filter(product => {
      // Filtre par recherche
      const matchesSearch = !searchTerm || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtre par catégorie
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      
      // Filtre par marque
      const matchesBrand = brandFilter === 'all' || product.brand === brandFilter;
      
      // Filtre par pointure (utiliser les clés pointure-type)
      const matchesSize = sizeFilter.length === 0 || 
        product.ProductVariants?.some(variant => {
          const sizeKey = `${variant.size}-${variant.sizeType}`;
          return sizeFilter.includes(sizeKey) && variant.stock > 0;
        });
      
      return matchesSearch && matchesCategory && matchesBrand && matchesSize;
    });

    // Tri
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return parseFloat(a.basePrice) - parseFloat(b.basePrice);
        case 'price-desc':
          return parseFloat(b.basePrice) - parseFloat(a.basePrice);
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [products, searchTerm, categoryFilter, brandFilter, sizeFilter, sortBy]);

  const getCategoryLabel = (category) => {
    switch (category) {
      case 'men': return 'Homme';
      case 'women': return 'Femme';
      case 'kids': return 'Enfant';
      default: return category;
    }
  };

  const isNewProduct = (createdAt) => {
    const productDate = new Date(createdAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return productDate > thirtyDaysAgo;
  };

  const getStockStatus = (variants) => {
    if (!variants || variants.length === 0) return { status: 'out', count: 0 };
    
    const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);
    if (totalStock === 0) return { status: 'out', count: 0 };
    if (totalStock <= 5) return { status: 'low', count: totalStock };
    return { status: 'good', count: totalStock };
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <>
      <ProductFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        category={categoryFilter}
        onCategoryChange={setCategoryFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
        brands={availableBrands}
        selectedBrand={brandFilter}
        onBrandChange={setBrandFilter}
        availableSizes={availableSizes}
        selectedSizes={sizeFilter}
        onSizesChange={setSizeFilter}
      />

      {/* Résultats */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" color="text.secondary">
          {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} trouvé{filteredProducts.length > 1 ? 's' : ''}
        </Typography>
      </Box>

      <Grid 
        container 
        spacing={3} 
        sx={{ 
          '& .MuiGrid-item': {
            display: 'flex'
          },
          justifyContent: 'flex-start',
          alignItems: 'stretch',
          // Force exactement 3 colonnes sur desktop
          '@media (min-width: 900px)': {
            '& .MuiGrid-item': {
              maxWidth: '33.333333%',
              flexBasis: '33.333333%'
            }
          },
          // Force exactement 2 colonnes sur tablette
          '@media (min-width: 600px) and (max-width: 899px)': {
            '& .MuiGrid-item': {
              maxWidth: '50%',
              flexBasis: '50%'
            }
          }
        }}
      >
        {filteredProducts.map((product, index) => {
          const stockStatus = getStockStatus(product.ProductVariants);
          const isNew = isNewProduct(product.createdAt);
          
          return (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <Fade in={true} timeout={300 + index * 100}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    width: '100%',
                    display: 'flex', 
                    flexDirection: 'column',
                    position: 'relative',
                    overflow: 'visible'
                  }}
                >
                  {/* Badges */}
                  <Box sx={{ position: 'absolute', top: 12, left: 12, zIndex: 1, display: 'flex', gap: 1, flexDirection: 'column' }}>
                    {isNew && (
                      <Chip
                        label="Nouveau"
                        size="small"
                        sx={{
                          backgroundColor: '#e74c3c',
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.75rem'
                        }}
                      />
                    )}
                    {stockStatus.status === 'low' && (
                      <Chip
                        label="Stock limité"
                        size="small"
                        sx={{
                          backgroundColor: '#f39c12',
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.75rem'
                        }}
                      />
                    )}
                  </Box>

                  {/* Badge prix top right */}
                  <Box sx={{ position: 'absolute', top: 12, right: 12, zIndex: 1 }}>
                    <Chip
                      icon={<LocalOffer />}
                      label={`${parseFloat(product.basePrice).toFixed(2)}€`}
                      sx={{
                        backgroundColor: 'rgba(44, 62, 80, 0.9)',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        '& .MuiChip-icon': { color: '#f39c12' }
                      }}
                    />
                  </Box>
                  
                  <CardMedia
                    component="div"
                    sx={{
                      height: 220,
                      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      '&:hover': {
                        '& .product-emoji': {
                          transform: 'scale(1.1) rotate(5deg)'
                        }
                      }
                    }}
                  >
                    <Typography 
                      variant="h1" 
                      className="product-emoji"
                      sx={{ 
                        fontSize: '4rem',
                        transition: 'transform 0.3s ease',
                        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
                      }}
                    >
                      👟
                    </Typography>
                    
                    {/* Brand overlay */}
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 8,
                        left: 8,
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: '6px',
                        backdropFilter: 'blur(4px)'
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                        {product.brand}
                      </Typography>
                    </Box>
                  </CardMedia>
                  
                  <CardContent sx={{ 
                    flexGrow: 1, 
                    p: 3, 
                    display: 'flex', 
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    width: '100%' // Largeur uniforme
                  }}>
                    {/* Catégorie et rating */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Chip 
                        label={getCategoryLabel(product.category)}
                        color={getCategoryColor(product.category)}
                        size="small"
                        sx={{ fontWeight: 500 }}
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Star sx={{ color: '#f39c12', fontSize: '1rem' }} />
                        <Typography variant="caption" sx={{ fontWeight: 500 }}>
                          4.8
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Typography gutterBottom variant="h6" component="h3" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                      {product.name}
                    </Typography>
                    
                    {product.Seller && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        🏪 {product.Seller.sellerInfo?.businessName || `${product.Seller.firstName} ${product.Seller.lastName}`}
                      </Typography>
                    )}
                    
                    {/* Stock indicator */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Inventory2 
                        sx={{ 
                          fontSize: '1rem',
                          color: stockStatus.status === 'out' ? 'error.main' : 
                                 stockStatus.status === 'low' ? 'warning.main' : 'success.main'
                        }} 
                      />
                      <Typography variant="body2" color="text.secondary">
                        {stockStatus.status === 'out' ? 'Rupture de stock' :
                         stockStatus.status === 'low' ? `Plus que ${stockStatus.count} en stock` :
                         `${stockStatus.count} en stock`}
                      </Typography>
                    </Box>
                    
                    {/* Pointures disponibles - affichage informatif */}
                    {product.ProductVariants && product.ProductVariants.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                          Pointures disponibles:
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {product.ProductVariants
                            .filter(variant => variant.stock > 0)
                            .slice(0, 6) // Limiter l'affichage à 6 pointures max
                            .map(variant => (
                              <Chip
                                key={variant.id}
                                label={variant.size}
                                size="small"
                                sx={{
                                  fontSize: '0.75rem',
                                  height: '24px',
                                  backgroundColor: 'grey.100',
                                  color: 'text.primary',
                                  '&:hover': {
                                    backgroundColor: 'primary.light'
                                  }
                                }}
                              />
                            ))}
                          {product.ProductVariants.filter(v => v.stock > 0).length > 6 && (
                            <Chip
                              label={`+${product.ProductVariants.filter(v => v.stock > 0).length - 6}`}
                              size="small"
                              sx={{
                                fontSize: '0.75rem',
                                height: '24px',
                                backgroundColor: 'grey.200',
                                color: 'text.secondary'
                              }}
                            />
                          )}
                        </Box>
                      </Box>
                    )}
                    
                    <Button 
                      variant="contained" 
                      fullWidth
                      size="large"
                      disabled={!product.ProductVariants?.some(v => v.stock > 0)}
                      onClick={() => handleAddToCartRequest(product)}
                      startIcon={<ShoppingCart />}
                      sx={{
                        py: 1.2,
                        fontWeight: 600,
                        borderRadius: '10px',
                        backgroundColor: stockStatus.status === 'out' ? 'grey.400' : 'secondary.main',
                        '&:hover': {
                          backgroundColor: stockStatus.status === 'out' ? 'grey.400' : 'secondary.dark',
                          transform: stockStatus.status !== 'out' ? 'translateY(-1px)' : 'none'
                        }
                      }}
                    >
                      {stockStatus.status === 'out' ? 'Rupture de stock' : 'Choisir la pointure'}
                    </Button>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          );
        })}
      </Grid>

      {filteredProducts.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" color="text.secondary" gutterBottom>
            Aucun produit trouvé
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Essayez de modifier vos critères de recherche
          </Typography>
        </Box>
      )}

      {/* Dialog de sélection de pointure */}
      <SizeSelectionDialog
        open={sizeDialogOpen}
        onClose={() => {
          setSizeDialogOpen(false);
          setSelectedProductForSize(null);
        }}
        product={selectedProductForSize}
        onAddToCart={handleConfirmAddToCart}
        loading={addToCartLoading}
        preselectedSize={
          selectedProductForSize && sizeFilter.length === 1
            ? (() => {
                const selectedSizeKey = sizeFilter[0];
                const [size, sizeType] = selectedSizeKey.split('-');
                return selectedProductForSize.ProductVariants?.find(v => 
                  v.size === size && v.sizeType === sizeType && v.stock > 0
                )?.id;
              })()
            : null
        }
      />
    </>
  );
};

export default ProductCatalog;
