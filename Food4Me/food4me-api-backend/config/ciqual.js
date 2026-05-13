const fs = require('fs');
const path = require('path');

let alimentsCiqual = [];
try {
    const raw = fs.readFileSync(path.join(__dirname, '..', 'aliments.json'), 'utf-8');
    alimentsCiqual = JSON.parse(raw);
    console.log(`✅ ${alimentsCiqual.length} aliments chargés depuis Ciqual`);
} catch (err) {
    console.error('❌ Impossible de charger aliments.json :', err.message);
}

module.exports = alimentsCiqual;