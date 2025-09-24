import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Alert,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip
} from '@mui/material';
import { 
  AccessTime, 
  Warning, 
  ExtensionOutlined,
  ShoppingCartOutlined 
} from '@mui/icons-material';
import { useCartTimer } from '../contexts/CartTimerContext';

const CartTimer = () => {
  const { 
    timeRemaining, 
    isActive, 
    isExpired, 
    showWarning, 
    extendTimer, 
    formatTime,
    CART_DURATION,
    WARNING_THRESHOLD
  } = useCartTimer();

  const [showExtendDialog, setShowExtendDialog] = useState(false);

  if (!isActive && !isExpired) return null;

  // Calculer le pourcentage de temps écoulé
  const progressPercentage = timeRemaining ? ((CART_DURATION - timeRemaining) / CART_DURATION) * 100 : 100;
  
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

  // Si le panier a expiré
  if (isExpired) {
    return (
      <Alert 
        severity="warning" 
        icon={<ShoppingCartOutlined />}
        sx={{ 
          mb: 2, 
          borderRadius: 2,
          '& .MuiAlert-message': { width: '100%' }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Panier expiré
            </Typography>
            <Typography variant="body2">
              Les articles ont été mis de côté. Vous pouvez les récupérer en les ajoutant à nouveau.
            </Typography>
          </Box>
        </Box>
      </Alert>
    );
  }

  // Affichage du timer actif
  return (
    <>
      <Box 
        sx={{ 
          mb: 2, 
          p: 2, 
          borderRadius: 2, 
          bgcolor: showWarning ? 'error.50' : 'success.50',
          border: `1px solid ${showWarning ? 'error.200' : 'success.200'}`,
          transition: 'all 0.3s ease'
        }}
      >
        {/* Header avec icône et temps */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccessTime 
              sx={{ 
                color: getTimerColor() === 'error' ? 'error.main' : 
                       getTimerColor() === 'warning' ? 'warning.main' : 'success.main',
                animation: showWarning ? 'pulse 1s infinite' : 'none'
              }} 
            />
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Réservation du panier
            </Typography>
          </Box>
          
          <Chip
            label={formatTime(timeRemaining)}
            color={getTimerColor()}
            variant="filled"
            sx={{ 
              fontWeight: 700,
              fontSize: '1rem',
              animation: timeRemaining <= 60 ? 'pulse 1s infinite' : 'none'
            }}
          />
        </Box>

        {/* Barre de progression */}
        <LinearProgress 
          variant="determinate" 
          value={progressPercentage}
          color={getTimerColor()}
          sx={{ 
            mb: 2, 
            height: 6, 
            borderRadius: 3,
            bgcolor: 'grey.200'
          }} 
        />

        {/* Message et bouton */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {showWarning 
              ? '⚠️ Votre panier expire bientôt !'
              : '✅ Vos articles sont réservés'
            }
          </Typography>
          
          <Button
            size="small"
            variant="outlined"
            color={getTimerColor()}
            startIcon={<ExtensionOutlined />}
            onClick={() => setShowExtendDialog(true)}
            sx={{ 
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2
            }}
          >
            Prolonger
          </Button>
        </Box>

        {/* Avertissement urgent */}
        {timeRemaining <= 120 && (
          <Alert 
            severity="error" 
            icon={<Warning />}
            sx={{ mt: 2, borderRadius: 2 }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              ⏰ Plus que {formatTime(timeRemaining)} ! Finalisez votre commande rapidement.
            </Typography>
          </Alert>
        )}
      </Box>

      {/* Dialog de confirmation pour prolonger */}
      <Dialog 
        open={showExtendDialog} 
        onClose={() => setShowExtendDialog(false)}
        maxWidth="sm"
        fullWidth
        sx={{ zIndex: (theme) => theme.zIndex.modal + 3 }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ExtensionOutlined color="primary" />
          Prolonger la réservation du panier
        </DialogTitle>
        
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Voulez-vous prolonger la réservation de vos articles pour <strong>15 minutes supplémentaires</strong> ?
          </Typography>
          
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            <Typography variant="body2">
              💡 <strong>Astuce :</strong> Cette fonctionnalité vous permet de prendre le temps de finaliser votre commande sans perdre vos articles préférés.
            </Typography>
          </Alert>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button 
            onClick={() => setShowExtendDialog(false)}
            variant="outlined"
            sx={{ textTransform: 'none' }}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleExtend}
            variant="contained"
            startIcon={<ExtensionOutlined />}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Prolonger de 15 min
          </Button>
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
            opacity: 0.8;
            transform: scale(1.05);
          }
        }
      `}</style>
    </>
  );
};

export default CartTimer;
