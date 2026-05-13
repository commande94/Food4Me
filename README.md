# Food4Me 🍽️

Application mobile de suivi nutritionnel – Recherche d'aliments (Ciqual + Open Food Facts), composition de repas, journal alimentaire.

## ✨ Fonctionnalités

- 🔐 Authentification sécurisée (bcrypt + JWT)
- 🔍 Recherche produit : base française **Ciqual 2025** (Anses) pour les aliments bruts, **Open Food Facts** pour les produits emballés
- 📊 Visualisation des macronutriments (calories, protéines, glucides, lipides)
- ➕ Ajout de repas au journal (produit scanné ou repas composé)
- 🧠 Composition manuelle de repas avec recherche d'ingrédients en temps réel
- 🏠 Synthèse des apports nutritionnels du jour

## 🧱 Architecture

- **Frontend** : React Native avec Expo (Android & iOS)
- **Backend** : API REST avec Node.js, Express (structure modulaire)
- **Base de données** : PostgreSQL

## ⚙️ Prérequis

- [Node.js](https://nodejs.org) (v20 ou plus récent)
- [PostgreSQL](https://www.postgresql.org) (v12+) + **pgAdmin** (ou psql)
- Expo CLI (utilisable via `npx expo`)

## 📦 Installation

```bash
git clone https://github.com/ton-compte/Food4Me.git
cd Food4Me
npm install
cd food4me-api-backend
npm install

# Créer une base (ex: food4me_db) puis exécuter le script SQL
psql -U postgres -d food4me_db -f bdd.sql


```

Créer un fichier .env dans food4me-api-backend :

```
env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=food4me_db
DB_PASSWORD=ton_mot_de_passe
DB_PORT=5432
JWT_SECRET=change_ce_secret_jwt
PORT=3000
```

## 🚀 Lancement

Deux terminaux nécessaires :

```bash
# Terminal 1 – Backend
cd food4me-api-backend
node index.js


# Terminal 2 – Frontend
npx expo start

```

Scanner le QR code avec Expo Go (téléphone sur le même réseau Wi-Fi).

## 📂 Structure du projet

```
Food4Me/
├── App.js
├── src/
│   ├── config/
│   │   └── apiConfig.js
│   ├── navigation/
│   │   └── AppNavigator.js
│   ├── screens/
│   │   ├── AuthScreen.js
│   │   ├── ComposeScreen.js
│   │   ├── HomeScreen.js
│   │   ├── ProfileScreen.js
│   │   ├── RegisterScreen.js
│   │   ├── SearchScreen.js
│   │   └── WelcomeScreen.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── foodService.js
│   │   ├── ingredientService.js
│   │   └── openFoodService.js
│   └── styles/
│       ├── authStyles.js
│       ├── composeStyles.js
│       ├── globalStyles.js
│       ├── homeStyles.js
│       ├── registerStyles.js
│       ├── searchStyles.js
│       └── welcomeStyles.js
├── food4me-api-backend/
│   ├── config/
│   │   ├── db.js
│   │   └── ciqual.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── repasController.js
│   │   ├── ingredientsController.js
│   │   └── offSearchController.js
│   ├── middlewares/
│   │   └── auth.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── repasRoutes.js
│   │   ├── ingredientsRoutes.js
│   │   └── offSearchRoutes.js
│   ├── utils/
│   │   └── getOrCreateProfil.js
│   ├── aliments.json
│   ├── .env
│   └── index.js
├── bdd.sql
├── assets/
└── package.json
```

## 🔌 Routes API principales

Méthode	Endpoint	Auth	Description
POST	/auth/register	Non	Créer un compte
POST	/auth/login	Non	Se connecter (retourne un token)
GET	/auth/me	Oui	Infos utilisateur connecté
GET	/off/search?terme=…	Oui	Recherche produit (Ciqual + OFF)
GET	/ingredients/recherche?nom=…	Non	Recherche ingrédient en base
POST	/repas/ajouter-complet	Oui	Enregistrer un repas
GET	/repas/aujourdhui	Oui	Synthèse nutritionnelle du jour

## 📊 Données nutritionnelles
Aliments génériques : Anses. 2025. Table Ciqual – Licence Ouverte (https://doi.org/10.57745/RDMHWY)

Produits emballés : Open Food Facts


## 👤 Auteur

Projet développé par [commande94 / miguel12ops] – apprentissage React Native & Node.js.

## 📝 Notes de développement

L'adresse IP de l'API se configure dans src/config/apiConfig.js (par défaut http://172.20.10.2:3000). Adapte-la à ton réseau (Wi‑Fi, Ethernet…).

Le port par défaut du backend est 3000, modifiable dans le .env.

Ne jamais commiter le fichier .env (présent dans .gitignore).