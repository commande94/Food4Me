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

INSERT INTO profil (id_profil, id_utilisateur, nom, objectif)
VALUES (
    '93308442-16ea-4838-920a-a45fae6627ec', 
    (SELECT id_utilisateur FROM utilisateur LIMIT 1), 
    'Maxime Profil Final',
    'Suivi Nutritionnel'
)
ON CONFLICT (id_profil) DO NOTHING; 


DROP TABLE IF EXISTS composition_repas;
DROP TABLE IF EXISTS repas;
DROP TABLE IF EXISTS ingredient;

CREATE TABLE ingredient (
    id_ingredient BIGSERIAL PRIMARY KEY,

    nom TEXT NOT NULL,

    code_barre TEXT UNIQUE,

    calories_pour_100g NUMERIC(6,2) NOT NULL,
    proteines_pour_100g NUMERIC(6,2) NOT NULL,
    glucides_pour_100g NUMERIC(6,2) NOT NULL,
    lipides_pour_100g NUMERIC(6,2) NOT NULL,

    source TEXT DEFAULT 'OpenFoodFacts',

    id_externe_api TEXT
);

CREATE TABLE repas (
    id_repas BIGSERIAL PRIMARY KEY,

    id_profil UUID NOT NULL
        REFERENCES profil(id_profil)
        ON DELETE CASCADE,

    nom_repas TEXT,

    date_repas TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    type_repas TEXT CHECK (
        type_repas IN (
            'petit_dejeuner',
            'dejeuner',
            'diner',
            'collation'
        )
    ),

    date_creation TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE composition_repas (
    id_composition BIGSERIAL PRIMARY KEY,

    id_repas BIGINT NOT NULL
        REFERENCES repas(id_repas)
        ON DELETE CASCADE,

    id_ingredient BIGINT NOT NULL
        REFERENCES ingredient(id_ingredient)
        ON DELETE CASCADE,

    quantite_grammes NUMERIC(6,2) NOT NULL
);
