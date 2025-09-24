import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Grid, Card, CardMedia, CardContent, Typography, Button, Chip, Box, CircularProgress, Alert, Fade, Pagination } from '@mui/material';
import { LocalOffer, ShoppingCart, Inventory2 } from '@mui/icons-material';
import { productService } from '../services/api';
import useCartWithTimer from '../hooks/useCartWithTimer';
import { useNotification } from '../contexts/NotificationContext';
import { useFilters } from '../contexts/FiltersContext';
import ProductFilters from './ProductFilters';
import SizeSelectionDialog from './SizeSelectionDialog';

const ProductCatalog = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // États pour la pagination
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // États pour le dialog de sélection de pointure
  const [sizeDialogOpen, setSizeDialogOpen] = useState(false);
  const [selectedProductForSize, setSelectedProductForSize] = useState(null);
  const [addToCartLoading, setAddToCartLoading] = useState(false);
  
  const { addToCart } = useCartWithTimer();
  const { showNotification } = useNotification();
  
  // Utilisation du contexte des filtres
  const {
    searchTerm,
    categoryFilter,
    brandFilter,
    sizeFilter,
    sortBy,
    currentPage,
    setSearchTerm,
    setCategoryFilter,
    setBrandFilter,
    setSizeFilter,
    setSortBy,
    setCurrentPage,
    resetPagination
  } = useFilters();

  // Fonction pour récupérer les produits avec pagination et filtres
  const fetchProducts = useCallback(async (page = 1, filters = {}) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 12,
        ...filters
      };
      
      const response = await productService.getAll(params);
      setProducts(response.data.products);
      setCurrentPage(response.data.pagination.currentPage);
      setTotalPages(response.data.pagination.totalPages);
      setTotalItems(response.data.pagination.totalItems);
    } catch (err) {
      setError('Erreur lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  }, [setCurrentPage, setTotalPages, setTotalItems]);

  // Effet pour charger les produits initialement
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Effet pour recharger les produits quand les filtres changent
  useEffect(() => {
    const filters = {};
    if (categoryFilter !== 'all') filters.category = categoryFilter;
    if (brandFilter !== 'all') filters.brand = brandFilter;
    if (searchTerm) filters.search = searchTerm;
    if (sortBy) filters.sortBy = sortBy;
    
    resetPagination(); // Reset à la page 1 quand les filtres changent
    fetchProducts(1, filters);
  }, [categoryFilter, brandFilter, searchTerm, sortBy, fetchProducts, resetPagination]);

  // Gestionnaire de changement de page
  const handlePageChange = (event, page) => {
    const filters = {};
    if (categoryFilter !== 'all') filters.category = categoryFilter;
    if (brandFilter !== 'all') filters.brand = brandFilter;
    if (searchTerm) filters.search = searchTerm;
    if (sortBy) filters.sortBy = sortBy;
    
    fetchProducts(page, filters);
  };

  const getCategoryColor = (category) => {
    const colors = { men: 'primary', women: 'secondary', kids: 'success' };
    return colors[category] || 'default';
  };

  // Fonction pour obtenir l'image du produit avec fallback
  const getProductImage = (product, forceFallback = false) => {
    if (forceFallback || !product.images || product.images.length === 0) {
      // Images de fallback spécifiques par marque/type
      const fallbackImages = {
        'Nike': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop&auto=format&q=80',
        'Jordan': 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400&h=300&fit=crop&auto=format&q=80',
        'Adidas': 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=300&fit=crop&auto=format&q=80',
        'New Balance': 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=300&fit=crop&auto=format&q=80',
        'ASICS': 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=300&fit=crop&auto=format&q=80'
      };
      return fallbackImages[product.brand] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop&auto=format&q=80';
    }
    return product.images[0];
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

  // Filtrage des produits par taille (côté client pour les tailles seulement)
  const filteredProducts = useMemo(() => {
    if (sizeFilter.length === 0) {
      return products;
    }
    
    return products.filter(product => {
      return product.ProductVariants?.some(variant => {
        const sizeKey = `${variant.size}-${variant.sizeType}`;
        return sizeFilter.includes(sizeKey) && variant.stock > 0;
      });
    });
  }, [products, sizeFilter]);

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
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return productDate > sevenDaysAgo;
  };

  const getStockStatus = (variants, sizeFilters = []) => {
    if (!variants || variants.length === 0) return { status: 'out', count: 0 };
    
    // Filtrer les variants selon les filtres de taille appliqués
    let filteredVariants = variants;
    if (sizeFilters.length > 0) {
      filteredVariants = variants.filter(variant => {
        const sizeKey = `${variant.size}-${variant.sizeType}`;
        return sizeFilters.includes(sizeKey);
      });
    }
    
    const totalStock = filteredVariants.reduce((sum, v) => sum + (v.stock || 0), 0);
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
          {totalItems} produit{totalItems > 1 ? 's' : ''} trouvé{totalItems > 1 ? 's' : ''}
        </Typography>
      </Box>

      <Grid 
        container 
        spacing={3} 
        sx={{ 
          '& .MuiGrid-item': {
            display: 'flex',
            justifyContent: 'center' // Centre les cartes
          },
          justifyContent: 'flex-start',
          alignItems: 'stretch',
          // Force exactement 4 colonnes sur desktop avec largeur fixe
          '@media (min-width: 900px)': {
            '& .MuiGrid-item': {
              maxWidth: '25%',
              flexBasis: '25%',
              display: 'flex',
              justifyContent: 'center'
            }
          },
          // Force exactement 2 colonnes sur tablette avec largeur fixe
          '@media (min-width: 600px) and (max-width: 899px)': {
            '& .MuiGrid-item': {
              maxWidth: '50%',
              flexBasis: '50%',
              display: 'flex',
              justifyContent: 'center'
            }
          }
        }}
      >
        {filteredProducts.map((product, index) => {
          const stockStatus = getStockStatus(product.ProductVariants, sizeFilter);
          const isNew = isNewProduct(product.createdAt);
          
          return (
            <Grid item xs={12} sm={6} md={3} key={product.id}>
              <Fade in={true} timeout={300 + index * 100}>
                <Card 
                  sx={{ 
                    height: 480, // Réduit légèrement pour un meilleur équilibre
                    width: { xs: '100%', sm: '280px', md: '270px' },
                    maxWidth: { xs: '100%', sm: '280px', md: '270px' },
                    minWidth: { xs: '100%', sm: '280px', md: '270px' },
                    display: 'flex', 
                    flexDirection: 'column',
                    position: 'relative',
                    overflow: 'hidden',
                    margin: '0 auto',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    '&:hover': {
                      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.3s ease'
                    }
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
                  
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      image={product.images && product.images.length > 0 ? product.images[0] : getProductImage(product, true)}
                      alt={`${product.brand} ${product.name}`}
                      onError={(e) => {
                        e.target.src = getProductImage(product, true);
                      }}
                    sx={{
                        height: 180, // Réduit de 220 à 180 pour laisser plus d'espace au texte
                        objectFit: 'cover',
                        cursor: 'pointer',
                        backgroundColor: '#f8f9fa',
                      '&:hover': {
                          transform: 'scale(1.02)',
                          transition: 'transform 0.3s ease',
                          filter: 'brightness(1.1)'
                        }
                      }}
                    />
                    {/* Brand overlay */}
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 8,
                        left: 8,
                        backgroundColor: 'rgba(255,255,255,0.95)',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: '6px',
                        backdropFilter: 'blur(4px)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                        {product.brand}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <CardContent sx={{ 
                    flexGrow: 1, 
                    p: 2, // Réduit de 3 à 2 pour optimiser l'espace
                    display: 'flex', 
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    width: '100%',
                    minWidth: 0,
                    overflow: 'hidden',
                    boxSizing: 'border-box'
                  }}>
                    {/* Catégorie */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', mb: 1.5 }}>
                      <Chip 
                        label={getCategoryLabel(product.category)}
                        color={getCategoryColor(product.category)}
                        size="small"
                        sx={{ fontWeight: 500 }}
                      />
                    </Box>
                    
                    <Typography 
                      gutterBottom 
                      variant="h6" 
                      component="h3" 
                      sx={{ 
                        fontWeight: 600, 
                        lineHeight: 1.4,
                        fontSize: '1.1rem',
                        height: '3.6em', // Hauteur optimisée pour 2-3 lignes
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2, // Retour à 2 lignes pour optimiser l'espace
                        WebkitBoxOrient: 'vertical',
                        mb: 1.5
                      }}
                    >
                      {product.name}
                    </Typography>
                    
                    {product.Seller && (
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                          mb: 1.5, 
                          fontSize: '0.85rem',
                          height: '2.0em', // Hauteur réduite
                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitLineClamp: 1, // Une seule ligne pour le vendeur
                          WebkitBoxOrient: 'vertical',
                          lineHeight: 1.2
                        }}
                      >
                        🏪 {product.Seller.sellerInfo?.businessName || `${product.Seller.firstName} ${product.Seller.lastName}`}
                      </Typography>
                    )}
                    
                    {/* Stock indicator */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
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
                    
                    
                    <Button 
                      variant="contained" 
                      fullWidth
                      size="large"
                      disabled={stockStatus.status === 'out'}
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

      {/* Interface de pagination */}
      {!loading && !error && totalPages > 1 && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          mt: 6, 
          mb: 4,
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2
        }}>
          <Typography variant="body2" color="text.secondary">
            Page {currentPage} sur {totalPages} • {totalItems} produit{totalItems > 1 ? 's' : ''}
          </Typography>
          <Pagination 
            count={totalPages} 
            page={currentPage} 
            onChange={handlePageChange}
            color="primary"
            size="large"
            showFirstButton 
            showLastButton
            sx={{
              '& .MuiPagination-ul': {
                justifyContent: 'center'
              }
            }}
          />
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
