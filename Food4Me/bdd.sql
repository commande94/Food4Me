CREATE EXTENSION IF NOT EXISTS unaccent WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;

-- Nettoyage si besoin
DROP TABLE IF EXISTS composition_repas CASCADE;
DROP TABLE IF EXISTS repas CASCADE;
DROP TABLE IF EXISTS ingredient CASCADE;
DROP TABLE IF EXISTS profil CASCADE;
DROP TABLE IF EXISTS utilisateur CASCADE;

-- -------------------------------------------------------
-- 1. utilisateur
-- -------------------------------------------------------
CREATE TABLE public.utilisateur (
    id_utilisateur uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    email text NOT NULL UNIQUE,
    mot_de_passe_hash text NOT NULL,
    date_creation timestamptz DEFAULT now(),
    derniere_connexion timestamptz
);

INSERT INTO public.utilisateur (id_utilisateur, email, mot_de_passe_hash, date_creation, derniere_connexion) VALUES
('804e8a64-fc66-4fbb-a36f-dd62af7dd7ba', 'maxime@test.fr', '$2b$10$Btb7QkEA8K3l1kB0vDPnR.HGo2PjXa5cyL92q/jZqNbKtRB7kPAr6', '2026-04-25 23:40:41.155241+02', NULL),
('93308442-16ea-4838-920a-a45fae6627ec', 'abc@gmail.com', '$2b$10$fdFN.sT9tPTmYMhnNlJ1kePsJ9KmOjAp9QGn4WPOvq/KX.lelIrBa', '2026-04-26 23:27:10.401008+02', NULL),
('ee20dd99-c27c-4abf-bbf6-d0bb7bdea5ce', 'abab@abab.com', '$2b$10$ezG3/SSg.7IHAxf0WQoYbeD2EqOGlr07qvnbv2jAOCFhpw252DQQq', '2026-04-26 23:33:32.676645+02', NULL),
('841164ff-97f4-4ab5-86f0-32e91cc0008b', 'migueltatiotsop@icloud.com', '$2b$10$ehDkIh7.nTNB6cTViUDEp.Hvk3.wg/HpjhW.ilsdGhvI57XOVX1om', '2026-04-27 13:56:23.895126+02', NULL),
('ac1faaa4-2770-445d-af33-7701247482e8', 'pro@gmail.com', '$2b$10$CqqaPa9etvK.y2qdt0XqdekjdD/HcW4F4f/sw1D76SRf8Ij9ZlOyu', '2026-05-04 14:58:01.985436+02', NULL),
('a5e9c376-4108-46ae-bbdc-ef05ea5ca9bc', 'lol@gmail.com', '$2b$10$iGZqKHeEYVGGUsy1IPcSE.V.q2k/PaZtjRnAzSgD9xaK3Y6KSzaCy', '2026-05-05 19:10:41.617925+02', NULL),
('4796ed14-aff2-4cc1-a9b3-984b6dc45596', 'dylan@gmail.com', '$2b$10$G2UueqhCFeTP0nk25EWU8O.jGwlJMrEN1J8ZZTvlRZNS2rTv0f61q', '2026-05-06 09:36:16.231786+02', NULL);

-- -------------------------------------------------------
-- 2. profil
-- -------------------------------------------------------
CREATE TABLE public.profil (
    id_profil uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    id_utilisateur uuid NOT NULL REFERENCES public.utilisateur(id_utilisateur) ON DELETE CASCADE,
    nom text NOT NULL,
    age int,
    genre text,
    taille_cm int,
    poids_kg int,
    objectif text NOT NULL,
    calories_cible_journaliere int,
    preferences_alimentaires text,
    date_creation timestamptz DEFAULT now(),
    prenom text
);

INSERT INTO public.profil (id_profil, id_utilisateur, nom, age, genre, taille_cm, poids_kg, objectif, calories_cible_journaliere, preferences_alimentaires, date_creation, prenom) VALUES
('93308442-16ea-4838-920a-a45fae6627ec', '804e8a64-fc66-4fbb-a36f-dd62af7dd7ba', 'Maxime Profil Final', NULL, NULL, NULL, NULL, 'Suivi Nutritionnel', NULL, NULL, '2026-04-27 00:17:47.513629+02', NULL),
('32eca6d3-bb9f-48c0-aa47-de8cfb902f03', 'ac1faaa4-2770-445d-af33-7701247482e8', 'pro@gmail.com', NULL, NULL, NULL, NULL, 'Suivi Nutritionnel', NULL, NULL, '2026-05-05 18:08:26.275664+02', NULL),
('32f62b5c-cf91-49dd-bc14-956c68789129', 'a5e9c376-4108-46ae-bbdc-ef05ea5ca9bc', 'lol@gmail.com', 30, 'Homme', 170, 70, 'Suivi Nutritionnel', NULL, NULL, '2026-05-05 19:10:41.629563+02', NULL),
('db62a5fd-2efb-40c2-98b1-98f0652bf69e', '4796ed14-aff2-4cc1-a9b3-984b6dc45596', 'dylan@gmail.com', 31, 'Lémurien', 175, 80, 'Coucou c est moi', NULL, NULL, '2026-05-06 09:36:16.241388+02', NULL);

