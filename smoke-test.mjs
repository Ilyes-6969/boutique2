// leclub151 — Test fumée du build : charge chaque page construite dans un
// navigateur simulé (jsdom), exécute les scripts (React compris) et vérifie
// que la page se rend sans erreur. Usage :
//   npx --yes serve dist -l 5151   (dans un premier terminal)
//   node smoke-test.mjs            (dans un second)
import { JSDOM, VirtualConsole } from 'jsdom';

const BASE = 'http://localhost:5151';
const PAGES = [
  '/index.html',
  '/boutique.html',
  '/panier.html',
  '/produit.html?id=d1',
  '/produits/dracaufeu-set-de-base-d1.html',
  '/lorcana.html',
  '/faq.html',
  '/cgv.html',
  '/admin.html',
];

let failed = 0;

for (const page of PAGES) {
  const errors = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', (e) => {
    const msg = String((e && e.detail && e.detail.stack) || (e && e.stack) || e);
    // Bruit d'environnement (pas des bugs du site) :
    // - CSS moderne / API manquantes dans jsdom
    // - script analytics Vercel (/_vercel/…) : n'existe que sur Vercel
    if (/Could not parse CSS|not implemented|_vercel\/insights|createObjectURL/i.test(msg)) return;
    errors.push(msg.split('\n').slice(0, 3).join(' | '));
  });
  vc.on('error', (msg) => errors.push(String(msg)));

  try {
    const dom = await JSDOM.fromURL(BASE + page, {
      resources: 'usable',
      runScripts: 'dangerously',
      pretendToBeVisual: true,
      virtualConsole: vc,
      beforeParse(window) {
        window.matchMedia = window.matchMedia || (() => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }));
        window.IntersectionObserver = window.IntersectionObserver || class { observe() {} unobserve() {} disconnect() {} };
        window.scrollTo = window.scrollTo || (() => {});
        window.fetch = window.fetch || (() => new Promise(() => {}));
        window.URL.createObjectURL = window.URL.createObjectURL || (() => 'blob:jsdom');
      },
    });
    // Laisse le temps aux scripts defer + au rendu React.
    await new Promise((r) => setTimeout(r, 2500));
    const root = dom.window.document.getElementById('root') || dom.window.document.getElementById('admin-root') || dom.window.document.body;
    const rendered = root && root.children.length > 0;
    const realErrors = errors.filter((e) => !/favicon|unpkg|images\.pokemontcg/.test(e));
    if (rendered && realErrors.length === 0) {
      console.log('OK    ' + page + '  (' + root.children.length + ' éléments rendus)');
    } else {
      failed += 1;
      console.log('ÉCHEC ' + page + '  rendu=' + rendered);
      realErrors.slice(0, 4).forEach((e) => console.log('      → ' + e));
    }
    dom.window.close();
  } catch (e) {
    failed += 1;
    console.log('ÉCHEC ' + page + '  (chargement) → ' + String(e).slice(0, 200));
  }
}

console.log(failed === 0 ? '\nTout est bon ✔' : '\n' + failed + ' page(s) en échec ✖');
process.exit(failed === 0 ? 0 : 1);
