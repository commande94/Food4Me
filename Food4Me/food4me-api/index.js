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

app.listen(3000, () => console.log("Serveur démarré sur le port 3000"));