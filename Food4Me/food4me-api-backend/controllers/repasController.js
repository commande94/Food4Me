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

// POST /repas/ajouter-compose — crée un repas avec ses ingrédients séparés
exports.ajouterRepaseCompose = async (req, res) => {
    const client = await pool.connect();
    try {
        const { nom_repas, items } = req.body;

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: "La liste d'ingrédients est vide" });
        }

        const id_profil = await getOrCreateProfil(req.user.id, req.user.email || '');
        const mealName = nom_repas?.trim() || "Repas";

        await client.query("BEGIN");

        const rep = await client.query(
            `INSERT INTO repas (id_profil, nom_repas, type_repas)
             VALUES ($1, $2, $3) RETURNING id_repas`,
            [id_profil, mealName, "Repas"]
        );
        const id_rep = rep.rows[0].id_repas;

        for (const item of items) {
            const ing = await client.query(
                `INSERT INTO ingredient (nom, calories_pour_100g, proteines_pour_100g, glucides_pour_100g, lipides_pour_100g)
                 VALUES ($1, $2, $3, $4, $5)
                 ON CONFLICT (nom) DO UPDATE SET calories_pour_100g = EXCLUDED.calories_pour_100g
                 RETURNING id_ingredient`,
                [item.name, item.cal || 0, item.prot || 0, item.glu || 0, item.lip || 0]
            );
            await client.query(
                "INSERT INTO composition_repas (id_repas, id_ingredient, quantite_grammes) VALUES ($1, $2, $3)",
                [id_rep, ing.rows[0].id_ingredient, item.grams || 100]
            );
        }

        await client.query("COMMIT");
        console.log(`✅ Repas composé "${mealName}" créé (${items.length} ingrédient(s))`);
        res.json({ message: "Repas enregistré avec succès !" });
    } catch (err) {
        await client.query("ROLLBACK");
        console.error("❌ Erreur ajout repas composé:", err);
        res.status(500).json({ error: "Erreur BDD" });
    } finally {
        client.release();
    }
};

// GET /repas/liste-aujourdhui — repas enregistrés aujourd'hui pour le compte
exports.listeAujourdhui = async (req, res) => {
    try {
        const profil = await pool.query(
            "SELECT id_profil FROM profil WHERE id_utilisateur = $1",
            [req.user.id]
        );

        if (profil.rows.length === 0) {
            return res.json({ repas: [] });
        }

        const id_profil = profil.rows[0].id_profil;

        const result = await pool.query(
            `SELECT
                r.id_repas,
                r.nom_repas,
                r.type_repas,
                r.date_repas,
                COALESCE(SUM(i.calories_pour_100g * c.quantite_grammes / 100.0), 0) AS calories,
                COALESCE(SUM(i.proteines_pour_100g * c.quantite_grammes / 100.0), 0) AS proteines,
                COALESCE(SUM(i.glucides_pour_100g * c.quantite_grammes / 100.0), 0) AS glucides,
                COALESCE(SUM(i.lipides_pour_100g * c.quantite_grammes / 100.0), 0) AS lipides
             FROM repas r
             JOIN composition_repas c ON c.id_repas = r.id_repas
             JOIN ingredient i ON i.id_ingredient = c.id_ingredient
             WHERE r.id_profil = $1
               AND DATE(r.date_repas) = CURRENT_DATE
             GROUP BY r.id_repas, r.nom_repas, r.type_repas, r.date_repas
             ORDER BY r.date_repas DESC`,
            [id_profil]
        );

        const repas = result.rows.map((row) => ({
            id_repas: row.id_repas,
            nom_repas: row.nom_repas || "Repas sans nom",
            type_repas: row.type_repas,
            date_repas: row.date_repas,
            calories: Math.round(Number(row.calories)),
            proteines: Math.round(Number(row.proteines) * 10) / 10,
            glucides: Math.round(Number(row.glucides) * 10) / 10,
            lipides: Math.round(Number(row.lipides) * 10) / 10,
        }));

        res.json({ repas });
    } catch (err) {
        console.error("❌ Erreur liste repas du jour:", err);
        res.status(500).json({ error: "Erreur liste repas" });
    }
};