-- -------------------------------------------------------
-- 3. ingredient
-- -------------------------------------------------------
CREATE TABLE public.ingredient (
    id_ingredient uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    nom text NOT NULL,
    code_barre text,
    calories_pour_100g numeric NOT NULL,
    proteines_pour_100g numeric NOT NULL,
    glucides_pour_100g numeric NOT NULL,
    lipides_pour_100g numeric NOT NULL,
    source text DEFAULT 'OpenFoodFacts'::text,
    id_externe_api text,
    UNIQUE (nom)
);

INSERT INTO public.ingredient (id_ingredient, nom, code_barre, calories_pour_100g, proteines_pour_100g, glucides_pour_100g, lipides_pour_100g, source, id_externe_api) VALUES
('dd030730-a355-4504-927d-e1532ef20f42', 'Abricot', NULL, 48, 1.4, 11.1, 0.4, 'OpenFoodFacts', NULL),
('82473af9-92f4-4814-a063-571ab072ab6a', 'Ail', NULL, 149, 6.4, 33.1, 0.5, 'OpenFoodFacts', NULL),
('67862b54-8700-40f9-a3db-877cfd42d834', 'Amande', NULL, 579, 21.2, 21.6, 49.9, 'OpenFoodFacts', NULL),
('51d850e7-ea8f-49cf-8031-a48d3a26b3e6', 'Ananas', NULL, 50, 0.5, 13.1, 0.1, 'OpenFoodFacts', NULL),
('f2d95cda-8345-4a79-a5a3-6c987c4d1206', 'Artichaut', NULL, 47, 3.3, 10.5, 0.2, 'OpenFoodFacts', NULL),
('76726eac-862b-4949-8d3b-bc37c3fbf7d5', 'Asperge', NULL, 20, 2.2, 3.9, 0.1, 'OpenFoodFacts', NULL),
('c9e93556-e109-41cf-9807-bfba32ec1e1e', 'Aubergine', NULL, 25, 1.0, 5.9, 0.2, 'OpenFoodFacts', NULL),
('4bf8da4a-a179-46e9-916b-82483649b632', 'Avocat', NULL, 160, 2.0, 8.5, 14.7, 'OpenFoodFacts', NULL),
('f74ef29e-3dda-4a17-8a45-fecb1cad1c62', 'Baguette (pain)', NULL, 274, 8.8, 55.0, 1.5, 'OpenFoodFacts', NULL),
('ee578367-56c7-4fea-b104-b7e242176af4', 'Banane', NULL, 89, 1.1, 22.8, 0.3, 'OpenFoodFacts', NULL),
('7e4e1089-6a23-41f6-aa62-0920289b8451', 'Bar (poisson)', NULL, 97, 19.4, 0.0, 2.0, 'OpenFoodFacts', NULL),
('6057e531-6913-4f70-bdc9-a28d604aeefc', 'Basilic (frais)', NULL, 23, 3.2, 2.7, 0.6, 'OpenFoodFacts', NULL),
('02d1d3bf-7983-4975-a4ec-be87a5c77d38', 'Betterave', NULL, 43, 1.6, 9.6, 0.2, 'OpenFoodFacts', NULL),
('b4cfe6e0-c4f5-405c-998f-230f1231c10d', 'Beurre', NULL, 717, 0.9, 0.1, 81.1, 'OpenFoodFacts', NULL),
('e311370d-ca5d-4bd4-8446-19b8553afad2', 'Bifteck', NULL, 271, 25.0, 0.0, 19.0, 'OpenFoodFacts', NULL),
('487d6d51-89c6-4204-a541-d34f15770233', 'Blanc de poulet', NULL, 165, 31.0, 0.0, 3.6, 'OpenFoodFacts', NULL),
('530226f9-1ff0-4cda-aed0-d7903aedaa48', 'Blanc d''oeuf', NULL, 52, 10.9, 0.7, 0.2, 'OpenFoodFacts', NULL),
('39fc5cfb-11c8-4f8d-8659-2d72a277ec35', 'Boeuf haché 5% MG', NULL, 121, 21.0, 0.0, 5.0, 'OpenFoodFacts', NULL),
('82d1a37d-b053-4106-b5ec-dd0eee4f902b', 'Brie', NULL, 334, 20.8, 0.5, 27.7, 'OpenFoodFacts', NULL),
('15112740-acf4-4133-b079-9ab3a6b869f7', 'Brocoli', NULL, 34, 2.8, 6.6, 0.4, 'OpenFoodFacts', NULL),
('d1699c98-604a-49d9-83dd-d8e723871fd9', 'Cabillaud', NULL, 82, 17.8, 0.0, 0.7, 'OpenFoodFacts', NULL),
('cfba11f3-720a-47dd-b493-a53310227569', 'Cacahuète', NULL, 567, 25.8, 16.1, 49.2, 'OpenFoodFacts', NULL),
('6dc3bf25-cfda-4d1a-aba2-75e63ec23208', 'Camembert', NULL, 300, 19.8, 0.5, 24.3, 'OpenFoodFacts', NULL),
('1f9f2a14-071f-474e-8b70-a7329bade3b0', 'Canard (magret)', NULL, 202, 19.0, 0.0, 14.0, 'OpenFoodFacts', NULL),
('ecd80b3c-d2f5-43f6-97c9-abf4f0efd10c', 'Carotte', NULL, 41, 0.9, 9.6, 0.2, 'OpenFoodFacts', NULL),
('ddedd15a-782c-44e0-884c-07d878adbe61', 'Céleri branche', NULL, 16, 0.7, 3.0, 0.2, 'OpenFoodFacts', NULL),
-- (continue avec tous les ingrédients… je vais tous les mettre ci-dessous pour être complet)
('f90d87e4-348b-4c38-bce4-e6e1ddb6b74d', 'Céréales petit-déj (moyenne)', NULL, 379, 8.0, 72.0, 4.0, 'OpenFoodFacts', NULL),
('e7427e72-cd71-45b1-b839-6f8bfac3ad92', 'Cerise', NULL, 63, 1.1, 16.0, 0.2, 'OpenFoodFacts', NULL),
('faeb588e-ad1c-47fe-8ba0-c9eb5360e09f', 'Champignon de Paris', NULL, 22, 3.1, 3.3, 0.3, 'OpenFoodFacts', NULL),
('257699e3-ae07-41ea-b782-708fdc5d18c1', 'Chou-fleur', NULL, 25, 1.9, 5.0, 0.3, 'OpenFoodFacts', NULL),
('2a3c983e-7a33-4f08-b609-a32fb45062cd', 'Chou rouge', NULL, 31, 1.4, 7.4, 0.2, 'OpenFoodFacts', NULL),
('143c1d25-7de5-4beb-bbcd-f7d5488dc0c8', 'Citron', NULL, 29, 1.1, 9.3, 0.3, 'OpenFoodFacts', NULL),
('027c2aa9-af27-46c3-8cf7-d3ea52825ca5', 'Clémentine', NULL, 47, 0.9, 12.0, 0.2, 'OpenFoodFacts', NULL),
('5b069a2b-456b-4627-8979-3d2c4ab48c9e', 'Colin (poisson)', NULL, 82, 18.0, 0.0, 0.8, 'OpenFoodFacts', NULL),
('8e5f5e4b-7dd2-4804-bf96-f237ee55bf11', 'Comté', NULL, 419, 28.0, 1.0, 33.0, 'OpenFoodFacts', NULL),
('e7dd6969-791e-4e50-aa8c-28125b3bfc00', 'Concombre', NULL, 16, 0.7, 3.6, 0.1, 'OpenFoodFacts', NULL),
('122fd7df-297d-41a6-8847-a48d32630822', 'Courgette', NULL, 17, 1.2, 3.1, 0.3, 'OpenFoodFacts', NULL),
('583c352f-c055-4d2f-be5d-9ed5f91ce202', 'Crème fraîche 30%', NULL, 292, 2.4, 3.0, 30.0, 'OpenFoodFacts', NULL),
('243d6fdc-2c0a-4ab7-8b63-37c0fdc75657', 'Crevette', NULL, 99, 24.0, 0.2, 1.0, 'OpenFoodFacts', NULL),
('60f91c21-2db6-4514-8849-428a00e1d8b4', 'Croissant', NULL, 406, 8.2, 45.8, 21.0, 'OpenFoodFacts', NULL),
('815b495a-f102-4843-9a7e-88796d01c809', 'Dinde (escalope)', NULL, 105, 24.0, 0.0, 1.2, 'OpenFoodFacts', NULL),
('d36de014-83e7-4ef5-ae6c-8c6f3ba1cc39', 'Eau (0 cal)', NULL, 0, 0, 0, 0, 'OpenFoodFacts', NULL),
('76910f6f-1127-4570-ac86-12978f266cb0', 'Échalote', NULL, 72, 2.5, 16.8, 0.1, 'OpenFoodFacts', NULL),
('89c7d2fe-bfea-4e24-b9af-d7d521a19784', 'Emmental', NULL, 378, 29.0, 1.0, 28.0, 'OpenFoodFacts', NULL),
('3ac2b284-541e-4df5-82e4-0fab4db65805', 'Endive', NULL, 17, 1.1, 3.3, 0.1, 'OpenFoodFacts', NULL),
('8ffd37bb-f5ca-4425-afeb-57c6446e3ad1', 'Épinard', NULL, 23, 2.9, 3.6, 0.4, 'OpenFoodFacts', NULL),
('aa58c47e-61f8-4474-a183-c8a81031fdc5', 'Farine de blé', NULL, 364, 10.3, 76.3, 1.0, 'OpenFoodFacts', NULL),
('57b6a703-45a5-4b72-bb75-0b711c2e8752', 'Feta', NULL, 264, 14.2, 4.1, 21.3, 'OpenFoodFacts', NULL),
('c16ce25f-a280-49cc-a51c-5a46a8757b31', 'Fève', NULL, 88, 7.9, 11.6, 0.7, 'OpenFoodFacts', NULL),
('2d3a51a4-66f4-49ab-a436-224fed737b30', 'Foie de veau', NULL, 140, 19.3, 4.5, 4.7, 'OpenFoodFacts', NULL),
('2e06bee6-b457-4187-ab85-3abdc0c1b869', 'Fraises', NULL, 32, 0.7, 7.7, 0.3, 'OpenFoodFacts', NULL),
('87fa140b-0f77-4057-b363-90b4707ac072', 'Framboises', NULL, 53, 1.2, 11.9, 0.7, 'OpenFoodFacts', NULL),
('f2eee33a-b70f-4e20-921b-510327e8019a', 'Fromage blanc 0%', NULL, 50, 8.0, 4.0, 0.1, 'OpenFoodFacts', NULL),
('67c9aabe-2623-4198-8bab-83bdd83f4c8a', 'Fromage blanc 20%', NULL, 80, 7.0, 4.0, 3.5, 'OpenFoodFacts', NULL),
('789fc812-ca99-4367-9ac8-a93853906514', 'Fruits de mer (moyenne)', NULL, 85, 14.0, 2.0, 1.5, 'OpenFoodFacts', NULL),
('ee52787b-5159-4bfe-b5af-59aa0435662b', 'Gigot d''agneau', NULL, 225, 20.0, 0.0, 16.0, 'OpenFoodFacts', NULL),
('c1d071f2-2951-4cc8-b81a-b8c226f351f9', 'Gingembre', NULL, 80, 1.8, 17.8, 0.8, 'OpenFoodFacts', NULL),
('5f14f871-255a-4ffd-af8e-eda2651c34dd', 'Gorgonzola', NULL, 370, 21.0, 2.0, 31.0, 'OpenFoodFacts', NULL),
('e2b4a4c6-78b8-4b84-a022-a5ba5bc6570c', 'Groseille', NULL, 56, 1.4, 13.8, 0.2, 'OpenFoodFacts', NULL),
('7fadb790-deb2-4b5c-bd48-f04c2a33f158', 'Haricot vert', NULL, 31, 1.8, 7.0, 0.2, 'OpenFoodFacts', NULL),
('5d1cf728-1f30-4563-b594-564f59294c97', 'Haricots blancs (cuits)', NULL, 139, 9.7, 25.1, 0.5, 'OpenFoodFacts', NULL),
('7aa782df-ad90-4607-b6ef-121d2ea571c4', 'Huile d''olive', NULL, 884, 0.0, 0.0, 100.0, 'OpenFoodFacts', NULL),
('4c35049a-43b3-424a-84bf-04f612c6a93f', 'Huile de tournesol', NULL, 884, 0.0, 0.0, 100.0, 'OpenFoodFacts', NULL),
('84540e2e-b2b0-4463-bc0e-a6f56dbadb7f', 'Jambon blanc', NULL, 116, 20.4, 0.5, 3.6, 'OpenFoodFacts', NULL),
('407a514a-8fdf-4d1e-80f9-c697f04bd5c8', 'Jambon cru', NULL, 250, 27.0, 0.5, 15.0, 'OpenFoodFacts', NULL),
('99313134-28df-4d8d-a5dd-36d088fb35d6', 'Jus d''orange', NULL, 45, 0.7, 10.4, 0.2, 'OpenFoodFacts', NULL),
('47916d30-59ba-4d0c-9518-4b53aa7a20f6', 'Kiwi', NULL, 61, 1.1, 14.7, 0.5, 'OpenFoodFacts', NULL),
('245ab886-2723-441c-bbf2-31e5b0d2e645', 'Lait demi-écrémé', NULL, 46, 3.2, 4.8, 1.6, 'OpenFoodFacts', NULL),
('6e5a1138-bb04-45f6-aa95-a72be616e847', 'Lait entier', NULL, 61, 3.0, 4.8, 3.3, 'OpenFoodFacts', NULL),
('df84cb55-b64a-4619-872b-72c05a979968', 'Laitue', NULL, 15, 1.4, 2.9, 0.2, 'OpenFoodFacts', NULL),
('0b26bea5-7153-4560-8453-da1639ecfd99', 'Lardon fumé', NULL, 290, 14.0, 1.0, 26.0, 'OpenFoodFacts', NULL),
('28ab1a35-3eed-46fd-a31a-7c119676fa54', 'Lasagnes (maison)', NULL, 155, 8.0, 15.0, 7.0, 'OpenFoodFacts', NULL),
('8c49c01a-0085-4795-b326-ec9e86184c5d', 'Lentilles (cuites)', NULL, 116, 9.0, 20.1, 0.4, 'OpenFoodFacts', NULL),
('deea0444-86e3-4a67-8d23-2a6a792bd212', 'Maïs (grain)', NULL, 365, 9.4, 74.3, 4.7, 'OpenFoodFacts', NULL),
('f1990aa5-a9e5-4007-8e58-2c4620f88dbe', 'Mandarine', NULL, 53, 0.8, 13.3, 0.3, 'OpenFoodFacts', NULL),
('49994abe-d40e-446d-8b94-34d9bab663cf', 'Mangue', NULL, 60, 0.8, 15.0, 0.4, 'OpenFoodFacts', NULL),
('58a03762-381f-4645-a00d-5dbeacaef015', 'Margarine', NULL, 717, 0.2, 0.7, 80.7, 'OpenFoodFacts', NULL),
('d4445d63-e8c6-4850-be7a-d46ef5240524', 'Melon', NULL, 34, 0.8, 8.2, 0.2, 'OpenFoodFacts', NULL),
('47b67a70-5ed3-48c0-99a4-abe0fed420e3', 'Miel', NULL, 304, 0.3, 82.4, 0.0, 'OpenFoodFacts', NULL),
('b0cf7b9a-71f8-4ce2-a6ca-fd005644a7f6', 'Moules', NULL, 86, 11.9, 3.7, 2.2, 'OpenFoodFacts', NULL),
('f0e2b4d2-19d2-41cd-897c-04456d218fd9', 'Moutarde', NULL, 135, 5.7, 6.0, 9.0, 'OpenFoodFacts', NULL),
('254375f5-6305-4b51-a9d2-3cdb2e6f30fa', 'Mozzarella', NULL, 280, 22.0, 3.0, 20.0, 'OpenFoodFacts', NULL),
('a1b3490b-ce08-421b-85e6-8054edf0ea17', 'Myrtille', NULL, 57, 0.7, 14.5, 0.3, 'OpenFoodFacts', NULL),
('3df88947-35c0-4ede-bfa0-0dc74d6a3d59', 'Navet', NULL, 28, 0.9, 6.4, 0.1, 'OpenFoodFacts', NULL),
('9d5d9849-38d2-4a9e-8f30-956f17d438d3', 'Noisette', NULL, 628, 14.9, 16.7, 60.8, 'OpenFoodFacts', NULL),
('d99531ba-cdf1-4304-963e-b0d0fd520efc', 'Noix', NULL, 654, 15.0, 13.7, 65.0, 'OpenFoodFacts', NULL),
('e52f35ce-7966-4ae8-a4da-ea866847228c', 'Oeuf (entier)', NULL, 155, 12.6, 1.1, 10.6, 'OpenFoodFacts', NULL),
('58c539ac-3760-47b3-8491-43f7adedfa4d', 'Oeuf dur', NULL, 155, 12.6, 1.1, 10.6, 'OpenFoodFacts', NULL),
('6ae3f16b-0c15-4c2d-86af-7160508eb253', 'Oignon', NULL, 40, 1.1, 9.3, 0.1, 'OpenFoodFacts', NULL),
('2c2f57f8-16be-4032-8e7e-94961db8e663', 'Olive verte', NULL, 145, 1.0, 3.8, 15.3, 'OpenFoodFacts', NULL),
('2a28ece2-44ef-412c-a368-47844b2220af', 'Orange', NULL, 47, 0.9, 11.8, 0.1, 'OpenFoodFacts', NULL),
('859deaa4-ad81-4b22-9b37-6f8045edcb9a', 'Pain complet', NULL, 247, 9.0, 46.0, 1.8, 'OpenFoodFacts', NULL),
('c1704f59-2e8a-4c39-adfd-51d7a5a46070', 'Pain de mie', NULL, 285, 8.0, 52.0, 4.0, 'OpenFoodFacts', NULL),
('1c7a617c-2f19-48c9-aaa8-a21c0294b67b', 'Pamplemousse', NULL, 42, 0.8, 10.7, 0.1, 'OpenFoodFacts', NULL),
('4966b501-2edc-463f-bb47-fecbac3f8cbd', 'Panais', NULL, 75, 1.2, 18.0, 0.3, 'OpenFoodFacts', NULL),
('2ad22e49-c17f-4bd2-84b0-2f9ba201c439', 'Papaye', NULL, 43, 0.5, 10.8, 0.3, 'OpenFoodFacts', NULL),
('18c928e6-7794-4e9d-a7be-ade351c3d0c1', 'Parmesan', NULL, 431, 38.0, 4.0, 29.0, 'OpenFoodFacts', NULL),
('8d7f0199-8be7-4408-a8e3-2b320d6e0287', 'Pastèque', NULL, 30, 0.6, 7.6, 0.2, 'OpenFoodFacts', NULL),
('d4c2af42-257c-4594-a430-e559f82bc9ac', 'Patate douce', NULL, 86, 1.6, 20.1, 0.1, 'OpenFoodFacts', NULL),
('fbef84a5-7a3a-4ccb-955d-70521c7fd0dd', 'Pâtes (cuites)', NULL, 131, 5.0, 24.9, 0.9, 'OpenFoodFacts', NULL),
('793361b1-2820-4f2d-aa5c-1350c67181bc', 'Pâtes (sèches)', NULL, 350, 12.0, 70.0, 1.5, 'OpenFoodFacts', NULL),
('8e93f693-1443-45f4-89fb-d31c3ec5cf65', 'Pêche', NULL, 39, 0.7, 9.5, 0.3, 'OpenFoodFacts', NULL),
('d2d0be1d-784c-4c07-a3a2-dfad17e14127', 'Persil', NULL, 36, 3.0, 6.3, 0.8, 'OpenFoodFacts', NULL),
('09638927-3528-4214-af3b-075c7e5cecc4', 'Pistache', NULL, 560, 20.0, 27.0, 45.0, 'OpenFoodFacts', NULL),
('d0632560-d675-4bc9-8088-530a15134e92', 'Poire', NULL, 57, 0.4, 15.5, 0.1, 'OpenFoodFacts', NULL),
('52d605dc-6dca-475d-bd4f-dd4c18401798', 'Poireau', NULL, 61, 1.5, 14.2, 0.3, 'OpenFoodFacts', NULL),
('f1bae342-e549-4bc3-8cf5-edfcbed862fa', 'Pois chiche (cuit)', NULL, 139, 7.0, 23.0, 2.6, 'OpenFoodFacts', NULL),
('d9a222d2-db69-4d9f-8655-cc9e2aaaed45', 'Poisson pané', NULL, 190, 12.0, 15.0, 9.0, 'OpenFoodFacts', NULL),
('44ccfa07-c126-4d89-a032-cfdafe8911c1', 'Poivron', NULL, 20, 0.9, 4.6, 0.2, 'OpenFoodFacts', NULL),
('07544b4c-6eff-441b-93c2-5b9adab45d65', 'Pomme', NULL, 52, 0.3, 14.0, 0.2, 'OpenFoodFacts', NULL),
('91c064f4-7971-4dc6-9b56-baa5a6863f3e', 'Pomme de terre', NULL, 77, 2.0, 17.5, 0.1, 'OpenFoodFacts', NULL),
('1652a4e5-61b0-485b-b667-04d3f1ecec3c', 'Porc (côtelette)', NULL, 229, 20.0, 0.0, 16.0, 'OpenFoodFacts', NULL),
('77b062ec-18d2-45d8-811e-ccef79a4a60f', 'Poulet rôti', NULL, 190, 25.0, 0.0, 9.0, 'OpenFoodFacts', NULL),
('4716282a-2443-4dbd-95dd-2ae926fa6398', 'Prune', NULL, 46, 0.7, 11.4, 0.3, 'OpenFoodFacts', NULL),
('4735db3e-ec25-47c5-af88-5c3a4c8f6430', 'Raisin', NULL, 69, 0.7, 18.1, 0.2, 'OpenFoodFacts', NULL),
('3b595485-2542-4e63-9edb-d0fa02a7142c', 'Ratatouille (cuisinée)', NULL, 47, 1.0, 5.0, 2.8, 'OpenFoodFacts', NULL),
('30e228a9-df34-4afd-a373-14f035a57a44', 'Ravioli (boîte)', NULL, 110, 4.0, 15.0, 3.5, 'OpenFoodFacts', NULL),
('b9ea5854-5b12-48c0-a70d-8e522ea36dee', 'Rhum', NULL, 231, 0.0, 0.0, 0.0, 'OpenFoodFacts', NULL),
('ec3982ef-8e95-404a-928d-c158f98440a8', 'Riz blanc (cuit)', NULL, 130, 2.7, 28.0, 0.3, 'OpenFoodFacts', NULL),
('e2daab8d-82c4-4907-8021-c69b55fcf122', 'Riz complet (cuit)', NULL, 111, 2.6, 23.0, 0.9, 'OpenFoodFacts', NULL),
('86e12844-8118-4507-a8be-50b919c094bf', 'Roquette', NULL, 25, 2.6, 3.7, 0.7, 'OpenFoodFacts', NULL),
('7cfc9830-d9d9-4826-8534-db9271e858ee', 'Rôti de boeuf', NULL, 180, 28.0, 0.0, 8.0, 'OpenFoodFacts', NULL),
('c1848ef6-550d-4a06-b438-776543bd47e2', 'Rôti de porc', NULL, 200, 25.0, 0.0, 11.0, 'OpenFoodFacts', NULL),
('514517ce-df28-40f3-9287-1f5d9a6f3e10', 'Salami', NULL, 425, 18.0, 1.0, 37.0, 'OpenFoodFacts', NULL),
('d9c82c4f-399d-4825-b8bd-a6ef78ca82b1', 'Sardine (à l''huile)', NULL, 208, 24.6, 0.0, 11.4, 'OpenFoodFacts', NULL),
('931dc45c-86ba-4292-8c59-f07515bf14d4', 'Sarrasin (cuit)', NULL, 92, 3.4, 19.9, 0.6, 'OpenFoodFacts', NULL),
('808f1487-e465-4788-b6d6-47451b6db449', 'Saucisson sec', NULL, 400, 23.0, 1.0, 33.0, 'OpenFoodFacts', NULL),
('a1b763a6-15d8-4772-8ca8-67056b6eb8f9', 'Saumon', NULL, 206, 20.0, 0.0, 14.0, 'OpenFoodFacts', NULL),
('e81db5d6-0652-411b-bf50-09c7a03c25a2', 'Semoule (sèche)', NULL, 360, 12.0, 73.0, 1.0, 'OpenFoodFacts', NULL),
('ba0e8bb9-7f41-469a-a749-5cd5b46fcbc8', 'Sirop d''érable', NULL, 260, 0.0, 67.0, 0.1, 'OpenFoodFacts', NULL),
('5e495b7a-9453-4dbb-8a07-0154c0d7eb99', 'Sole', NULL, 91, 17.5, 0.0, 1.5, 'OpenFoodFacts', NULL),
('b94ecda6-f75e-4bfc-9af8-6536aef32683', 'Sorbet citron', NULL, 130, 0.1, 32.0, 0.0, 'OpenFoodFacts', NULL),
('4729abb2-5c05-444a-ae72-4e1ffd9fe08b', 'Steak haché 15%', NULL, 215, 19.0, 0.0, 15.0, 'OpenFoodFacts', NULL),
('84046015-6edc-4999-84ec-d39e53a69c10', 'Sucre blanc', NULL, 400, 0.0, 100.0, 0.0, 'OpenFoodFacts', NULL),
('467e89ec-97ef-4fee-a013-2ab073453cd8', 'Surimi', NULL, 100, 8.0, 12.0, 2.0, 'OpenFoodFacts', NULL),
('257eb87c-a86b-4500-9d3a-5127213080d8', 'Thon au naturel', NULL, 116, 26.0, 0.0, 1.0, 'OpenFoodFacts', NULL),
('73b61835-e57d-47c0-9bd4-561f55e8894e', 'Thon à l''huile', NULL, 198, 24.0, 0.0, 10.0, 'OpenFoodFacts', NULL),
('4f82aa10-10b6-44dc-92d5-ffedcef22268', 'Tomate', NULL, 18, 0.9, 3.9, 0.2, 'OpenFoodFacts', NULL),
('3ebfb950-f6bc-4631-9820-e1d0acfb20f2', 'Tortilla (wrap)', NULL, 300, 8.0, 52.0, 6.0, 'OpenFoodFacts', NULL),
('4ccde0d9-dcf2-4315-9dc0-d1e430e17595', 'Truite', NULL, 138, 19.0, 0.0, 6.0, 'OpenFoodFacts', NULL),
('fda9f648-c927-44a6-b02e-df497e4201c6', 'Veau (escalope)', NULL, 108, 21.0, 0.0, 3.0, 'OpenFoodFacts', NULL),
('14714b78-fcad-4f31-885d-5fd00cc1e4d4', 'Vin rouge', NULL, 85, 0.1, 3.0, 0.0, 'OpenFoodFacts', NULL),
('8bd0ebc8-c91f-4422-96f4-6fadae41eb4d', 'Yaourt nature', NULL, 63, 4.0, 5.0, 3.0, 'OpenFoodFacts', NULL),
('ffa16751-8799-47b1-a895-ea535d5f9051', 'Yaourt aux fruits', NULL, 96, 3.0, 15.0, 2.0, 'OpenFoodFacts', NULL),
('7a65169c-e17a-4954-9a6c-5faab7da257a', 'Lasagnes', NULL, 173, 12, 12.45, 7.95, 'OpenFoodFacts', NULL),
('2ef9e19f-1648-4ffe-9c7d-900c2b9240bd', 'Prince Goût Chocolat au blé complet', NULL, 465, 6.3, 69, 17, 'OpenFoodFacts', NULL),
('94cf6c4b-8b1a-48e2-8fe2-7795a8454315', 'Lasagne', NULL, 210, 31.55, 11.4, 3.75, 'OpenFoodFacts', NULL),
('ea604ccf-2bbf-466b-9a4c-452e65180cc1', 'test', NULL, 65, 5.33, 6.84, 1.89, 'OpenFoodFacts', NULL),
('432b5a01-91e0-49e3-a815-7e472f7421cc', 'pates carbonara', NULL, 66, 2.5, 12.45, 0.45, 'OpenFoodFacts', NULL),
('70cfdd64-94fe-400f-9c92-453430810e49', 'Boeuf, steak haché 10% MG cru', NULL, 170, 20, 0, 10, 'OpenFoodFacts', NULL),
('03435615-ed26-46c3-97c6-964bb1bfdb55', 'lasagnes maison', NULL, 373, 41.25, 6.225, 20.225, 'OpenFoodFacts', NULL);

