// convert_ciqual.js (version robuste)
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// ----- 1. Trouver le fichier Excel -----
const apiDir = __dirname;
const excelFiles = fs.readdirSync(apiDir).filter(f => f.includes('Ciqual') && f.endsWith('.xlsx'));
if (excelFiles.length === 0) {
    console.error("❌ Aucun fichier contenant 'Ciqual' en .xlsx trouvé !");
    process.exit(1);
}
const excelPath = path.join(apiDir, excelFiles[0]);
console.log(`📄 Fichier : ${excelPath}`);

// ----- 2. Charger la première feuille -----
const workbook = XLSX.readFile(excelPath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
console.log(`📊 ${rows.length} lignes lues`);

// ----- 3. Nettoyer les en-têtes (supprimer les retours à la ligne) -----
const cleanKey = (key) => key.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
const rawHeaders = Object.keys(rows[0] || {});
const headers = {};
rawHeaders.forEach(h => { headers[cleanKey(h)] = h; });

// Afficher les en-têtes nettoyées (pour debug)
console.log("🧹 En-têtes nettoyées :");
Object.entries(headers).forEach(([clean, orig]) => console.log(`  "${clean}"`));

// ----- 4. Identifier les colonnes utiles -----
const findCol = (keywords) => {
    const match = Object.keys(headers).find(k => keywords.every(kw => k.toLowerCase().includes(kw.toLowerCase())));
    return match ? headers[match] : null;
};

const colNom = findCol(['alim_nom_fr']) || findCol(['nom']);
const colKcal = findCol(['energie', 'kcal']);
const colProt = findCol(['protéines']);
const colGlu = findCol(['glucides']);
const colLip = findCol(['lipides']);

console.log(`🔍 Colonnes sélectionnées :`);
console.log(`   Nom      : ${colNom}`);
console.log(`   Calories : ${colKcal}`);
console.log(`   Protéines: ${colProt}`);
console.log(`   Glucides : ${colGlu}`);
console.log(`   Lipides  : ${colLip}`);

if (!colNom || !colKcal || !colProt || !colGlu || !colLip) {
    console.error("❌ Impossible de trouver toutes les colonnes nécessaires.");
    console.error("Vérifiez les en-têtes affichées ci-dessus et ajustez les mots-clés.");
    process.exit(1);
}

// ----- 5. Extraire les aliments -----
const aliments = [];
for (const row of rows) {
    const nom = (row[colNom] || '').toString().trim();
    if (!nom || nom === '-') continue;

    // Les valeurs peuvent utiliser la virgule comme séparateur décimal
    const toFloat = (val) => {
        if (val === undefined || val === null || val === '' || val === '-') return 0;
        const str = val.toString().replace(',', '.');
        return parseFloat(str) || 0;
    };

    const calories = toFloat(row[colKcal]);
    const proteines = toFloat(row[colProt]);
    const glucides = toFloat(row[colGlu]);
    const lipides = toFloat(row[colLip]);

    aliments.push({
        nom,
        calories: Math.round(calories),
        proteines: Math.round(proteines * 10) / 10,
        glucides: Math.round(glucides * 10) / 10,
        lipides: Math.round(lipides * 10) / 10,
    });
}

// ----- 6. Sauvegarder -----
aliments.sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
const outputPath = path.join(apiDir, 'aliments.json');
fs.writeFileSync(outputPath, JSON.stringify(aliments, null, 2), 'utf-8');
console.log(`✅ ${aliments.length} aliments exportés dans aliments.json`);

console.log('\n⚠️  SOURCE À MENTIONNER (Licence Ouverte) :');
console.log('Anses. 2025. Table de composition nutritionnelle des aliments Ciqual, https://doi.org/10.57745/RDMHWY');