// GET /repas/:id/detail — détail d'un repas avec la liste d'ingrédients
exports.detailRepas = async (req, res) => {
    try {
        const id_repas = parseInt(req.params.id, 10);
        if (!id_repas) return res.status(400).json({ error: "ID invalide" });

        const profil = await pool.query(
            "SELECT id_profil FROM profil WHERE id_utilisateur = $1",
            [req.user.id]
        );
        if (profil.rows.length === 0) return res.status(403).json({ error: "Profil introuvable" });
        const id_profil = profil.rows[0].id_profil;

        const repasRow = await pool.query(
            "SELECT id_repas, nom_repas FROM repas WHERE id_repas = $1 AND id_profil = $2",
            [id_repas, id_profil]
        );
        if (repasRow.rows.length === 0) return res.status(404).json({ error: "Repas introuvable" });

        const items = await pool.query(
            `SELECT
                c.id_composition,
                i.id_ingredient,
                i.nom,
                c.quantite_grammes,
                i.calories_pour_100g,
                i.proteines_pour_100g,
                i.glucides_pour_100g,
                i.lipides_pour_100g
             FROM composition_repas c
             JOIN ingredient i ON i.id_ingredient = c.id_ingredient
             WHERE c.id_repas = $1`,
            [id_repas]
        );

        res.json({
            id_repas: repasRow.rows[0].id_repas,
            nom_repas: repasRow.rows[0].nom_repas || "",
            items: items.rows,
        });
    } catch (err) {
        console.error("❌ Erreur détail repas:", err);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

// PUT /repas/:id/composition — remplace toute la composition + met à jour le nom
exports.modifierComposition = async (req, res) => {
    const client = await pool.connect();
    try {
        const id_repas = parseInt(req.params.id, 10);
        if (!id_repas) return res.status(400).json({ error: "ID invalide" });

        const { nom_repas, items } = req.body;
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: "La liste d'ingrédients est vide" });
        }

        const profil = await pool.query(
            "SELECT id_profil FROM profil WHERE id_utilisateur = $1",
            [req.user.id]
        );
        if (profil.rows.length === 0) return res.status(403).json({ error: "Profil introuvable" });
        const id_profil = profil.rows[0].id_profil;

        const repasRow = await pool.query(
            "SELECT id_repas FROM repas WHERE id_repas = $1 AND id_profil = $2",
            [id_repas, id_profil]
        );
        if (repasRow.rows.length === 0) return res.status(404).json({ error: "Repas introuvable" });

        await client.query("BEGIN");

        if (nom_repas?.trim()) {
            await client.query(
                "UPDATE repas SET nom_repas = $1 WHERE id_repas = $2",
                [nom_repas.trim(), id_repas]
            );
        }

        await client.query(
            "DELETE FROM composition_repas WHERE id_repas = $1",
            [id_repas]
        );

        for (const item of items) {
            const ing = await client.query(
                `INSERT INTO ingredient (nom, calories_pour_100g, proteines_pour_100g, glucides_pour_100g, lipides_pour_100g)
                 VALUES ($1, $2, $3, $4, $5)
                 ON CONFLICT (nom) DO UPDATE SET calories_pour_100g = EXCLUDED.calories_pour_100g
                 RETURNING id_ingredient`,
                [item.name, item.cal || 0, item.prot || 0, item.glu || 0, item.lip || 0]
            );
            await client.query(
                "INSERT INTO composition_repas (id_repas, id_ingredient, quantite_grammes) VALUES ($1, $2, $3)",
                [id_repas, ing.rows[0].id_ingredient, item.grams || 100]
            );
        }

        await client.query("COMMIT");
        console.log(`✏️ Composition repas ${id_repas} mise à jour (${items.length} ingrédient(s))`);
        res.json({ message: "Repas modifié avec succès" });
    } catch (err) {
        await client.query("ROLLBACK");
        console.error("❌ Erreur modification composition:", err);
        res.status(500).json({ error: "Erreur modification" });
    } finally {
        client.release();
    }
};

// DELETE /repas/:id — supprime un repas (et sa composition via CASCADE)
exports.supprimerRepas = async (req, res) => {
    try {
        const id_repas = parseInt(req.params.id, 10);
        if (!id_repas) return res.status(400).json({ error: "ID invalide" });

        const profil = await pool.query(
            "SELECT id_profil FROM profil WHERE id_utilisateur = $1",
            [req.user.id]
        );
        if (profil.rows.length === 0) {
            return res.status(403).json({ error: "Profil introuvable" });
        }
        const id_profil = profil.rows[0].id_profil;

        const result = await pool.query(
            "DELETE FROM repas WHERE id_repas = $1 AND id_profil = $2 RETURNING id_repas",
            [id_repas, id_profil]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Repas introuvable ou accès refusé" });
        }

        console.log(`🗑️ Repas ${id_repas} supprimé`);
        res.json({ message: "Repas supprimé avec succès" });
    } catch (err) {
        console.error("❌ Erreur suppression repas:", err);
        res.status(500).json({ error: "Erreur suppression" });
    }
};

// PUT /repas/:id — renomme un repas
exports.renommerRepas = async (req, res) => {
    try {
        const id_repas = parseInt(req.params.id, 10);
        const { nom_repas } = req.body;

        if (!id_repas) return res.status(400).json({ error: "ID invalide" });
        if (!nom_repas?.trim()) return res.status(400).json({ error: "Nom vide" });

        const profil = await pool.query(
            "SELECT id_profil FROM profil WHERE id_utilisateur = $1",
            [req.user.id]
        );
        if (profil.rows.length === 0) {
            return res.status(403).json({ error: "Profil introuvable" });
        }
        const id_profil = profil.rows[0].id_profil;

        const result = await pool.query(
            "UPDATE repas SET nom_repas = $1 WHERE id_repas = $2 AND id_profil = $3 RETURNING id_repas, nom_repas",
            [nom_repas.trim(), id_repas, id_profil]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Repas introuvable ou accès refusé" });
        }

        console.log(`✏️ Repas ${id_repas} renommé → "${nom_repas.trim()}"`);
        res.json({ message: "Repas renommé", repas: result.rows[0] });
    } catch (err) {
        console.error("❌ Erreur renommage repas:", err);
        res.status(500).json({ error: "Erreur renommage" });
    }
};