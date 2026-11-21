# Règles de classement : rayon WooCommerce (catégorie), jeu (étiquette), nettoyage des noms.
import re, unicodedata
def norm(s):
    s = unicodedata.normalize('NFD', s.lower())
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    return re.sub(r'[^a-z0-9]+', ' ', s).strip()

def clean_name(raw):
    n = raw.strip()
    n = re.sub(r'\s+\d+,\d{2}\s+\d+\s+\d+,\d{2}\s*€\s*$', '', n)       # résidu de facture collé au nom
    n = re.sub(r'^-\s+', '', n)                                         # tiret parasite en tête
    n = re.sub(r'^Pok[ée]mon - Pokemon ', 'Pokémon ', n)                # « Pokémon - Pokemon Puzzle » (catalogue fournisseur)
    if n.count('(') > n.count(')'): n += ')'
    n = re.sub(r'\s+', ' ', n).strip()
    return n

CAT = {
    'single': "Cartes à l'unité", 'graded': 'Cartes gradées',
    'display': 'Scellé — Displays', 'booster': 'Scellé — Boosters & blisters', 'etb': 'Scellé — ETB',
    'coffret': 'Scellé — Coffrets & bundles', 'deck': 'Scellé — Decks & starters',
    'protection': 'Accessoires — Protection', 'tapis': 'Accessoires — Tapis de jeu',
    'peluche': 'Peluches', 'figurine': 'Figurines & Pop', 'goodies': 'Goodies',
}
def rayon(name):
    n = norm(name)
    w = lambda pat: re.search(r'(?<![a-z0-9])(?:' + pat + r')(?![a-z0-9])', n) is not None
    # 1. accessoires (avant « gradée » : les étuis pour cartes gradées sont des accessoires)
    if w('tapis'): return 'tapis'
    if w('sleeves?|sleeves100|toploaders?|top loader|strip bags|protection|protections|protege deck|malette|art set acrylic|phoenix shield|pheonix shield|dragon shield|portfolio') \
       or (w('classeur') and not w('coffret')): return 'protection'
    # 2. goodies
    if w('peluche'): return 'peluche'
    if n.startswith('pop ') or w('funko|bitty pop|re ment|mystery minis') or (w('figurine') and not w('coffret')): return 'figurine'
    if w('uno'): return 'goodies'
    if w('puzzle|coussin|mug|casquette|chaussettes|gants|couverture|plaid'): return 'goodies'
    # 3. cartes gradées
    if w('psa|pca|cgc|bgs|sgc') and re.search(r'(psa|pca|cgc|bgs|sgc) ?\d', n): return 'graded'
    # 4. scellé
    if w('demi display|display|booster box'): return 'display'
    if w('etb|upc'): return 'etb'
    if w('deck|starter|starter pack|academie de combat|kit ap'): return 'deck'
    if re.match(r'^one piece (op|eb) ?\d{2}$', n): return 'booster'          # « One Piece OP17 » = un booster de la série
    if w('art set|spc|collector') or w('coffret|bundle|tin|tins|mini tin|mini tins|tinbox|pokebox|poke box|valisette|tuckbox|mystery box|figure collection|collection poster'): return 'coffret'
    if w('booster|boosters|blister|tripack|duo pack'): return 'booster'
    return 'single'

GAME_PAGES = ('Pokémon', 'One Piece', 'Lorcana', 'Magic', 'Yu-Gi-Oh!')
def jeu(name, famille, ray):
    if ray in ('peluche', 'figurine', 'goodies', 'protection', 'tapis'): return ''   # jeu = cartes à jouer uniquement
    n = norm(name); f = famille.upper()
    w = lambda pat: re.search(r'(?<![a-z0-9])(?:' + pat + r')(?![a-z0-9])', n) is not None
    if w('lorcana|disney'): return 'Lorcana'
    if f == 'ONE PIECE' or w(r'one piece|op ?\d{2}|eb ?\d{2}|luffy|zoro'): return 'One Piece'
    if f == 'YUGIOH' or w('yu gi oh|croisee infernale'): return 'Yu-Gi-Oh!'
    if f == 'MAGIC' or w('magic the gathering|marvel|magic'): return 'Magic'
    if f == 'RIFTBOUND' or w('riftbound|spiritforged'): return 'Riftbound'
    if f == 'NARUTO' or w('naruto'): return 'Naruto'
    if f == 'KAYOU' or w('kayou'): return 'Kayou'
    if f == 'DBZ' or w('dragon ball'): return 'Dragon Ball'
    if f == 'RISE': return 'Rise'
    if f == 'POKEMON' or w('pokemon'): return 'Pokémon'
    # Famille vide dans la caisse : sur l'export du 21/11/2026, toutes les cartes et tous les
    # produits scellés sans famille étaient du Pokémon (147 articles relus un par un). On les
    # range donc en Pokémon, sauf les lignes génériques et les « mystery box ».
    if not f and not is_generic(name) and not w('mystery box'): return 'Pokémon'
    return ''

# Lignes « bac » de la caisse : un prix pour n'importe quelle carte du bac. Invendables
# en ligne telles quelles (le client ne sait pas quelle carte il achète) → brouillon.
GENERIC = {'carte', 'carte 1', 'carte ar', 'carte bloc ex', 'carte dp', 'carte full art', 'commune bloc ex',
           'ar japonnaise', 'lot de dp', 'reprise', 'pi', 'pikachu', 'booster', 'etb', 'one piece carte',
           'faille paradoxe', 'magicarpe', 'popi', 'stretch fit'}
def is_generic(name): return norm(name) in GENERIC
