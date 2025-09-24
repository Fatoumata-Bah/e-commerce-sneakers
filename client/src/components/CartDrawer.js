import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  Avatar,
  Alert
} from '@mui/material';
import { Close, Delete, Add, Remove } from '@mui/icons-material';
import ConfirmDialog from './ConfirmDialog';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { useCartTimer } from '../contexts/CartTimerContext';
import CheckoutSimple from './CheckoutSimple';
import HeaderCartTimer from './HeaderCartTimer';

const CartDrawer = ({ open, onClose, onLoginRequest, autoCheckout = false, onCheckoutStart }) => {
  const { cart, updateCart, removeFromCart, loading } = useCart();
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const { updateActivity } = useCartTimer();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const handleCheckoutCancel = () => {
    setCheckoutOpen(false);
    // Les articles restent dans le panier avec le timer qui continue
  };

  const handleCheckoutSuccess = () => {
    setCheckoutOpen(false);
    onClose(); // Fermer le panier après une commande réussie
  };

  // Déclencher automatiquement le checkout si demandé
  useEffect(() => {
    if (autoCheckout && open && cart.items.length > 0 && user) {
      console.log('🚀 Auto-checkout déclenché depuis le timer');
      setCheckoutOpen(true);
      if (onCheckoutStart) {
        onCheckoutStart();
      }
    } else if (autoCheckout && open && cart.items.length > 0 && !user) {
      // Si pas connecté, demander la connexion
      console.log('🔐 Auto-checkout: demande de connexion');
      onLoginRequest();
    }
  }, [autoCheckout, open, cart.items.length, user, onCheckoutStart, onLoginRequest]);
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);
  const [removeLoading, setRemoveLoading] = useState(false);

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    updateActivity(); // Mettre à jour l'activité utilisateur
    
    const result = await updateCart(itemId, newQuantity);
    if (!result.success) {
      showNotification(result.error, 'error');
    }
  };

  const handleRemoveItemRequest = (item) => {
    updateActivity(); // Mettre à jour l'activité utilisateur
    setItemToRemove(item);
    setConfirmRemoveOpen(true);
  };

  const handleRemoveItemConfirm = async () => {
    if (!itemToRemove) return;
    
    try {
      setRemoveLoading(true);
      const result = await removeFromCart(itemToRemove.id);
      if (result.success) {
        showNotification('Article supprimé du panier', 'success');
        setConfirmRemoveOpen(false);
        setItemToRemove(null);
      } else {
        showNotification(result.error, 'error');
      }
    } catch (error) {
      showNotification('Erreur lors de la suppression', 'error');
    } finally {
      setRemoveLoading(false);
    }
  };

  const handleRemoveItemCancel = () => {
    setConfirmRemoveOpen(false);
    setItemToRemove(null);
  };

  const getItemInfo = (item) => {
    if (user) {
      return {
        name: item.ProductVariant?.Product?.name || 'Produit',
        brand: item.ProductVariant?.Product?.brand || '',
        size: item.ProductVariant?.size || '',
        price: item.ProductVariant?.Product?.basePrice || 0,
        image: item.ProductVariant?.Product?.images?.[0] || null,
        stock: item.ProductVariant?.stock
      };
    } else {
      return {
        name: item.productInfo?.name || 'Produit',
        brand: item.productInfo?.brand || '',
        size: item.productInfo?.variant?.size || '',
        price: item.productInfo?.basePrice || 0,
        image: null,
        stock: item.productInfo?.variant?.stock
      };
    }
  };

  return (
    <>
      <Drawer 
        anchor="right" 
        open={open} 
        onClose={onClose}
        sx={{
          zIndex: (theme) => theme.zIndex.modal + 1, // Plus élevé que le header
          '& .MuiDrawer-paper': {
            zIndex: (theme) => theme.zIndex.modal + 1
          }
        }}
      >
      <Box sx={{ width: 420, display: 'flex', flexDirection: 'column', height: '100vh' }}>
        {/* En-tête amélioré */}
        <Box sx={{ 
          p: 3, 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                borderRadius: '12px', 
                p: 1.5,
                display: 'flex',
                alignItems: 'center'
              }}>
                🛍️
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Mon Panier
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {cart.count} article{cart.count > 1 ? 's' : ''}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* Timer du panier dans le drawer */}
              <Box sx={{ 
                bgcolor: 'rgba(255,255,255,0.15)',
                borderRadius: 2,
                px: 1.5,
                py: 0.5,
                display: 'flex',
                alignItems: 'center'
              }}>
                <HeaderCartTimer />
              </Box>
              
              <IconButton 
                onClick={onClose}
                sx={{ 
                  color: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                }}
              >
            <Close />
          </IconButton>
            </Box>
          </Box>
        </Box>

        
        {cart.items.length === 0 ? (
          <Box sx={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            p: 4 
          }}>
            <Box sx={{ 
              fontSize: '4rem', 
              mb: 2,
              opacity: 0.5
            }}>
              🛒
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
              Votre panier est vide
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', maxWidth: '280px' }}>
              Découvrez nos sneakers authentiques et ajoutez vos modèles préférés !
            </Typography>
          </Box>
        ) : (
          <>
            <Box sx={{ flex: 1, overflow: 'auto', px: 3, py: 2 }}>
              {cart.items.map((item) => {
                const info = getItemInfo(item);
                return (
                  <Box 
                    key={item.id} 
                    sx={{ 
                      mb: 3,
                      p: 2,
                      border: '1px solid',
                      borderColor: 'grey.200',
                      borderRadius: '12px',
                      bgcolor: 'background.paper',
                      '&:hover': { 
                        borderColor: 'primary.main',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Avatar
                      src={info.image}
                        sx={{ 
                          width: 60, 
                          height: 60, 
                          bgcolor: 'grey.100',
                          border: '2px solid',
                          borderColor: 'grey.200'
                        }}
                      variant="rounded"
                    >
                      👟
                    </Avatar>
                    
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {info.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {info.brand} • Pointure {info.size}
                        </Typography>
                            {info.stock !== undefined && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Box sx={{ 
                              width: 8, 
                              height: 8, 
                              borderRadius: '50%', 
                              bgcolor: info.stock <= 5 ? 'error.main' : 'success.main' 
                            }} />
                            <Typography variant="caption" color="text.secondary">
                              Stock: {info.stock}
                            </Typography>
                          </Box>
                        )}
                        <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700 }}>
                            {parseFloat(info.price).toFixed(2)}€
                          </Typography>
                        </Box>
                    </Box>
                    
                    {/* Contrôles en bas de la carte */}
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      mt: 2
                    }}>
                      {/* Contrôles de quantité - Version simplifiée */}
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1,
                        bgcolor: 'rgba(0,0,0,0.03)',
                        borderRadius: 2,
                        p: 0.5
                      }}>
                        <Button
                          variant="contained"
                            size="small" 
                          onClick={() => {
                            handleQuantityChange(item.id, item.quantity - 1);
                          }}
                            disabled={loading || item.quantity <= 1}
                          sx={{
                            minWidth: 36,
                            width: 36,
                            height: 36,
                            p: 0,
                            bgcolor: 'error.main',
                            '&:hover': { bgcolor: 'error.dark' },
                            '&:disabled': { bgcolor: 'grey.300' }
                          }}
                          >
                            <Remove fontSize="small" />
                        </Button>
                        
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            minWidth: 24, 
                            textAlign: 'center',
                            fontWeight: 600,
                            mx: 1
                          }}
                        >
                            {item.quantity}
                          </Typography>
                          
                        <Button
                          variant="contained"
                            size="small" 
                          onClick={() => {
                            handleQuantityChange(item.id, item.quantity + 1);
                          }}
                            disabled={loading || (info.stock !== undefined && item.quantity >= info.stock)}
                          sx={{
                            minWidth: 36,
                            width: 36,
                            height: 36,
                            p: 0,
                            bgcolor: 'success.main',
                            '&:hover': { bgcolor: 'success.dark' },
                            '&:disabled': { bgcolor: 'grey.300' }
                          }}
                            title={info.stock !== undefined && item.quantity >= info.stock ? `Stock maximum atteint (${info.stock})` : 'Augmenter la quantité'}
                          >
                            <Add fontSize="small" />
                        </Button>
                        </Box>
                        
                      {/* Bouton supprimer - Version simplifiée */}
                      <Button
                        variant="contained"
                          size="small" 
                        onClick={() => {
                          handleRemoveItemRequest(item);
                        }}
                          disabled={loading}
                        sx={{
                          minWidth: 44,
                          width: 44,
                          height: 44,
                          p: 0,
                          bgcolor: 'error.main',
                          borderRadius: 2,
                          '&:hover': { 
                            bgcolor: 'error.dark',
                            transform: 'scale(1.05)'
                          },
                          '&:disabled': { bgcolor: 'grey.300' }
                        }}
                      >
                        <Delete fontSize="small" />
                      </Button>
                    </Box>
                      </Box>
                );
              })}
            </Box>

            {/* Section Total et Actions */}
            <Box sx={{ 
              p: 3, 
              bgcolor: 'grey.50',
              borderTop: '1px solid',
              borderColor: 'grey.200',
              position: 'relative',
              zIndex: 1000,
              pointerEvents: 'auto'
            }}>
            {/* Total */}
              <Box sx={{ 
                p: 2, 
                bgcolor: 'white',
                borderRadius: '12px',
                border: '1px solid',
                borderColor: 'grey.200',
                mb: 3
              }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Total:
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {cart.total.toFixed(2)}€
                </Typography>
              </Box>
            </Box>

            {/* Actions */}
            {!user && (
                <Alert severity="info" sx={{ mb: 3, borderRadius: '12px' }}>
                  <Typography variant="body2">
                Connectez-vous pour finaliser votre commande
                  </Typography>
              </Alert>
            )}
            
            <Button
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
                onClick={(e) => {
                  e.stopPropagation();
                if (!user) {
                  onClose();
                  onLoginRequest();
                } else {
                  setCheckoutOpen(true);
                    // Garder le panier ouvert en arrière-plan
                  }
                }}
                sx={{ 
                  py: 1.5,
                  borderRadius: '12px',
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                  cursor: 'pointer',
                  pointerEvents: 'auto',
                  zIndex: 1001,
                  position: 'relative',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #5a67d8 30%, #6b46c1 90%)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                  },
                  '&:disabled': {
                    background: 'grey.400',
                    cursor: 'not-allowed'
                  }
                }}
              >
                {user ? '🚀 Commander' : '🔐 Se connecter pour commander'}
            </Button>
            </Box>
          </>
        )}
      </Box>
      </Drawer>
        
        <CheckoutSimple 
          open={checkoutOpen} 
          onClose={() => setCheckoutOpen(false)} 
        onCancel={handleCheckoutCancel}
        onSuccess={handleCheckoutSuccess}
        />

        <ConfirmDialog
          open={confirmRemoveOpen}
          onClose={handleRemoveItemCancel}
          onConfirm={handleRemoveItemConfirm}
          title="Supprimer l'article"
          message={itemToRemove ? 
            `Êtes-vous sûr de vouloir supprimer "${getItemInfo(itemToRemove).name}" de votre panier ?` : 
            'Êtes-vous sûr de vouloir supprimer cet article ?'
          }
          confirmText="Oui, supprimer"
          cancelText="Non, conserver"
          severity="warning"
          loading={removeLoading}
        />
    </>
    );
  };

export default CartDrawer;
