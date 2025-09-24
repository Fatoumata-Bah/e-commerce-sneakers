# 🛠️ Guide de Dépannage - SneakersShop

## 🗄️ Problèmes de Base de Données

### ❌ Erreur "no such table"
```bash
SQLITE_ERROR: no such table: product_variants
```

**Solution** :
```bash
cd server
npm run seed    # Recrée les tables et insère les données
```

### ❌ Base de données vide
**Symptômes** : Aucun produit affiché sur le site

**Solution** :
```bash
cd server
npm run seed
# Vérifier : devrait afficher "108 produits créés"
```

### ❌ Utilisateurs de test inexistants
**Solution** :
```bash
cd server
npm run db:init    # Recrée tous les utilisateurs
```

## 🌐 Problèmes de Connexion API

### ❌ Erreur CORS
**Symptômes** : Erreurs de connexion entre frontend et backend

**Solution** :
1. Vérifier que le backend est démarré sur le port 5000
2. Vérifier l'URL dans `client/src/services/api.js`

### ❌ Erreur 404 sur les routes API
**Solution** :
```bash
cd server
npm start    # Redémarrer le serveur
```

## 🚀 Problèmes de Démarrage

### ❌ Port déjà utilisé
```bash
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution** :
```bash
# Trouver le processus utilisant le port
lsof -i :5000
# Tuer le processus
kill -9 <PID>
# Ou utiliser un autre port
PORT=5001 npm start
```

### ❌ Modules manquants
```bash
Error: Cannot find module 'xyz'
```

**Solution** :
```bash
# Backend
cd server && npm install

# Frontend  
cd client && npm install
```

## 🔐 Problèmes d'Authentification

### ❌ Impossible de se connecter
**Vérifications** :
1. Utiliser les bons identifiants :
   - Admin: `admin@sneakersshop.com` / `SneakersShop2025!Admin`
   - Client: `lucas.moreau@gmail.com` / `Lucas2025!`
2. Vérifier que la base de données est initialisée
3. Vérifier les cookies/localStorage

## 📦 Problèmes de Build

### ❌ Erreur de build frontend
```bash
cd client
rm -rf node_modules package-lock.json
npm install
npm run build
```

### ❌ Variables d'environnement manquantes
**Pour la production** :
```bash
# Créer client/.env.production
REACT_APP_API_URL=https://your-backend.onrender.com/api
```

## 🔍 Vérifications Rapides

### ✅ Backend fonctionne
```bash
curl http://localhost:5000/api/health
# Devrait retourner: {"status":"OK","timestamp":"..."}
```

### ✅ Base de données peuplée
```bash
cd server
node -e "
const { Product } = require('./database');
Product.count().then(count => console.log(count + ' produits'));
"
# Devrait afficher: 108 produits
```

### ✅ Frontend connecté
Ouvrir http://localhost:3000 et vérifier que les produits s'affichent

## 🧪 Test Automatisé de Déploiement

Pour tester un déploiement Render :
```bash
./test-deployment.sh https://votre-backend.onrender.com
```

## 📞 Support

Si les problèmes persistent :
1. Vérifier les logs dans la console du navigateur
2. Vérifier les logs du serveur Node.js
3. Consulter la documentation complète dans `DOCUMENTATION-TECHNIQUE-FONCTIONNELLE.md`
4. Utiliser le script de test automatisé

---

**💡 Conseil** : La plupart des problèmes se résolvent en relançant `npm run seed` côté serveur.
