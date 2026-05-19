const pool = require("../config/db");
const getOrCreateProfil = require("../utils/getOrCreateProfil");

// POST /repas/ajouter
exports.ajouterRepas = async (req, res) => {
    try {
        const id_profil = await getOrCreateProfil(req.user.id, req.user.email || '');
        const { nom, calories } = req.body;
        const result = await pool.query(
            "INSERT INTO repas (nom, calories, id_profil, date_repas) VALUES ($1, $2, $3, NOW()) RETURNING *",
            [nom, calories, id_profil]
        );
        res.json({ message: "Repas enregistré !", data: result.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Erreur lors de l'ajout en base" });
    }
};

// POST /repas/ajouter-complet (utilisé par SearchScreen et ComposeScreen)
exports.ajouterRepasComplet = async (req, res) => {
    const { nom_produit, nutriments, quantite } = req.body;
    try {
        const id_profil = await getOrCreateProfil(req.user.id, req.user.email || '');

        const ing = await pool.query(
            `INSERT INTO ingredient (nom, calories_pour_100g, proteines_pour_100g, glucides_pour_100g, lipides_pour_100g)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (nom) DO UPDATE SET calories_pour_100g = EXCLUDED.calories_pour_100g
             RETURNING id_ingredient`,
            [nom_produit, nutriments.cal || 0, nutriments.prot || 0, nutriments.glu || 0, nutriments.lip || 0]
        );
        const id_ing = ing.rows[0].id_ingredient;

        const rep = await pool.query(
            `INSERT INTO repas (id_profil, nom_repas, type_repas)
             VALUES ($1, $2, $3) RETURNING id_repas`,
            [id_profil, nom_produit, "Repas"]
        );
        const id_rep = rep.rows[0].id_repas;

        await pool.query(
            `INSERT INTO composition_repas (id_repas, id_ingredient, quantite_grammes)
             VALUES ($1, $2, $3)`,
            [id_rep, id_ing, quantite || 100]
        );

        res.json({ message: "Repas enregistré avec succès !" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur BDD" });
    }
};

// GET /repas/aujourdhui (utilisé par HomeScreen)
exports.aujourdhui = async (req, res) => {
    try {
        console.log("📊 Récupération des totals du jour pour l'utilisateur:", req.user.id);

        const profil = await pool.query("SELECT id_profil FROM profil WHERE id_utilisateur = $1", [req.user.id]);
        if (profil.rows.length === 0) {
            console.log("⚠️ Aucun profil trouvé");
            return res.json({ calories: 0, proteines: 0, glucides: 0, lipides: 0 });
        }

        const id_profil = profil.rows[0].id_profil;

        // Utiliser AT TIME ZONE pour gérer les timezones correctement
        // Récupérer la date du jour du serveur (supposé UTC)
        const result = await pool.query(
            `SELECT 
                COALESCE(SUM(i.calories_pour_100g * c.quantite_grammes / 100.0), 0) as calories,
                COALESCE(SUM(i.proteines_pour_100g * c.quantite_grammes / 100.0), 0) as proteines,
                COALESCE(SUM(i.glucides_pour_100g * c.quantite_grammes / 100.0), 0) as glucides,
                COALESCE(SUM(i.lipides_pour_100g * c.quantite_grammes / 100.0), 0) as lipides
             FROM repas r
             JOIN composition_repas c ON c.id_repas = r.id_repas
             JOIN ingredient i ON i.id_ingredient = c.id_ingredient
             WHERE r.id_profil = $1
               AND DATE(r.date_repas) = CURRENT_DATE`,
            [id_profil]
        );

        const { calories, proteines, glucides, lipides } = result.rows[0];

        const totals = {
            calories: Math.round(calories),
            proteines: Math.round(proteines * 10) / 10,
            glucides: Math.round(glucides * 10) / 10,
            lipides: Math.round(lipides * 10) / 10
        };

        console.log("✅ Totals trouvés:", totals);
        res.json(totals);
    } catch (err) {
        console.error("❌ Erreur synthèse:", err);
        res.status(500).json({ error: "Erreur synthèse" });
    }
};