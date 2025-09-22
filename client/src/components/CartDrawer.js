import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Button,
  Divider,
  Avatar,
  Alert
} from '@mui/material';
import { Close, Delete, Add, Remove } from '@mui/icons-material';
import ConfirmDialog from './ConfirmDialog';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import CheckoutSimple from './CheckoutSimple';

const CartDrawer = ({ open, onClose, onLoginRequest }) => {
  const { cart, updateCart, removeFromCart, loading } = useCart();
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);
  const [removeLoading, setRemoveLoading] = useState(false);

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    const result = await updateCart(itemId, newQuantity);
    if (!result.success) {
      showNotification(result.error, 'error');
    }
  };

  const handleRemoveItemRequest = (item) => {
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
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 400, p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Mon Panier ({cart.count})</Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 2 }} />
        {cart.items.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              Votre panier est vide
            </Typography>
          </Box>
        ) : (
          <>
            <List sx={{ flexGrow: 1 }}>
              {cart.items.map((item) => {
                const info = getItemInfo(item);
                return (
                  <ListItem key={item.id} sx={{ px: 0, py: 2 }}>
                    <Avatar
                      src={info.image}
                      sx={{ mr: 2, bgcolor: 'grey.200' }}
                      variant="rounded"
                    >
                      👟
                    </Avatar>
                    
                    <ListItemText
                      primary={
                        <Box>
                          <Typography variant="subtitle2">{info.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {info.brand} • Pointure {info.size}
                            {info.stock !== undefined && (
                              <span style={{ color: info.stock <= 5 ? '#f44336' : '#666' }}>
                                {' '}• Stock: {info.stock}
                              </span>
                            )}
                          </Typography>
                          <Typography variant="h6" color="primary">
                            {parseFloat(info.price).toFixed(2)}€
                          </Typography>
                        </Box>
                      }
                    />
                    
                    <ListItemSecondaryAction>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                        {/* Contrôles de quantité */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, border: '1px solid', borderColor: 'grey.300', borderRadius: 1, px: 1, py: 0.5 }}>
                          <IconButton 
                            size="small" 
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            disabled={loading || item.quantity <= 1}
                            sx={{ minWidth: 'auto', p: 0.5 }}
                          >
                            <Remove fontSize="small" />
                          </IconButton>
                          
                          <Typography variant="body2" sx={{ minWidth: 20, textAlign: 'center' }}>
                            {item.quantity}
                          </Typography>
                          
                          <IconButton 
                            size="small" 
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            disabled={loading || (info.stock !== undefined && item.quantity >= info.stock)}
                            sx={{ minWidth: 'auto', p: 0.5 }}
                            title={info.stock !== undefined && item.quantity >= info.stock ? `Stock maximum atteint (${info.stock})` : 'Augmenter la quantité'}
                          >
                            <Add fontSize="small" />
                          </IconButton>
                        </Box>
                        
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleRemoveItemRequest(item)}
                          disabled={loading}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                );
              })}
            </List>

            <Divider sx={{ my: 2 }} />

            {/* Total */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h6" color="primary">
                  {cart.total.toFixed(2)}€
                </Typography>
              </Box>
            </Box>

            {/* Actions */}
            {!user && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Connectez-vous pour finaliser votre commande
              </Alert>
            )}
            
            <Button
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              onClick={() => {
                if (!user) {
                  onClose();
                  onLoginRequest();
                } else {
                  setCheckoutOpen(true);
                }
              }}
            >
              {user ? 'Commander' : 'Se connecter pour commander'}
            </Button>
          </>
        )}
      </Box>
        
        <CheckoutSimple 
          open={checkoutOpen} 
          onClose={() => setCheckoutOpen(false)} 
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
      </Drawer>
    );
  };

export default CartDrawer;
