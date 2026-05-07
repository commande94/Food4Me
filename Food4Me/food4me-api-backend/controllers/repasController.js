const pool = require("../config/db");

// SIMPLE REPAS
exports.ajouterRepas = async (req, res) => {
    try {
        const { nom, calories, id_utilisateur } = req.body;

        const result = await pool.query(
            "INSERT INTO repas (nom, calories, id_utilisateur, date_repas) VALUES ($1, $2, $3, NOW()) RETURNING *",
            [nom, calories, id_utilisateur]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send("Erreur repas");
    }
};

// COMPLET (ton OpenFoodFacts)
exports.ajouterRepasComplet = async (req, res) => {
    const { id_profil, nom_produit, nutriments, quantite } = req.body;

    try {
        const ing = await pool.query(
            `INSERT INTO ingredient 
      (nom, calories_pour_100g, proteines_pour_100g, glucides_pour_100g, lipides_pour_100g)
      VALUES ($1,$2,$3,$4,$5)
      RETURNING id_ingredient`,
            [
                nom_produit,
                nutriments.cal || 0,
                nutriments.prot || 0,
                nutriments.glu || 0,
                nutriments.lip || 0,
            ]
        );

        const id_ing = ing.rows[0].id_ingredient;

        const rep = await pool.query(
            `INSERT INTO repas (id_profil, nom_repas, type_repas)
       VALUES ($1,$2,$3)
       RETURNING id_repas`,
            [id_profil, "Mon Repas", "Déjeuner"]
        );

        const id_rep = rep.rows[0].id_repas;

        await pool.query(
            `INSERT INTO composition_repas (id_repas, id_ingredient, quantite_grammes)
       VALUES ($1,$2,$3)`,
            [id_rep, id_ing, quantite]
        );

        res.json({ message: "Repas complet enregistré !" });
    } catch (err) {
        console.error(err);
        res.status(500).send("Erreur BDD");
    }
};