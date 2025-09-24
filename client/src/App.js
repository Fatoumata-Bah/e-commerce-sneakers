import React, { useState } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Container, Typography, Box, Toolbar } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { FiltersProvider, useFilters } from './contexts/FiltersContext';
import { CartTimerProvider } from './contexts/CartTimerContext';
import AuthFiltersSync from './components/AuthFiltersSync';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import AnimatedBackground from './components/AnimatedBackground';
import ProductCatalog from './components/ProductCatalog';
import OrdersList from './components/OrdersList';
import ExpiredItemsHistory from './components/ExpiredItemsHistory';
import AdminDashboard from './components/AdminDashboard';
import CookieBanner from './components/CookieBanner';
import PrivacyPolicy from './components/PrivacyPolicy';
import LegalNotices from './components/LegalNotices';
import Footer from './components/Footer';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2d3748',      // Gris anthracite premium
      light: '#4a5568',
      dark: '#1a1a1a',      // Noir premium
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#ff6b35',      // Orange énergique SneakersShop
      light: '#ff8a65',
      dark: '#e64a19',
      contrastText: '#ffffff'
    },
    accent: {
      main: '#ffd700',      // Or premium pour highlights
      light: '#ffeb3b',
      dark: '#ffa000'
    },
    background: {
      default: '#f7fafc',   // Gris très clair
      paper: '#ffffff'
    },
    text: {
      primary: '#1a1a1a',   // Noir premium
      secondary: '#a0aec0'   // Gris moyen
    },
    success: {
      main: '#48bb78',      // Vert moderne
      light: '#68d391',
      dark: '#38a169'
    },
    warning: {
      main: '#ed8936',      // Orange alerte
      light: '#f6ad55',
      dark: '#dd6b20'
    },
    error: {
      main: '#f56565',      // Rouge moderne
      light: '#fc8181',
      dark: '#e53e3e'
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.02em'
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.01em'
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 500,
      lineHeight: 1.5
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.5
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
      borderRadius: '8px'
    }
  },
  shape: {
    borderRadius: 12
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          padding: '10px 24px',
          fontSize: '0.95rem',
          fontWeight: 600,
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transform: 'translateY(-1px)'
          },
          transition: 'all 0.2s ease-in-out'
        },
        contained: {
          '&:hover': {
            boxShadow: '0 6px 16px rgba(0,0,0,0.2)'
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.06)',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            transform: 'translateY(-2px)'
          },
          transition: 'all 0.3s ease-in-out'
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '6px',
          fontWeight: 500
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px'
          }
        }
      }
    }
  }
});

const AppContent = () => {
  const [currentView, setCurrentView] = useState('products');
  const { user } = useAuth();
  const { setCategoryFilter } = useFilters();

  // Fonction de navigation qui nettoie automatiquement les hash
  const navigateTo = (view) => {
    // Nettoyer l'URL des hash si présents
    if (window.location.hash) {
      window.history.replaceState(null, null, window.location.pathname);
    }
    setCurrentView(view);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'orders':
        // Seuls les clients peuvent accéder à "Mes commandes"
        if (!user || user.role !== 'customer') {
          return (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" component="h1" gutterBottom color="error">
                Accès non autorisé
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Cette page est réservée aux clients. Les administrateurs et vendeurs ont accès à la gestion des commandes via le Dashboard.
              </Typography>
            </Box>
          );
        }
        return <OrdersList />;
      case 'expired-items':
        if (!user || user.role !== 'customer') {
          return (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary">
                Cette page est réservée aux clients.
              </Typography>
            </Box>
          );
        }
        return <ExpiredItemsHistory />;
      case 'admin':
        return <AdminDashboard />;
      case 'privacy':
        return <PrivacyPolicy />;
      case 'legal':
        return <LegalNotices />;
      case 'products':
      default:
        return (
          <>
            <HeroSection 
              onShopNow={(category = null) => {
                // Si une catégorie est spécifiée, l'appliquer au filtre
                if (category) {
                  setCategoryFilter(category);
                }
                // Scroll vers le catalogue
                const catalogElement = document.getElementById('product-catalog');
                if (catalogElement) {
                  catalogElement.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              onShowOffers={() => {
                // Scroll vers le catalogue avec focus sur les nouveautés
                const catalogElement = document.getElementById('product-catalog');
                if (catalogElement) {
                  catalogElement.scrollIntoView({ behavior: 'smooth' });
                  // TODO: Filtrer par nouveautés quand cette fonctionnalité sera implémentée
                }
              }}
            />
            <Container maxWidth="lg" sx={{ py: 8 }} id="product-catalog">
              <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
                  Notre Collection
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '600px', mx: 'auto' }}>
                  Découvrez les dernières tendances sneakers avec notre sélection premium de marques authentiques
                </Typography>
              </Box>
              <ProductCatalog />
            </Container>
          </>
        );
    }
  };

  return (
    <>
      {/* Skip link pour l'accessibilité */}
      <a href="#main-content" className="skip-link">
        Aller au contenu principal
      </a>
      
      <Header 
        onShowOrders={() => navigateTo('orders')} 
        onShowProducts={() => navigateTo('products')}
        onShowAdmin={() => navigateTo('admin')}
        onShowExpiredItems={() => navigateTo('expired-items')}
        onShowPrivacy={() => navigateTo('privacy')}
        onShowLegal={() => navigateTo('legal')}
        onNavigateHome={() => navigateTo('home')}
      />
      {/* Espacement pour le header fixe */}
      <Toolbar />
      <Box 
        component="main"
        id="main-content"
        sx={{ minHeight: '100vh' }}
        role="main"
        aria-label="Contenu principal"
      >
        {renderContent()}
      </Box>
      
      {/* Footer avec liens légaux */}
      <Footer 
        onShowPrivacy={() => navigateTo('privacy')}
        onShowLegal={() => navigateTo('legal')}
      />
      
      {/* Bandeau de cookies RGPD */}
      <CookieBanner />
      
    </>
  );
};

function App() {

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NotificationProvider>
        <AuthProvider>
          <CartProvider>
            <CartTimerProvider>
              <FiltersProvider>
                <AuthFiltersSync>
                  <AnimatedBackground />
                  <AppContent />
                </AuthFiltersSync>
              </FiltersProvider>
            </CartTimerProvider>
          </CartProvider>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
