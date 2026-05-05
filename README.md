# Food4Me 🍽️

Application mobile intelligente pour gérer votre alimentation et optimiser votre nutrition selon vos objectifs personnels.

## 📱 Aperçu

**Food4Me** permet de :
- S'inscrire / Se connecter (authentification JWT)
- Rechercher des produits dans la base **OpenFoodFacts**
- Visualiser les valeurs nutritionnelles (calories, protéines, glucides, lipides)
- Ajouter des repas à son journal alimentaire
- (À venir) Suivi personnalisé, profils, synthèses

## 🧱 Architecture

- **Frontend** : React Native avec Expo (Android & iOS)
- **Backend** : API REST avec Node.js et Express
- **Base de données** : PostgreSQL

## ⚙️ Prérequis

Avant de commencer, installe sur ta machine :

- [Node.js](https://nodejs.org) (version **20.19.4** ou plus récente, recommandé v24+)
- [PostgreSQL](https://www.postgresql.org) (v12+) + l'outil **pgAdmin** (ou psql)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (installé globalement ou utilisé via `npx`)

## 📦 Installation

### 1. Cloner le projet
```bash
git clone https://github.com/ton-compte/Food4Me.git
cd Food4Me
2. Installer les dépendances
bash
# Dépendances front-end
npm install

# Dépendances back-end
cd food4me-api
npm install
cd ..
3. Configurer la base de données
Crée un fichier .env dans food4me-api/ avec ces variables :

env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=food4me_db
DB_PASSWORD=ton_mot_de_passe
DB_PORT=5432
JWT_SECRET=change_ce_secret_jwt
PORT=3000
Ensuite, crée la base de données food4me_db via pgAdmin ou psql, puis exécute le script SQL :

bash
psql -U postgres -d food4me_db -f bdd.sql
🚀 Lancement
L’application nécessite deux terminaux ouverts.

Terminal 1 – Backend (API Express)
bash
cd food4me-api
node index.js
Le serveur écoute sur le port 3000 (ou celui défini dans .env).

Terminal 2 – Frontend (Expo)
bash
# Depuis la racine du projet Food4Me/
npx expo start
Scanne le QR code avec l’application Expo Go (Android) ou l’appareil photo (iOS).

📂 Structure du projet
text
Food4Me/
├── App.js                 # Composant principal (React Native)
├── app.json               # Configuration Expo
├── package.json           # Dépendances et scripts
├── eas.json               # Configuration EAS Build
├── bdd.sql                # Schéma et données initiales PostgreSQL
├── assets/                # Icônes et images
└── food4me-api/           # Backend Express
    ├── index.js           # Routes API
    ├── db.js              # Connexion PostgreSQL
    └── .env               # Variables d'environnement (non commité)

🔌 Routes principales
Méthode	Endpoint	Description
POST	/auth/register	Créer un compte
POST	/auth/login	Se connecter (retourne un token)
POST	/repas/ajouter-complet	Enregistrer un repas avec nutriments
✅ Fonctionnalités actuelles
Authentification sécurisée (bcrypt + JWT)

Recherche de produits via l’API OpenFoodFacts

Affichage des macronutriments pour 100g

Ajout d’un repas en base de données (lié à un profil)

👤 Auteur
Projet développé par commande94 miguel12ops dans le cadre d’un apprentissage React Native & Node.js.

📝 Notes de développement
L’adresse IP de l’API (192.168.1.141) Change-la dans App.js (ligne 12 et 45) selon ton réseau (Wi-Fi, Ethernet…).

Le profil de test utilisé est 93308442-16ea-4838-920a-a45fae6627ec (inséré dans bdd.sql).

Pense à ne jamais commiter le fichier .env (ajoute-le dans ton .gitignore).