#!/usr/bin/env python3
"""Export « Gestion du stock produits » de la caisse Rezomatic (PDF) → fichier d'import WooCommerce (CSV).

Usage :  python3 convertir.py stock.pdf import-woocommerce.csv [recap.json]
Dépendance :  pip install pdfplumber

Ce que fait le script (et pourquoi) :
  - une ligne Rezomatic = un produit WooCommerce, UGS (SKU) = code article de la caisse ;
    relancer l'import avec « Mettre à jour les produits existants » met donc à jour stock et prix ;
  - prix = colonne « Vente TTC » de la caisse. Les prix d'achat et les marges ne sont JAMAIS exportés ;
  - catégorie = rayon du site, étiquette = jeu (voir classer.py et GUIDE-WOOCOMMERCE.md, étape 2) ;
  - publié seulement si stock > 0 ET prix > 0 ET prix ≥ prix d'achat ET nom non générique ;
    tout le reste est importé en BROUILLON (invisible sur le site, publiable en un clic).

⚠️ Ne jamais ajouter au dépôt (public) le PDF de la caisse ni les fichiers produits : ils
   contiennent le stock et, pour le PDF, les prix d'achat.
"""
import csv, json, re, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from classer import clean_name, rayon, jeu, is_generic, CAT, norm

NUMCOLS = range(6, 13)   # Stock … Vente TTC

def extraire(pdf_path):
    import pdfplumber
    lignes, dernier_texte = [], ''
    with pdfplumber.open(pdf_path) as pdf:
        for pi, pg in enumerate(pdf.pages, 1):
            for t in pg.extract_tables():
                for ri, r in enumerate(t):
                    lignes.append({'page': pi, 'row': ri, 'cells': [(c or '') for c in r]})
            dernier_texte = pg.extract_text() or ''
    return lignes, dernier_texte

def num(s):
    s = s.replace(' ', '').replace(' ', '').replace('€', '').replace(',', '.').strip()
    try: return float(s)
    except ValueError: return None

def articles(lignes, dernier_texte):
    fusion = []
    for r in lignes:
        c = r['cells']
        if c[1] == 'Designation' and c[2] == 'Famille': continue                       # en-tête
        fragment = all(not c[i].strip() for i in NUMCOLS) and not c[4].strip()          # suite d'une ligne coupée par le saut de page
        if r['row'] == 0 and r['page'] > 1 and fragment and fusion:
            prev = fusion[-1]['cells']
            for i in range(14):
                if c[i].strip(): prev[i] = (prev[i] + '\n' + c[i]) if prev[i].strip() else c[i]
            continue
        fusion.append({'page': r['page'], 'cells': list(c)})
    out = []
    for k, m in enumerate(fusion):
        c = m['cells']
        code = re.sub(r'\D', '', c[0])
        if not code and k == len(fusion) - 1:
            # Dernière ligne du document : le code est rogné par l'extraction du tableau.
            # On le relit dans le texte brut de la dernière page (deux fragments en début de ligne).
            frag = re.findall(r'^(\d{2,})\s', dernier_texte, flags=re.M)
            if len(frag) >= 2: code = frag[-2] + frag[-1]
        out.append({'page': m['page'], 'code': code, 'name_raw': re.sub(r'\s+', ' ', c[1].replace('\n', ' ')).strip(),
                    'famille': c[2].replace('\n', ' ').strip(), 'etat': c[4].replace('\n', ' ').strip(),
                    'stock': num(c[6]), 'achat': num(c[7]), 'vente_ttc': num(c[12])})
    return out

def convertir(P):
    rows, recap, vus = [], [], set()
    for i, p in enumerate(P):
        name = clean_name(p['name_raw']); ray = rayon(name); game = jeu(name, p['famille'], ray)
        sku = p['code'] or ('C151-SANSCODE-%d' % (i + 1))
        if sku in vus: raise SystemExit('Code article en double dans la caisse : ' + sku)
        vus.add(sku)
        stock = int(p['stock']) if p['stock'] is not None else 0
        price = p['vente_ttc'] or 0
        flags = []
        if not price: flags.append('Prix de vente absent ou à 0 € dans la caisse')
        if stock < 0: flags.append('Stock négatif dans la caisse (%d)' % stock)
        if is_generic(name): flags.append('Ligne générique (bac / divers) : pas vendable en ligne telle quelle')
        sous_cout = bool(price and p['achat'] and price < p['achat'] and stock > 0)
        if sous_cout: flags.append("Prix de vente inférieur au prix d'achat : à confirmer")
        bloquant = (not price) or is_generic(name) or sous_cout
        en_ligne = stock > 0 and not bloquant
        rows.append({'Type': 'simple', 'SKU': sku, 'Name': name, 'Published': 1 if en_ligne else -1,
                     'Is featured?': 0, 'Visibility in catalog': 'visible', 'Short description': '', 'Description': '',
                     'In stock?': 1 if stock > 0 else 0, 'Stock': max(stock, 0), 'Backorders allowed?': 0, 'Sold individually?': 0,
                     'Allow customer reviews?': 0, 'Regular price': ('%.2f' % price) if price else '',
                     'Categories': CAT[ray], 'Tags': game})
        recap.append({'code': sku, 'nom': name, 'rayon': CAT[ray], 'jeu': game, 'stock_caisse': stock, 'prix_ttc': price or None,
                      'statut': 'En ligne' if en_ligne else 'Brouillon', 'a_verifier': ' ; '.join(flags)})
    return rows, recap

if __name__ == '__main__':
    if len(sys.argv) < 3: raise SystemExit(__doc__)
    lignes, dernier = extraire(sys.argv[1])
    P = articles(lignes, dernier)
    rows, recap = convertir(P)
    with open(sys.argv[2], 'w', newline='', encoding='utf-8-sig') as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys())); w.writeheader(); w.writerows(rows)
    if len(sys.argv) > 3: json.dump(recap, open(sys.argv[3], 'w'), ensure_ascii=False)
    print('%d articles → %d en ligne, %d brouillons, %d à vérifier' % (len(rows), sum(r['Published'] == 1 for r in rows), sum(r['Published'] == -1 for r in rows), sum(1 for r in recap if r['a_verifier'])))
