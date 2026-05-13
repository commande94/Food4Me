const pool = require('../config/db');

const getOrCreateProfil = async (userId, userEmail) => {
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
};

module.exports = getOrCreateProfil;