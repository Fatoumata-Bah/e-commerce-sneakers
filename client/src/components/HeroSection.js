import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Container, Grid, Chip, Card, CardMedia, CardContent } from '@mui/material';
import { ShoppingBag, TrendingUp, Verified } from '@mui/icons-material';
import { productService } from '../services/api';

const HeroSection = ({ onShopNow, onShowOffers }) => {
  const [products, setProducts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Charger tous les produits pour le carrousel
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        // Récupérer d'abord le nombre total de produits
        const firstResponse = await productService.getAll({ limit: 1 });
        const totalItems = firstResponse.data.pagination.totalItems;
        
        // Ensuite récupérer tous les produits
        const response = await productService.getAll({ limit: totalItems });
        
        // Mélanger aléatoirement le tableau de produits
        const shuffledProducts = [...response.data.products].sort(() => Math.random() - 0.5);
        setProducts(shuffledProducts);
      } catch (error) {
        console.error('Erreur lors du chargement des produits:', error);
      }
    };
    fetchAllProducts();
  }, []);

  // Animation automatique du carrousel
  useEffect(() => {
    if (products.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % products.length);
    }, 3000); // Change toutes les 3 secondes

    return () => clearInterval(interval);
  }, [products.length]);

  // Fonction pour obtenir l'image du produit
  const getProductImage = (product) => {
    if (product?.images && product.images.length > 0) {
      return product.images[0];
    }
    return 'https://via.placeholder.com/400x300/f8f9fa/6c757d?text=Sneaker';
  };

  return (
    <Box
      component="section"
      role="banner"
      aria-label="Section d'accueil avec présentation de la collection sneakers"
      sx={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d3748 100%)',
        color: 'white',
        py: { xs: 8, md: 12 },
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.03"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        }
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              {/* Badge tendance */}
              <Chip
                icon={<TrendingUp />}
                label="Collection Automne 2025"
                sx={{
                  backgroundColor: 'rgba(255, 107, 53, 0.9)',
                  color: 'white',
                  fontWeight: 600,
                  mb: 3,
                  '& .MuiChip-icon': { color: 'white' }
                }}
              />
              
              <Typography
                variant="h1"
                component="h1"
                sx={{
                  fontSize: { xs: '2.5rem', md: '2.8rem', lg: '3.2rem' },
                  fontWeight: 800,
                  mb: 2,
                  background: 'linear-gradient(45deg, #ffffff 30%, #ffd700 90%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  lineHeight: 1.1,
                  fontFamily: '"Poppins", "Inter", sans-serif'
                }}
              >
                Sneakers
                <br />
                <span style={{ color: '#ffd700' }}>Authentiques</span>
              </Typography>
              
              <Typography
                variant="h5"
                sx={{
                  mb: 4,
                  opacity: 0.9,
                  fontWeight: 400,
                  maxWidth: '400px',
                  lineHeight: 1.6
                }}
              >
                <strong>100+ références</strong> pour <strong>Hommes, Femmes & Enfants</strong>. 
                Gestion professionnelle des stocks par taille (EU, UK, US). 
                Des marques iconiques aux labels émergents. Qualité e-commerce premium.
              </Typography>
              
              {/* Points clés */}
              <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
                {[
                  { icon: <Verified />, text: '3 catégories' },
                  { icon: <ShoppingBag />, text: 'Stock temps réel' },
                  { icon: <TrendingUp />, text: 'Toutes tailles' }
                ].map((item, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ color: '#ffd700' }}>{item.icon}</Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {item.text}
                    </Typography>
                  </Box>
                ))}
              </Box>
              
              {/* CTA Buttons */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={onShopNow}
                  aria-label="Découvrir notre collection de sneakers premium"
                  sx={{
                    backgroundColor: '#ff6b35',
                    color: 'white',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    borderRadius: '12px',
                    '&:hover': {
                      backgroundColor: '#e64a19',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(255, 107, 53, 0.3)'
                    }
                  }}
                >
                  Découvrir la collection
                </Button>
                
                <Button
                  variant="outlined"
                  size="large"
                  onClick={onShowOffers}
                  aria-label="Voir les offres spéciales et nouveautés"
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    borderRadius: '12px',
                    '&:hover': {
                      borderColor: '#ffd700',
                      color: '#ffd700',
                      backgroundColor: 'rgba(255, 215, 0, 0.1)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(255, 215, 0, 0.2)'
                    }
                  }}
                >
                  🔥 Nouveautés
                </Button>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Box
              sx={{
                position: 'relative',
                textAlign: 'center',
                zIndex: 1
              }}
            >
              {/* Carrousel dynamique de sneakers */}
              <Box
                sx={{
                  position: 'relative',
                  height: { xs: '300px', md: '380px' },
                  width: '100%',
                  maxWidth: { xs: '400px', md: '520px' },
                  margin: '0 auto',
                  overflow: 'hidden',
                  borderRadius: '16px',
                  boxShadow: '0 15px 40px rgba(0,0,0,0.25)',
                  animation: 'float 3s ease-in-out infinite',
                  '@keyframes float': {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-8px)' }
                  }
                }}
              >
                {products.length > 0 && (
                  <Card
                    sx={{
                      height: '100%',
                      position: 'relative',
                      overflow: 'hidden',
                      borderRadius: '16px'
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="100%"
                      image={getProductImage(products[currentIndex])}
                      alt={products[currentIndex]?.name || 'Sneaker'}
                      sx={{
                        objectFit: 'cover',
                        transition: 'all 0.8s ease-in-out',
                        filter: 'brightness(1.1) saturate(1.2)',
                      }}
                    />
                    
                    {/* Overlay avec info produit */}
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                        color: 'white',
                        p: 2,
                        textAlign: 'left'
                      }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {products[currentIndex]?.name}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        {products[currentIndex]?.brand} • {products[currentIndex]?.basePrice}€
                      </Typography>
                    </Box>
                    
                    {/* Indicateur de défilement */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        background: 'rgba(255,255,255,0.9)',
                        borderRadius: '20px',
                        px: 1.5,
                        py: 0.5
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                        {currentIndex + 1} / {products.length}
                      </Typography>
                    </Box>
                  </Card>
                )}
                
                {/* Fallback si pas de produits */}
                {products.length === 0 && (
                  <Box
                    sx={{
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: '16px',
                      color: 'white'
                    }}
                  >
                    <Typography variant="h4">👟</Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
      
      {/* Section Statistiques */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={6} md={3} textAlign="center">
            <Typography variant="h3" sx={{ fontWeight: 800, color: '#ffd700', mb: 1 }}>
              100+
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Références
            </Typography>
          </Grid>
          <Grid item xs={6} md={3} textAlign="center">
            <Typography variant="h3" sx={{ fontWeight: 800, color: '#ffd700', mb: 1 }}>
              3
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Catégories
            </Typography>
          </Grid>
          <Grid item xs={6} md={3} textAlign="center">
            <Typography variant="h3" sx={{ fontWeight: 800, color: '#ffd700', mb: 1 }}>
              24/7
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Stock temps réel
            </Typography>
          </Grid>
          <Grid item xs={6} md={3} textAlign="center">
            <Typography variant="h3" sx={{ fontWeight: 800, color: '#ffd700', mb: 1 }}>
              RGPD
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Conformité
            </Typography>
          </Grid>
        </Grid>
      </Container>
      
      {/* Section Catégories - Design Horizontal Compact */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 600,
              color: 'white',
              letterSpacing: '0.5px',
              fontSize: { xs: '1.5rem', md: '1.75rem' }
            }}
          >
            Pour Toute la
            <Box component="span" sx={{ 
              fontWeight: 700, 
              background: 'linear-gradient(45deg, #ffd700 30%, #ff6b35 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              ml: 1
            }}>
              Famille
            </Box>
          </Typography>
        </Box>

        <Box 
          sx={{ 
            display: 'flex', 
            gap: 3, 
            justifyContent: 'center',
            flexWrap: { xs: 'wrap', md: 'nowrap' },
            maxWidth: '900px',
            mx: 'auto'
          }}
        >
          {[
            {
              category: 'Femmes',
              icon: '👠',
              gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              description: 'Style & Confort'
            },
            {
              category: 'Hommes', 
              icon: '👟',
              gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              description: 'Sport & Lifestyle'
            },
            {
              category: 'Enfants',
              icon: '🎨',
              gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              description: 'Sécurité & Fun'
            }
          ].map((item, index) => (
            <Box
              key={item.category}
              sx={{
                flex: '1 1 280px',
                maxWidth: { xs: '100%', md: '300px' },
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(15px)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '16px',
                p: 3,
                textAlign: 'center',
                position: 'relative',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  background: 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid rgba(255, 215, 0, 0.3)',
                  boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
                  '& .category-icon': {
                    transform: 'scale(1.1)',
                  },
                  '& .category-gradient': {
                    opacity: 1,
                  }
                }
              }}
            >
              {/* Gradient Top Border */}
              <Box
                className="category-gradient"
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: item.gradient,
                  borderRadius: '16px 16px 0 0',
                  opacity: 0.7,
                  transition: 'opacity 0.3s ease'
                }}
              />

              {/* Content Horizontal Layout */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {/* Icon */}
                <Box
                  className="category-icon"
                  sx={{
                    fontSize: '2.5rem',
                    transition: 'transform 0.3s ease',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                    flexShrink: 0
                  }}
                >
                  {item.icon}
                </Box>

                {/* Text Content */}
                <Box sx={{ textAlign: 'left', flex: 1 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: 'white',
                      mb: 0.5,
                      fontSize: '1.1rem'
                    }}
                  >
                    {item.category}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#ffd700',
                      fontWeight: 500,
                      fontSize: '0.85rem',
                      opacity: 0.9
                    }}
                  >
                    {item.description}
                  </Typography>
                </Box>

                {/* Arrow Indicator */}
                <Box
                  sx={{
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontSize: '1.2rem',
                    transition: 'all 0.3s ease',
                    flexShrink: 0,
                    '.category-box:hover &': {
                      color: '#ffd700',
                      transform: 'translateX(4px)'
                    }
                  }}
                >
                  →
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default HeroSection;
