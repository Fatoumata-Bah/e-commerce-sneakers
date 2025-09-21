# Schéma de Base de Données - E-commerce Sneakers

## 📋 Entités principales

### 👤 Users (Utilisateurs)
- **id** : UUID (clé primaire)
- **email** : string unique
- **password** : string (hashé)
- **firstName** : string
- **lastName** : string
- **role** : enum (admin, seller, customer)
- **isActive** : boolean
- **createdAt** : timestamp
- **updatedAt** : timestamp

### 👟 Products (Produits)
- **id** : UUID (clé primaire)
- **name** : string
- **description** : text
- **brand** : string
- **category** : enum (men, women, kids)
- **basePrice** : decimal
- **images** : array of strings (URLs)
- **isActive** : boolean
- **createdAt** : timestamp
- **updatedAt** : timestamp

### 📏 ProductVariants (Variantes - Tailles)
- **id** : UUID (clé primaire)
- **productId** : UUID (FK → Products)
- **size** : string (ex: "42", "US 9", "UK 8")
- **sizeType** : enum (EU, US, UK)
- **stock** : integer
- **price** : decimal (peut différer du prix de base)
- **sku** : string unique (référence)
- **createdAt** : timestamp
- **updatedAt** : timestamp

### 🛒 Orders (Commandes)
- **id** : UUID (clé primaire)
- **userId** : UUID (FK → Users)
- **status** : enum (pending, confirmed, shipped, delivered, cancelled)
- **totalAmount** : decimal
- **shippingAddress** : JSON
- **billingAddress** : JSON
- **paymentStatus** : enum (pending, paid, failed, refunded)
- **paymentMethod** : string
- **createdAt** : timestamp
- **updatedAt** : timestamp

### 📦 OrderItems (Articles de commande)
- **id** : UUID (clé primaire)
- **orderId** : UUID (FK → Orders)
- **productVariantId** : UUID (FK → ProductVariants)
- **quantity** : integer
- **unitPrice** : decimal (prix au moment de l'achat)
- **totalPrice** : decimal
- **createdAt** : timestamp

### 🛍️ CartItems (Panier)
- **id** : UUID (clé primaire)
- **userId** : UUID (FK → Users)
- **productVariantId** : UUID (FK → ProductVariants)
- **quantity** : integer
- **createdAt** : timestamp
- **updatedAt** : timestamp

## 🔗 Relations

1. **User → Orders** : 1:N (un utilisateur peut avoir plusieurs commandes)
2. **Order → OrderItems** : 1:N (une commande contient plusieurs articles)
3. **Product → ProductVariants** : 1:N (un produit a plusieurs tailles)
4. **ProductVariant → OrderItems** : 1:N (une variante peut être dans plusieurs commandes)
5. **User → CartItems** : 1:N (un utilisateur a un panier avec plusieurs articles)
6. **ProductVariant → CartItems** : 1:N (une variante peut être dans plusieurs paniers)

## 📐 Tailles réalistes par catégorie

### Hommes (EU)
- 39, 40, 41, 42, 43, 44, 45, 46, 47, 48

### Femmes (EU)
- 35, 36, 37, 38, 39, 40, 41, 42, 43, 44

### Enfants (EU)
- 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38

## 💡 Bonnes pratiques appliquées

1. **UUID** au lieu d'auto-increment (sécurité, distribution)
2. **Soft delete** avec isActive (données historiques)
3. **Timestamps** automatiques (audit trail)
4. **Prix stockés** dans OrderItems (prix historiques)
5. **Adresses en JSON** (flexibilité internationale)
6. **SKU unique** (gestion stock et logistique)
