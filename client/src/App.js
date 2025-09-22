import React, { useState } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Container, Typography, Box, Toolbar } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import ProductCatalog from './components/ProductCatalog';
import OrdersList from './components/OrdersList';
import AdminDashboard from './components/AdminDashboard';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2c3e50',      // Bleu marine sophistiqué
      light: '#34495e',
      dark: '#1a252f',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#e74c3c',      // Rouge énergique pour CTAs
      light: '#ec7063',
      dark: '#c0392b',
      contrastText: '#ffffff'
    },
    accent: {
      main: '#f39c12',      // Orange premium pour highlights
      light: '#f4d03f',
      dark: '#d68910'
    },
    background: {
      default: '#fafafa',   // Fond très léger
      paper: '#ffffff'
    },
    text: {
      primary: '#2c3e50',
      secondary: '#7f8c8d'
    },
    success: {
      main: '#27ae60',      // Vert pour stock/succès
      light: '#58d68d',
      dark: '#1e8449'
    },
    warning: {
      main: '#f39c12',      // Orange pour alertes
      light: '#f4d03f',
      dark: '#d68910'
    },
    error: {
      main: '#e74c3c',      // Rouge pour erreurs
      light: '#ec7063',
      dark: '#c0392b'
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
        return (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Mes commandes
            </Typography>
            <OrdersList />
          </Box>
        );
      case 'admin':
        return <AdminDashboard />;
      case 'products':
      default:
        return (
          <>
            <HeroSection onShopNow={() => {
              // Scroll vers le catalogue
              const catalogElement = document.getElementById('product-catalog');
              if (catalogElement) {
                catalogElement.scrollIntoView({ behavior: 'smooth' });
              }
            }} />
            <Container maxWidth="lg" sx={{ py: 6 }} id="product-catalog">
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
        onShowOrders={() => setCurrentView('orders')} 
        onShowProducts={() => setCurrentView('products')}
        onShowAdmin={() => setCurrentView('admin')}
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
            <AppContent />
          </CartProvider>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
