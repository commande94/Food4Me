const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

// REGISTER
exports.register = async (req, res) => {
    try {
        const { email, password } = req.body;

        const userExist = await pool.query(
            "SELECT * FROM utilisateur WHERE email = $1",
            [email]
        );

        if (userExist.rows.length !== 0) {
            return res.status(401).send("Email déjà utilisé");
        }

        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(password, salt);

        await pool.query(
            "INSERT INTO utilisateur (email, mot_de_passe_hash) VALUES ($1, $2)",
            [email, hashed]
        );

        res.json({ message: "Compte créé !" });
    } catch (err) {
        console.error(err);
        res.status(500).send("Erreur serveur");
    }
};

// LOGIN
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await pool.query(
            "SELECT * FROM utilisateur WHERE email = $1",
            [email]
        );

        if (user.rows.length === 0) {
            return res.status(401).json("Identifiants incorrects");
        }

        const valid = await bcrypt.compare(
            password,
            user.rows[0].mot_de_passe_hash
        );

        if (!valid) {
            return res.status(401).json("Identifiants incorrects");
        }

        const token = jwt.sign(
            { id: user.rows[0].id_utilisateur },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        res.json({
            token,
            userId: user.rows[0].id_utilisateur,
            message: "Connexion OK",
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Erreur serveur");
    }
};