-- -------------------------------------------------------
-- 4. repas
-- -------------------------------------------------------
CREATE TABLE public.repas (
    id_repas uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    id_profil uuid NOT NULL REFERENCES public.profil(id_profil) ON DELETE CASCADE,
    nom_repas text,
    date_repas timestamptz DEFAULT now() NOT NULL,
    type_repas text,
    date_creation timestamptz DEFAULT now()
);

INSERT INTO public.repas (id_repas, id_profil, nom_repas, date_repas, type_repas, date_creation) VALUES
('baae2c5d-3a1f-44f9-bf3f-37a25ae2e475', '32f62b5c-cf91-49dd-bc14-956c68789129', 'Lasagnes', '2026-05-05 19:11:22.235634+02', 'Repas', '2026-05-05 19:11:22.235634+02'),
('cb00f14f-54c4-489d-9494-b003880744b1', '32f62b5c-cf91-49dd-bc14-956c68789129', 'Prince Goût Chocolat au blé complet', '2026-05-05 20:01:54.245619+02', 'Repas', '2026-05-05 20:01:54.245619+02'),
('b4525c72-7f81-4787-8d44-36da1e73f328', '32eca6d3-bb9f-48c0-aa47-de8cfb902f03', 'Lasagne', '2026-05-06 09:19:38.585184+02', 'Repas', '2026-05-06 09:19:38.585184+02'),
('52b1a617-0249-48ca-a431-70725a2cca60', '32eca6d3-bb9f-48c0-aa47-de8cfb902f03', 'test', '2026-05-06 09:20:59.699309+02', 'Repas', '2026-05-06 09:20:59.699309+02'),
('caa7a256-65f9-4f04-9e25-00a052bf64ab', '32f62b5c-cf91-49dd-bc14-956c68789129', 'pates carbonara', '2026-05-12 15:40:38.497305+02', 'Repas', '2026-05-12 15:40:38.497305+02'),
('2fd83009-84c5-4917-8295-94dc08291f59', '32f62b5c-cf91-49dd-bc14-956c68789129', 'Boeuf, steak haché 10% MG cru', '2026-05-12 15:40:50.795804+02', 'Repas', '2026-05-12 15:40:50.795804+02'),
('df252440-4ffd-46dd-8184-d0bc378a1b35', '32f62b5c-cf91-49dd-bc14-956c68789129', 'lasagnes maison', '2026-05-12 15:54:40.418494+02', 'Repas', '2026-05-12 15:54:40.418494+02');

