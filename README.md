# Food4Me 🍽️

Une application mobile intelligente pour gérer votre alimentation et optimiser votre nutrition selon vos objectifs personnels.

## 📱 À propos

**Food4Me** est une application mobile conçue pour révolutionner la façon dont nous gérons notre alimentation quotidienne. Elle offre un suivi nutritionnel personnalisé, des recommandations adaptées et une gestion simplifiée de vos repas.

### Caractéristiques principales

- ✅ **Suivi Nutritionnel** - Analyse détaillée des macronutriments et micronutriments
- ✅ **Authentification** - Inscription et connexion sécurisées avec JWT
- ✅ **Gestion de Repas** - Ajout de repas avec informations nutritionnelles
- ✅ **Intégration OpenFoodFacts** - Accès aux données nutritionnelles des produits
- ✅ **Profils Personnalisés** - Supports de multiples profils par compte avec objectifs spécifiques
- ✅ **Synthèse Nutritionnelle** - Vue d'ensemble journalière, hebdomadaire, mensuelle

## 🏗️ Architecture

### Frontend
- **React Native** avec **Expo** pour le développement mobile cross-platform
- Fonctionne sur **Android** et **iOS**
- Interface intuitive en React moderne

### Backend
- **Node.js** avec **Express.js**
- **PostgreSQL** pour la base de données
- Authentification via **JWT**
- Sécurité des mots de passe avec **bcrypt**

## 📦 Structure du Projet

```
Food4Me/
├── App.js                 # Composant principal (React Native)
├── app.json              # Configuration Expo
├── package.json          # Dépendances du projet
├── eas.json             # Configuration EAS Build
├── bdd.sql              # Schéma de base de données
├── assets/              # Icônes et images
└── food4me-api/         # Backend Express
    ├── index.js         # Routes API (auth, repas)
    └── db.js            # Configuration PostgreSQL
```

## 🚀 Démarrage Rapide

### Prérequis
- **Node.js** (v16+)
- **PostgreSQL** (v12+)
- **Expo CLI** (ou développement build)

### Installation

1. **Cloner le projet**
   ```bash
   git clone <url-du-repo>
   cd Food4Me
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer la base de données**
   - Créer un fichier `.env` à la racine du projet
   - Ajouter vos credentials PostgreSQL :
     ```
     DB_USER=postgres
     DB_HOST=localhost
     DB_NAME=food4me
     DB_PASSWORD=votre_mot_de_passe
     DB_PORT=5432
     ```

4. **Initialiser la BDD**
   ```bash
   psql -U postgres -d food4me -f bdd.sql
   ```

### Lancer l'application

L'application nécessite **2 terminaux** pour fonctionner : un pour le backend et un pour le frontend.

#### Terminal 1 - Backend (API Express)
```bash
cd food4me-api
node index.js            # Démarre le serveur sur port 3000
```

#### Terminal 2 - Frontend (React Native avec Expo)
```bash
npx expo start           # Démarre le dev server Expo
```

Ensuite :
1. **Scanne le QR code** qui s'affiche dans le terminal avec l'app Expo sur ton téléphone
2. L'application se charge automatiquement et se connecte au backend

**Alternative** (une seule commande) :
```bash
npm start                # Équivalent de npx expo start
npm run android          # Sur Android émulé
npm run ios              # Sur iOS émulé
npm run web              # Version web
```

## 🔐 Authentification

L'application utilise un système de connexion sécurisé :

- **Inscription** : `POST /auth/register` avec email et mot de passe
- **Connexion** : `POST /auth/login` retourne un JWT token
- **Hashage** : Les mots de passe sont hachés avec bcrypt

## 🍽️ API Principales

- `POST /auth/register` - Créer un compte
- `POST /auth/login` - Se connecter
- `POST /repas/ajouter-complet` - Ajouter un repas avec nutriments

## 🛠️ Technologies Utilisées

- **Frontend** : React Native, Expo, React Hooks
- **Backend** : Express.js, Node.js
- **BD** : PostgreSQL
- **Sécurité** : bcrypt, JWT, CORS
- **Données** : OpenFoodFacts API

## 👤 Cas d'Usage Client

L'application a été pensée pour des utilisateurs comme **Maxime**, 31 ans :
- Travail dans la pharmaceutique
- Passionné de sport et de nutrition
- Cherche une solution simple pour optimiser son alimentation

## 📝 Notes de Développement

- L'API s'attend à un ID utilisateur (exemple : `93308442-16ea-4838-920a-a45fae6627ec`)
- L'adresse API du frontend est configurée pour `192.168.1.141:3000` (à adapter selon votre environnement)
- La base de données utilise PostgreSQL avec variables d'environnement

## 🎯 Prochaines Étapes

- Implémentation complète des endpoints API
- Intégration du scanner de code-barres
- Système de recommandation IA
- Gestion avancée des profils utilisateur

---

**By commande94 miguel12ops**
