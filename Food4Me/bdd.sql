-- 1. Activer l'extension pour les identifiants uniques
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Table Utilisateur
CREATE TABLE utilisateur (
    id_utilisateur UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    mot_de_passe_hash TEXT NOT NULL,
    date_creation TIMESTAMPTZ DEFAULT NOW(),
    derniere_connexion TIMESTAMPTZ
);

-- 3. Table Profil 
CREATE TABLE profil (
    id_profil UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_utilisateur UUID NOT NULL REFERENCES utilisateur(id_utilisateur) ON DELETE CASCADE,
    nom TEXT NOT NULL,
    age INT,
    genre TEXT,
    taille_cm INT,
    poids_kg INT,
    objectif TEXT NOT NULL, -- ex: perte de poids, gain de masse
    calories_cible_journaliere INT, -- Utile pour la synthèse Lifesum
    preferences_alimentaires TEXT, -- Allergies et goûts
    date_creation TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Table Ingredient 
CREATE TABLE ingredient (
    id_ingredient UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom TEXT NOT NULL,
    code_barre TEXT, -- Indispensable pour le scanner
    calories_pour_100g NUMERIC NOT NULL,
    proteines_pour_100g NUMERIC NOT NULL,
    glucides_pour_100g NUMERIC NOT NULL,
    lipides_pour_100g NUMERIC NOT NULL,
    source TEXT DEFAULT 'OpenFoodFacts',
    id_externe_api TEXT
);

-- 5. Table Repas
CREATE TABLE repas (
    id_repas UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_profil UUID NOT NULL REFERENCES profil(id_profil) ON DELETE CASCADE,
    nom_repas TEXT,
    date_repas TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    type_repas TEXT, -- Petit-déjeuner, Déjeuner, etc.
    date_creation TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Table Composition 
CREATE TABLE composition_repas (
    id_composition UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_repas UUID NOT NULL REFERENCES repas(id_repas) ON DELETE CASCADE,
    id_ingredient UUID NOT NULL REFERENCES ingredient(id_ingredient) ON DELETE CASCADE,
    quantite_grammes NUMERIC NOT NULL
);

INSERT INTO profil (id_profil, id_utilisateur, nom, objectif)
VALUES (
    '93308442-16ea-4838-920a-a45fae6627ec', 
    (SELECT id_utilisateur FROM utilisateur LIMIT 1), 
    'Maxime Profil Final',
    'Suivi Nutritionnel'
)
ON CONFLICT (id_profil) DO NOTHING; -- Évite l'erreur si tu l'as déjà créé

CREATE EXTENSION IF NOT EXISTS unaccent;