import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Button,
  Box,
  Alert,
  CircularProgress,
  Chip,
  Pagination,
  Stack,
  Tooltip
} from '@mui/material';
import {
  ShoppingCart,
  Schedule,
  CheckCircle,
  Refresh,
  FilterList
} from '@mui/icons-material';
import { expiredCartService } from '../services/api';
import { useCart } from '../contexts/CartContext';
import { useNotification } from '../contexts/NotificationContext';
import { useCartTimer } from '../contexts/CartTimerContext';
import useAutoRefresh from '../hooks/useAutoRefresh';

const ExpiredItemsHistory = () => {
  const [expiredItems, setExpiredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reorderingId, setReorderingId] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [showOnlyNotReordered, setShowOnlyNotReordered] = useState(false);
  
  const itemsPerPage = 12;
  const { fetchCart } = useCart();
  const { showNotification } = useNotification();
  const { extendOnAddItem } = useCartTimer();

  // Charger les articles expirés
  const loadExpiredItems = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const options = {
        limit: itemsPerPage,
        offset: (page - 1) * itemsPerPage,
        onlyNotReordered: showOnlyNotReordered,
        recentOnly: false
      };

      const response = await expiredCartService.getHistory(options);
      setExpiredItems(response.data.items);
      setTotalCount(response.data.totalCount);
      setCurrentPage(page);
    } catch (error) {
      console.error('Erreur chargement articles expirés:', error);
      showNotification('Erreur lors du chargement de l\'historique', 'error');
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage, showOnlyNotReordered, showNotification]);

  // Mise à jour automatique toutes les 30 secondes
  useAutoRefresh(loadExpiredItems, 30000, true);

  // Remettre un article au panier
  const handleReorderItem = async (expiredItemId, productVariantId) => {
    try {
      setReorderingId(expiredItemId);
      
      await expiredCartService.reorderItem(expiredItemId, 1);
      
      // Rafraîchir le panier et la liste
      await fetchCart();
      await loadExpiredItems(currentPage);
      
      // Déclencher la mise à jour du compteur d'articles expirés
      window.dispatchEvent(new CustomEvent('expiredItemsUpdated'));
      
      // Démarrer/prolonger le timer après ajout au panier
      setTimeout(() => {
        extendOnAddItem();
      }, 100);
      
      showNotification('✅ Article remis au panier avec succès !', 'success');
    } catch (error) {
      console.error('Erreur remise au panier:', error);
      const errorMessage = error.response?.data?.error || 'Erreur lors de la remise au panier';
      showNotification(errorMessage, 'error');
    } finally {
      setReorderingId(null);
    }
  };

  // Formater la date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtenir l'image du produit
  const getProductImage = (product, fallback = true) => {
    if (product?.images && product.images.length > 0) {
      return product.images[0];
    }
    
    if (fallback) {
      const brandQuery = product?.brand || 'sneakers';
      return `https://images.unsplash.com/400x300/?${brandQuery}+shoes`;
    }
    
    return null;
  };

  useEffect(() => {
    loadExpiredItems();
  }, [showOnlyNotReordered, loadExpiredItems]);

  const handlePageChange = (event, page) => {
    loadExpiredItems(page);
  };

  const toggleFilter = () => {
    setShowOnlyNotReordered(!showOnlyNotReordered);
  };

  if (loading && expiredItems.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Chargement de votre historique...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* En-tête */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Schedule color="primary" />
          Articles Expirés
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Retrouvez ici tous les articles qui ont expiré de votre panier et ajoutez-les à nouveau à votre panier.
        </Typography>
      </Box>


      {/* Filtres et Actions */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Tooltip title={showOnlyNotReordered ? "Afficher tous les articles" : "Afficher seulement les articles non remis au panier"}>
            <Button
              variant={showOnlyNotReordered ? "contained" : "outlined"}
              startIcon={<FilterList />}
              onClick={toggleFilter}
            >
              {showOnlyNotReordered ? 'Non remis au panier seulement' : 'Tous les articles'}
            </Button>
          </Tooltip>
          
          <Chip 
            label={`${totalCount} article${totalCount > 1 ? 's' : ''} trouvé${totalCount > 1 ? 's' : ''}`}
            color="primary"
            variant="outlined"
          />
        </Box>

        {/* Bouton actualiser déplacé ici */}
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={() => loadExpiredItems(currentPage)}
          size="small"
        >
          Actualiser
        </Button>
      </Box>

      {/* Liste des articles */}
      {expiredItems.length === 0 ? (
        <Alert severity="info" sx={{ textAlign: 'center' }}>
          <Typography variant="h6">Aucun article expiré</Typography>
          <Typography variant="body2">
            {showOnlyNotReordered 
              ? "Vous n'avez aucun article expiré non remis au panier."
              : "Votre historique d'articles expirés est vide."
            }
          </Typography>
        </Alert>
      ) : (
        <>
          <Grid container spacing={3}>
            {expiredItems.map((item) => (
              <Grid item xs={12} sm={6} lg={4} key={item.id}>
                <Card sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  minHeight: '450px',
                  width: '100%',
                  maxWidth: '100%'
                }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={getProductImage(item.productVariant?.Product)}
                    alt={item.productVariant?.Product?.name}
                    sx={{ objectFit: 'cover' }}
                  />
                  
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography 
                      variant="h6" 
                      gutterBottom 
                      sx={{ 
                        height: '3.2rem', 
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        lineHeight: '1.6rem'
                      }}
                    >
                      {item.productVariant?.Product?.name}
                    </Typography>
                    
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      gutterBottom
                      sx={{ 
                        height: '1.5rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {item.productVariant?.Product?.Seller?.firstName} {item.productVariant?.Product?.Seller?.lastName}
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                      <Chip
                        label={`Taille: ${item.productVariant?.size} ${item.productVariant?.sizeType?.toUpperCase()}`}
                        size="small"
                        sx={{ mr: 1, mb: 1 }}
                      />
                      <Chip
                        label={`Qté: ${item.quantity}`}
                        size="small"
                        sx={{ mr: 1, mb: 1 }}
                      />
                    </Box>

                    <Typography variant="h6" color="primary" gutterBottom>
                      {item.originalPrice}€
                    </Typography>

                    <Typography variant="caption" color="text.secondary" display="block">
                      Expiré le {formatDate(item.expiredAt)}
                    </Typography>

                    {item.isReordered && (
                      <Chip
                        icon={<CheckCircle />}
                        label="Re-commandé"
                        color="success"
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    )}
                  </CardContent>

                  <Box sx={{ p: 2, pt: 0 }}>
                    {!item.isReordered ? (
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={reorderingId === item.id ? <CircularProgress size={16} /> : <ShoppingCart />}
                        onClick={() => handleReorderItem(item.id, item.productVariantId)}
                        disabled={reorderingId === item.id}
                      >
                        {reorderingId === item.id ? 'Ajout...' : 'Remettre au panier'}
                      </Button>
                    ) : (
                      <Button
                        fullWidth
                        variant="outlined"
                        disabled
                        startIcon={<CheckCircle />}
                      >
                        Déjà remis au panier
                      </Button>
                    )}
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {totalCount > itemsPerPage && (
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
              <Stack spacing={2}>
                <Pagination
                  count={Math.ceil(totalCount / itemsPerPage)}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  showFirstButton
                  showLastButton
                />
              </Stack>
            </Box>
          )}
        </>
      )}

    </Container>
  );
};

export default ExpiredItemsHistory;

