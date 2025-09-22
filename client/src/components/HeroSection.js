import React from 'react';
import { Box, Typography, Button, Container, Grid, Chip } from '@mui/material';
import { ShoppingBag, TrendingUp, Verified } from '@mui/icons-material';

const HeroSection = ({ onShopNow }) => {
  return (
    <Box
      component="section"
      role="banner"
      aria-label="Section d'accueil avec présentation de la collection sneakers"
      sx={{
        background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
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
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={7}>
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              {/* Badge tendance */}
              <Chip
                icon={<TrendingUp />}
                label="Collection Automne 2025"
                sx={{
                  backgroundColor: 'rgba(231, 76, 60, 0.9)',
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
                  fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
                  fontWeight: 800,
                  mb: 2,
                  background: 'linear-gradient(45deg, #ffffff 30%, #f39c12 90%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  lineHeight: 1.1
                }}
              >
                Sneakers
                <br />
                <span style={{ color: '#f39c12' }}>Premium</span>
              </Typography>
              
              <Typography
                variant="h5"
                sx={{
                  mb: 4,
                  opacity: 0.9,
                  fontWeight: 400,
                  maxWidth: '600px',
                  lineHeight: 1.6
                }}
              >
                Découvrez notre collection exclusive de sneakers Nike & Adidas. 
                Authenticité garantie, livraison rapide, satisfaction 100%.
              </Typography>
              
              {/* Points clés */}
              <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
                {[
                  { icon: <Verified />, text: 'Authenticité garantie' },
                  { icon: <ShoppingBag />, text: 'Livraison gratuite' },
                  { icon: <TrendingUp />, text: 'Dernières tendances' }
                ].map((item, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ color: '#f39c12' }}>{item.icon}</Box>
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
                    backgroundColor: '#e74c3c',
                    color: 'white',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    borderRadius: '12px',
                    '&:hover': {
                      backgroundColor: '#c0392b',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(231, 76, 60, 0.3)'
                    }
                  }}
                >
                  Découvrir la collection
                </Button>
                
                <Button
                  variant="outlined"
                  size="large"
                  aria-label="Découvrir nos marques partenaires Nike et Adidas"
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    borderRadius: '12px',
                    '&:hover': {
                      borderColor: '#f39c12',
                      color: '#f39c12',
                      backgroundColor: 'rgba(243, 156, 18, 0.1)'
                    }
                  }}
                >
                  Nos marques
                </Button>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={5}>
            <Box
              sx={{
                position: 'relative',
                textAlign: 'center',
                zIndex: 1
              }}
            >
              {/* Illustration sneakers stylisée */}
              <Box
                sx={{
                  fontSize: { xs: '8rem', md: '12rem' },
                  lineHeight: 1,
                  opacity: 0.9,
                  filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))',
                  animation: 'float 3s ease-in-out infinite',
                  '@keyframes float': {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' }
                  }
                }}
                role="img"
                aria-label="Illustration de sneaker premium"
              >
                👟
              </Box>
              
              {/* Badges flottants */}
              <Box
                sx={{
                  position: 'absolute',
                  top: '20%',
                  right: '10%',
                  animation: 'pulse 2s ease-in-out infinite'
                }}
              >
                <Chip
                  label="Nouveau"
                  sx={{
                    backgroundColor: '#f39c12',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.8rem'
                  }}
                />
              </Box>
              
              <Box
                sx={{
                  position: 'absolute',
                  bottom: '30%',
                  left: '5%',
                  animation: 'pulse 2s ease-in-out infinite 1s'
                }}
              >
                <Chip
                  label="-20%"
                  sx={{
                    backgroundColor: '#e74c3c',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.9rem'
                  }}
                />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default HeroSection;
