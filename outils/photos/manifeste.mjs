// CLUB 151 — Table des photos produits hébergées par le site
// ---------------------------------------------------------------------------
// Les photos vivent dans assets/produits/<code article>.webp (le code article
// est le SKU WooCommerce, celui de la caisse). Elles ne servent QUE pour les
// produits qui n'ont aucune image dans WooCommerce : dès qu'une image y est
// ajoutée, c'est elle qui s'affiche.
//
// Après avoir ajouté, remplacé ou retiré une photo :   node outils/photos/manifeste.mjs
// → régénère lib/photos-produits.json  { "<sku>": "<fichier>?v=<empreinte>" }.
// L'empreinte change avec le contenu : le dossier /assets est mis en cache un an
// par les navigateurs, c'est elle qui fait apparaître une photo remplacée.
// ---------------------------------------------------------------------------
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DIR = join(ROOT, 'assets', 'produits');
const OUT = join(ROOT, 'lib', 'photos-produits.json');

const table = {};
if (existsSync(DIR)) {
  for (const f of readdirSync(DIR).sort()) {
    const m = f.match(/^([A-Za-z0-9_-]+)\.(webp|jpg|jpeg|png)$/i);
    if (!m) { console.warn('ignoré (nom inattendu) : ' + f); continue; }
    const hash = createHash('sha1').update(readFileSync(join(DIR, f))).digest('hex').slice(0, 8);
    table[m[1]] = f + '?v=' + hash;
  }
}
writeFileSync(OUT, JSON.stringify(table, null, 1) + '\n');
console.log(Object.keys(table).length + ' photo(s) → lib/photos-produits.json');
