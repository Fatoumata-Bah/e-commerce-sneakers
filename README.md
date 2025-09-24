# SneakersShop - E-commerce Platform

Plateforme e-commerce moderne dédiée à la vente de sneakers avec 108+ références et gestion réaliste des stocks.

## 🚀 Installation et Démarrage Local

### Prérequis
- **Node.js 18+**
- **npm**

### 1. Cloner le Projet
```bash
git clone <repository-url>
cd e-commerce-sneakers
```

### 2. Configuration Backend
```bash
cd server
npm install
```

### 3. Initialisation de la Base de Données
```bash
# Créer les tables et insérer les données (recommandé)
npm run seed

# Alternative
npm run db:init

# Ou directement
node scripts/seed-production.js
```

**✅ Résultat attendu** :
- 108 produits créés
- 2195 variantes de tailles
- 11 utilisateurs (admin, vendeurs, clients)

### 4. Démarrage du Backend
```bash
npm start
# ✅ Serveur API disponible sur http://localhost:4000
```

### 5. Configuration Frontend
```bash
cd ../client
npm install
```

### 6. Démarrage du Frontend
```bash
npm start
# ✅ Application disponible sur http://localhost:3000
```

## 👥 Comptes de Test

### 👑 Administrateur
- **Email**: `admin@sneakersshop.com`
- **Mot de passe**: `SneakersShop2025!Admin`
- **Accès**: Gestion complète, dashboard admin

### 🏪 Vendeurs
- **Email**: `marie.dubois@sneakerpro.fr`
- **Mot de passe**: `SneakerPro2025!`
- **Entreprise**: SneakerPro Paris

- **Email**: `thomas.bernard@urbanstyle.fr`
- **Mot de passe**: `UrbanStyle2025!`
- **Entreprise**: Urban Style Lyon

### 👤 Clients
- **Email**: `lucas.moreau@gmail.com`
- **Mot de passe**: `Lucas2025!`

- **Email**: `emma.rousseau@yahoo.fr`
- **Mot de passe**: `Emma2025!`

## 🌐 Déploiement sur Render

### 🚀 Guide Complet
Voir **`DEPLOYMENT-CONFIG.md`** pour le guide détaillé étape par étape.

### ⚡ Résumé Rapide

#### Backend (API)
1. **Render** → **New Web Service** → Connecter GitHub
2. **Configuration** :
   - Root Directory: `server`
   - Build: `npm install`
   - Start: `npm start`
3. **Variables** : `NODE_ENV=production`, `JWT_SECRET=...`, `PORT=5000`
4. **Base de données** : Shell → `npm run seed`

#### Frontend (Interface)
1. **Créer** `client/.env.production` :
   ```bash
   REACT_APP_API_URL=https://votre-backend.onrender.com/api
   ```
2. **Render** → **New Static Site** → Connecter GitHub
3. **Configuration** :
   - Root Directory: `client`
   - Build: `npm install && npm run build`
   - Publish: `build`

#### Test de Déploiement
```bash
# Tester l'API
./test-deployment.sh https://votre-backend.onrender.com

# Tester l'interface
# Ouvrir https://votre-frontend.onrender.com
# Connexion admin: admin@sneakersshop.com / SneakersShop2025!Admin
```

## 🔧 Configuration de Production

### Backend
```bash
# server/config.js - Exemple de configuration production
module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: 'production',
  
  database: {
    dialect: 'sqlite',
    storage: './database/prod.sqlite'
  },
  
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '24h'
  }
};
```

### Frontend
```bash
# client/.env.production
REACT_APP_API_URL=https://your-backend-app.onrender.com/api
```

## 📋 Fonctionnalités

✅ **108 références** de sneakers  
✅ **Gestion des stocks** par taille (2171 variantes)  
✅ **3 rôles utilisateur** (admin/seller/customer)  
✅ **Processus d'achat** complet avec timer (1m30)  
✅ **Interface moderne** Material-UI responsive  
✅ **Conformité RGPD** complète  
✅ **Recherche intelligente** par marque  
✅ **Articles expirés** récupérables  
✅ **Compteurs temps réel** (commandes, articles expirés)  

## 🛠️ Scripts Utiles

### Backend
```bash
npm start          # Démarrer le serveur
npm run dev        # Démarrer en mode développement (avec nodemon)
npm run seed       # Initialiser la base de données
npm run db:init    # Alternative pour initialiser la base de données
```

### Frontend
```bash
npm start          # Démarrer en développement
npm run build      # Build pour production
npm test           # Lancer les tests
```

## 🔍 Tests et Validation

### Test Local Complet
1. ✅ Backend démarré sur port 4000
2. ✅ Frontend démarré sur port 3000
3. ✅ Base de données initialisée avec `npm run seed`
4. ✅ Connexion avec comptes de test
5. ✅ Test du processus d'achat complet
6. ✅ Vérification RGPD (bandeau cookies)

### Test de Déploiement
1. ✅ Backend déployé et accessible
2. ✅ Base de données initialisée en production
3. ✅ Frontend connecté au backend
4. ✅ HTTPS activé
5. ✅ Variables d'environnement configurées

## 📖 Documentation

- **Documentation technique complète**: `DOCUMENTATION-TECHNIQUE-FONCTIONNELLE.md`
- **Configuration de déploiement**: `DEPLOYMENT-CONFIG.md`
- **Guide de dépannage**: `TROUBLESHOOTING.md`
- **Architecture**: React + Node.js + SQLite
- **Base de données**: 108 produits, 2195 variantes, 7 marques
- **Sécurité**: JWT, bcrypt, CORS, Helmet, Rate limiting

## 🆘 Dépannage

### Problèmes Courants

**Base de données vide**:
```bash
cd server
npm run seed
# ou
npm run db:init
# ou
node scripts/seed-production.js
```

**Erreur de connexion API**:
- Vérifier que le backend est démarré
- Vérifier l'URL de l'API dans le frontend

**Erreur de build frontend**:
```bash
cd client
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

🎯 **Application prête pour la production avec 108+ références de sneakers !**