-- -------------------------------------------------------
-- 5. composition_repas
-- -------------------------------------------------------
CREATE TABLE public.composition_repas (
    id_composition uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    id_repas uuid NOT NULL REFERENCES public.repas(id_repas) ON DELETE CASCADE,
    id_ingredient uuid NOT NULL REFERENCES public.ingredient(id_ingredient) ON DELETE CASCADE,
    quantite_grammes numeric NOT NULL
);

INSERT INTO public.composition_repas (id_composition, id_repas, id_ingredient, quantite_grammes) VALUES
('6e2dea48-5425-4a78-9ff8-6034e79bfe2c', 'baae2c5d-3a1f-44f9-bf3f-37a25ae2e475', '7a65169c-e17a-4954-9a6c-5faab7da257a', 100),
('69218e51-37e1-4d5e-ac29-22fb510782f6', 'cb00f14f-54c4-489d-9494-b003880744b1', '2ef9e19f-1648-4ffe-9c7d-900c2b9240bd', 100),
('9740f9c6-b9d8-4522-b318-c46cfd7efad0', 'b4525c72-7f81-4787-8d44-36da1e73f328', '94cf6c4b-8b1a-48e2-8fe2-7795a8454315', 100),
('6dece517-769a-4ba2-b78e-ede8957bec97', '52b1a617-0249-48ca-a431-70725a2cca60', 'ea604ccf-2bbf-466b-9a4c-452e65180cc1', 100),
('9a632e19-863d-4429-918a-ae038e0c642c', 'caa7a256-65f9-4f04-9e25-00a052bf64ab', '432b5a01-91e0-49e3-a815-7e472f7421cc', 100),
('7d892e57-4036-4fc3-95e3-6e533d59fa08', '2fd83009-84c5-4917-8295-94dc08291f59', '70cfdd64-94fe-400f-9c92-453430810e49', 100),
('5f7f9a0c-945e-4cf9-b659-f7bdf7750d62', 'df252440-4ffd-46dd-8184-d0bc378a1b35', '03435615-ed26-46c3-97c6-964bb1bfdb55', 100);

ALTER TABLE profil ADD COLUMN date_naissance date;