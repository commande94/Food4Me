const pool = require("../config/db");

exports.recherche = async (req, res) => {
    try {
        const { nom } = req.query;
        const result = await pool.query(
            "SELECT * FROM ingredient WHERE nom ILIKE $1 LIMIT 5",
            [`%${nom}%`]
        );
        res.json({ ingredients: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur recherche ingrédient" });
    }
};

exports.ajouter = async (req, res) => {
    try {
        const { nom, cal, prot, glu, lip } = req.body;
        const result = await pool.query(
            `INSERT INTO ingredient (nom, calories_pour_100g, proteines_pour_100g, glucides_pour_100g, lipides_pour_100g)
             VALUES ($1,$2,$3,$4,$5) RETURNING *`,
            [nom, cal || 0, prot || 0, glu || 0, lip || 0]
        );
        res.json({ ingredient: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur ajout ingrédient" });
    }
};