import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Container,
  Fade,
  CardHeader,
  CardActions
} from '@mui/material';
import {
  ShoppingBag,
  LocalShipping,
  CheckCircle,
  Cancel,
  Visibility,
  CalendarToday,
  Payment,
  LocationOn,
  Inventory2,
  CreditCard,
  AccountBalanceWallet,
  LocalAtm
} from '@mui/icons-material';
import ConfirmDialog from './ConfirmDialog';
import { orderService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import useAutoRefresh from '../hooks/useAutoRefresh';

const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  
  // Filtres simples pour les clients
  const [filters, setFilters] = useState({
    status: 'all',
    period: 'all'
  });
  
  const { user } = useAuth();
  const { showNotification } = useNotification();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getAll();
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      showNotification('Erreur lors du chargement des commandes', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Mise à jour automatique toutes les 45 secondes (un peu moins fréquent que les articles expirés)
  useAutoRefresh(fetchOrders, 45000, !!user);

  // Fonction de filtrage simple pour les clients
  const getFilteredOrders = () => {
    return orders.filter(order => {
      // Filtre par statut
      if (filters.status !== 'all' && order.status !== filters.status) {
        return false;
      }
      
      // Filtre par période
      if (filters.period !== 'all') {
        const orderDate = new Date(order.createdAt);
        const now = new Date();
        const daysDiff = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24));
        
        switch (filters.period) {
          case 'week':
            if (daysDiff > 7) return false;
            break;
          case 'month':
            if (daysDiff > 30) return false;
            break;
          case '3months':
            if (daysDiff > 90) return false;
            break;
          default:
            break;
        }
      }
      
      return true;
    });
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

  const getStatusIcon = (status) => {
    const icons = {
      pending: <CalendarToday sx={{ fontSize: '1rem' }} />,
      confirmed: <CheckCircle sx={{ fontSize: '1rem' }} />,
      processing: <Inventory2 sx={{ fontSize: '1rem' }} />,
      shipped: <LocalShipping sx={{ fontSize: '1rem' }} />,
      delivered: <CheckCircle sx={{ fontSize: '1rem' }} />,
      cancelled: <Cancel sx={{ fontSize: '1rem' }} />
    };
    return icons[status] || <ShoppingBag sx={{ fontSize: '1rem' }} />;
  };

  const getPaymentIcon = (paymentMethod) => {
    const method = paymentMethod?.toLowerCase() || '';
    if (method.includes('card') || method.includes('carte')) {
      return <CreditCard sx={{ fontSize: '1.2rem', color: 'info.main' }} />;
    }
    if (method.includes('paypal')) {
      return <AccountBalanceWallet sx={{ fontSize: '1.2rem', color: 'info.main' }} />;
    }
    if (method.includes('cash') || method.includes('espèces')) {
      return <LocalAtm sx={{ fontSize: '1.2rem', color: 'info.main' }} />;
    }
    // Icône par défaut pour les paiements
    return <Payment sx={{ fontSize: '1.2rem', color: 'info.main' }} />;
  };

  const canCancelOrder = (order) => {
    return ['pending', 'confirmed'].includes(order.status);
  };

  const handleCancelOrderRequest = (order) => {
    setOrderToCancel(order);
    setConfirmOpen(true);
  };

  const handleCancelOrderConfirm = async () => {
    if (!orderToCancel) return;
    
    try {
      setCancelLoading(true);
      await orderService.updateStatus(orderToCancel.id, 'cancelled');
      showNotification('Commande annulée avec succès', 'success');
      await fetchOrders();
      setDetailsOpen(false);
      setConfirmOpen(false);
      setOrderToCancel(null);
    } catch (error) {
      showNotification('Erreur lors de l\'annulation', 'error');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleCancelOrderCancel = () => {
    setConfirmOpen(false);
    setOrderToCancel(null);
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return (
      <Alert severity="info">
        Connectez-vous pour voir vos commandes
      </Alert>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (orders.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <Paper 
          elevation={0}
          sx={{ 
            p: 6, 
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <ShoppingBag sx={{ fontSize: '4rem', color: 'text.secondary', mb: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
            Aucune commande
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            Vous n'avez pas encore passé de commande. Découvrez nos produits !
          </Typography>
          <Button 
            variant="contained" 
            size="large"
            sx={{ 
              borderRadius: '12px',
              fontWeight: 600,
              textTransform: 'none',
              px: 4,
              py: 1.5
            }}
            onClick={() => window.location.reload()} // Retour au catalogue
          >
            Découvrir nos sneakers
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* En-tête avec style moderne */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 4, 
          mb: 4, 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: '20px'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <ShoppingBag sx={{ fontSize: '2.5rem' }} />
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            📦 Historique des Commandes
          </Typography>
        </Box>
        <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
          {getFilteredOrders().length} commande{getFilteredOrders().length > 1 ? 's' : ''} trouvée{getFilteredOrders().length > 1 ? 's' : ''} 
          {orders.length !== getFilteredOrders().length && ` sur ${orders.length} au total`}
        </Typography>
      </Paper>

      {/* Filtres améliorés */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          mb: 4, 
          borderRadius: '16px',
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          🔍 Filtres
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Statut de la commande</InputLabel>
              <Select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                label="Statut de la commande"
                sx={{ borderRadius: '12px' }}
              >
                <MenuItem value="all">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ShoppingBag sx={{ fontSize: '1rem' }} />
                    Tous les statuts
                  </Box>
                </MenuItem>
                <MenuItem value="pending">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarToday sx={{ fontSize: '1rem' }} />
                    En attente
                  </Box>
                </MenuItem>
                <MenuItem value="confirmed">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle sx={{ fontSize: '1rem' }} />
                    Confirmée
                  </Box>
                </MenuItem>
                <MenuItem value="processing">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Inventory2 sx={{ fontSize: '1rem' }} />
                    En préparation
                  </Box>
                </MenuItem>
                <MenuItem value="shipped">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocalShipping sx={{ fontSize: '1rem' }} />
                    Expédiée
                  </Box>
                </MenuItem>
                <MenuItem value="delivered">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle sx={{ fontSize: '1rem' }} />
                    Livrée
                  </Box>
                </MenuItem>
                <MenuItem value="cancelled">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Cancel sx={{ fontSize: '1rem' }} />
                    Annulée
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Période</InputLabel>
              <Select
                value={filters.period}
                onChange={(e) => setFilters({...filters, period: e.target.value})}
                label="Période"
                sx={{ borderRadius: '12px' }}
              >
                <MenuItem value="all">Toutes les commandes</MenuItem>
                <MenuItem value="week">Cette semaine</MenuItem>
                <MenuItem value="month">Ce mois-ci</MenuItem>
                <MenuItem value="3months">3 derniers mois</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Liste des commandes avec design moderne */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center' }}>
        {getFilteredOrders().map((order, index) => (
          <Fade in={true} timeout={300 + index * 100} key={order.id}>
            <Card 
              sx={{ 
                borderRadius: '16px',
                overflow: 'visible',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                transition: 'all 0.3s ease-in-out',
                width: '100%',
                maxWidth: '800px',
                minWidth: { xs: '100%', sm: '600px' },
                '&:hover': {
                  boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                  transform: 'translateY(-2px)'
                }
              }}
              >
                <CardHeader
                  avatar={
                    <Avatar 
                      sx={{ 
                        bgcolor: getStatusColor(order.status) === 'success' ? 'success.main' : 
                               getStatusColor(order.status) === 'error' ? 'error.main' :
                               getStatusColor(order.status) === 'warning' ? 'warning.main' : 'primary.main',
                        width: 56,
                        height: 56
                      }}
                    >
                      {getStatusIcon(order.status)}
                    </Avatar>
                  }
                  action={
                    <Chip 
                      icon={getStatusIcon(order.status)}
                      label={getStatusLabel(order.status)} 
                      color={getStatusColor(order.status)}
                      sx={{ 
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        height: '32px'
                      }}
                    />
                  }
                  title={
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      Commande #{order.orderNumber}
                    </Typography>
                  }
                  subheader={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1, flexWrap: 'wrap' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarToday sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(order.createdAt)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {React.cloneElement(getPaymentIcon(order.paymentMethod), { 
                          sx: { fontSize: '1rem', color: 'text.secondary' } 
                        })}
                        <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                          {order.paymentMethod}
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
                
                <CardContent sx={{ pt: 0, px: 3 }}>
                  <Grid container spacing={3} sx={{ alignItems: 'center' }}>
                    <Grid item xs={12} sm={4}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minHeight: '40px' }}>
                        <ShoppingBag sx={{ fontSize: '1.2rem', color: 'primary.main' }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {order.OrderItems?.length || 0} article{(order.OrderItems?.length || 0) > 1 ? 's' : ''}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={4}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minHeight: '40px' }}>
                        <Payment sx={{ fontSize: '1.2rem', color: 'success.main' }} />
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                          {parseFloat(order.totalAmount).toFixed(2)}€
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={4}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minHeight: '40px' }}>
                        <LocationOn sx={{ fontSize: '1.2rem', color: 'info.main' }} />
                        <Typography variant="body2" color="text.secondary" sx={{ 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          whiteSpace: 'nowrap',
                          maxWidth: '180px'
                        }}>
                          {order.shippingAddress ? 
                            `${order.shippingAddress.city}, ${order.shippingAddress.country}` : 
                            'Adresse non renseignée'
                          }
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>

                <CardActions sx={{ px: 3, pb: 3, gap: 2, justifyContent: 'space-between', flexWrap: 'wrap' }}>
                  <Button 
                    variant="contained" 
                    startIcon={<Visibility />}
                    onClick={() => handleViewDetails(order)}
                    sx={{ 
                      borderRadius: '10px',
                      fontWeight: 600,
                      textTransform: 'none',
                      minWidth: '140px',
                      py: 1
                    }}
                  >
                    Voir détails
                  </Button>
                  {canCancelOrder(order) && (
                    <Button 
                      variant="outlined" 
                      color="error" 
                      startIcon={<Cancel />}
                      onClick={() => handleCancelOrderRequest(order)}
                      sx={{ 
                        borderRadius: '10px',
                        fontWeight: 600,
                        textTransform: 'none',
                        minWidth: '120px',
                        py: 1
                      }}
                    >
                      Annuler
                    </Button>
                  )}
                </CardActions>
            </Card>
          </Fade>
        ))}
      </Box>

      <Dialog 
        open={detailsOpen} 
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            boxShadow: '0 24px 48px rgba(0,0,0,0.15)'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          borderRadius: '20px 20px 0 0'
        }}>
          <ShoppingBag sx={{ fontSize: '1.5rem' }} />
          <Typography variant="h6" component="span" sx={{ fontWeight: 700 }}>
            Commande #{selectedOrder?.orderNumber}
          </Typography>
        </DialogTitle>
        
        <DialogContent dividers sx={{ p: 4 }}>
          {selectedOrder && (
            <Box>
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Paper elevation={0} sx={{ p: 3, borderRadius: '12px', bgcolor: 'grey.50' }}>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
                      <CalendarToday sx={{ color: 'primary.main' }} />
                      Informations générales
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <CalendarToday sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                      <Typography variant="body2">
                        <strong>Date:</strong> {formatDate(selectedOrder.createdAt)}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" component="span">
                          <strong>Statut:</strong>
                        </Typography>
                        <Chip 
                          icon={getStatusIcon(selectedOrder.status)}
                          label={getStatusLabel(selectedOrder.status)} 
                          color={getStatusColor(selectedOrder.status)} 
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Payment sx={{ fontSize: '1rem', color: 'success.main' }} />
                      <Typography variant="body2">
                        <strong>Total:</strong> {parseFloat(selectedOrder.totalAmount).toFixed(2)}€
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {React.cloneElement(getPaymentIcon(selectedOrder.paymentMethod), { 
                        sx: { fontSize: '1rem', color: 'info.main' } 
                      })}
                      <Typography variant="body2">
                        <strong>Paiement:</strong> {selectedOrder.paymentMethod} ({selectedOrder.paymentStatus})
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Paper elevation={0} sx={{ p: 3, borderRadius: '12px', bgcolor: 'grey.50' }}>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
                      <LocationOn sx={{ color: 'primary.main' }} />
                      Adresse de livraison
                    </Typography>
                    {selectedOrder.shippingAddress && (
                      <Box sx={{ pl: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                          {selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          {selectedOrder.shippingAddress.address}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          {selectedOrder.shippingAddress.postalCode} {selectedOrder.shippingAddress.city}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {selectedOrder.shippingAddress.country}
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </Grid>
              </Grid>

              <Divider sx={{ my: 4 }} />

              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700, mb: 3 }}>
                <ShoppingBag sx={{ color: 'primary.main' }} />
                Articles commandés ({selectedOrder.OrderItems?.length || 0})
              </Typography>
              
              <List sx={{ bgcolor: 'background.paper', borderRadius: '12px' }}>
                {selectedOrder.OrderItems?.map((item, index) => (
                  <ListItem 
                    key={index} 
                    divider={index < (selectedOrder.OrderItems?.length || 0) - 1}
                    sx={{ 
                      py: 2,
                      '&:hover': { bgcolor: 'grey.50' },
                      borderRadius: '8px',
                      mb: index < (selectedOrder.OrderItems?.length || 0) - 1 ? 1 : 0
                    }}
                  >
                    <Avatar 
                      src={item.ProductVariant?.Product?.images?.[0] || 'https://via.placeholder.com/60?text=👟'} 
                      variant="square" 
                      sx={{ 
                        mr: 2, 
                        width: 60, 
                        height: 60,
                        borderRadius: '8px',
                        border: '2px solid',
                        borderColor: 'divider'
                      }} 
                    />
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {item.ProductVariant?.Product?.name || 'Produit'}
                        </Typography>
                      }
                      secondary={
                        <Box component="div">
                          <Typography variant="body2" color="text.secondary" component="span" display="block">
                            {item.ProductVariant?.Product?.brand || ''} • Pointure: {item.ProductVariant?.size || 'N/A'}
                          </Typography>
                          <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600 }} component="span" display="block">
                            {item.quantity} x {parseFloat(item.unitPrice).toFixed(2)}€
                          </Typography>
                        </Box>
                      }
                    />
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                        {parseFloat(item.totalPrice).toFixed(2)}€
                      </Typography>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3, gap: 2 }}>
          {selectedOrder && canCancelOrder(selectedOrder) && (
            <Button 
              variant="outlined"
              color="error"
              startIcon={<Cancel />}
              onClick={() => handleCancelOrderRequest(selectedOrder)}
              sx={{ 
                borderRadius: '10px',
                fontWeight: 600,
                textTransform: 'none'
              }}
            >
              Annuler la commande
            </Button>
          )}
          <Button 
            variant="contained"
            onClick={() => setDetailsOpen(false)}
            sx={{ 
              borderRadius: '10px',
              fontWeight: 600,
              textTransform: 'none'
            }}
          >
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        onClose={handleCancelOrderCancel}
        onConfirm={handleCancelOrderConfirm}
        title="Annuler la commande"
        message={orderToCancel ? 
          `Êtes-vous sûr de vouloir annuler la commande #${orderToCancel.orderNumber} ?` : 
          'Êtes-vous sûr de vouloir annuler cette commande ?'
        }
        confirmText="Oui, annuler"
        cancelText="Non, conserver"
        severity="error"
        loading={cancelLoading}
        irreversible={true}
      />
    </Container>
  );
};

export default OrdersList;
