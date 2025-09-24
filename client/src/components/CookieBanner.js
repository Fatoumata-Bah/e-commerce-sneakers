import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Collapse,
  Switch,
  FormControlLabel,
  Divider,
  Link
} from '@mui/material';
import {
  Close,
  Settings,
  Cookie,
  Security,
  Analytics,
  Campaign
} from '@mui/icons-material';

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [cookiePreferences, setCookiePreferences] = useState({
    necessary: true, // Toujours activés
    analytics: false,
    marketing: false,
    preferences: false
  });

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà donné son consentement
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setIsVisible(true);
    } else {
      // Charger les préférences sauvegardées
      try {
        const savedPreferences = JSON.parse(consent);
        setCookiePreferences(savedPreferences);
      } catch (error) {
        console.error('Erreur lors du chargement des préférences cookies:', error);
        setIsVisible(true);
      }
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('cookie-consent', JSON.stringify(allAccepted));
    setCookiePreferences(allAccepted);
    setIsVisible(false);
    
    // Activer les services tiers si nécessaire
    enableThirdPartyServices(allAccepted);
  };

  const handleRejectAll = () => {
    const onlyNecessary = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('cookie-consent', JSON.stringify(onlyNecessary));
    setCookiePreferences(onlyNecessary);
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    const preferences = {
      ...cookiePreferences,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('cookie-consent', JSON.stringify(preferences));
    setIsVisible(false);
    
    // Activer/désactiver les services selon les préférences
    enableThirdPartyServices(preferences);
  };

  const enableThirdPartyServices = (preferences) => {
    // Ici vous pourriez activer/désactiver Google Analytics, Facebook Pixel, etc.
    if (preferences.analytics) {
      // Exemple: gtag('config', 'GA_MEASUREMENT_ID');
    }
    
    if (preferences.marketing) {
      // Exemple: fbq('init', 'FACEBOOK_PIXEL_ID');
    }
    
    if (preferences.preferences) {
    }
  };

  const handlePreferenceChange = (category) => {
    if (category === 'necessary') return; // Les cookies nécessaires ne peuvent pas être désactivés
    
    setCookiePreferences(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const cookieCategories = [
    {
      key: 'necessary',
      name: 'Cookies Nécessaires',
      description: 'Ces cookies sont essentiels au fonctionnement du site et ne peuvent pas être désactivés.',
      icon: <Security color="success" />,
      required: true
    },
    {
      key: 'preferences',
      name: 'Cookies de Préférences',
      description: 'Ces cookies nous permettent de mémoriser vos choix et de personnaliser votre expérience.',
      icon: <Settings color="primary" />
    },
    {
      key: 'analytics',
      name: 'Cookies d\'Analyse',
      description: 'Ces cookies nous aident à comprendre comment vous utilisez notre site pour l\'améliorer.',
      icon: <Analytics color="info" />
    },
    {
      key: 'marketing',
      name: 'Cookies Marketing',
      description: 'Ces cookies sont utilisés pour vous proposer des publicités pertinentes.',
      icon: <Campaign color="warning" />
    }
  ];

  if (!isVisible) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        p: 2
      }}
    >
      <Paper
        elevation={8}
        sx={{
          maxWidth: '1200px',
          mx: 'auto',
          p: 3,
          borderRadius: '16px 16px 0 0',
          background: 'linear-gradient(135deg, #ffffff 0%, #f7fafc 100%)',
          border: '1px solid rgba(45, 55, 72, 0.1)',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.15)'
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Cookie sx={{ color: '#ff6b35', mr: 1, fontSize: '1.5rem' }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600, color: '#1a1a1a' }}>
            🍪 Gestion des Cookies - SneakersShop
          </Typography>
          <IconButton onClick={() => setIsVisible(false)} size="small">
            <Close />
          </IconButton>
        </Box>

        {/* Description principale */}
        <Typography variant="body1" sx={{ mb: 3, color: '#2d3748', lineHeight: 1.6 }}>
          Nous utilisons des cookies pour améliorer votre expérience sur SneakersShop, analyser notre trafic et personnaliser le contenu. 
          Vous pouvez choisir quels types de cookies vous souhaitez accepter.
          {' '}
          <Link 
            component="button"
            onClick={() => {
              // Nettoyer l'URL et ne rien faire pour l'instant
              if (window.location.hash) {
                window.history.replaceState(null, null, window.location.pathname);
              }
            }}
            sx={{ color: '#ff6b35', fontWeight: 500, textDecoration: 'underline', border: 'none', background: 'none', cursor: 'pointer' }}
          >
            En savoir plus sur notre politique de confidentialité
          </Link>
        </Typography>

        {/* Paramètres détaillés */}
        <Collapse in={showSettings}>
          <Box sx={{ mb: 3 }}>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1a1a1a' }}>
              Paramètres des Cookies
            </Typography>
            
            {cookieCategories.map((category) => (
              <Box key={category.key} sx={{ mb: 2, p: 2, backgroundColor: '#f7fafc', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  {category.icon}
                  <Typography variant="subtitle1" sx={{ ml: 1, fontWeight: 600, flexGrow: 1 }}>
                    {category.name}
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={cookiePreferences[category.key]}
                        onChange={() => handlePreferenceChange(category.key)}
                        disabled={category.required}
                        color="primary"
                      />
                    }
                    label=""
                  />
                </Box>
                <Typography variant="body2" sx={{ color: '#a0aec0', ml: 4 }}>
                  {category.description}
                </Typography>
              </Box>
            ))}
          </Box>
        </Collapse>

        {/* Boutons d'action */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <Button
            variant="contained"
            onClick={handleAcceptAll}
            sx={{
              backgroundColor: '#ff6b35',
              color: 'white',
              fontWeight: 600,
              px: 3,
              '&:hover': {
                backgroundColor: '#e64a19'
              }
            }}
          >
            Accepter tous les cookies
          </Button>
          
          <Button
            variant="outlined"
            onClick={handleRejectAll}
            sx={{
              borderColor: '#a0aec0',
              color: '#2d3748',
              fontWeight: 600,
              px: 3,
              '&:hover': {
                borderColor: '#2d3748',
                backgroundColor: 'rgba(45, 55, 72, 0.05)'
              }
            }}
          >
            Rejeter tout
          </Button>

          <Button
            variant="text"
            startIcon={<Settings />}
            onClick={() => setShowSettings(!showSettings)}
            sx={{
              color: '#2d3748',
              fontWeight: 500
            }}
          >
            {showSettings ? 'Masquer' : 'Personnaliser'}
          </Button>

          {showSettings && (
            <Button
              variant="contained"
              onClick={handleSavePreferences}
              sx={{
                backgroundColor: '#2d3748',
                color: 'white',
                fontWeight: 600,
                px: 3,
                '&:hover': {
                  backgroundColor: '#1a1a1a'
                }
              }}
            >
              Enregistrer mes choix
            </Button>
          )}
        </Box>

        {/* Note légale */}
        <Typography variant="caption" sx={{ display: 'block', mt: 2, color: '#a0aec0' }}>
          En continuant à naviguer sur ce site, vous acceptez notre utilisation des cookies nécessaires au fonctionnement du site.
        </Typography>
      </Paper>
    </Box>
  );
};

export default CookieBanner;
