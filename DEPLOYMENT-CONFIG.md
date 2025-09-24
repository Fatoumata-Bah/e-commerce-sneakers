# 🚀 Guide de Déploiement Complet - Render

## 📋 Prérequis
- Compte GitHub avec le repository
- Compte Render.com (gratuit)
- Code pushé sur GitHub

---

## 🔧 ÉTAPE 1 : Déploiement Backend (API)

### 1.1 Créer le Web Service
1. Aller sur [render.com](https://render.com) → **New** → **Web Service**
2. Connecter votre repository GitHub
3. Configurer le service :

| Paramètre | Valeur |
|-----------|--------|
| **Name** | `sneakersshop-api` (ou votre choix) |
| **Root Directory** | `server` |
| **Environment** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | `Free` |

### 1.2 Variables d'Environnement
Ajouter dans **Environment** :

```bash
NODE_ENV=production
JWT_SECRET=SneakersShop2025SecretKeyForJWTTokensMinimum32Characters
PORT=5000
```

⚠️ **Important** : Remplacez `JWT_SECRET` par une clé unique de 32+ caractères

### 1.3 Déployer
1. Cliquer **Create Web Service**
2. Attendre la fin du déploiement (5-10 minutes)
3. Noter l'URL générée : `https://sneakersshop-api.onrender.com`

### 1.4 Initialiser la Base de Données
1. Dans le dashboard Render → **Shell**
2. Exécuter :
```bash
npm run seed
```
3. Vérifier la sortie : "108 produits créés, 2195 variantes, 11 utilisateurs"

### 1.5 Tester l'API
```bash
curl https://votre-app.onrender.com/api/health
# Doit retourner : {"status":"ok","timestamp":"..."}
```

---

## 🌐 ÉTAPE 2 : Déploiement Frontend

### 2.1 Configuration Locale
1. Créer `client/.env.production` :
```bash
REACT_APP_API_URL=https://votre-backend-app.onrender.com/api
```

2. Tester le build local :
```bash
cd client
npm run build
# Vérifier qu'aucune erreur n'apparaît
```

### 2.2 Créer le Static Site
1. Render → **New** → **Static Site**
2. Connecter le même repository
3. Configurer :

| Paramètre | Valeur |
|-----------|--------|
| **Name** | `sneakersshop-web` |
| **Root Directory** | `client` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `build` |

### 2.3 Variables d'Environnement Frontend
Ajouter dans **Environment** :
```bash
REACT_APP_API_URL=https://votre-backend-app.onrender.com/api
```

### 2.4 Déployer
1. **Create Static Site**
2. Attendre le build (3-5 minutes)
3. Noter l'URL : `https://sneakersshop-web.onrender.com`

---

## ✅ ÉTAPE 3 : Tests de Validation

### 3.1 Test Backend
```bash
# Health check
curl https://votre-backend.onrender.com/api/health

# Test produits
curl https://votre-backend.onrender.com/api/products?limit=1

# Test auth
curl -X POST https://votre-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sneakersshop.com","password":"SneakersShop2025!Admin"}'
```

### 3.2 Test Frontend
1. Ouvrir `https://votre-frontend.onrender.com`
2. Vérifier que les produits s'affichent
3. Tester la connexion admin :
   - Email: `admin@sneakersshop.com`
   - Password: `SneakersShop2025!Admin`
4. Tester un achat complet

### 3.3 Test Intégration
- ✅ Catalogue de produits visible
- ✅ Recherche fonctionnelle
- ✅ Connexion utilisateur
- ✅ Ajout au panier
- ✅ Timer de panier (1m30)
- ✅ Processus de commande
- ✅ Dashboard admin

---

## 🔧 Configuration Avancée

### Optimisations Render
```bash
# Dans server/package.json, ajouter :
"engines": {
  "node": "18.x"
}
```

### Variables d'Environnement Complètes

#### Backend
```bash
NODE_ENV=production
JWT_SECRET=VotreCleSuperSecreteDeMinimum32Caracteres2025
PORT=5000
```

#### Frontend
```bash
REACT_APP_API_URL=https://votre-backend.onrender.com/api
GENERATE_SOURCEMAP=false
```

---

## 🆘 Dépannage Déploiement

### ❌ Build Backend échoue
```bash
# Vérifier package.json et dependencies
# Logs disponibles dans Render Dashboard
```

### ❌ Base de données vide
```bash
# Via Render Shell :
npm run seed
# Vérifier les logs : "108 produits créés"
```

### ❌ CORS Error Frontend
```bash
# Vérifier REACT_APP_API_URL dans .env.production
# Format correct : https://backend.onrender.com/api (sans slash final)
```

### ❌ 503 Service Unavailable
- Les apps gratuites Render s'endorment après 15min d'inactivité
- Premier accès peut prendre 30-60 secondes

---

## 📊 Checklist Final

### Backend ✅
- [ ] Service déployé et accessible
- [ ] Variables d'environnement configurées
- [ ] Base de données initialisée (108 produits)
- [ ] API health check OK
- [ ] Authentification fonctionnelle

### Frontend ✅
- [ ] Static site déployé
- [ ] Variables d'environnement configurées
- [ ] Build sans erreurs
- [ ] Connexion API fonctionnelle
- [ ] Interface utilisateur complète

### Tests ✅
- [ ] Connexion admin/seller/customer
- [ ] Catalogue produits affiché
- [ ] Recherche et filtres
- [ ] Processus d'achat complet
- [ ] Timer et notifications

---

**🎯 Votre application SneakersShop est maintenant déployée et fonctionnelle sur Render !**
