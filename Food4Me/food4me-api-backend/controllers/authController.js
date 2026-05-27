const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

// REGISTER
exports.register = async (req, res) => {

    try {

        const {
            email,
            password,
            nom,
            prenom,
            objectif,
            genre,
            dateNaissance,
            poids,
            taille,
            niveauActivite
        } = req.body;

        console.log("data received ", {
            email,
            password,
            nom,
            prenom,
            objectif,
            genre,
            dateNaissance,
            poids,
            taille,
            niveauActivite
        });

        // Vérifie si email existe déjà
        const userExist = await pool.query(
            "SELECT * FROM utilisateur WHERE email = $1",
            [email]
        );

        if (userExist.rows.length > 0) {
            return res.status(400).json({
                message: "Email déjà utilisé"
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);

        const hashedPassword = await bcrypt.hash(password, salt);

        // Création utilisateur
        const newUser = await pool.query(
            `INSERT INTO utilisateur
            (
                email,
                mot_de_passe_hash
            )
            VALUES ($1, $2)
            RETURNING id_utilisateur`,
            [
                email,
                hashedPassword
            ]
        );

        const userId = newUser.rows[0].id_utilisateur;

        // Création profil (SANS AGE)
        await pool.query(
            `INSERT INTO profil
            (
                id_utilisateur,
                nom,
                prenom,
                genre,
                date_naissance,
                taille_cm,
                poids_kg,
                objectif,
                niveau_activite
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
            [
                userId,
                nom,
                prenom,
                genre,
                dateNaissance,
                taille,
                poids,
                objectif,
                niveauActivite

            ]
        );

        console.log("📥 niveauActivite =", niveauActivite);

        // Génération token
        const token = jwt.sign(
            {
                id: userId
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "24h"
            }
        );

        res.status(201).json({
            message: "Compte créé avec succès",
            token,
            userId
        });

    } catch (err) {

        console.error("❌ ERREUR REGISTER :", err.message);
        console.error("Stack:", err.stack);

        // ✅ GESTION DES ERREURS DB SPÉCIFIQUES
        if (err.message.includes("timeout")) {
            return res.status(503).json({
                message: "Base de données indisponible (timeout)"
            });
        }

        res.status(500).json({
            message: "Erreur serveur / réseau"
        });
    }
};

// LOGIN
exports.login = async (req, res) => {

    try {

        const { email, password } = req.body;

        console.log(`🔐 LOGIN: ${email}`);

        // ✅ TIMEOUT EXPLICITE POUR LA REQUÊTE
        const loginTimeout = setTimeout(() => {
            return res.status(503).json({
                message: "Timeout de connexion à la base de données"
            });
        }, 5000);

        // Vérifie utilisateur
        const user = await pool.query(
            "SELECT * FROM utilisateur WHERE email = $1",
            [email]
        );

        clearTimeout(loginTimeout);

        if (user.rows.length === 0) {
            return res.status(401).json({
                message: "Identifiants incorrects"
            });
        }

        // Vérifie mot de passe
        const validPassword = await bcrypt.compare(
            password,
            user.rows[0].mot_de_passe_hash
        );

        if (!validPassword) {
            return res.status(401).json({
                message: "Identifiants incorrects"
            });
        }

        // Mise à jour dernière connexion
        await pool.query(
            `UPDATE utilisateur
             SET derniere_connexion = NOW()
             WHERE id_utilisateur = $1`,
            [user.rows[0].id_utilisateur]
        );

        // Génération token
        const token = jwt.sign(
            {
                id: user.rows[0].id_utilisateur
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "24h"
            }
        );

        console.log(`✅ LOGIN RÉUSSI: ${email}`);

        res.json({
            message: "Connexion réussie",
            token,
            userId: user.rows[0].id_utilisateur
        });

    } catch (err) {

        console.error("❌ ERREUR LOGIN:", err.message);
        console.error("Stack:", err.stack);

        // ✅ GESTION DES ERREURS DB SPÉCIFIQUES
        if (err.message.includes("timeout") || err.code === "ECONNREFUSED") {
            return res.status(503).json({
                message: "Base de données indisponible"
            });
        }

        res.status(500).json({
            message: "Erreur serveur / réseau"
        });
    }
};

exports.me = async (req, res) => {
    try {
        const user = await pool.query(
            "SELECT id_utilisateur, email FROM utilisateur WHERE id_utilisateur = $1",
            [req.user.id]
        );
        if (user.rows.length === 0) return res.status(404).json({ error: "Utilisateur introuvable" });

        const profil = await pool.query(
            `SELECT nom, prenom, genre, date_naissance, taille_cm, poids_kg, objectif
             FROM profil WHERE id_utilisateur = $1`,
            [req.user.id]
        );

        const result = { id: user.rows[0].id_utilisateur, email: user.rows[0].email };
        if (profil.rows.length > 0) {
            result.profil = profil.rows[0];
        }

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: "Erreur serveur" });
    }
};