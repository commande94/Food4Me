CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE utilisateur (
    id_utilisateur UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    mot_de_passe_hash TEXT NOT NULL,
    date_creation TIMESTAMPTZ DEFAULT NOW(),
    derniere_connexion TIMESTAMPTZ
);

CREATE TABLE profil (
    id_profil UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_utilisateur UUID NOT NULL REFERENCES utilisateur(id_utilisateur) ON DELETE CASCADE,
    nom TEXT NOT NULL,
    age INT,
    genre TEXT,
    taille_cm INT,
    poids_kg INT,
    objectif TEXT NOT NULL, 
    calories_cible_journaliere INT, 
    preferences_alimentaires TEXT, 
    date_creation TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ingredient (
    id_ingredient UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom TEXT NOT NULL,
    code_barre TEXT, 
    calories_pour_100g NUMERIC NOT NULL,
    proteines_pour_100g NUMERIC NOT NULL,
    glucides_pour_100g NUMERIC NOT NULL,
    lipides_pour_100g NUMERIC NOT NULL,
    source TEXT DEFAULT 'OpenFoodFacts',
    id_externe_api TEXT
);

CREATE TABLE repas (
    id_repas UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_profil UUID NOT NULL REFERENCES profil(id_profil) ON DELETE CASCADE,
    nom_repas TEXT,
    date_repas TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    type_repas TEXT, 
    date_creation TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE composition_repas (
    id_composition UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_repas UUID NOT NULL REFERENCES repas(id_repas) ON DELETE CASCADE,
    id_ingredient UUID NOT NULL REFERENCES ingredient(id_ingredient) ON DELETE CASCADE,
    quantite_grammes NUMERIC NOT NULL
);

ALTER TABLE profil
ADD COLUMN prenom TEXT;