import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  IconButton
} from '@mui/material';
import { Close, Inventory2, Add, Remove } from '@mui/icons-material';

const SizeSelectionDialog = ({ 
  open, 
  onClose, 
  product, 
  onAddToCart,
  loading,
  preselectedSize = null 
}) => {
  const [selectedVariant, setSelectedVariant] = useState(preselectedSize);
  const [quantity, setQuantity] = useState(1);

  // Reset quand le dialog s'ouvre
  React.useEffect(() => {
    if (open) {
      setSelectedVariant(preselectedSize);
      setQuantity(1);
    }
  }, [open, preselectedSize]);

  if (!product) return null;

  const availableVariants = product.ProductVariants?.filter(v => v.stock > 0) || [];
  const selectedVariantData = availableVariants.find(v => v.id === selectedVariant);

  const handleConfirm = () => {
    if (selectedVariant && selectedVariantData) {
      onAddToCart(product, selectedVariant, quantity);
    }
  };

  const getStockColor = (stock) => {
    if (stock <= 3) return '#e74c3c';
    if (stock <= 10) return '#f39c12';
    return '#27ae60';
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: '16px' }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 2
      }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Choisir une pointure
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {product.brand} • {product.name}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 0 }}>
        {/* Prix */}
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
            {parseFloat(product.basePrice).toFixed(2)}€
          </Typography>
        </Box>

        {/* Message si pointure présélectionnée */}
        {preselectedSize && (
          <Box sx={{ mb: 2, p: 2, bgcolor: 'success.light', borderRadius: '8px', color: 'success.dark' }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              ✨ Pointure présélectionnée selon vos filtres
            </Typography>
          </Box>
        )}

        {/* Grille des pointures */}
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
          Pointures disponibles ({availableVariants.length})
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {availableVariants.map((variant) => (
            <Grid item xs={6} sm={4} md={3} key={variant.id}>
              <Card
                sx={{
                  cursor: 'pointer',
                  border: selectedVariant === variant.id ? '2px solid' : '1px solid',
                  borderColor: selectedVariant === variant.id ? 'primary.main' : 'grey.300',
                  backgroundColor: selectedVariant === variant.id ? 'primary.light' : 'white',
                  transform: selectedVariant === variant.id ? 'scale(1.02)' : 'scale(1)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    transform: 'scale(1.02)',
                    boxShadow: 2
                  }
                }}
                onClick={() => setSelectedVariant(variant.id)}
              >
                <CardContent sx={{ p: 2, textAlign: 'center', '&:last-child': { pb: 2 } }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600,
                      color: selectedVariant === variant.id ? 'primary.main' : 'text.primary'
                    }}
                  >
                    {variant.size}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mt: 1 }}>
                    <Inventory2 
                      sx={{ 
                        fontSize: '0.9rem',
                        color: getStockColor(variant.stock)
                      }} 
                    />
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: getStockColor(variant.stock),
                        fontWeight: 500
                      }}
                    >
                      {variant.stock}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {availableVariants.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Aucune pointure disponible
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ce produit est actuellement en rupture de stock
            </Typography>
          </Box>
        )}

        {/* Quantité */}
        {selectedVariantData && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              Quantité
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                border: '1px solid',
                borderColor: 'grey.300',
                borderRadius: '8px',
                p: 1
              }}>
                <IconButton 
                  size="small"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  sx={{ minWidth: 'auto', p: 0.5 }}
                >
                  <Remove fontSize="small" />
                </IconButton>
                
                <Typography 
                  variant="h6" 
                  sx={{ 
                    minWidth: 40, 
                    textAlign: 'center',
                    fontWeight: 600,
                    mx: 1
                  }}
                >
                  {quantity}
                </Typography>
                
                <IconButton 
                  size="small"
                  onClick={() => setQuantity(Math.min(selectedVariantData.stock, quantity + 1))}
                  disabled={quantity >= selectedVariantData.stock}
                  sx={{ minWidth: 'auto', p: 0.5 }}
                >
                  <Add fontSize="small" />
                </IconButton>
              </Box>
              
              <Typography variant="body2" color="text.secondary">
                Maximum: {selectedVariantData.stock}
              </Typography>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          sx={{ borderRadius: '8px' }}
        >
          Annuler
        </Button>
        
        <Button 
          onClick={handleConfirm}
          variant="contained"
          disabled={!selectedVariant || loading}
          sx={{ 
            borderRadius: '8px',
            px: 3,
            fontWeight: 600
          }}
        >
          {loading ? 'Ajout...' : `Ajouter au panier (${quantity})`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SizeSelectionDialog;
