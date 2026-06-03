const fs = require("fs");
const path = require("path");

const ALIMENTS_PATH = path.join(__dirname, "..", "aliments.json");

let aliments = [];

function normalizeString(str) {
    if (!str) return "";
    return str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\w\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function deduplicateAliments() {
    const seen = new Set();
    const unique = [];
    let removed = 0;

    for (const aliment of aliments) {
        const key = normalizeString(aliment.nom);
        if (!key) continue;

        if (seen.has(key)) {
            removed++;
            continue;
        }

        seen.add(key);
        unique.push(aliment);
    }

    if (removed > 0) {
        aliments = unique;
        persist();
        console.log(`🧹 ${removed} doublon(s) supprimé(s) dans aliments.json (total: ${aliments.length})`);
    }

    return removed;
}

function roundNutriment(value) {
    if (value == null || Number.isNaN(Number(value))) return 0;
    return Math.round(Number(value) * 10) / 10;
}

function load() {
    try {
        const raw = fs.readFileSync(ALIMENTS_PATH, "utf-8");
        aliments = JSON.parse(raw);
        if (!Array.isArray(aliments)) {
            throw new Error("aliments.json doit être un tableau");
        }
        console.log(`✅ ${aliments.length} aliments chargés depuis aliments.json`);
    } catch (err) {
        console.error("❌ Impossible de charger aliments.json :", err.message);
        aliments = [];
    }
}

function persist() {
    const tmpPath = `${ALIMENTS_PATH}.tmp`;
    const content = JSON.stringify(aliments, null, 4) + "\n";
    fs.writeFileSync(tmpPath, content, "utf-8");
    fs.renameSync(tmpPath, ALIMENTS_PATH);
}

function offProductToAliment(product) {
    const nutriments = product.nutriments || {};
    const brand = product.brands?.trim();
    const name = product.product_name?.trim() || "";
    const nom = brand && brand !== "Aliment générique (Ciqual)"
        ? `${name} (${brand})`
        : name;

    return {
        nom,
        calories: Math.round(nutriments["energy-kcal_100g"] || 0),
        proteines: roundNutriment(nutriments.proteins_100g),
        glucides: roundNutriment(nutriments.carbohydrates_100g),
        lipides: roundNutriment(nutriments.fat_100g),
    };
}

function isValidAliment(aliment) {
    return Boolean(aliment?.nom?.trim());
}

/**
 * Ajoute les produits OFF absents de aliments.json.
 * Retourne le nombre d'entrées réellement ajoutées.
 */
function addFromOffProducts(products) {
    if (!Array.isArray(products) || products.length === 0) return 0;

    const existingNames = new Set(aliments.map((a) => normalizeString(a.nom)));
    let added = 0;

    for (const product of products) {
        if (!product?.product_name) continue;
        if (String(product.code || "").startsWith("ciqual_")) continue;

        const aliment = offProductToAliment(product);
        if (!isValidAliment(aliment)) continue;

        const key = normalizeString(aliment.nom);
        if (existingNames.has(key)) {
            console.log(`⏭️  Doublon ignoré : "${aliment.nom}"`);
            continue;
        }

        existingNames.add(key);
        aliments.push(aliment);
        added++;
    }

    if (added > 0) {
        persist();
        console.log(`💾 ${added} aliment(s) ajouté(s) à aliments.json (total: ${aliments.length})`);
    }

    return added;
}

function getAll() {
    return aliments;
}

load();
deduplicateAliments();

module.exports = {
    getAll,
    addFromOffProducts,
    deduplicateAliments,
    normalizeString,
    reload: load,
};
