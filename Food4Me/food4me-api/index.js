const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('./db');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// ─── MIDDLEWARE AUTH ──────────────────────────────
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: "Token requis" });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Token invalide" });
        req.user = user;
        next();
    });
};

// ─── AUTH ─────────────────────────────────────────
app.post('/auth/register', async (req, res) => {
    try {
        const { email, password, objectif, taille, poids, genre, age } = req.body;

        const userExist = await pool.query("SELECT * FROM utilisateur WHERE email = $1", [email]);
        if (userExist.rows.length !== 0) return res.status(401).json({ error: "L'email est déjà utilisé." });

        const salt = await bcrypt.genSalt(10);
        const bcryptPassword = await bcrypt.hash(password, salt);

        const newUser = await pool.query(
            "INSERT INTO utilisateur (email, mot_de_passe_hash) VALUES ($1, $2) RETURNING id_utilisateur",
            [email, bcryptPassword]
        );

        await pool.query(
            `INSERT INTO profil (id_utilisateur, nom, objectif, taille_cm, poids_kg, genre, age)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
                newUser.rows[0].id_utilisateur,
                email,
                objectif || 'Suivi Nutritionnel',
                taille || null,
                poids || null,
                genre || null,
                age || null
            ]
        );

        const token = jwt.sign(
            { id: newUser.rows[0].id_utilisateur },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ token, message: "Compte créé avec succès !" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

app.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await pool.query("SELECT * FROM utilisateur WHERE email = $1", [email]);
        if (user.rows.length === 0) return res.status(401).json({ error: "Email ou mot de passe incorrect" });
        const validPassword = await bcrypt.compare(password, user.rows[0].mot_de_passe_hash);
        if (!validPassword) return res.status(401).json({ error: "Email ou mot de passe incorrect" });
        const token = jwt.sign({ id: user.rows[0].id_utilisateur }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, message: "Connexion réussie !" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

app.get('/auth/me', authenticateToken, async (req, res) => {
    try {
        const user = await pool.query("SELECT id_utilisateur, email FROM utilisateur WHERE id_utilisateur = $1", [req.user.id]);
        if (user.rows.length === 0) return res.status(404).json({ error: "Utilisateur introuvable" });
        res.json({ id: user.rows[0].id_utilisateur, email: user.rows[0].email });
    } catch (err) {
        res.status(500).json({ error: "Erreur serveur" });
    }
});

// ─── REPAS ────────────────────────────────────────
async function getOrCreateProfil(userId, userEmail) {
    let profil = await pool.query("SELECT id_profil FROM profil WHERE id_utilisateur = $1", [userId]);
    if (profil.rows.length === 0) {
        const newProfil = await pool.query(
            `INSERT INTO profil (id_utilisateur, nom, objectif)
             VALUES ($1, $2, $3) RETURNING id_profil`,
            [userId, userEmail || 'Utilisateur', 'Suivi Nutritionnel']
        );
        return newProfil.rows[0].id_profil;
    }
    return profil.rows[0].id_profil;
}

app.post('/repas/ajouter', authenticateToken, async (req, res) => {
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
});

app.post('/repas/ajouter-complet', authenticateToken, async (req, res) => {
    const { nom_produit, nutriments, quantite } = req.body;

    try {
        const id_profil = await getOrCreateProfil(req.user.id, req.user.email || '');

        const ing = await pool.query(
            `INSERT INTO ingredient (nom, calories_pour_100g, proteines_pour_100g, glucides_pour_100g, lipides_pour_100g)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (nom) DO UPDATE SET calories_pour_100g = EXCLUDED.calories_pour_100g
             RETURNING id_ingredient`,
            [
                nom_produit,
                nutriments.cal || 0,
                nutriments.prot || 0,
                nutriments.glu || 0,
                nutriments.lip || 0
            ]
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
});

app.get('/repas/aujourdhui', authenticateToken, async (req, res) => {
    try {
        const profil = await pool.query("SELECT id_profil FROM profil WHERE id_utilisateur = $1", [req.user.id]);
        if (profil.rows.length === 0) return res.json({ calories: 0, proteines: 0, glucides: 0, lipides: 0 });

        const id_profil = profil.rows[0].id_profil;
        const today = new Date().toISOString().slice(0, 10);

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
               AND r.date_repas::date = $2`,
            [id_profil, today]
        );

        const { calories, proteines, glucides, lipides } = result.rows[0];
        res.json({
            calories: Math.round(calories),
            proteines: Math.round(proteines * 10) / 10,
            glucides: Math.round(glucides * 10) / 10,
            lipides: Math.round(lipides * 10) / 10
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur synthèse" });
    }
});

// ─── INGRÉDIENTS ──────────────────────────────────
app.get('/ingredients/recherche', async (req, res) => {
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
});

app.post('/ingredients/ajouter', authenticateToken, async (req, res) => {
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
});

// ─── PROXY OPEN FOOD FACTS (ULTIME) ──────────────
let lastOffRequestTime = 0;
const MIN_OFF_INTERVAL = 1500;

app.get('/off/search', authenticateToken, async (req, res) => {
    try {
        const { terme } = req.query;
        if (!terme) return res.status(400).json({ error: "Terme de recherche requis" });

        console.log(`\n==============================`);
        console.log(`[OFF] Recherche : "${terme}"`);

        const now = Date.now();
        if (now - lastOffRequestTime < MIN_OFF_INTERVAL) {
            const waitTime = MIN_OFF_INTERVAL - (now - lastOffRequestTime);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
        lastOffRequestTime = Date.now();

        // On change d'URL pour être sûrs d'éviter tout cache
        const url = `https://world.openfoodfacts.org/api/v1/search?search_terms=${encodeURIComponent(terme)}&search_simple=1&json=1&page_size=10&nocache=${Date.now()}`;
        console.log(`[OFF] URL : ${url}`);

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(url, {
            headers: { 'User-Agent': 'Food4Me/1.0' },
            signal: controller.signal
        });
        clearTimeout(timeout);

        if (response.status === 429) {
            return res.status(429).json({ error: "Trop de requêtes vers OFF, patientez 1 minute." });
        }
        if (!response.ok) {
            console.error(`[OFF] Erreur API : ${response.status}`);
            return res.status(502).json({ error: `OFF a répondu avec le statut ${response.status}` });
        }

        const data = await response.json();
        console.log(`[OFF] ${data.products?.length || 0} produits reçus`);
        if (data.products && data.products.length > 0) {
            console.log(`[OFF] Premier produit : "${data.products[0]?.product_name}"`);
        }

        // Anti-cache response
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');
        res.set('Surrogate-Control', 'no-store');
        res.json(data);
    } catch (error) {
        console.error("[OFF] Erreur :", error);
        res.status(500).json({ error: "Erreur lors de la recherche" });
    }
});

app.listen(process.env.PORT || 3000, () => {
    console.log(`Serveur backend démarré sur le port ${process.env.PORT || 3000}`);
});