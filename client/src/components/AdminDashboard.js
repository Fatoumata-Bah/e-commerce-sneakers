import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Grid,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Autocomplete,
  Container
} from '@mui/material';
import { Add, Edit, Delete, Inventory, Assessment, ExpandMore, FilterList } from '@mui/icons-material';
import { productService, orderService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { getSizesForCategory, isValidSize } from '../utils/sizes';
import ConfirmDialog from './ConfirmDialog';

const AdminDashboard = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [productDialog, setProductDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    brand: '',
    category: 'men',
    basePrice: '',
    variants: []
  });
  const [stockDialog, setStockDialog] = useState(false);
  const [selectedProductForStock, setSelectedProductForStock] = useState(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [confirmVariantDeleteOpen, setConfirmVariantDeleteOpen] = useState(false);
  const [variantToDelete, setVariantToDelete] = useState(null);
  const [variantIndexToDelete, setVariantIndexToDelete] = useState(null);
  const [newVariant, setNewVariant] = useState({ size: '', sizeType: 'EU', stock: 0 });
  
  // États pour les filtres de commandes (admin uniquement)
  const [orderFilters, setOrderFilters] = useState({
    seller: 'all',
    client: 'all',
    status: 'all',
    dateRange: 'all'
  });
  const [availableSellers, setAvailableSellers] = useState([]);
  const [availableClients, setAvailableClients] = useState([]);
  
  // États pour les filtres de produits (seller/admin)
  const [productFilters, setProductFilters] = useState({
    category: 'all',
    stock: 'all',
    seller: 'all' // admin uniquement
  });
  
  const { user } = useAuth();
  const { showNotification } = useNotification();

  // Fonction pour obtenir une pointure par défaut selon la catégorie
  const getDefaultSizeForCategory = (category) => {
    switch (category) {
      case 'men': return '42';
      case 'women': return '38';
      case 'kids': return '32';
      default: return '42';
    }
  };

  useEffect(() => {
    if (currentTab === 0) fetchProducts();
    if (currentTab === 1) fetchOrders();
  }, [currentTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProducts = async () => {
    try {
      console.log('🔄 Fetching products...');
      // Utiliser l'API appropriée selon le rôle
      const response = user?.role === 'seller' 
        ? await productService.getMyProducts()
        : await productService.getAll();
      console.log('✅ Products fetched:', response.data.products.length, 'products');
      const productsData = response.data.products;
      setProducts(productsData);
      
      // Extraire les sellers uniques pour les filtres (admin uniquement)
      if (user?.role === 'admin') {
        const sellers = new Set();
        productsData.forEach(product => {
          if (product.Seller && product.Seller.role === 'seller') {
            sellers.add(JSON.stringify({
              id: product.Seller.id,
              name: product.Seller.sellerInfo?.businessName || `${product.Seller.firstName} ${product.Seller.lastName}`
            }));
          }
        });
        setAvailableSellers(Array.from(sellers).map(s => JSON.parse(s)));
      }
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      showNotification('Erreur lors du chargement des produits', 'error');
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await orderService.getAll();
      const ordersData = response.data.orders;
      setOrders(ordersData);
      
      // Extraire les sellers et clients uniques pour les filtres (admin et sellers)
      if (user?.role === 'admin' || user?.role === 'seller') {
        const sellers = new Set();
        const clients = new Set();
        
        ordersData.forEach(order => {
          // Ajouter le client (uniquement les users avec role='customer')
          if (order.User && order.User.role === 'customer') {
            clients.add(JSON.stringify({
              id: order.User.id,
              name: `${order.User.firstName} ${order.User.lastName}`
            }));
          }
          
          // Ajouter les sellers des produits de cette commande (admin uniquement)
          if (user?.role === 'admin') {
            order.OrderItems?.forEach(item => {
              if (item.ProductVariant?.Product?.Seller && item.ProductVariant.Product.Seller.role === 'seller') {
                const seller = item.ProductVariant.Product.Seller;
                sellers.add(JSON.stringify({
                  id: seller.id,
                  name: seller.sellerInfo?.businessName || `${seller.firstName} ${seller.lastName}`
                }));
              }
            });
          }
        });
        
        if (user?.role === 'admin') {
          setAvailableSellers(Array.from(sellers).map(s => JSON.parse(s)));
        }
        // Limiter à 100 clients pour éviter les problèmes de performance
        const clientsList = Array.from(clients).map(c => JSON.parse(c));
        setAvailableClients(clientsList.slice(0, 100));
      }
    } catch (error) {
      showNotification('Erreur lors du chargement des commandes', 'error');
    }
  };

  // Fonction pour filtrer les commandes selon les critères sélectionnés
  const getFilteredOrders = () => {
    if (user?.role !== 'admin') return orders;
    
    return orders.filter(order => {
      // Filtre par client
      if (orderFilters.client !== 'all' && order.User?.id !== orderFilters.client) {
        return false;
      }
      
      // Filtre par statut
      if (orderFilters.status !== 'all' && order.status !== orderFilters.status) {
        return false;
      }
      
      // Filtre par seller - vérifier si la commande contient des produits de ce seller
      if (orderFilters.seller !== 'all') {
        const hasSellerProduct = order.OrderItems?.some(item => 
          item.ProductVariant?.Product?.Seller?.id === orderFilters.seller
        );
        if (!hasSellerProduct) {
          return false;
        }
      }
      
      // Filtre par période (simplifiée pour le moment)
      if (orderFilters.dateRange !== 'all') {
        const orderDate = new Date(order.createdAt);
        const now = new Date();
        const daysDiff = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24));
        
        switch (orderFilters.dateRange) {
          case 'today':
            if (daysDiff > 0) return false;
            break;
          case 'week':
            if (daysDiff > 7) return false;
            break;
          case 'month':
            if (daysDiff > 30) return false;
            break;
          default:
            break;
        }
      }
      
      return true;
    });
  };

  // Fonction pour filtrer les produits selon les critères sélectionnés
  const getFilteredProducts = () => {
    return products.filter(product => {
      // Filtre par catégorie
      if (productFilters.category !== 'all' && product.category !== productFilters.category) {
        return false;
      }
      
      // Filtre par stock
      if (productFilters.stock !== 'all') {
        const totalStock = product.ProductVariants?.reduce((sum, variant) => sum + variant.stock, 0) || 0;
        switch (productFilters.stock) {
          case 'instock':
            if (totalStock <= 0) return false;
            break;
          case 'lowstock':
            if (totalStock > 10 || totalStock <= 0) return false;
            break;
          case 'outstock':
            if (totalStock > 0) return false;
            break;
          default:
            break;
        }
      }
      
      // Filtre par seller (admin uniquement)
      if (user?.role === 'admin' && productFilters.seller !== 'all' && product.sellerId !== productFilters.seller) {
        return false;
      }
      
      return true;
    });
  };

  // Fonction pour réinitialiser les filtres de commandes
  const resetOrderFilters = () => {
    setOrderFilters({
      seller: 'all',
      client: 'all',
      status: 'all',
      dateRange: 'all'
    });
  };

  // Fonction pour réinitialiser les filtres de produits
  const resetProductFilters = () => {
    setProductFilters({
      category: 'all',
      stock: 'all',
      seller: 'all'
    });
  };


  const handleProductSubmit = async () => {
    try {
      // Validation pour les nouveaux produits
      if (!selectedProduct && productForm.variants.length === 0) {
        showNotification('Veuillez ajouter au moins une pointure pour le produit', 'warning');
        return;
      }

      const productData = {
        ...productForm,
        basePrice: parseFloat(productForm.basePrice),
        variants: productForm.variants.length > 0 ? 
          productForm.variants.map(variant => ({
            ...variant,
            // Supprimer l'ID temporaire pour les nouveaux variants
            id: variant.id && variant.id.startsWith('new-') ? undefined : variant.id,
            stock: parseInt(variant.stock) || 0
          })) : 
          // Si aucun variant défini, créer un variant par défaut (ne devrait plus arriver)
          [{
            size: getDefaultSizeForCategory(productForm.category),
            sizeType: 'EU',
            stock: 0
          }]
      };

      if (selectedProduct) {
        console.log('💾 Updating product:', selectedProduct.id, 'with variants:', productData.variants.map(v => `${v.size}${v.sizeType}:${v.stock}`));
        await productService.update(selectedProduct.id, productData);
        showNotification('Produit et stocks modifiés avec succès', 'success');
        
        // Attendre que fetchProducts soit terminé avant de fermer le dialog
        console.log('🔄 Refreshing products after update...');
        await fetchProducts();
      } else {
        await productService.create(productData);
        showNotification('Produit créé avec succès', 'success');
        await fetchProducts();
      }

      setProductDialog(false);
      setSelectedProduct(null);
      setProductForm({
        name: '',
        description: '',
        brand: '',
        category: 'men',
        basePrice: '',
        variants: []
      });
    } catch (error) {
      // Afficher l'erreur spécifique du serveur si disponible
      const errorMessage = error.response?.data?.error || error.message || 'Erreur lors de la sauvegarde du produit';
      showNotification(errorMessage, 'error');
    }
  };

  const handleProductEdit = (product) => {
    setSelectedProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || '',
      brand: product.brand,
      category: product.category,
      basePrice: product.basePrice.toString(),
      variants: product.ProductVariants?.map(v => ({
        id: v.id,
        size: v.size,
        sizeType: v.sizeType,
        stock: v.stock,
        sku: v.sku
      })) || []
    });
    setProductDialog(true);
  };

  const handleProductDeleteRequest = (product) => {
    setProductToDelete(product);
    setConfirmDeleteOpen(true);
  };

  const handleProductDeleteConfirm = async () => {
    if (!productToDelete) return;
    
    try {
      setDeleteLoading(true);
      await productService.delete(productToDelete.id);
      showNotification('Produit supprimé avec succès', 'success');
      fetchProducts();
      setConfirmDeleteOpen(false);
      setProductToDelete(null);
    } catch (error) {
      showNotification('Erreur lors de la suppression', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleProductDeleteCancel = () => {
    setConfirmDeleteOpen(false);
    setProductToDelete(null);
  };

  const handleAddVariant = () => {
    if (!newVariant.size.trim()) {
      showNotification('Veuillez sélectionner une pointure', 'warning');
      return;
    }

    // Validation de la pointure selon la catégorie (sécurité supplémentaire)
    if (!isValidSize(productForm.category, newVariant.size.trim(), newVariant.sizeType)) {
      showNotification('Pointure invalide pour cette catégorie', 'error');
      return;
    }

    // Note: La vérification des doublons est déjà gérée par le filtrage du Select
    const newVariants = [...productForm.variants, {
      id: `new-${Date.now()}`, // ID temporaire pour les nouvelles variantes
      size: newVariant.size.trim(),
      sizeType: newVariant.sizeType,
      stock: newVariant.stock,
      sku: `${productForm.brand.toUpperCase()}-${productForm.name.replace(/\s+/g, '').toUpperCase()}-${productForm.category.toUpperCase()}-${newVariant.size}-${newVariant.sizeType}`
    }];

    setProductForm({...productForm, variants: newVariants});
    setNewVariant({ size: '', sizeType: 'EU', stock: 0 });
    showNotification(`Pointure ${newVariant.size} ${newVariant.sizeType} ajoutée avec succès`, 'success');
  };

  const handleRemoveVariantRequest = (index) => {
    const variant = productForm.variants[index];
    
    // Si c'est un nouveau variant (ID temporaire), suppression directe
    if (!variant.id || variant.id.toString().startsWith('new-')) {
      const newVariants = productForm.variants.filter((_, i) => i !== index);
      setProductForm({...productForm, variants: newVariants});
      showNotification('Pointure supprimée', 'info');
      return;
    }
    
    // Si c'est un variant existant, vérifier qu'il ne reste pas qu'un seul variant
    if (productForm.variants.length <= 1) {
      showNotification('Impossible de supprimer la dernière pointure. Un produit doit avoir au moins une pointure.', 'error');
      return;
    }
    
    // Demander confirmation pour les variants existants
    setVariantToDelete(variant);
    setVariantIndexToDelete(index);
    setConfirmVariantDeleteOpen(true);
  };

  const handleRemoveVariantConfirm = async () => {
    if (!variantToDelete || variantIndexToDelete === null) return;
    
    try {
      setDeleteLoading(true);
      
      // Suppression en base de données
      await productService.deleteVariant(variantToDelete.id);
      
      // Suppression locale après succès
      const newVariants = productForm.variants.filter((_, i) => i !== variantIndexToDelete);
      setProductForm({...productForm, variants: newVariants});
      
      // Rafraîchir la liste des produits pour avoir les données à jour
      await fetchProducts();
      
      showNotification(`Pointure ${variantToDelete.size} ${variantToDelete.sizeType} supprimée avec succès`, 'success');
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Erreur lors de la suppression de la pointure';
      showNotification(errorMessage, 'error');
    } finally {
      setDeleteLoading(false);
      setConfirmVariantDeleteOpen(false);
      setVariantToDelete(null);
      setVariantIndexToDelete(null);
    }
  };

  const handleRemoveVariantCancel = () => {
    setConfirmVariantDeleteOpen(false);
    setVariantToDelete(null);
    setVariantIndexToDelete(null);
  };

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      await orderService.updateStatus(orderId, newStatus);
      showNotification('Statut mis à jour avec succès', 'success');
      fetchOrders();
    } catch (error) {
      showNotification('Erreur lors de la mise à jour', 'error');
    }
  };

  const handleStockVisualization = (product) => {
    setSelectedProductForStock(product);
    setStockDialog(true);
  };


  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      confirmed: 'info',
      processing: 'primary',
      shipped: 'secondary',
      delivered: 'success',
      cancelled: 'error'
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'En attente',
      confirmed: 'Confirmée',
      processing: 'En préparation',
      shipped: 'Expédiée',
      delivered: 'Livrée',
      cancelled: 'Annulée'
    };
    return labels[status] || status;
  };

  if (!user || !['admin', 'seller'].includes(user.role)) {
    return (
      <Alert severity="error" sx={{ mt: 4 }}>
        Accès non autorisé. Cette section est réservée aux administrateurs et vendeurs.
      </Alert>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom 
          sx={{ 
            fontWeight: 700,
            background: 'linear-gradient(45deg, #2d3748 30%, #ff6b35 90%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          🏪 Dashboard {user.role === 'admin' ? 'Administrateur' : 'Vendeur'}
      </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '600px', mx: 'auto' }}>
          {user.role === 'admin' 
            ? 'Gestion complète de la marketplace SneakersShop' 
            : 'Gérez vos produits et commandes sur SneakersShop'
          }
        </Typography>
      </Box>

      <Paper elevation={2} sx={{ mb: 4, borderRadius: 3 }}>
        <Tabs 
          value={currentTab} 
          onChange={(e, newValue) => setCurrentTab(newValue)}
          centered
          sx={{
            '& .MuiTab-root': {
              fontWeight: 600,
              fontSize: '1rem',
              textTransform: 'none',
              minHeight: '64px',
              px: 4
            },
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0'
            }
          }}
        >
          <Tab 
            label={user.role === 'seller' ? '📦 Mes Produits' : '🏪 Gestion Produits'} 
            sx={{ color: currentTab === 0 ? 'primary.main' : 'text.secondary' }}
          />
          <Tab 
            label="📋 Gestion Commandes" 
            sx={{ color: currentTab === 1 ? 'primary.main' : 'text.secondary' }}
          />
      </Tabs>
      </Paper>

      {currentTab === 0 && (
        <Paper elevation={1} sx={{ p: 4, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>
              📦 Produits ({getFilteredProducts().length}{products.length !== getFilteredProducts().length ? ` / ${products.length}` : ''})
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                variant="outlined" 
                startIcon={<FilterList />} 
                onClick={resetProductFilters}
                size="small"
              >
                Réinitialiser
              </Button>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setProductDialog(true)}
              >
                Ajouter un produit
              </Button>
            </Box>
          </Box>

          {/* Filtres pour produits */}
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Catégorie</InputLabel>
                  <Select
                    value={productFilters.category}
                    onChange={(e) => setProductFilters({...productFilters, category: e.target.value})}
                    label="Catégorie"
                  >
                    <MenuItem value="all">Toutes les catégories</MenuItem>
                    <MenuItem value="men">Homme</MenuItem>
                    <MenuItem value="women">Femme</MenuItem>
                    <MenuItem value="kids">Enfant</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Stock</InputLabel>
                  <Select
                    value={productFilters.stock}
                    onChange={(e) => setProductFilters({...productFilters, stock: e.target.value})}
                    label="Stock"
                  >
                    <MenuItem value="all">Tous les stocks</MenuItem>
                    <MenuItem value="instock">En stock</MenuItem>
                    <MenuItem value="lowstock">Stock faible (≤10)</MenuItem>
                    <MenuItem value="outstock">Rupture de stock</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              {user?.role === 'admin' && (
                <Grid item xs={12} sm={6} md={3}>
                  <Autocomplete
                    size="small"
                    fullWidth={true}
                    options={[{ id: 'all', name: 'Tous les vendeurs' }, ...availableSellers]}
                    getOptionLabel={(option) => option.name}
                    value={availableSellers.find(s => s.id === productFilters.seller) || { id: 'all', name: 'Tous les vendeurs' }}
                    onChange={(event, newValue) => {
                      setProductFilters({...productFilters, seller: newValue ? newValue.id : 'all'});
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Vendeur"
                        placeholder="Rechercher un vendeur..."
                        fullWidth={true}
                        sx={{
                          '& .MuiInputBase-root': {
                            width: '100% !important',
                            minWidth: '100% !important'
                          },
                          '& .MuiInputBase-input': {
                            paddingLeft: '6px !important',
                            paddingRight: '40px !important',
                            width: '100% !important',
                            minWidth: '250px !important'
                          },
                          '& .MuiAutocomplete-endAdornment': {
                            right: '6px'
                          }
                        }}
                      />
                    )}
                    noOptionsText="Aucun vendeur trouvé"
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                  />
                </Grid>
              )}
            </Grid>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nom</TableCell>
                  <TableCell>Marque</TableCell>
                  <TableCell>Catégorie</TableCell>
                  <TableCell>Prix</TableCell>
                  <TableCell>Stock total</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getFilteredProducts().map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.brand}</TableCell>
                    <TableCell>
                      <Chip 
                        label={product.category} 
                        color={product.category === 'men' ? 'primary' : product.category === 'women' ? 'secondary' : 'success'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{parseFloat(product.basePrice).toFixed(2)}€</TableCell>
                    <TableCell>
                      {product.ProductVariants?.reduce((sum, variant) => sum + variant.stock, 0) || 0}
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleStockVisualization(product)} color="info" title="Visualiser stock">
                        <Assessment />
                      </IconButton>
                      <IconButton onClick={() => handleProductEdit(product)} color="primary" title="Modifier produit">
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => handleProductDeleteRequest(product)} color="error" title="Supprimer">
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {currentTab === 1 && (
        <Paper elevation={1} sx={{ p: 4, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>
              📋 Commandes ({getFilteredOrders().length}{orders.length !== getFilteredOrders().length ? ` / ${orders.length}` : ''})
            </Typography>
            {(user?.role === 'admin' || user?.role === 'seller') && (
              <Button 
                variant="outlined" 
                startIcon={<FilterList />} 
                onClick={resetOrderFilters}
                size="small"
              >
                Réinitialiser filtres
              </Button>
            )}
          </Box>

          {/* Filtres pour administrateur uniquement */}
          {user?.role === 'admin' && (
            <Accordion sx={{ mb: 3 }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6">🔍 Filtres de recherche</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  {/* Première ligne : Vendeur, Statut, Période */}
                  <Grid item xs={12} sm={4} md={4}>
                    <Autocomplete
                      size="small"
                      fullWidth={true}
                      options={[{ id: 'all', name: 'Tous les vendeurs' }, ...availableSellers]}
                      getOptionLabel={(option) => option.name}
                      value={availableSellers.find(s => s.id === orderFilters.seller) || { id: 'all', name: 'Tous les vendeurs' }}
                      onChange={(event, newValue) => {
                        setOrderFilters({...orderFilters, seller: newValue ? newValue.id : 'all'});
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Vendeur"
                          placeholder="Rechercher un vendeur..."
                          fullWidth={true}
                          sx={{
                            '& .MuiInputBase-root': {
                              width: '100% !important',
                              minWidth: '100% !important'
                            },
                            '& .MuiInputBase-input': {
                              paddingLeft: '6px !important',
                              paddingRight: '40px !important',
                              width: '100% !important',
                              minWidth: '250px !important'
                            },
                            '& .MuiAutocomplete-endAdornment': {
                              right: '6px'
                            }
                          }}
                        />
                      )}
                      noOptionsText="Aucun vendeur trouvé"
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={4} md={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Statut</InputLabel>
                      <Select
                        value={orderFilters.status}
                        onChange={(e) => setOrderFilters({...orderFilters, status: e.target.value})}
                        label="Statut"
                      >
                        <MenuItem value="all">Tous les statuts</MenuItem>
                        <MenuItem value="pending">En attente</MenuItem>
                        <MenuItem value="confirmed">Confirmée</MenuItem>
                        <MenuItem value="processing">En cours</MenuItem>
                        <MenuItem value="shipped">Expédiée</MenuItem>
                        <MenuItem value="delivered">Livrée</MenuItem>
                        <MenuItem value="cancelled">Annulée</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={4} md={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Période</InputLabel>
                      <Select
                        value={orderFilters.dateRange}
                        onChange={(e) => setOrderFilters({...orderFilters, dateRange: e.target.value})}
                        label="Période"
                      >
                        <MenuItem value="all">Toutes les périodes</MenuItem>
                        <MenuItem value="today">Aujourd'hui</MenuItem>
                        <MenuItem value="week">Cette semaine</MenuItem>
                        <MenuItem value="month">Ce mois</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  {/* Deuxième ligne : Client avec 100% de largeur */}
                  <Grid item xs={12}>
                    <Autocomplete
                      size="small"
                      fullWidth={true}
                      options={[{ id: 'all', name: 'Tous les clients' }, ...availableClients]}
                      getOptionLabel={(option) => option.name}
                      value={availableClients.find(c => c.id === orderFilters.client) || { id: 'all', name: 'Tous les clients' }}
                      onChange={(event, newValue) => {
                        setOrderFilters({...orderFilters, client: newValue ? newValue.id : 'all'});
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Client"
                          placeholder="Rechercher un client..."
                          fullWidth={true}
                          sx={{
                            '& .MuiInputBase-root': {
                              width: '100% !important',
                              minWidth: '100% !important'
                            },
                            '& .MuiInputBase-input': {
                              paddingLeft: '6px !important',
                              paddingRight: '40px !important',
                              width: '100% !important',
                              minWidth: '300px !important'
                            },
                            '& .MuiAutocomplete-endAdornment': {
                              right: '6px'
                            }
                          }}
                        />
                      )}
                      noOptionsText="Aucun client trouvé"
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Filtres simples pour les sellers */}
          {user?.role === 'seller' && (
            <Box sx={{ mb: 3 }}>
              <Grid container spacing={2}>
                {/* Première ligne : Statut et Période */}
                <Grid item xs={12} sm={6} md={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Statut</InputLabel>
                    <Select
                      value={orderFilters.status}
                      onChange={(e) => setOrderFilters({...orderFilters, status: e.target.value})}
                      label="Statut"
                    >
                      <MenuItem value="all">Tous les statuts</MenuItem>
                      <MenuItem value="pending">En attente</MenuItem>
                      <MenuItem value="confirmed">Confirmée</MenuItem>
                      <MenuItem value="processing">En cours</MenuItem>
                      <MenuItem value="shipped">Expédiée</MenuItem>
                      <MenuItem value="delivered">Livrée</MenuItem>
                      <MenuItem value="cancelled">Annulée</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6} md={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Période</InputLabel>
                    <Select
                      value={orderFilters.dateRange}
                      onChange={(e) => setOrderFilters({...orderFilters, dateRange: e.target.value})}
                      label="Période"
                    >
                      <MenuItem value="all">Toutes les périodes</MenuItem>
                      <MenuItem value="today">Aujourd'hui</MenuItem>
                      <MenuItem value="week">Cette semaine</MenuItem>
                      <MenuItem value="month">Ce mois</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                {/* Deuxième ligne : Client avec 100% de largeur */}
                <Grid item xs={12}>
                  <Autocomplete
                    size="small"
                    fullWidth={true}
                    options={[{ id: 'all', name: 'Tous les clients' }, ...availableClients]}
                    getOptionLabel={(option) => option.name}
                    value={availableClients.find(c => c.id === orderFilters.client) || { id: 'all', name: 'Tous les clients' }}
                    onChange={(event, newValue) => {
                      setOrderFilters({...orderFilters, client: newValue ? newValue.id : 'all'});
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Client"
                        placeholder="Rechercher un client..."
                        fullWidth={true}
                        sx={{
                          '& .MuiInputBase-root': {
                            width: '100% !important',
                            minWidth: '100% !important'
                          },
                          '& .MuiInputBase-input': {
                            paddingLeft: '6px !important',
                            paddingRight: '40px !important',
                            width: '100% !important',
                            minWidth: '300px !important'
                          },
                          '& .MuiAutocomplete-endAdornment': {
                            right: '6px'
                          }
                        }}
                      />
                    )}
                    noOptionsText="Aucun client trouvé"
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Numéro</TableCell>
                  <TableCell>Client</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Montant</TableCell>
                  {user?.role === 'admin' && <TableCell>Vendeurs</TableCell>}
                  <TableCell>Statut</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getFilteredOrders().map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.orderNumber}</TableCell>
                    <TableCell>
                      {order.User ? `${order.User.firstName} ${order.User.lastName}` : 'Client inconnu'}
                    </TableCell>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell>{parseFloat(order.totalAmount).toFixed(2)}€</TableCell>
                    {user?.role === 'admin' && (
                      <TableCell>
                        {/* Afficher les vendeurs uniques de cette commande */}
                        {[...new Set(order.OrderItems?.map(item => {
                          const seller = item.ProductVariant?.Product?.Seller;
                          return seller?.sellerInfo?.businessName || `${seller?.firstName} ${seller?.lastName}` || 'Inconnu';
                        }) || [])].map((sellerName, index, array) => (
                          <Chip
                            key={index}
                            label={sellerName}
                            size="small"
                            variant="outlined"
                            sx={{ mr: 0.5, mb: 0.5 }}
                            color={array.length > 1 ? 'secondary' : 'primary'}
                          />
                        ))}
                      </TableCell>
                    )}
                    <TableCell>
                      <Chip 
                        label={getStatusLabel(order.status)} 
                        color={getStatusColor(order.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        size="small"
                        value={order.status}
                        onChange={(e) => handleOrderStatusUpdate(order.id, e.target.value)}
                      >
                        <MenuItem value="pending">En attente</MenuItem>
                        <MenuItem value="confirmed">Confirmée</MenuItem>
                        <MenuItem value="processing">En préparation</MenuItem>
                        <MenuItem value="shipped">Expédiée</MenuItem>
                        <MenuItem value="delivered">Livrée</MenuItem>
                        <MenuItem value="cancelled">Annulée</MenuItem>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      <Dialog open={productDialog} onClose={() => setProductDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ 
          bgcolor: 'primary.main', 
          color: 'white', 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          py: 2
        }}>
          <Edit />
          {selectedProduct ? `Modifier "${selectedProduct.name}"` : 'Créer un nouveau produit'}
        </DialogTitle>
        <DialogContent sx={{ bgcolor: 'grey.50', p: 3 }}>
          {/* Section Informations Générales */}
          <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: 'white' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main', mb: 3 }}>
              <Inventory />
              Informations du produit
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Nom du produit"
                  value={productForm.name}
                  onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                  variant="outlined"
                  required
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Marque"
                  value={productForm.brand}
                  onChange={(e) => setProductForm({...productForm, brand: e.target.value})}
                  variant="outlined"
                  required
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth variant="outlined" required>
                  <InputLabel>Catégorie</InputLabel>
                  <Select
                    value={productForm.category}
                    onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                    label="Catégorie"
                  >
                    <MenuItem value="men">👨 Homme</MenuItem>
                    <MenuItem value="women">👩 Femme</MenuItem>
                    <MenuItem value="kids">🧒 Enfant</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label="Prix (€)"
                  type="number"
                  value={productForm.basePrice}
                  onChange={(e) => setProductForm({...productForm, basePrice: e.target.value})}
                  variant="outlined"
                  required
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1, color: 'text.secondary' }}>€</Typography>
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description du produit"
                  multiline
                  rows={4}
                  value={productForm.description}
                  onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                  variant="outlined"
                  placeholder="Décrivez les caractéristiques, matériaux, couleurs, style et avantages du produit..."
                  helperText="Description détaillée visible par les clients - utilisez toute la largeur disponible"
                />
              </Grid>
            </Grid>
          </Paper>

          {!selectedProduct && productForm.variants.length === 0 && (
            <Paper elevation={2} sx={{ p: 3, bgcolor: 'white', textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom sx={{ color: 'text.secondary' }}>
                👟 Gestion des pointures
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                Ajoutez des pointures pour ce nouveau produit
                {productForm.category && (
                  <><br />
                  <strong>Pointure de départ :</strong> {getDefaultSizeForCategory(productForm.category)} EU</>
                )}
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => {
                  // Ajouter une première pointure par défaut
                  setProductForm({
                    ...productForm,
                    variants: [{
                      id: `new-${Date.now()}`,
                      size: getDefaultSizeForCategory(productForm.category),
                      sizeType: 'EU',
                      stock: 0
                    }]
                  });
                }}
                disabled={!productForm.category}
              >
                {!productForm.category ? 'Sélectionnez d\'abord une catégorie' : 'Commencer la gestion des pointures'}
              </Button>
            </Paper>
          )}

          {(selectedProduct || productForm.variants.length > 0) && (
            <Paper elevation={2} sx={{ p: 3, bgcolor: 'white' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
                  <Assessment />
                  Gestion des stocks par pointure
                </Typography>
                <Chip 
                  label={`📦 Total: ${productForm.variants.reduce((sum, variant) => sum + (variant.stock || 0), 0)} unités`}
                  color="primary"
                  variant="filled"
                  size="medium"
                />
              </Box>

              {/* Section ajout nouvelle pointure */}
              <Paper elevation={1} sx={{ p: 2, mb: 3, bgcolor: 'grey.50', border: '2px dashed', borderColor: 'primary.main' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                    ➕ Ajouter une nouvelle pointure
                  </Typography>
                  {productForm.category && (
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        Catégorie: {productForm.category === 'men' ? '👨 Homme' : productForm.category === 'women' ? '👩 Femme' : '🧒 Enfant'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'primary.main', fontSize: '0.65rem' }}>
                        {(() => {
                          const categoryLabel = productForm.category === 'men' ? 'Homme' : productForm.category === 'women' ? 'Femme' : 'Enfant';
                          const allEU = getSizesForCategory(productForm.category, 'EU');
                          const allUS = getSizesForCategory(productForm.category, 'US');
                          const allUK = getSizesForCategory(productForm.category, 'UK');
                          return `${categoryLabel}: EU(${allEU[0]}-${allEU[allEU.length-1]}) • US(${allUS[0]}-${allUS[allUS.length-1]}) • UK(${allUK[0]}-${allUK[allUK.length-1]})`;
                        })()}
                      </Typography>
                    </Box>
                  )}
                </Box>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={6} sm={2}>
                    <FormControl size="small" fullWidth>
                      <InputLabel id="type-select-label">Type</InputLabel>
                      <Select
                        labelId="type-select-label"
                        value={newVariant.sizeType}
                        onChange={(e) => {
                          setNewVariant({
                            ...newVariant, 
                            sizeType: e.target.value,
                            size: '' // Reset size when type changes
                          });
                        }}
                        label="Type"
                      >
                        <MenuItem value="EU">🇪🇺 EU</MenuItem>
                        <MenuItem value="US">🇺🇸 US</MenuItem>
                        <MenuItem value="UK">🇬🇧 UK</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <FormControl size="small" fullWidth sx={{ minWidth: 120 }}>
                      <InputLabel 
                        id="size-select-label"
                        sx={{ 
                          fontSize: '0.875rem',
                          '&.Mui-focused': { fontSize: '0.75rem' },
                          '&.MuiFormLabel-filled': { fontSize: '0.75rem' }
                        }}
                      >
                        Pointure
                      </InputLabel>
                      <Select
                        labelId="size-select-label"
                        value={newVariant.size}
                        onChange={(e) => setNewVariant({...newVariant, size: e.target.value})}
                        label="Pointure"
                        disabled={!productForm.category}
                        sx={{ 
                          minWidth: 120,
                          '& .MuiSelect-select': { 
                            minWidth: 120,
                            display: 'flex',
                            alignItems: 'center'
                          }
                        }}
                      >
                        {productForm.category && getSizesForCategory(productForm.category, newVariant.sizeType)
                          .filter(size => !productForm.variants.some(v => v.size === size && v.sizeType === newVariant.sizeType))
                          .map(size => (
                            <MenuItem key={size} value={size}>{size}</MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={6} sm={2}>
                    <TextField
                      label="Stock initial"
                      type="number"
                      size="small"
                      value={newVariant.stock}
                      onChange={(e) => setNewVariant({...newVariant, stock: parseInt(e.target.value) || 0})}
                      inputProps={{ min: 0, max: 999 }}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={6} sm={5}>
                    <Button
                      variant="contained"
                      onClick={handleAddVariant}
                      startIcon={<Add />}
                      fullWidth
                      disabled={!newVariant.size.trim() || !productForm.category}
                    >
                      {!productForm.category ? 'Catégorie requise' : 
                       !newVariant.size.trim() ? 'Choisir pointure' : 
                       'Ajouter pointure'}
                    </Button>
                  </Grid>
                  
                  {productForm.category && (
                    <Grid item xs={12}>
                      {(() => {
                        const categoryLabel = productForm.category === 'men' ? 'Homme' : productForm.category === 'women' ? 'Femme' : 'Enfant';
                        const availableSizes = getSizesForCategory(productForm.category, newVariant.sizeType)
                          .filter(size => !productForm.variants.some(v => v.size === size && v.sizeType === newVariant.sizeType));
                        
                        return (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                              {availableSizes.length > 0 ? (
                                <>
                                  💡 <strong>Pointures restantes</strong> pour {categoryLabel} (type {newVariant.sizeType}): {availableSizes.join(', ')}
                                </>
                              ) : (
                                <>
                                  ⚠️ <strong>Toutes les pointures {newVariant.sizeType}</strong> sont déjà ajoutées pour {categoryLabel}
                                </>
                              )}
                            </Typography>
                            {!productForm.category && (
                              <Typography variant="caption" sx={{ color: 'warning.main', fontStyle: 'italic' }}>
                                ⚠️ Sélectionnez d'abord une catégorie dans les informations produit
                              </Typography>
                            )}
                          </Box>
                        );
                      })()}
                    </Grid>
                  )}
                  
                  {!productForm.category && (
                    <Grid item xs={12}>
                      <Typography variant="caption" sx={{ color: 'warning.main', fontStyle: 'italic' }}>
                        ⚠️ Sélectionnez d'abord une catégorie dans les informations produit ci-dessus
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Paper>
              
              {productForm.variants.length > 0 ? (
                <Grid container spacing={2}>
                  {productForm.variants.map((variant, index) => (
                    <Grid item xs={12} sm={6} md={4} key={variant.id || index}>
                      <Paper 
                      elevation={1} 
                      sx={{ 
                        p: 2, 
                        bgcolor: 'grey.50', 
                        border: '1px solid', 
                        borderColor: 'grey.200',
                        transition: 'all 0.2s ease-in-out',
                        cursor: 'default',
                        '&:hover': { 
                          borderColor: 'primary.main', 
                          bgcolor: 'white',
                          transform: 'translateY(-2px)',
                          boxShadow: 3,
                          borderWidth: '2px'
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Chip 
                          label={`${variant.size} ${variant.sizeType}`} 
                          color="primary" 
                          size="small"
                        />
                        <Chip 
                          label={`${variant.stock || 0}`} 
                          color={variant.stock > 5 ? 'success' : variant.stock > 0 ? 'warning' : 'error'}
                          size="small"
                        />
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <TextField
                          type="number"
                          size="small"
                          value={variant.stock || 0}
                          onChange={(e) => {
                            const newVariants = [...productForm.variants];
                            newVariants[index].stock = parseInt(e.target.value) || 0;
                            setProductForm({...productForm, variants: newVariants});
                          }}
                          inputProps={{ min: 0, max: 999 }}
                          sx={{ width: 80 }}
                          variant="outlined"
                        />
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            const newVariants = [...productForm.variants];
                            newVariants[index].stock = 0;
                            setProductForm({...productForm, variants: newVariants});
                          }}
                          color="warning"
                          sx={{ minWidth: 'auto', px: 1 }}
                          title="Vider le stock"
                        >
                          🗑️
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleRemoveVariantRequest(index)}
                          color="error"
                          sx={{ minWidth: 'auto', px: 1 }}
                          title="Supprimer cette pointure"
                        >
                          ❌
                        </Button>
                      </Box>
                    </Paper>
                  </Grid>
                  ))}
                </Grid>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    👟 Aucune pointure définie
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Utilisez le formulaire ci-dessus pour ajouter des pointures
                  </Typography>
                </Box>
              )}
            </Paper>
          )}
        </DialogContent>
        <DialogActions sx={{ bgcolor: 'grey.100', p: 3, gap: 2 }}>
          <Button 
            onClick={() => setProductDialog(false)} 
            variant="outlined"
            size="large"
            sx={{ minWidth: 120 }}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleProductSubmit} 
            variant="contained"
            size="large"
            startIcon={selectedProduct ? <Edit /> : <Add />}
            sx={{ minWidth: 150 }}
          >
            {selectedProduct ? 'Sauvegarder' : 'Créer produit'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={stockDialog} onClose={() => setStockDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          📊 État des stocks - {selectedProductForStock?.name}
        </DialogTitle>
        <DialogContent>
          {selectedProductForStock && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Stock par pointure
              </Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Pointure</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Stock</TableCell>
                      <TableCell>État</TableCell>
                      <TableCell>Statut</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedProductForStock.ProductVariants?.map((variant) => (
                      <TableRow key={variant.id}>
                        <TableCell><strong>{variant.size}</strong></TableCell>
                        <TableCell>{variant.sizeType}</TableCell>
                        <TableCell>
                          <Chip 
                            label={`${variant.stock} unités`} 
                            color={variant.stock > 5 ? 'success' : variant.stock > 0 ? 'warning' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {variant.stock > 5 && <Chip label="En stock" color="success" size="small" />}
                          {variant.stock > 0 && variant.stock <= 5 && <Chip label="Stock faible" color="warning" size="small" />}
                          {variant.stock === 0 && <Chip label="Rupture" color="error" size="small" />}
                        </TableCell>
                        <TableCell>
                          {variant.stock > 10 ? '🟢 Excellent' : 
                           variant.stock > 5 ? '🟡 Correct' :
                           variant.stock > 0 ? '🟠 Attention' : '🔴 Critique'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle2" color="primary">
                  Stock total: {selectedProductForStock.ProductVariants?.reduce((sum, variant) => sum + variant.stock, 0) || 0} unités
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStockDialog(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmDeleteOpen}
        onClose={handleProductDeleteCancel}
        onConfirm={handleProductDeleteConfirm}
        title="Supprimer le produit"
        message={productToDelete ?
          `Êtes-vous sûr de vouloir supprimer "${productToDelete.name}" de ${productToDelete.brand} ?` :
          'Êtes-vous sûr de vouloir supprimer ce produit ?'
        }
        confirmText="Oui, supprimer"
        cancelText="Non, conserver"
        severity="error"
        loading={deleteLoading}
        irreversible={true}
      />

      <ConfirmDialog
        open={confirmVariantDeleteOpen}
        onClose={handleRemoveVariantCancel}
        onConfirm={handleRemoveVariantConfirm}
        title="Supprimer la pointure"
        message={variantToDelete ?
          `Êtes-vous sûr de vouloir supprimer la pointure ${variantToDelete.size} ${variantToDelete.sizeType} ?` :
          'Êtes-vous sûr de vouloir supprimer cette pointure ?'
        }
        confirmText="Oui, supprimer"
        cancelText="Non, conserver"
        severity="error"
        loading={deleteLoading}
        irreversible={true}
      />
    </Container>
  );
};

export default AdminDashboard;
