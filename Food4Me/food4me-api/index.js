const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('./db');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// ROUTE D'INSCRIPTION
app.post('/auth/register', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1 on vérifsi l'utilisateur existe déjà
        const userExist = await pool.query("SELECT * FROM utilisateur WHERE email = $1", [email]);
        if (userExist.rows.length !== 0) return res.status(401).send("L'email est déjà utilisé.");

        // 2 on "hashe" le mot de passe
        const salt = await bcrypt.genSalt(10);
        const bcryptPassword = await bcrypt.hash(password, salt);

        // 3 on enregistre dans postgreSQL
        const newUser = await pool.query(
            "INSERT INTO utilisateur (email, mot_de_passe_hash) VALUES ($1, $2) RETURNING *",
            [email, bcryptPassword]
        );

        res.json({ message: "Compte créé avec succès !" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Erreur serveur");
    }
});

// ROUTE DE CONNEXION (LOGIN)
app.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Chercher l'utilisateur dans la BDD
        const user = await pool.query("SELECT * FROM utilisateur WHERE email = $1", [email]);

        if (user.rows.length === 0) {
            return res.status(401).json("Email ou mot de passe incorrect");
        }

        // 2. Comparer le mot de passe saisi avec le hash en BDD
        const validPassword = await bcrypt.compare(password, user.rows[0].mot_de_passe_hash);

        if (!validPassword) {
            return res.status(401).json("Email ou mot de passe incorrect");
        }

        // 3. Générer un Token JWT 
        const token = jwt.sign(
            { id: user.rows[0].id_utilisateur },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ token, message: "Connexion réussie !" });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Erreur serveur");
    }
});

// ROUTE POUR AJOUTER UN REPAS
app.post('/repas/ajouter', async (req, res) => {
    try {
        const { nom, calories, id_utilisateur } = req.body;

        const result = await pool.query(
            "INSERT INTO repas (nom, calories, id_utilisateur, date_repas) VALUES ($1, $2, $3, NOW()) RETURNING *",
            [nom, calories, id_utilisateur]
        );

        res.json({ message: "Repas enregistré dans la table repas !", data: result.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json("Erreur lors de l'ajout en base");
    }
});

// ROUTE POUR AJOUTER UN REPAS COMPLET (AVEC INGRÉDIENTS ET NUTRIMENTS)
app.post('/repas/ajouter-complet', async (req, res) => {
    const { id_profil, nom_produit, nutriments, quantite } = req.body;

    try {
        // 1. On insère l'ingrédient (ou on le récupère s'il existe déjà)
        const ing = await pool.query(
            `INSERT INTO ingredient (nom, calories_pour_100g, proteines_pour_100g, glucides_pour_100g, lipides_pour_100g) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id_ingredient`,
            [
                nom_produit,
                nutriments.cal || 0,
                nutriments.prot || 0,
                nutriments.glu || 0,
                nutriments.lip || 0
            ]
        );
        const id_ing = ing.rows[0].id_ingredient;

        // 2. On crée le repas
        const rep = await pool.query(
            `INSERT INTO repas (id_profil, nom_repas, type_repas) 
       VALUES ($1, $2, $3) RETURNING id_repas`,
            [id_profil, "Mon Repas", "Déjeuner"]
        );
        const id_rep = rep.rows[0].id_repas;

        // 3. On lie les deux dans composition_repas
        await pool.query(
            `INSERT INTO composition_repas (id_repas, id_ingredient, quantite_grammes) 
       VALUES ($1, $2, $3)`,
            [id_rep, id_ing, quantite]
        );

        res.json({ message: "Calcul et enregistrement réussis !" });
    } catch (err) {
        console.error(err);
        res.status(500).send("Erreur BDD");
    }
});

app.listen(3000, () => console.log("Serveur démarré sur le port 3000"));