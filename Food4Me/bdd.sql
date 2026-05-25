CREATE EXTENSION IF NOT EXISTS unaccent WITH SCHEMA public;

-- Nettoyage
DROP TABLE IF EXISTS composition_repas CASCADE;
DROP TABLE IF EXISTS repas CASCADE;
DROP TABLE IF EXISTS ingredient CASCADE;
DROP TABLE IF EXISTS profil CASCADE;
DROP TABLE IF EXISTS utilisateur CASCADE;

-- =====================================================
-- 1. UTILISATEUR ✅ UUID
-- =====================================================
CREATE TABLE public.utilisateur (

    id_utilisateur UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    email TEXT NOT NULL UNIQUE,

    mot_de_passe_hash TEXT NOT NULL,

    date_creation TIMESTAMPTZ DEFAULT now(),

    derniere_connexion TIMESTAMPTZ
);

INSERT INTO public.utilisateur (
    email,
    mot_de_passe_hash
)
VALUES
(
    'maxime@test.fr',
    '$2b$10$Btb7QkEA8K3l1kB0vDPnR.HGo2PjXa5cyL92q/jZqNbKtRB7kPAr6'
),
(
    'abc@gmail.com',
    '$2b$10$fdFN.sT9tPTmYMhnNlJ1kePsJ9KmOjAp9QGn4WPOvq/KX.lelIrBa'
);

-- =====================================================
-- 2. PROFIL ✅ UUID
-- =====================================================
CREATE TABLE public.profil (

    id_profil UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    id_utilisateur UUID NOT NULL
    REFERENCES public.utilisateur(id_utilisateur)
    ON DELETE CASCADE,

    nom TEXT NOT NULL,

    prenom TEXT,

    age INT,

    genre TEXT,

    taille_cm INT,

    poids_kg INT,

    objectif TEXT NOT NULL,

    calories_cible_journaliere INT,

    preferences_alimentaires TEXT,

    date_naissance DATE,

    date_creation TIMESTAMPTZ DEFAULT now()
);

INSERT INTO public.profil (
    id_utilisateur,
    nom,
    objectif
)
SELECT
    id_utilisateur,
    'Profil Maxime',
    'Prise de masse'
FROM utilisateur
WHERE email = 'maxime@test.fr';

-- =====================================================
-- 3. INGREDIENT ❌ SERIAL
-- =====================================================
CREATE TABLE public.ingredient (

    id_ingredient SERIAL PRIMARY KEY,

    nom TEXT NOT NULL UNIQUE,

    code_barre TEXT,

    calories_pour_100g NUMERIC NOT NULL,

    proteines_pour_100g NUMERIC NOT NULL,

    glucides_pour_100g NUMERIC NOT NULL,

    lipides_pour_100g NUMERIC NOT NULL,

    source TEXT DEFAULT 'OpenFoodFacts',

    id_externe_api TEXT
);

INSERT INTO public.ingredient (
    nom,
    calories_pour_100g,
    proteines_pour_100g,
    glucides_pour_100g,
    lipides_pour_100g
)
VALUES
(
    'Pomme',
    52,
    0.3,
    14,
    0.2
),
(
    'Banane',
    89,
    1.1,
    22.8,
    0.3
),
(
    'Poulet rôti',
    190,
    25,
    0,
    9
);

-- =====================================================
-- 4. REPAS ❌ SERIAL
-- =====================================================
CREATE TABLE public.repas (

    id_repas SERIAL PRIMARY KEY,

    id_profil UUID NOT NULL
    REFERENCES public.profil(id_profil)
    ON DELETE CASCADE,

    nom_repas TEXT,

    date_repas TIMESTAMPTZ DEFAULT now() NOT NULL,

    type_repas TEXT,

    date_creation TIMESTAMPTZ DEFAULT now()
);

INSERT INTO public.repas (
    id_profil,
    nom_repas,
    type_repas
)
SELECT
    id_profil,
    'Déjeuner Poulet',
    'Déjeuner'
FROM profil
WHERE nom = 'Profil Maxime';

-- =====================================================
-- 5. COMPOSITION REPAS ❌ SERIAL
-- =====================================================
CREATE TABLE public.composition_repas (

    id_composition SERIAL PRIMARY KEY,

    id_repas INT NOT NULL
    REFERENCES public.repas(id_repas)
    ON DELETE CASCADE,

    id_ingredient INT NOT NULL
    REFERENCES public.ingredient(id_ingredient)
    ON DELETE CASCADE,

    quantite_grammes NUMERIC NOT NULL
);

INSERT INTO public.composition_repas (
    id_repas,
    id_ingredient,
    quantite_grammes
)
VALUES
(
    1,
    1,
    150
),
(
    1,
    3,
    200
);