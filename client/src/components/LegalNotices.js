import React from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Divider,
  Grid,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Business,
  Gavel,
  Security,
  Web,
  Payment,
  LocalShipping,
  Phone,
  Email,
  LocationOn
} from '@mui/icons-material';

const LegalNotices = () => {
  const legalSections = [
    {
      title: "Informations sur l'éditeur",
      icon: <Business color="primary" />,
      content: (
        <Box>
          <Typography variant="body1" paragraph>
            <strong>Raison sociale :</strong> SneakersShop (Projet étudiant)<br />
            <strong>Établissement :</strong> Epitech Lyon<br />
            <strong>Formation :</strong> Web@cadémie - Développement Web<br />
            <strong>Responsable projet :</strong> Fatoumata Bah<br />
            <strong>Email :</strong> fatoumata-bah@epitech.eu<br />
            <strong>Téléphone :</strong> +33 7 00 00 00 00
          </Typography>
          <Typography variant="body1">
            <strong>Adresse :</strong><br />
            Epitech: 2 Rue du Professeur Charles Appleton<br />
            69007 Lyon, France
          </Typography>
        </Box>
      )
    },
    {
      title: "Directeur de publication",
      icon: <Gavel color="secondary" />,
      content: (
        <Typography variant="body1">
          <strong>Directeur de publication :</strong> Fatoumata Bah<br />
          <strong>Qualité :</strong> Étudiante analyste financière - Epitech Lyon<br />
          <strong>Contact :</strong> fatoumata-bah@epitech.eu
        </Typography>
      )
    },
    {
      title: "Hébergement",
      icon: <Web color="info" />,
      content: (
        <Typography variant="body1">
          <strong>Hébergeur :</strong> OVH SAS<br />
          <strong>Siège social :</strong> 2 rue Kellermann, 59100 Roubaix, France<br />
          <strong>Téléphone :</strong> 09 72 10 10 07<br />
          <strong>Site web :</strong> www.ovh.com
        </Typography>
      )
    },
    {
      title: "Propriété intellectuelle",
      icon: <Security color="warning" />,
      content: (
        <Box>
          <Typography variant="body1" paragraph>
            L'ensemble du contenu du site SneakersShop (textes, images, vidéos, logos, icônes, sons, logiciels) 
            est protégé par les droits de propriété intellectuelle.
          </Typography>
          <Typography variant="body1" paragraph>
            Toute reproduction, représentation, modification, publication, adaptation de tout ou partie 
            des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite, 
            sauf autorisation écrite préalable de SneakersShop.
          </Typography>
          <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
            Les marques et logos des produits vendus appartiennent à leurs propriétaires respectifs.
          </Typography>
        </Box>
      )
    }
  ];

  const contactInfo = [
    { icon: <Phone />, label: "Téléphone", value: "+33 7 00 00 00 00" },
    { icon: <Email />, label: "Email", value: "fatoumata-bah@epitech.eu" },
    { icon: <LocationOn />, label: "Adresse", value: "Epitech: 2 Rue du Professeur Charles Appleton, 69007 Lyon" }
  ];

  const businessInfo = [
    { icon: <Payment />, label: "Paiements", value: "Stripe, PayPal, CB sécurisée" },
    { icon: <LocalShipping />, label: "Livraison", value: "Colissimo, Chronopost, DPD" },
    { icon: <Security />, label: "Sécurité", value: "SSL, chiffrement des données" }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700, color: '#1a1a1a' }}>
            ⚖️ Mentions Légales
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '800px', mx: 'auto' }}>
            Informations légales obligatoires concernant SneakersShop
          </Typography>
          <Chip 
            label={`Dernière mise à jour : ${new Date().toLocaleDateString('fr-FR')}`}
            color="primary" 
            sx={{ mt: 2 }}
          />
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Informations principales */}
        <Grid container spacing={4} sx={{ mb: 4 }}>
          {legalSections.map((section, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card sx={{ height: '100%', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {section.icon}
                    <Typography variant="h6" sx={{ ml: 1, fontWeight: 600 }}>
                      {section.title}
                    </Typography>
                  </Box>
                  {section.content}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Contact et services */}
        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 2, backgroundColor: '#f7fafc' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                  <Phone sx={{ mr: 1, color: '#ff6b35' }} />
                  Nous Contacter
                </Typography>
                <List dense>
                  {contactInfo.map((item, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText 
                        primary={item.label}
                        secondary={item.value}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 2, backgroundColor: '#f7fafc' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                  <Business sx={{ mr: 1, color: '#ffd700' }} />
                  Services
                </Typography>
                <List dense>
                  {businessInfo.map((item, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText 
                        primary={item.label}
                        secondary={item.value}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Conditions générales */}
        <Paper sx={{ p: 3, backgroundColor: '#f7fafc', borderRadius: 2, mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
            <Gavel sx={{ mr: 1, color: '#ff6b35' }} />
            Conditions Générales
          </Typography>
          <Typography variant="body1" paragraph>
            L'utilisation du site SneakersShop implique l'acceptation pleine et entière des conditions générales 
            d'utilisation et de vente disponibles sur notre site.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Chip label="CGU disponibles" color="primary" variant="outlined" />
            <Chip label="CGV disponibles" color="secondary" variant="outlined" />
            <Chip label="Politique de retour" color="success" variant="outlined" />
          </Box>
        </Paper>

        {/* Responsabilité */}
        <Paper sx={{ p: 3, backgroundColor: '#fff3cd', borderRadius: 2, mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            ⚠️ Limitation de responsabilité
          </Typography>
          <Typography variant="body1" paragraph>
            SneakersShop s'efforce de fournir des informations aussi précises que possible sur le site. 
            Toutefois, il ne pourra être tenu responsable des omissions, des inexactitudes et des 
            carences dans la mise à jour, qu'elles soient de son fait ou du fait des tiers 
            partenaires qui lui fournissent ces informations.
          </Typography>
          <Typography variant="body1">
            Tous les informations indiquées sur le site sont données à titre indicatif, 
            et sont susceptibles d'évoluer. Par ailleurs, les renseignements figurant sur le 
            site ne sont pas exhaustifs.
          </Typography>
        </Paper>

        {/* Médiation */}
        <Paper sx={{ p: 3, backgroundColor: '#d1ecf1', borderRadius: 2, mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            🤝 Médiation de la consommation
          </Typography>
          <Typography variant="body1" paragraph>
            Conformément aux dispositions du Code de la consommation concernant le règlement 
            amiable des litiges, SneakersShop adhère au Service du Médiateur du e-commerce de la FEVAD 
            (Fédération du e-commerce et de la vente à distance).
          </Typography>
          <Typography variant="body1">
            <strong>Médiateur :</strong> FEVAD<br />
            <strong>Site web :</strong> www.mediateurfevad.fr<br />
            <strong>Email :</strong> mediateur@fevad.com
          </Typography>
        </Paper>

        {/* Droit applicable */}
        <Box sx={{ textAlign: 'center', p: 3, backgroundColor: '#f7fafc', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Droit applicable
          </Typography>
          <Typography variant="body1">
            Les présentes mentions légales sont régies par le droit français. 
            En cas de litige, les tribunaux français seront seuls compétents.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default LegalNotices;
