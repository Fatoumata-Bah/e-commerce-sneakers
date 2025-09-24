import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Fade
} from '@mui/material';
import { 
  AccessTime, 
  ExtensionOutlined,
  Warning,
  ShoppingCart
} from '@mui/icons-material';
import { useCartTimer } from '../contexts/CartTimerContext';
import { useCart } from '../contexts/CartContext';

const HeaderCartTimer = () => {
  const { 
    timeRemaining, 
    isActive, 
    isPaused,
    showWarning,
    extendTimer, 
    formatTime,
    WARNING_THRESHOLD
  } = useCartTimer();

  const { cart } = useCart();
  const [showExtendDialog, setShowExtendDialog] = useState(false);

  // Afficher automatiquement le dialog quand le warning apparaît
  useEffect(() => {
    if (showWarning && isActive) {
      setShowExtendDialog(true);
    }
  }, [showWarning, isActive]);

  // Ne pas afficher si pas de timer actif
  if (!isActive || timeRemaining === null) return null;

  // Déterminer la couleur selon le temps restant
  const getTimerColor = () => {
    if (timeRemaining > WARNING_THRESHOLD) return 'success';
    if (timeRemaining > 120) return 'warning'; // 2 minutes
    return 'error';
  };

  const handleExtend = () => {
    extendTimer();
    setShowExtendDialog(false);
  };

  const handleBuyNow = () => {
    // Prolonger automatiquement le timer pour sécuriser la commande
    extendTimer();
    setShowExtendDialog(false);
    
    // Déclencher l'événement pour ouvrir le panier et commencer la commande
    // Nous utiliserons un événement personnalisé pour communiquer avec le Header/CartDrawer
    window.dispatchEvent(new CustomEvent('openCartAndCheckout', {
      detail: { 
        source: 'timer-urgency',
        extendReservation: true 
      }
    }));
  };

  return (
    <>
      <Fade in={isActive}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          mr: 2
        }}>
          <AccessTime 
            sx={{ 
              color: getTimerColor() === 'error' ? 'error.main' : 
                     getTimerColor() === 'warning' ? 'warning.main' : 'success.main',
              fontSize: '1.2rem',
              animation: timeRemaining <= 120 ? 'pulse 1s infinite' : 'none'
            }} 
          />
          
          <Chip
            label={isPaused ? `⏸️ ${formatTime(timeRemaining)} (PAUSE)` : formatTime(timeRemaining)}
            color={isPaused ? 'warning' : getTimerColor()}
            variant="filled"
            size="small"
            sx={{ 
              fontWeight: 700,
              fontSize: '0.85rem',
              animation: timeRemaining <= 60 && !isPaused ? 'pulse 1s infinite' : 'none',
              cursor: showWarning ? 'pointer' : 'default'
            }}
            onClick={showWarning ? () => setShowExtendDialog(true) : undefined}
          />
          
          {/* Bouton prolonger visible seulement en avertissement */}
          {showWarning && (
            <Fade in={showWarning}>
              <Button
                size="small"
                variant="outlined"
                color={getTimerColor()}
                startIcon={<ExtensionOutlined />}
                onClick={() => setShowExtendDialog(true)}
                sx={{ 
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  px: 1.5,
                  py: 0.5,
                  animation: timeRemaining <= 120 ? 'pulse 1.5s infinite' : 'none',
                  zIndex: (theme) => theme.zIndex.modal + 5,
                  position: 'relative'
                }}
              >
                Prolonger
              </Button>
            </Fade>
          )}
        </Box>
      </Fade>

      {/* Dialog de prolongation */}
      <Dialog 
        open={showExtendDialog} 
        onClose={() => setShowExtendDialog(false)}
        maxWidth="sm"
        fullWidth
        sx={{ zIndex: (theme) => theme.zIndex.modal + 10 }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          bgcolor: 'warning.50',
          borderBottom: '1px solid',
          borderColor: 'warning.200'
        }}>
          <Warning color="warning" />
          ⏰ Votre panier expire bientôt !
        </DialogTitle>
        
        <DialogContent sx={{ py: 3 }}>
          <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Plus que <strong>{formatTime(timeRemaining)}</strong> avant expiration !
            </Typography>
          </Alert>
          
          <Typography variant="body1" sx={{ mb: 2 }}>
            Souhaitez-vous prolonger la réservation de vos articles pour <strong>15 minutes supplémentaires</strong> ?
          </Typography>
          
          <Typography variant="body2" color="text.secondary">
            ⚠️ Si vous ne prolongez pas, vos articles seront automatiquement supprimés du panier à l'expiration du timer.
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, gap: 2, flexDirection: 'column' }}>
          {/* Bouton principal d'incitation */}
          <Button 
            onClick={handleBuyNow}
            variant="contained"
            color="error"
            size="large"
            startIcon={<ShoppingCart />}
            sx={{ 
              textTransform: 'none', 
              fontWeight: 700,
              fontSize: '1.1rem',
              py: 1.5,
              px: 4,
              width: '100%',
              bgcolor: 'error.main',
              '&:hover': { 
                bgcolor: 'error.dark',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(211, 47, 47, 0.4)'
              },
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%, 100%': { transform: 'scale(1)' },
                '50%': { transform: 'scale(1.02)' }
              }
            }}
          >
            🔥 Commander maintenant ({cart?.count || 0} article{cart?.count > 1 ? 's' : ''})
          </Button>
          
          {/* Boutons secondaires */}
          <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
            <Button 
              onClick={() => setShowExtendDialog(false)}
              variant="outlined"
              color="inherit"
              sx={{ 
                textTransform: 'none',
                flex: 1,
                color: 'text.secondary',
                borderColor: 'grey.300'
              }}
            >
              Laisser expirer
            </Button>
            <Button 
              onClick={handleExtend}
              variant="contained"
              color="warning"
              startIcon={<ExtensionOutlined />}
              sx={{ 
                textTransform: 'none', 
                fontWeight: 600,
                flex: 1,
                bgcolor: 'warning.main',
                '&:hover': { bgcolor: 'warning.dark' }
              }}
            >
              Prolonger de 15 min
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* CSS pour l'animation pulse */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.05);
          }
        }
      `}</style>
    </>
  );
};

export default HeaderCartTimer;
