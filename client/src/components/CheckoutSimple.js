import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Typography,
  Box,
  Alert,
  FormControl,
  FormLabel,
  Divider
} from '@mui/material';
import ConfirmDialog from './ConfirmDialog';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { useCartTimer } from '../contexts/CartTimerContext';
import StockReservationService from '../services/stockReservationService';
import { orderService } from '../services/api';

const CheckoutSimple = ({ open, onClose, onCancel, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [confirmOrderOpen, setConfirmOrderOpen] = useState(false);
  const { cart, fetchCart } = useCart();
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const { pauseTimer, resumeTimer, stopTimer } = useCartTimer();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: ''
  });

  // Pré-remplir les données utilisateur quand elles sont disponibles
  useEffect(() => {
    if (user && user.firstName && user.lastName) {
      console.log('👤 Pré-remplissage des données utilisateur:', user.firstName, user.lastName);
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName,
        lastName: user.lastName
      }));
    }
  }, [user]);

  const [paymentMethod, setPaymentMethod] = useState('card');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  const handleOrderRequest = () => {
    if (!formData.address || !formData.city || !formData.postalCode) {
      showNotification('Veuillez remplir tous les champs obligatoires', 'warning');
      return;
    }
    setConfirmOrderOpen(true);
  };

  const handleOrderConfirm = async () => {
    setLoading(true);
    try {
      const orderData = {
        shippingAddress: { ...formData, country: 'France' },
        paymentMethod
      };

      const response = await orderService.create(orderData);
      const order = response.data.order;

      console.log('✅ Commande validée - Arrêt du timer et libération des réservations');
      
      // Arrêter le timer car la commande est validée
      stopTimer();
      
      // Libérer les réservations (elles sont maintenant converties en commande)
      try {
        await StockReservationService.releaseAllReservations();
        console.log('✅ Réservations libérées après commande validée');
      } catch (error) {
        console.error('❌ Erreur lors de la libération des réservations:', error);
      }

      showNotification(
        `🎉 Commande ${order.orderNumber} confirmée ! 📧 Email de confirmation envoyé à ${user.email}`, 
        'success'
      );
      await fetchCart();
      setConfirmOrderOpen(false);
      onClose();
      if (onSuccess) {
        onSuccess(); // Callback pour fermer le panier après succès
      }
      
    } catch (error) {
      showNotification(error.response?.data?.error || 'Erreur lors de la commande', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    console.log('❌ Annulation de la commande - Reprise du timer');
    
    // Reprendre le timer qui était en pause
    resumeTimer();
    
    onClose();
    if (onCancel) {
      onCancel(); // Callback pour rouvrir le panier
    }
  };

  // État pour savoir si on a déjà prolongé les réservations
  const [reservationsExtended, setReservationsExtended] = useState(false);

  // Mettre en pause le timer quand le checkout s'ouvre (une seule fois)
  useEffect(() => {
    if (open && cart.items.length > 0 && !reservationsExtended) {
      console.log('⏸️ Checkout ouvert - Mise en pause du timer et prolongation des réservations');
      
      // Mettre en pause le timer du panier
      pauseTimer();
      
      // Prolonger les réservations de stock pour chaque article
      cart.items.forEach(async (item) => {
        try {
          await StockReservationService.extendReservation(item.productVariantId, 5); // 5 minutes supplémentaires pour la commande
          console.log(`✅ Réservation prolongée pour le produit ${item.productVariantId}`);
        } catch (error) {
          console.error(`❌ Erreur prolongation réservation pour ${item.productVariantId}:`, error);
        }
      });
      
      setReservationsExtended(true);
      showNotification('⏸️ Timer mis en pause pendant votre commande', 'info');
    }
  }, [open, cart.items, pauseTimer, showNotification, reservationsExtended]);

  // Réinitialiser l'état des réservations quand le dialog se ferme
  useEffect(() => {
    if (!open) {
      setReservationsExtended(false);
    }
  }, [open]);

  return (
    <Dialog 
      open={open} 
      onClose={handleCancel} 
      maxWidth="sm" 
      fullWidth
      sx={{
        zIndex: (theme) => theme.zIndex.modal + 2, // Plus élevé que le CartDrawer
        '& .MuiDialog-paper': {
          zIndex: (theme) => theme.zIndex.modal + 2
        },
        '& .MuiBackdrop-root': {
          backgroundColor: 'rgba(0, 0, 0, 0.3)', // Backdrop semi-transparent
          backdropFilter: 'blur(2px)' // Léger flou pour voir le panier derrière
        }
      }}
    >
      <DialogTitle>Finaliser la commande</DialogTitle>
      
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>Adresse de livraison</Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                name="firstName"
                label="Prénom *"
                value={formData.firstName}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                name="lastName"
                label="Nom *"
                value={formData.lastName}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="address"
                label="Adresse *"
                value={formData.address}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={8}>
              <TextField
                fullWidth
                name="city"
                label="Ville *"
                value={formData.city}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                name="postalCode"
                label="Code postal *"
                value={formData.postalCode}
                onChange={handleChange}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>Mode de paiement</Typography>
          <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
            <FormLabel component="legend">Choisissez votre mode de paiement</FormLabel>
            
            {/* Solution alternative avec des boutons stylés comme des radio buttons */}
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
              {[
                { value: 'card', label: '💳 Carte bancaire (simulation)' },
                { value: 'paypal', label: '🅿️ PayPal (simulation)' },
                { value: 'bank', label: '🏦 Virement bancaire (simulation)' }
              ].map((option) => (
                <Button
                  key={option.value}
                  variant={paymentMethod === option.value ? 'contained' : 'outlined'}
                  color={paymentMethod === option.value ? 'primary' : 'inherit'}
                  onClick={() => {
                    console.log('🔄 Changement mode de paiement:', option.value);
                    setPaymentMethod(option.value);
                  }}
                  sx={{
                    justifyContent: 'flex-start',
                    textAlign: 'left',
                    padding: '12px 16px',
                    border: paymentMethod === option.value ? '2px solid' : '1px solid',
                    borderColor: paymentMethod === option.value ? 'primary.main' : 'grey.300',
                    backgroundColor: paymentMethod === option.value ? 'primary.main' : 'transparent',
                    color: paymentMethod === option.value ? 'primary.contrastText' : 'text.primary',
                    '&:hover': {
                      backgroundColor: paymentMethod === option.value ? 'primary.dark' : 'grey.50',
                      borderColor: paymentMethod === option.value ? 'primary.dark' : 'grey.400'
                    },
                    '&::before': {
                      content: paymentMethod === option.value ? '"●"' : '"○"',
                      marginRight: '8px',
                      fontSize: '1.2em'
                    }
                  }}
                >
                  {option.label}
                </Button>
              ))}
            </Box>
          </FormControl>


          {paymentMethod === 'card' && (
            <Alert severity="info" sx={{ mb: 2 }}>
              💳 Paiement par carte bancaire sécurisé (simulation)
            </Alert>
          )}
          {paymentMethod === 'paypal' && (
            <Alert severity="info" sx={{ mb: 2 }}>
              🅿️ Redirection vers PayPal pour finaliser le paiement (simulation)
            </Alert>
          )}
          {paymentMethod === 'bank' && (
            <Alert severity="info" sx={{ mb: 2 }}>
              🏦 Instructions de virement envoyées par email (simulation)
            </Alert>
          )}

          <Divider sx={{ my: 3 }} />

          <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="h6">Récapitulatif de commande</Typography>
            <Typography variant="body2">
              {cart.count} article(s) • Total: {cart.total.toFixed(2)}€
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Paiement: {paymentMethod === 'card' ? 'Carte bancaire' : paymentMethod === 'paypal' ? 'PayPal' : 'Virement bancaire'} (simulation)
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleCancel}>Annuler</Button>
        <Button 
          variant="contained" 
          onClick={handleOrderRequest}
          disabled={loading}
        >
          {loading ? 'Commande en cours...' : 'Confirmer la commande'}
        </Button>
      </DialogActions>

      <ConfirmDialog
        open={confirmOrderOpen}
        onClose={() => setConfirmOrderOpen(false)}
        onConfirm={handleOrderConfirm}
        title="Confirmer la commande"
        message={`Êtes-vous sûr de vouloir passer cette commande de ${cart.total.toFixed(2)}€ ?`}
        confirmText="Oui, commander"
        cancelText="Annuler"
        severity="info"
        loading={loading}
      />
    </Dialog>
  );
};

export default CheckoutSimple;
