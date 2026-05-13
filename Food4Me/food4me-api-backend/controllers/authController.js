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
            taille
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
            taille
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
                objectif
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
            [
                userId,
                nom,
                prenom,
                genre,
                dateNaissance,
                taille,
                poids,
                objectif
            ]
        );

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

        console.error(err);

        res.status(500).json({
            message: "Erreur serveur"
        });
    }
};

// LOGIN
exports.login = async (req, res) => {

    try {

        const { email, password } = req.body;

        // Vérifie utilisateur
        const user = await pool.query(
            "SELECT * FROM utilisateur WHERE email = $1",
            [email]
        );

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

        res.json({
            message: "Connexion réussie",
            token,
            userId: user.rows[0].id_utilisateur
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Erreur serveur"
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
        res.json({ id: user.rows[0].id_utilisateur, email: user.rows[0].email });
    } catch (err) {
        res.status(500).json({ error: "Erreur serveur" });
    }
};