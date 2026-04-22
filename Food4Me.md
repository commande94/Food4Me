# Food4Me

Food4Me est une application innovante conçue pour révolutionner la façon dont nous gérons notre alimentation quotidienne. Notre mission est de rendre la nutrition personnalisée accessible à tous, en offrant des recommandations précises basées sur les besoins individuels de chaque utilisateur.

## Caractéristiques Principales

- **Suivi Nutritionnel Intelligent :** Analyse détaillée des macronutriments et micronutriments de chaque repas
- **Recommandations Personnalisées :** Suggestions de repas adaptées aux objectifs et restrictions alimentaires
- **Scanner de Code-barres :** Identification rapide des informations nutritionnelles des produits (gérable avec openFoodFacts)
- **Planification de Repas :** Création automatique de menus équilibrés correspondant aux objectifs de l’utilisateur
- **Journal Alimentaire Photo :** Reconnaissance d'aliments par photo pour un suivi simplifié

---

# Détails techniques

Food4Me est prévu pour être une application mobile, elle devra être disponible sur Android et IOS. Une version web peut être intéressante, mais n’est pas obligatoire pour le moment, prenez cela en compte lors des choix techniques.

## Ressources

- Data OpenFoodFacts
    - Permet d’obtenir les données nutritionnel d’aliment, plat transformé…
    - A intégrer sous forme d’API externe ou utiliser un dump récent de leur BDD ([disponible ici](https://fr.openfoodfacts.org/data))
    - Il est possible d’utiliser d’autres outils permettant d’accéder aux informations nutritionnelles de chaque produit
- BDD à créer
    - Choix libre, SQL ou NoSQL

## Fonctionnalités

- Créer un compte
- Créer un profile (plusieurs par compte possible)
    - Préciser le genre, l’âge, la taille, le poids pour générer les besoins de la personne
    - Préciser un objectif (perte de poids, gain de poids, gain de masse musculaire, immunité)
    - Préciser les préférences alimentaire (allergies et gouts)
- Créer un plat à partir d’ingrédient entré à la main (ou dicté à la voix) avec leur quantité
    - (Possibilité de scanner un ingrédient)
    - Aller chercher dans les données récupérées le nombre de calories et les nutriment pour la quantité donnée
    - Calculer le nombre de calories et les nutriments totaux du plat
- Créer un plat à partir de donnée existante dans OpenFoodFacts
- Afficher une synthèse pour :
    - Un repas (nb de calories, de nutriment, de protéine… comparé au besoin journalier)
    - Journalière
    - Hebdomadaire
    - Mensuel
- Intégration d’une IA pour conseiller l’utilisateur en fonction de ses objectifs et de ses apports actuels
    - Conseil d’ingrédient à ajouter dans ses repas pour améliorer un apport particulier
    - Page ingrédient qui détail les avantages et inconvénients d’un ingrédient adapté à l’objectif de l’utilisateur

## Frontend

On utilisera les *frameworks* **React Native** et **Expo** pour créer notre application

React Native permet de créer des applications mobiles natives pour Android et iOS avec un seul code (basé sur React)

Expo simplifie le développement, la gestion des routes et le déploiement de l’application

- [Expo](http://docs.expo.dev/get-started/set-up-your-environment/?platform=android&device=physical&mode=development-build)
    - Mettre en développement build
    - Créer un compte Expo
    - Créer le projet sur Expo
    - Récupérer le projet en local en suivant les indications
    - Faire un premier build pour tester l’application (long)
    
    ```powershell
    eas build --platform android --profile development
    ```
    
    - Démarrer le server de dev
    
    ```powershell
    npx expo start
    ```
    
    - Démarrer le dev
- Expo Tools (VS Code)


![image.png](./res/image1.png)
![image.png](./res/image2.png)

## Backend

Le server backend sera lui développer en **Node.JS** (javascript version serveur) avec le framework Express

![](./res/diagram.jpg)

# Client

Nous avons un client réel pour ce projet :

![](https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb)

- 👦🏻 Maxime
- 🎂 31 ans
- 💊 Travaille dans la pharmaceutique
- 🏋‍♂️ Passionné de sport
- 🥗 Aime prendre soin de lui
- 💻 Utilise très mal les outils technologiques
- 🗣️ *“On est ce qu’on mange”*

Il est à la fois notre client et la cible directe de notre application. Lors de la création de celle ci nous devons constamment penser :

- “Est ce que maxime à besoin ce ceci”
- “Est ce que Maxime va réussir à utiliser l’appli”
- “Que fera-t-il face à cette page”

J’essayerais d’organiser une rencontre/visio et de lui faire tester l’application dés que ce sera possible pour avoir des retours constructifs.

- XS Quelques minutes
- S < demi journée
- M < 1 jour
- L < 2 jours
- XL < 3 jours
- **Pas de taches > 3 jours**