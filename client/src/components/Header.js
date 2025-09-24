import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, Menu, MenuItem, Chip, Box, CircularProgress, Badge, IconButton } from '@mui/material';
import { ShoppingCart, Receipt, AdminPanelSettings, History } from '@mui/icons-material';
import ConfirmDialog from './ConfirmDialog';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useCartTimer } from '../contexts/CartTimerContext';
import AuthDialog from './AuthDialog';
import HeaderCartTimer from './HeaderCartTimer';
import CartDrawer from './CartDrawer';
import useOrdersCount from '../hooks/useOrdersCount';
import useExpiredItemsCount from '../hooks/useExpiredItemsCount';

const Header = ({ onShowOrders, onShowProducts, onShowAdmin, onShowExpiredItems, onNavigateHome }) => {
  const { user, logout, loading } = useAuth();
  const { cart } = useCart();
  const { recoverLostTimer } = useCartTimer();
  
  // Hooks pour les compteurs
  const pendingOrdersCount = useOrdersCount();
  const expiredItemsCount = useExpiredItemsCount();
  const [authOpen, setAuthOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [autoCheckout, setAutoCheckout] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [authMessage, setAuthMessage] = useState(null);
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogoutRequest = () => {
    setConfirmLogoutOpen(true);
    handleMenuClose();
  };

  const handleLogoutConfirm = () => {
    logout(() => {
      // Rediriger vers la page d'accueil après déconnexion
      if (onNavigateHome) {
        onNavigateHome();
      }
    });
    setConfirmLogoutOpen(false);
  };

  // Écouter l'événement pour ouvrir le panier et déclencher le checkout
  useEffect(() => {
    const handleOpenCartAndCheckout = (event) => {
      setCartOpen(true);
      setAutoCheckout(true);
      
      // Persister l'intention de checkout pour après la connexion
      localStorage.setItem('pendingCheckout', 'true');
    };

    window.addEventListener('openCartAndCheckout', handleOpenCartAndCheckout);
    
    return () => {
      window.removeEventListener('openCartAndCheckout', handleOpenCartAndCheckout);
    };
  }, []);

  // Vérifier s'il y a un checkout en attente après connexion
  useEffect(() => {
    if (user && localStorage.getItem('pendingCheckout') === 'true') {
      localStorage.removeItem('pendingCheckout');
      
      // Petit délai pour s'assurer que tout est initialisé
      setTimeout(() => {
        // Récupérer le timer perdu
        recoverLostTimer();
        
        setCartOpen(true);
        setAutoCheckout(true);
      }, 500);
    } else if (user) {
      // Même si pas de checkout en attente, essayer de récupérer un timer perdu
      setTimeout(() => {
        recoverLostTimer();
      }, 1000);
    }
  }, [user, recoverLostTimer]);

  const getRoleColor = (role) => {
    const colors = { admin: 'error', seller: 'warning', customer: 'info' };
    return colors[role] || 'default';
  };

  const getRoleLabel = (role) => {
    const labels = { admin: 'Admin', seller: 'Vendeur', customer: 'Client' };
    return labels[role] || role;
  };

  return (
    <>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography 
            variant="h5" 
            sx={{ 
              flexGrow: 1, 
              cursor: 'pointer',
              fontWeight: 800,
              background: 'linear-gradient(45deg, #ffffff 30%, #ffd700 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.5px',
              fontFamily: '"Poppins", "Inter", sans-serif'
            }}
            onClick={onShowProducts}
          >
            👟 SneakersShop
          </Typography>
          
                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                   {/* Timer du panier */}
                   <HeaderCartTimer />
                   
                   <IconButton color="inherit" onClick={() => setCartOpen(!cartOpen)}>
                     <Badge badgeContent={cart.count} color="secondary">
                       <ShoppingCart />
                     </Badge>
                   </IconButton>
                   
                  {user && user.role === 'customer' && (
                    <>
                      <IconButton color="inherit" onClick={onShowOrders} title="Mes commandes">
                        <Badge badgeContent={pendingOrdersCount} color="warning">
                          <Receipt />
                        </Badge>
                      </IconButton>
                      <IconButton color="inherit" onClick={onShowExpiredItems} title="Articles expirés">
                        <Badge badgeContent={expiredItemsCount} color="error">
                          <History />
                        </Badge>
                      </IconButton>
                    </>
                  )}
                   
                   {user && ['admin', 'seller'].includes(user.role) && (
                     <IconButton color="inherit" onClick={onShowAdmin}>
                       <AdminPanelSettings />
                     </IconButton>
                   )}
            
            {loading ? (
              <CircularProgress color="inherit" size={24} />
            ) : user ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip 
                  label={getRoleLabel(user.role)} 
                  color={getRoleColor(user.role)} 
                  size="small" 
                />
                <Button color="inherit" onClick={handleMenuOpen}>
                  {user.firstName}
                </Button>
                       <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                         <MenuItem onClick={handleLogoutRequest}>Déconnexion</MenuItem>
                       </Menu>
              </Box>
            ) : (
              <Button color="inherit" onClick={() => setAuthOpen(true)}>
                Connexion
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <AuthDialog 
        open={authOpen} 
        onClose={() => {
          setAuthOpen(false);
          setAuthMessage(null);
        }}
        message={authMessage}
      />
      <CartDrawer 
        open={cartOpen} 
        onClose={() => {
          setCartOpen(false);
          setAutoCheckout(false);
        }}
        onLoginRequest={() => {
          setCartOpen(false);
          setAuthMessage("Connectez-vous pour finaliser votre commande");
          setAuthOpen(true);
        }}
        autoCheckout={autoCheckout}
        onCheckoutStart={() => setAutoCheckout(false)}
      />

             <ConfirmDialog
               open={confirmLogoutOpen}
               onClose={() => setConfirmLogoutOpen(false)}
               onConfirm={handleLogoutConfirm}
               title="Déconnexion"
               message="Êtes-vous sûr de vouloir vous déconnecter ?"
               confirmText="Oui, déconnecter"
               cancelText="Rester connecté"
               severity="warning"
             />
           </>
         );
       };

       export default Header;
