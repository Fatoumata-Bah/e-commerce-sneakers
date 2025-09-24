import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider,
  Chip
} from '@mui/material';
import {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  Email,
  Phone,
  LocationOn,
  Security,
  Gavel,
  Cookie
} from '@mui/icons-material';

const Footer = ({ onShowPrivacy, onShowLegal }) => {
  const handleClearHashAndNavigate = (action) => {
    // Nettoyer l'URL des hash si présents
    if (window.location.hash) {
      window.history.replaceState(null, null, window.location.pathname);
    }
    // Exécuter l'action de navigation
    if (action) action();
  };

  const footerLinks = {
    company: [
      { label: 'À propos de SneakersShop', onClick: () => handleClearHashAndNavigate() },
      { label: 'Notre histoire', onClick: () => handleClearHashAndNavigate() },
      { label: 'Carrières', onClick: () => handleClearHashAndNavigate() },
      { label: 'Presse', onClick: () => handleClearHashAndNavigate() }
    ],
    help: [
      { label: 'Centre d\'aide', onClick: () => handleClearHashAndNavigate() },
      { label: 'Livraison & Retours', onClick: () => handleClearHashAndNavigate() },
      { label: 'Guide des tailles', onClick: () => handleClearHashAndNavigate() },
      { label: 'Nous contacter', onClick: () => handleClearHashAndNavigate() }
    ],
    legal: [
      { label: 'Mentions légales', onClick: () => handleClearHashAndNavigate(onShowLegal) },
      { label: 'Politique de confidentialité', onClick: () => handleClearHashAndNavigate(onShowPrivacy) },
      { label: 'CGU & CGV', onClick: () => handleClearHashAndNavigate(onShowLegal) },
      { label: 'Gestion des cookies', onClick: () => handleClearHashAndNavigate() }
    ]
  };

  const socialLinks = [
    { icon: <Facebook />, href: 'https://facebook.com/solehub', label: 'Facebook' },
    { icon: <Instagram />, href: 'https://instagram.com/solehub', label: 'Instagram' },
    { icon: <Twitter />, href: 'https://twitter.com/solehub', label: 'Twitter' },
    { icon: <LinkedIn />, href: 'https://linkedin.com/company/solehub', label: 'LinkedIn' }
  ];

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#1a1a1a',
        color: 'white',
        py: 6,
        mt: 8
      }}
    >
      <Container maxWidth="lg">
        {/* Main footer content */}
        <Grid container spacing={4}>
          {/* Brand section */}
          <Grid item xs={12} md={4}>
            <Typography variant="h5" sx={{ 
              fontWeight: 800, 
              mb: 2,
              fontFamily: '"Poppins", "Inter", sans-serif',
              background: 'linear-gradient(45deg, #ffffff 30%, #ffd700 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              👟 SneakersShop
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, color: '#a0aec0', lineHeight: 1.6 }}>
              Votre marketplace de sneakers authentiques. 
              Découvrez les dernières tendances Nike, Adidas, Jordan et plus encore.
            </Typography>
            
            {/* Contact info */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Email sx={{ mr: 1, fontSize: '1rem', color: '#ff6b35' }} />
                <Typography variant="body2" sx={{ color: '#a0aec0' }}>
                  fatoumata-bah@epitech.eu
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Phone sx={{ mr: 1, fontSize: '1rem', color: '#ff6b35' }} />
                <Typography variant="body2" sx={{ color: '#a0aec0' }}>
                  +33 7 00 00 00 00
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationOn sx={{ mr: 1, fontSize: '1rem', color: '#ff6b35' }} />
                <Typography variant="body2" sx={{ color: '#a0aec0' }}>
                  Epitech: 2 Rue du Professeur Charles Appleton, 69007 Lyon
                </Typography>
              </Box>
            </Box>

            {/* Social links */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              {socialLinks.map((social, index) => (
                <IconButton
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  sx={{
                    color: '#a0aec0',
                    '&:hover': {
                      color: '#ffd700',
                      backgroundColor: 'rgba(255, 215, 0, 0.1)'
                    }
                  }}
                >
                  {social.icon}
                </IconButton>
              ))}
            </Box>
          </Grid>

          {/* Company links */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#ffd700' }}>
              Entreprise
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {footerLinks.company.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  sx={{
                    color: '#a0aec0',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    '&:hover': {
                      color: '#ffffff',
                      textDecoration: 'underline'
                    }
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </Box>
          </Grid>

          {/* Help links */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#ffd700' }}>
              Aide
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {footerLinks.help.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  sx={{
                    color: '#a0aec0',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    '&:hover': {
                      color: '#ffffff',
                      textDecoration: 'underline'
                    }
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </Box>
          </Grid>

          {/* Legal links */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#ffd700' }}>
              Légal
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {footerLinks.legal.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  onClick={link.onClick}
                  sx={{
                    color: '#a0aec0',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    '&:hover': {
                      color: '#ffffff',
                      textDecoration: 'underline'
                    }
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </Box>
          </Grid>

          {/* Newsletter */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#ffd700' }}>
              Garanties
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Chip
                icon={<Security />}
                label="Authenticité garantie"
                size="small"
                sx={{
                  backgroundColor: 'rgba(72, 187, 120, 0.2)',
                  color: '#48bb78',
                  border: '1px solid #48bb78'
                }}
              />
              <Chip
                icon={<Gavel />}
                label="Conforme RGPD"
                size="small"
                sx={{
                  backgroundColor: 'rgba(255, 107, 53, 0.2)',
                  color: '#ff6b35',
                  border: '1px solid #ff6b35'
                }}
              />
              <Chip
                icon={<Cookie />}
                label="Cookies sécurisés"
                size="small"
                sx={{
                  backgroundColor: 'rgba(255, 215, 0, 0.2)',
                  color: '#ffd700',
                  border: '1px solid #ffd700'
                }}
              />
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: '#2d3748' }} />

        {/* Bottom footer */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Typography variant="body2" sx={{ color: '#a0aec0' }}>
            © {new Date().getFullYear()} SneakersShop. Tous droits réservés.
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Typography variant="body2" sx={{ color: '#a0aec0' }}>
              Paiement sécurisé
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {['💳', '🏦', '📱'].map((icon, index) => (
                <Box
                  key={index}
                  sx={{
                    fontSize: '1.2rem',
                    opacity: 0.7
                  }}
                >
                  {icon}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
