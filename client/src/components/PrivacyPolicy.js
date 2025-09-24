import React from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip
} from '@mui/material';
import {
  ExpandMore,
  Security,
  Cookie,
  Email,
  Storage,
  Share,
  Delete,
  Update,
  Gavel
} from '@mui/icons-material';

const PrivacyPolicy = () => {
  const sections = [
    {
      title: "1. Collecte des Données Personnelles",
      icon: <Storage color="primary" />,
      content: (
        <Box>
          <Typography variant="body1" paragraph>
            SneakersShop collecte les données personnelles suivantes :
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><Email /></ListItemIcon>
              <ListItemText 
                primary="Données d'identification" 
                secondary="Nom, prénom, adresse email, mot de passe (chiffré)"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Storage /></ListItemIcon>
              <ListItemText 
                primary="Données de commande" 
                secondary="Adresse de livraison, historique d'achats, préférences"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Cookie /></ListItemIcon>
              <ListItemText 
                primary="Données techniques" 
                secondary="Cookies, adresse IP, données de navigation"
              />
            </ListItem>
          </List>
        </Box>
      )
    },
    {
      title: "2. Finalités du Traitement",
      icon: <Security color="success" />,
      content: (
        <Box>
          <Typography variant="body1" paragraph>
            Vos données sont utilisées pour :
          </Typography>
          <List dense>
            <ListItem>• Gérer votre compte client et vos commandes</ListItem>
            <ListItem>• Traiter vos paiements et livraisons</ListItem>
            <ListItem>• Améliorer nos services et votre expérience</ListItem>
            <ListItem>• Vous envoyer des communications commerciales (avec consentement)</ListItem>
            <ListItem>• Respecter nos obligations légales</ListItem>
            <ListItem>• Prévenir la fraude et assurer la sécurité</ListItem>
          </List>
        </Box>
      )
    },
    {
      title: "3. Base Légale du Traitement",
      icon: <Gavel color="warning" />,
      content: (
        <Box>
          <Typography variant="body1" paragraph>
            Nos traitements sont basés sur :
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Chip label="Exécution du contrat" color="primary" variant="outlined" />
            <Chip label="Intérêt légitime" color="secondary" variant="outlined" />
            <Chip label="Consentement" color="success" variant="outlined" />
            <Chip label="Obligation légale" color="warning" variant="outlined" />
          </Box>
        </Box>
      )
    },
    {
      title: "4. Partage des Données",
      icon: <Share color="info" />,
      content: (
        <Box>
          <Typography variant="body1" paragraph>
            Vos données peuvent être partagées avec :
          </Typography>
          <List>
            <ListItem>
              <ListItemText 
                primary="Prestataires de services" 
                secondary="Transporteurs, processeurs de paiement, hébergeurs (avec garanties contractuelles)"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Vendeurs partenaires" 
                secondary="Uniquement les données nécessaires au traitement de vos commandes"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Autorités légales" 
                secondary="Si requis par la loi ou pour protéger nos droits"
              />
            </ListItem>
          </List>
          <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
            Nous ne vendons jamais vos données personnelles à des tiers.
          </Typography>
        </Box>
      )
    },
    {
      title: "5. Conservation des Données",
      icon: <Update color="primary" />,
      content: (
        <Box>
          <Typography variant="body1" paragraph>
            Durées de conservation :
          </Typography>
          <List>
            <ListItem>• Données de compte : Pendant toute la durée du compte + 3 ans</ListItem>
            <ListItem>• Données de commande : 10 ans (obligation comptable)</ListItem>
            <ListItem>• Données marketing : Jusqu'à retrait du consentement</ListItem>
            <ListItem>• Cookies : Selon les durées définies dans notre politique cookies</ListItem>
          </List>
        </Box>
      )
    },
    {
      title: "6. Vos Droits RGPD",
      icon: <Security color="error" />,
      content: (
        <Box>
          <Typography variant="body1" paragraph>
            Vous disposez des droits suivants :
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><Security /></ListItemIcon>
              <ListItemText 
                primary="Droit d'accès" 
                secondary="Obtenir une copie de vos données personnelles"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Update /></ListItemIcon>
              <ListItemText 
                primary="Droit de rectification" 
                secondary="Corriger vos données inexactes ou incomplètes"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Delete /></ListItemIcon>
              <ListItemText 
                primary="Droit à l'effacement" 
                secondary="Supprimer vos données dans certaines conditions"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Share /></ListItemIcon>
              <ListItemText 
                primary="Droit à la portabilité" 
                secondary="Récupérer vos données dans un format structuré"
              />
            </ListItem>
          </List>
          <Paper sx={{ p: 2, mt: 2, backgroundColor: '#f7fafc' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Pour exercer vos droits : 
            </Typography>
            <Typography variant="body2">
              Contactez-nous à : <strong>fatoumata-bah@epitech.eu</strong>
              <br />
              Ou par courrier : SneakersShop - Service RGPD, Epitech: 2 Rue du Professeur Charles Appleton, 69007 Lyon
            </Typography>
          </Paper>
        </Box>
      )
    },
    {
      title: "7. Sécurité des Données",
      icon: <Security color="success" />,
      content: (
        <Box>
          <Typography variant="body1" paragraph>
            Nous mettons en œuvre des mesures techniques et organisationnelles appropriées :
          </Typography>
          <List>
            <ListItem>• Chiffrement des données sensibles (mots de passe, paiements)</ListItem>
            <ListItem>• Connexions sécurisées HTTPS</ListItem>
            <ListItem>• Accès limité aux données sur principe du besoin d'en connaître</ListItem>
            <ListItem>• Sauvegardes régulières et sécurisées</ListItem>
            <ListItem>• Formation du personnel à la protection des données</ListItem>
            <ListItem>• Audits de sécurité réguliers</ListItem>
          </List>
        </Box>
      )
    },
    {
      title: "8. Cookies et Traceurs",
      icon: <Cookie color="warning" />,
      content: (
        <Box>
          <Typography variant="body1" paragraph>
            Notre site utilise différents types de cookies :
          </Typography>
          <List>
            <ListItem>
              <ListItemText 
                primary="Cookies nécessaires" 
                secondary="Indispensables au fonctionnement du site (panier, authentification)"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Cookies de préférences" 
                secondary="Mémorisation de vos choix (langue, devise)"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Cookies d'analyse" 
                secondary="Mesure d'audience et amélioration du site"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Cookies marketing" 
                secondary="Publicités personnalisées et réseaux sociaux"
              />
            </ListItem>
          </List>
          <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
            Vous pouvez gérer vos préférences via notre bandeau de cookies.
          </Typography>
        </Box>
      )
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700, color: '#1a1a1a' }}>
            🔒 Politique de Confidentialité
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '800px', mx: 'auto' }}>
            SneakersShop respecte votre vie privée et s'engage à protéger vos données personnelles
          </Typography>
          <Chip 
            label={`Dernière mise à jour : ${new Date().toLocaleDateString('fr-FR')}`}
            color="primary" 
            sx={{ mt: 2 }}
          />
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Introduction */}
        <Box sx={{ mb: 4, p: 3, backgroundColor: '#f7fafc', borderRadius: 2 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            Responsable du traitement
          </Typography>
          <Typography variant="body1">
            <strong>SneakersShop</strong><br />
            Marketplace de sneakers authentiques<br />
            Epitech: 2 Rue du Professeur Charles Appleton, 69007 Lyon, France<br />
            Email : <strong>fatoumata-bah@epitech.eu</strong><br />
            Téléphone : +33 7 00 00 00 00
          </Typography>
        </Box>

        {/* Sections accordéons */}
        {sections.map((section, index) => (
          <Accordion 
            key={index} 
            sx={{ 
              mb: 2, 
              borderRadius: 2,
              '&:before': { display: 'none' },
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            <AccordionSummary 
              expandIcon={<ExpandMore />}
              sx={{ 
                '& .MuiAccordionSummary-content': { alignItems: 'center', gap: 2 }
              }}
            >
              {section.icon}
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {section.title}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {section.content}
            </AccordionDetails>
          </Accordion>
        ))}

        {/* Footer */}
        <Divider sx={{ my: 4 }} />
        <Box sx={{ textAlign: 'center', p: 3, backgroundColor: '#f7fafc', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Questions ou réclamations ?
          </Typography>
          <Typography variant="body1" paragraph>
            Pour toute question concernant cette politique ou l'exercice de vos droits :
          </Typography>
          <Typography variant="body1">
            📧 <strong>fatoumata-bah@epitech.eu</strong><br />
            📞 <strong>+33 7 00 00 00 00</strong><br />
            📍 <strong>SneakersShop - Service RGPD, Epitech: 2 Rue du Professeur Charles Appleton, 69007 Lyon</strong>
          </Typography>
          <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
            Vous avez également le droit de déposer une réclamation auprès de la CNIL (Commission Nationale de l'Informatique et des Libertés).
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default PrivacyPolicy;
