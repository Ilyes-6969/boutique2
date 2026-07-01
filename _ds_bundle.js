/* @ds-bundle: {"format":3,"namespace":"ADITCGDesignSystem_df75b7","components":[{"name":"QtyStepper","sourcePath":"components/commerce/QtyStepper.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Tag","sourcePath":"components/core/Tag.jsx"},{"name":"PriceTag","sourcePath":"components/product/PriceTag.jsx"},{"name":"ProductCard","sourcePath":"components/product/ProductCard.jsx"}],"sourceHashes":{"components/commerce/QtyStepper.jsx":"acfe183e1fe4","components/core/Badge.jsx":"7fd6a2089410","components/core/Button.jsx":"a03e2b9d1a95","components/core/Tag.jsx":"43c2c77fec9e","components/product/PriceTag.jsx":"01e26d70f4a4","components/product/ProductCard.jsx":"bc36f88ccd12","ui_kits/leclub151/Admin.jsx":"6825495af51e","ui_kits/leclub151/Cart.jsx":"30577da3889d","ui_kits/leclub151/Catalogue.jsx":"338336c92218","ui_kits/leclub151/Checkout.jsx":"f4f9f6cfc507","ui_kits/leclub151/Chrome.jsx":"727b8334602f","ui_kits/leclub151/Home.jsx":"60e1d6ccf773","ui_kits/leclub151/Legal.jsx":"b66e006b2f47","ui_kits/leclub151/Product.jsx":"858a99dddf98","ui_kits/leclub151/data.js":"804136f633da","ui_kits/leclub151/i18n.js":"ddb23cbdc0c1","ui_kits/leclub151/reveal.js":"3b11e3f322ed"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.ADITCGDesignSystem_df75b7 = window.ADITCGDesignSystem_df75b7 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/commerce/QtyStepper.jsx
try { (() => {
/**
 * leclub151 QtyStepper — − value + with hairline border, mono value.
 */
function QtyStepper({
  value = 1,
  min = 1,
  max = 99,
  onChange
}) {
  const set = n => {
    const clamped = Math.max(min, Math.min(max, n));
    onChange && onChange(clamped);
  };
  const btn = {
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    fontWeight: 500,
    color: 'var(--ink)',
    background: 'transparent',
    transition: 'background 0.15s ease'
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      border: '1.5px solid var(--line-strong)',
      borderRadius: 'var(--radius-sm)',
      overflow: 'hidden',
      background: 'var(--card)'
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": "Diminuer",
    style: btn,
    onClick: () => set(value - 1)
  }, "\u2212"), /*#__PURE__*/React.createElement("span", {
    style: {
      minWidth: 44,
      textAlign: 'center',
      fontFamily: 'var(--font-mono)',
      fontSize: 15,
      fontWeight: 600,
      fontVariantNumeric: 'tabular-nums',
      borderInline: '1.5px solid var(--line)',
      padding: '11px 4px'
    }
  }, value), /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": "Augmenter",
    style: btn,
    onClick: () => set(value + 1)
  }, "\uFF0B"));
}
Object.assign(__ds_scope, { QtyStepper });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/commerce/QtyStepper.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * leclub151 Badge — small status marker for product cards.
 * tone: 'new' (yellow), 'sale' (ink), 'graded' (outline), 'stock'/'oos'.
 */
function Badge({
  children,
  tone = 'new',
  ...rest
}) {
  const tones = {
    new: {
      background: 'var(--accent)',
      color: 'var(--on-accent)',
      border: '1.5px solid var(--accent)'
    },
    sale: {
      background: 'var(--ink)',
      color: 'var(--on-ink)',
      border: '1.5px solid var(--ink)'
    },
    graded: {
      background: 'var(--card)',
      color: 'var(--ink)',
      border: '1.5px solid var(--line-strong)'
    },
    stock: {
      background: 'var(--green-soft)',
      color: 'var(--green)',
      border: '1.5px solid transparent'
    },
    oos: {
      background: 'var(--red-soft)',
      color: 'var(--red)',
      border: '1.5px solid transparent'
    }
  };
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      padding: '3px 9px',
      borderRadius: 'var(--radius-xs)',
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      fontWeight: 600,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      lineHeight: 1.4,
      whiteSpace: 'nowrap',
      ...(tones[tone] || tones.new)
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * leclub151 Button — minimalist, square-ish (radius 8), medium weight.
 * Hierarchy:
 *   primary → ink fill (the boutique's default action)
 *   accent  → club-yellow fill with ink label (buy / highlight)
 *   outline → hairline ink border, fills ink on hover
 *   ghost   → text-only, yellow underline grows on hover
 */
function Button({
  children,
  variant = 'primary',
  size = 'md',
  block = false,
  disabled = false,
  iconLeft = null,
  iconRight = null,
  as = 'button',
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const pad = size === 'sm' ? '9px 16px' : size === 'lg' ? '16px 30px' : '12px 22px';
  const fontSize = size === 'sm' ? 13 : size === 'lg' ? 16 : 14.5;
  const base = {
    display: block ? 'flex' : 'inline-flex',
    width: block ? '100%' : undefined,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    padding: pad,
    borderRadius: 'var(--radius-sm)',
    fontFamily: 'var(--font-body)',
    fontWeight: 600,
    fontSize,
    lineHeight: 1.1,
    letterSpacing: '0.01em',
    whiteSpace: 'nowrap',
    border: '1.5px solid transparent',
    transition: 'background 0.18s ease, color 0.18s ease, border-color 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.45 : 1
  };
  const variants = {
    primary: {
      background: hover && !disabled ? 'var(--ink-soft)' : 'var(--ink)',
      color: 'var(--on-ink)',
      transform: hover && !disabled ? 'translateY(-1px)' : 'none'
    },
    accent: {
      background: hover && !disabled ? 'var(--accent-deep)' : 'var(--accent)',
      color: 'var(--on-accent)',
      boxShadow: hover && !disabled ? 'var(--shadow-accent)' : 'var(--shadow-xs)',
      transform: hover && !disabled ? 'translateY(-1px)' : 'none'
    },
    outline: {
      background: hover && !disabled ? 'var(--ink)' : 'transparent',
      color: hover && !disabled ? 'var(--on-ink)' : 'var(--ink)',
      borderColor: 'var(--ink)'
    },
    ghost: {
      background: 'transparent',
      color: 'var(--ink)',
      borderBottom: hover && !disabled ? '1.5px solid var(--accent)' : '1.5px solid transparent',
      borderRadius: 0,
      padding: size === 'sm' ? '6px 2px' : '8px 2px'
    }
  };
  const Tag = as;
  return /*#__PURE__*/React.createElement(Tag, _extends({
    style: {
      ...base,
      ...(variants[variant] || variants.primary)
    },
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    disabled: as === 'button' ? disabled : undefined
  }, rest), iconLeft, children, iconRight);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Tag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * leclub151 Tag / filter chip — mono label, hairline border.
 * Set `active` for the selected state (ink fill).
 */
function Tag({
  children,
  active = false,
  as = 'button',
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const Tag = as;
  return /*#__PURE__*/React.createElement(Tag, _extends({
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 7,
      padding: '8px 15px',
      borderRadius: 'var(--radius-pill)',
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      fontWeight: 500,
      letterSpacing: '0.03em',
      textTransform: 'uppercase',
      lineHeight: 1,
      cursor: 'pointer',
      transition: 'all 0.18s ease',
      background: active ? 'var(--ink)' : 'transparent',
      color: active ? 'var(--on-ink)' : 'var(--ink)',
      border: `1.5px solid ${active ? 'var(--ink)' : hover ? 'var(--ink)' : 'var(--line-strong)'}`
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Tag.jsx", error: String((e && e.message) || e) }); }

// components/product/PriceTag.jsx
try { (() => {
/**
 * leclub151 PriceTag — mono tabular numerals. French formatting
 * (space thousands, comma decimals, trailing currency).
 * Shows an optional struck reference price before the current one.
 */
function PriceTag({
  price,
  oldPrice,
  currency = '€',
  size = 'md'
}) {
  const sizes = {
    sm: 14,
    md: 18,
    lg: 26
  };
  const fs = sizes[size] || sizes.md;
  const fmt = n => new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(n);
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'baseline',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, oldPrice != null && oldPrice > price && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: fs * 0.72,
      color: 'var(--muted)',
      textDecoration: 'line-through',
      fontVariantNumeric: 'tabular-nums'
    }
  }, fmt(oldPrice), "\xA0", currency), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontWeight: 600,
      fontSize: fs,
      letterSpacing: '-0.01em',
      color: 'var(--ink)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, fmt(price), "\xA0", currency));
}
Object.assign(__ds_scope, { PriceTag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/product/PriceTag.jsx", error: String((e && e.message) || e) }); }

// components/product/ProductCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * leclub151 ProductCard — the storefront's core unit.
 * White card, hairline border, product image on a soft stage, mono
 * category kicker, display title, price with savings, stock cue and a
 * full "Ajouter au panier" CTA. Tuned to make you want to buy.
 */
function ProductCard({
  image,
  title,
  category,
  price,
  oldPrice,
  currency = '€',
  badge,
  // { tone, label }
  inStock = true,
  stockLeft,
  // optional number → "Plus que N en stock"
  href = '#',
  onAdd,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const [liked, setLiked] = React.useState(false);
  const fmt = n => new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(n);
  const pct = oldPrice && oldPrice > price ? Math.round((1 - price / oldPrice) * 100) : 0;
  const low = inStock && typeof stockLeft === 'number' && stockLeft <= 3;
  return /*#__PURE__*/React.createElement("a", _extends({
    href: href,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--card)',
      border: '1.5px solid var(--line)',
      borderRadius: 'var(--radius)',
      overflow: 'hidden',
      transition: 'border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease',
      borderColor: hover ? 'var(--line-strong)' : 'var(--line)',
      transform: hover ? 'translateY(-4px)' : 'none',
      boxShadow: hover ? 'var(--shadow-lg)' : 'var(--shadow-xs)',
      color: 'var(--ink)'
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      aspectRatio: '1 / 1',
      background: 'var(--paper-2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 22,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 12,
      left: 12,
      zIndex: 2,
      display: 'flex',
      gap: 6
    }
  }, pct > 0 && /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    tone: "sale"
  }, "\u2212", pct, "%"), badge && /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    tone: badge.tone
  }, badge.label)), !inStock && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 12,
      right: 12,
      zIndex: 2
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    tone: "oos"
  }, "Rupture")), inStock && /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": "Ajouter aux favoris",
    onClick: e => {
      e.preventDefault();
      e.stopPropagation();
      setLiked(v => !v);
    },
    style: {
      position: 'absolute',
      top: 10,
      right: 10,
      zIndex: 2,
      width: 32,
      height: 32,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--card)',
      border: '1.5px solid var(--line)',
      fontSize: 14,
      lineHeight: 1,
      color: liked ? 'var(--accent)' : 'var(--muted)',
      opacity: hover || liked ? 1 : 0,
      transition: 'opacity 0.2s ease, color 0.2s ease'
    }
  }, liked ? '♥' : '♡'), image ? /*#__PURE__*/React.createElement("img", {
    src: image,
    alt: title,
    loading: 'lazy',
    decoding: 'async',
    style: {
      maxWidth: '100%',
      maxHeight: '100%',
      objectFit: 'contain',
      filter: 'drop-shadow(0 12px 20px rgba(26,23,20,0.2))',
      transition: 'transform 0.35s cubic-bezier(0.2,0.8,0.2,1)',
      transform: hover ? 'scale(1.06)' : 'scale(1)'
    }
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: 'var(--muted)'
    }
  }, "IMAGE")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 16px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 5,
      flex: 1
    }
  }, category && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 10.5,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      color: 'var(--muted)'
    }
  }, category), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 16.5,
      lineHeight: 1.22,
      letterSpacing: '-0.01em',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
      minHeight: 40
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 8,
      flexWrap: 'wrap',
      marginTop: 2
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.PriceTag, {
    price: price,
    oldPrice: oldPrice,
    currency: currency,
    size: "md"
  }), pct > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      fontWeight: 600,
      color: 'var(--green)'
    }
  }, "\u2212", fmt(oldPrice - price), "\xA0", currency)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      fontFamily: 'var(--font-mono)',
      fontSize: 10.5,
      letterSpacing: '0.04em',
      color: inStock ? low ? 'var(--ink)' : 'var(--green)' : 'var(--muted)',
      fontWeight: low ? 600 : 400
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: '50%',
      background: inStock ? low ? 'var(--accent)' : 'var(--green)' : 'var(--line-strong)'
    }
  }), inStock ? low ? `Plus que ${stockLeft} en stock` : 'En stock · expédié sous 48 h' : 'Bientôt de retour'), /*#__PURE__*/React.createElement("button", {
    type: "button",
    disabled: !inStock,
    "aria-label": "Ajouter au panier",
    onClick: e => {
      e.preventDefault();
      if (inStock) onAdd && onAdd();
    },
    style: {
      marginTop: 12,
      width: '100%',
      height: 42,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      borderRadius: 'var(--radius-sm)',
      fontFamily: 'var(--font-body)',
      fontWeight: 600,
      fontSize: 14,
      cursor: inStock ? 'pointer' : 'not-allowed',
      transition: 'all 0.18s ease',
      border: '1.5px solid',
      borderColor: inStock ? 'var(--ink)' : 'var(--line)',
      background: !inStock ? 'transparent' : hover ? 'var(--accent)' : 'var(--ink)',
      color: !inStock ? 'var(--muted)' : hover ? 'var(--on-accent)' : 'var(--on-ink)',
      boxShadow: inStock && hover ? 'var(--shadow-accent)' : 'none'
    }
  }, inStock ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 16
    }
  }, "\uFF0B"), " Ajouter au panier") : 'Indisponible')));
}
Object.assign(__ds_scope, { ProductCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/product/ProductCard.jsx", error: String((e && e.message) || e) }); }

// ui_kits/leclub151/Admin.jsx
try { (() => {
/* leclub151 — Gestion via WordPress / WooCommerce (application externe au site)
   Interface façon wp-admin : on édite prix, stock, promos et on ajoute des
   produits. Tout est enregistré et synchronisé avec la boutique (démo). */

const WP = {
  dark: '#1d2327',
  darker: '#101517',
  blue: '#2271b1',
  blueDark: '#135e96',
  grey: '#f0f0f1',
  border: '#c3c4c7',
  text: '#1d2327',
  muted: '#50575e',
  woo: '#7f54b3',
  green: '#00a32a',
  red: '#d63638',
  white: '#fff',
  font: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, monospace"
};
function useStoreAdmin() {
  const [, force] = React.useReducer(x => x + 1, 0);
  React.useEffect(() => window.LC151.Store.subscribe(force), []);
  return window.LC151.Store;
}
function WpConnect({
  Store,
  showToast
}) {
  const [url, setUrl] = React.useState(Store.getWpUrl());
  const st = Store.wpStatus();
  const connect = () => {
    Store.setWpUrl(url);
    showToast(url ? 'Connexion à WordPress…' : 'WordPress déconnecté');
  };
  const dot = st.state === 'ok' ? WP.green : st.state === 'error' ? WP.red : st.state === 'loading' ? WP.blue : WP.muted;
  const label = st.state === 'ok' ? `Connecté · ${st.count} produit${st.count > 1 ? 's' : ''} importé${st.count > 1 ? 's' : ''}` : st.state === 'loading' ? 'Connexion en cours…' : st.state === 'error' ? 'Échec : ' + st.error : 'Non connecté';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: WP.white,
      border: '1px solid ' + WP.border,
      borderLeft: '4px solid ' + WP.woo,
      borderRadius: 4,
      padding: '14px 16px',
      marginBottom: 18,
      boxShadow: '0 1px 1px rgba(0,0,0,0.04)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600,
      fontSize: 13.5,
      color: WP.woo
    }
  }, "Connexion WordPress / WooCommerce"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      marginLeft: 'auto',
      fontSize: 12,
      color: WP.muted
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: '50%',
      background: dot
    }
  }), label)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("input", {
    value: url,
    onChange: e => setUrl(e.target.value),
    placeholder: "https://votre-site-wordpress.fr",
    onKeyDown: e => {
      if (e.key === 'Enter') connect();
    },
    style: {
      flex: 1,
      minWidth: 240,
      padding: '7px 11px',
      border: '1px solid ' + WP.border,
      borderRadius: 3,
      fontSize: 13,
      fontFamily: WP.mono,
      outline: 'none',
      color: WP.text
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: connect,
    style: {
      fontFamily: WP.font,
      fontSize: 13,
      fontWeight: 600,
      padding: '7px 16px',
      borderRadius: 3,
      border: 'none',
      background: WP.woo,
      color: '#fff',
      cursor: 'pointer'
    }
  }, "Connecter"), st.state === 'ok' && /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      Store.refreshFromWp();
      showToast('Catalogue actualisé');
    },
    style: {
      fontFamily: WP.font,
      fontSize: 13,
      padding: '7px 14px',
      borderRadius: 3,
      border: '1px solid ' + WP.border,
      background: '#f6f7f7',
      color: WP.text,
      cursor: 'pointer'
    }
  }, "\u21BB Actualiser")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 12,
      color: WP.muted,
      marginTop: 9,
      lineHeight: 1.55
    }
  }, "Saisissez l'adresse de votre site WordPress \xE9quip\xE9 de WooCommerce. Les produits sont lus via l'API publique ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: WP.mono
    }
  }, "/wp-json/wc/store/v1/products"), " et s'affichent automatiquement sur la boutique. (Le site doit autoriser le CORS pour le domaine de cette vitrine.)"));
}
function AdminApp() {
  const Store = useStoreAdmin();
  const {
    fmt,
    FILTERS
  } = window.LC151;
  const products = Store.all();
  const [q, setQ] = React.useState('');
  const [tab, setTab] = React.useState('all'); // all | instock | oos | promo
  const [toast, setToast] = React.useState('');
  const [adding, setAdding] = React.useState(false);
  const showToast = m => {
    setToast(m);
    setTimeout(() => setToast(''), 1600);
  };
  const counts = {
    all: products.length,
    instock: products.filter(p => p.inStock).length,
    oos: products.filter(p => !p.inStock).length,
    promo: products.filter(p => p.oldPrice).length
  };
  let list = products.filter(p => {
    if (tab === 'instock' && !p.inStock) return false;
    if (tab === 'oos' && p.inStock) return false;
    if (tab === 'promo' && !p.oldPrice) return false;
    return q === '' || (p.name + ' ' + p.set + ' ' + p.num).toLowerCase().includes(q.toLowerCase());
  });
  const menu = [['⊞', 'Tableau de bord'], ['✎', 'Articles'], ['▣', 'Médias'], ['❏', 'Pages'], ['✉', 'Commandes'], ['🛍', 'Produits', true], ['◫', 'Marketing'], ['⚙', 'Réglages']];
  const tabBtn = (key, label, n) => /*#__PURE__*/React.createElement("button", {
    onClick: () => setTab(key),
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontFamily: WP.font,
      fontSize: 13,
      color: tab === key ? WP.text : WP.blue,
      fontWeight: tab === key ? 600 : 400
    }
  }, label, " ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: WP.muted
    }
  }, "(", n, ")"));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100vh',
      background: WP.grey,
      fontFamily: WP.font,
      color: WP.text,
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 34,
      background: WP.darker,
      color: '#c3c4c7',
      display: 'flex',
      alignItems: 'center',
      paddingInline: 12,
      fontSize: 13,
      gap: 16,
      position: 'sticky',
      top: 0,
      zIndex: 60
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 7
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'baseline',
      gap: 1,
      fontWeight: 700
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#fff'
    }
  }, "leclub"), /*#__PURE__*/React.createElement("span", {
    style: {
      background: '#fff',
      color: '#161412',
      padding: '0 4px',
      borderRadius: 2
    }
  }, "151"))), /*#__PURE__*/React.createElement("a", {
    href: "index.html",
    style: {
      color: '#c3c4c7',
      textDecoration: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5
    }
  }, "\u2302 Voir le site"), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 'auto',
      color: '#a7aaad'
    }
  }, "Bonjour, leclub151 \u25BE")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("nav", {
    style: {
      width: 200,
      background: WP.dark,
      color: '#f0f0f1',
      flexShrink: 0,
      paddingTop: 8
    }
  }, menu.map(([ic, label, active]) => /*#__PURE__*/React.createElement("div", {
    key: label,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '11px 14px',
      fontSize: 14,
      cursor: 'pointer',
      background: active ? WP.blue : 'transparent',
      color: active ? '#fff' : '#c3c4c7',
      fontWeight: active ? 600 : 400,
      borderLeft: active ? '4px solid #fff' : '4px solid transparent'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 18,
      fontSize: 14,
      opacity: active ? 1 : 0.7
    }
  }, ic), label)), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px 14px 14px',
      fontFamily: WP.mono,
      fontSize: 10,
      color: '#8c8f94',
      letterSpacing: '0.04em'
    }
  }, "WooCommerce 9.4 \xB7 WordPress 6.7")), /*#__PURE__*/React.createElement("main", {
    style: {
      flex: 1,
      padding: '22px 30px 60px',
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 23,
      fontWeight: 400
    }
  }, "Produits"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setAdding(true),
    style: {
      fontFamily: WP.font,
      fontSize: 13,
      padding: '4px 10px',
      borderRadius: 3,
      border: '1px solid ' + WP.blue,
      color: WP.blue,
      background: '#f6f7f7',
      cursor: 'pointer'
    }
  }, "Ajouter un produit"), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 'auto',
      fontFamily: WP.mono,
      fontSize: 11.5,
      color: WP.muted
    }
  }, "Synchronis\xE9 avec la boutique \xB7 modifications enregistr\xE9es")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      color: WP.muted,
      marginBottom: 18
    }
  }, "G\xE9rez le catalogue WooCommerce : modifiez les prix, le stock et les promotions. Les changements s'appliquent au site en direct."), /*#__PURE__*/React.createElement(WpConnect, {
    Store: Store,
    showToast: showToast
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 0,
      marginBottom: 10,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      alignItems: 'center',
      fontSize: 13
    }
  }, tabBtn('all', 'Tous', counts.all), /*#__PURE__*/React.createElement("span", {
    style: {
      color: WP.border
    }
  }, "|"), tabBtn('instock', 'En stock', counts.instock), /*#__PURE__*/React.createElement("span", {
    style: {
      color: WP.border
    }
  }, "|"), tabBtn('oos', 'En rupture', counts.oos), /*#__PURE__*/React.createElement("span", {
    style: {
      color: WP.border
    }
  }, "|"), tabBtn('promo', 'En promotion', counts.promo)), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: 'auto',
      display: 'flex',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("input", {
    value: q,
    onChange: e => setQ(e.target.value),
    placeholder: "Rechercher des produits",
    style: {
      padding: '5px 10px',
      border: '1px solid ' + WP.border,
      borderRadius: 3,
      fontSize: 13,
      fontFamily: WP.font,
      minWidth: 220,
      outline: 'none',
      color: WP.text
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: WP.white,
      border: '1px solid ' + WP.border,
      borderRadius: 4,
      overflow: 'hidden',
      boxShadow: '0 1px 1px rgba(0,0,0,0.04)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '46px 1.9fr 0.8fr 1fr 1fr 0.9fr 0.5fr',
      gap: 12,
      padding: '10px 14px',
      borderBottom: '1px solid ' + WP.border,
      background: '#fff',
      fontSize: 12,
      fontWeight: 600,
      color: WP.text,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    disabled: true,
    style: {
      accentColor: WP.blue
    }
  }), /*#__PURE__*/React.createElement("span", null, "Nom"), /*#__PURE__*/React.createElement("span", null, "SKU"), /*#__PURE__*/React.createElement("span", null, "Stock"), /*#__PURE__*/React.createElement("span", null, "Prix"), /*#__PURE__*/React.createElement("span", null, "\xC9tiquette"), /*#__PURE__*/React.createElement("span", null)), list.map((p, i) => /*#__PURE__*/React.createElement(WpRow, {
    key: p.id,
    product: p,
    Store: Store,
    showToast: showToast,
    stripe: i % 2 === 1
  })), list.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 48,
      textAlign: 'center',
      color: WP.muted,
      fontSize: 13.5,
      lineHeight: 1.7
    }
  }, "Aucun produit pour l'instant.", /*#__PURE__*/React.createElement("br", null), "Cliquez \xAB Ajouter un produit \xBB ou importez votre catalogue depuis WooCommerce.")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10,
      fontSize: 12.5,
      color: WP.muted
    }
  }, list.length, " \xE9l\xE9ment", list.length > 1 ? 's' : ''), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      if (confirm('Réinitialiser toutes les modifications de démo ?')) {
        Store.resetAll();
        showToast('Catalogue réinitialisé');
      }
    },
    style: {
      marginTop: 22,
      fontFamily: WP.font,
      fontSize: 12.5,
      color: WP.muted,
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      textDecoration: 'underline'
    }
  }, "R\xE9initialiser le catalogue de d\xE9monstration"))), adding && /*#__PURE__*/React.createElement(WpAddModal, {
    Store: Store,
    onClose: () => setAdding(false),
    onDone: name => {
      setAdding(false);
      showToast(name + ' publié');
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      bottom: 22,
      left: 230,
      transform: `translateY(${toast ? 0 : 16}px)`,
      opacity: toast ? 1 : 0,
      transition: 'all 0.25s ease',
      pointerEvents: 'none',
      zIndex: 80,
      background: WP.white,
      color: WP.text,
      padding: '11px 18px',
      borderRadius: 4,
      fontSize: 13.5,
      border: '1px solid ' + WP.border,
      borderLeft: '4px solid ' + WP.green,
      boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: WP.green
    }
  }, "\u2713"), " ", toast));
}
function WpRow({
  product,
  Store,
  showToast,
  stripe
}) {
  const [price, setPrice] = React.useState(String(product.price));
  const [old, setOld] = React.useState(product.oldPrice != null ? String(product.oldPrice) : '');
  React.useEffect(() => {
    setPrice(String(product.price));
  }, [product.price]);
  React.useEffect(() => {
    setOld(product.oldPrice != null ? String(product.oldPrice) : '');
  }, [product.oldPrice]);
  const commitPrice = () => {
    const n = parseFloat(price.replace(',', '.'));
    if (!isNaN(n) && n !== product.price) {
      Store.update(product.id, 'price', Math.round(n * 100) / 100);
      showToast('Prix mis à jour');
    }
  };
  const commitOld = () => {
    const v = old.trim();
    if (v === '') {
      if (product.oldPrice != null) {
        Store.update(product.id, 'oldPrice', null);
        showToast('Promo retirée');
      }
      return;
    }
    const n = parseFloat(v.replace(',', '.'));
    if (!isNaN(n) && n !== product.oldPrice) {
      Store.update(product.id, 'oldPrice', Math.round(n * 100) / 100);
      showToast('Promo mise à jour');
    }
  };
  const inp = {
    width: '100%',
    padding: '6px 8px',
    border: '1px solid ' + WP.border,
    borderRadius: 3,
    fontFamily: WP.mono,
    fontSize: 12.5,
    color: WP.text,
    outline: 'none',
    fontVariantNumeric: 'tabular-nums'
  };
  const sku = 'LC151-' + product.id.toUpperCase();
  const curLabel = product.badge ? product.badge.tone === 'new' ? 'new' : product.badge.tone === 'graded' ? 'graded' : 'sale' : 'none';
  const setBadge = val => {
    if (val === 'none') Store.update(product.id, 'badge', null);else if (val === 'new') Store.update(product.id, 'badge', {
      tone: 'new',
      label: 'Nouveau'
    });else if (val === 'graded') Store.update(product.id, 'badge', {
      tone: 'graded',
      label: product.badge && product.badge.tone === 'graded' ? product.badge.label : 'PSA 10'
    });else Store.update(product.id, 'badge', {
      tone: 'sale',
      label: 'Promo'
    });
    showToast('Étiquette modifiée');
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '46px 1.9fr 0.8fr 1fr 1fr 0.9fr 0.5fr',
      gap: 12,
      padding: '12px 14px',
      borderBottom: '1px solid #f0f0f1',
      alignItems: 'center',
      background: stripe ? '#fbfbfc' : '#fff',
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    style: {
      accentColor: WP.blue
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 11,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 40,
      height: 40,
      flexShrink: 0,
      border: '1px solid ' + WP.border,
      borderRadius: 3,
      background: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      padding: 3
    }
  }, product.image ? /*#__PURE__*/React.createElement("img", {
    src: product.image,
    alt: "",
    style: {
      maxHeight: '100%',
      objectFit: 'contain'
    }
  }) : /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 800,
      fontSize: 12,
      color: WP.muted,
      fontFamily: WP.mono
    }
  }, "151")), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      color: WP.blue,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, product.name, " ", Store.isModified(product.id) && /*#__PURE__*/React.createElement("span", {
    title: "Modifi\xE9",
    style: {
      color: WP.woo
    }
  }, "\u25CF")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: WP.muted
    }
  }, product.cat))), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: WP.mono,
      fontSize: 11.5,
      color: WP.muted,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, sku), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => Store.update(product.id, 'inStock', !product.inStock),
    style: {
      justifySelf: 'start',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 7,
      padding: '4px 10px',
      borderRadius: 3,
      border: '1px solid',
      borderColor: product.inStock ? WP.green : WP.red,
      background: '#fff',
      fontSize: 12,
      fontWeight: 600,
      color: product.inStock ? WP.green : WP.red,
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 7,
      height: 7,
      borderRadius: '50%',
      background: product.inStock ? WP.green : WP.red
    }
  }), product.inStock ? 'En stock' : 'Rupture'), Store.isUnique(product.id) && /*#__PURE__*/React.createElement("span", {
    title: "Carte unique \u2014 une seule \xE9dition disponible",
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      fontFamily: WP.mono,
      fontSize: 10,
      fontWeight: 600,
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      color: WP.woo,
      background: '#f3eefb',
      border: '1px solid ' + WP.woo,
      borderRadius: 3,
      padding: '2px 6px'
    }
  }, "1 ex. \xB7 \xC9dition unique")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("input", {
    style: inp,
    value: price,
    onChange: e => setPrice(e.target.value),
    onBlur: commitPrice,
    onKeyDown: e => e.key === 'Enter' && e.target.blur()
  }), /*#__PURE__*/React.createElement("input", {
    style: {
      ...inp,
      color: old ? WP.red : WP.muted,
      fontSize: 11.5
    },
    value: old,
    placeholder: "prix barr\xE9",
    onChange: e => setOld(e.target.value),
    onBlur: commitOld,
    onKeyDown: e => e.key === 'Enter' && e.target.blur()
  })), /*#__PURE__*/React.createElement("select", {
    value: curLabel,
    onChange: e => setBadge(e.target.value),
    style: {
      padding: '6px 6px',
      border: '1px solid ' + WP.border,
      borderRadius: 3,
      fontSize: 12.5,
      color: WP.text,
      background: '#fff',
      cursor: 'pointer',
      width: '100%',
      fontFamily: WP.font
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: "none"
  }, "\u2014 Aucune"), /*#__PURE__*/React.createElement("option", {
    value: "new"
  }, "Nouveau"), /*#__PURE__*/React.createElement("option", {
    value: "sale"
  }, "Promo"), /*#__PURE__*/React.createElement("option", {
    value: "graded"
  }, "Grad\xE9e")), /*#__PURE__*/React.createElement("div", {
    style: {
      justifySelf: 'end'
    }
  }, Store.isCustom(product.id) ? /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      if (confirm('Supprimer ce produit ?')) {
        Store.remove(product.id);
        showToast('Produit supprimé');
      }
    },
    title: "Corbeille",
    style: {
      color: WP.red,
      fontSize: 13,
      background: 'none',
      border: 'none',
      cursor: 'pointer'
    }
  }, "Corbeille") : /*#__PURE__*/React.createElement("span", {
    style: {
      color: WP.border,
      fontSize: 12
    }
  }, "\u2014")));
}
function WpAddModal({
  Store,
  onClose,
  onDone
}) {
  const [name, setName] = React.useState('');
  const [cat, setCat] = React.useState("Carte à l'unité");
  const [type, setType] = React.useState('single');
  const [price, setPrice] = React.useState('');
  const cats = [["Carte à l'unité", 'single'], ['Carte gradée', 'graded'], ['Coffret / scellé', 'sealed'], ['Accessoire', 'accessory']];
  const submit = () => {
    const n = parseFloat(price.replace(',', '.'));
    if (!name.trim() || isNaN(n)) return;
    Store.add({
      name: name.trim(),
      cat,
      type,
      price: Math.round(n * 100) / 100
    });
    onDone(name.trim());
  };
  const field = {
    width: '100%',
    padding: '8px 10px',
    border: '1px solid ' + WP.border,
    borderRadius: 3,
    fontSize: 14,
    color: WP.text,
    outline: 'none',
    fontFamily: WP.font
  };
  const lbl = {
    fontSize: 12.5,
    fontWeight: 600,
    color: WP.text,
    marginBottom: 6,
    display: 'block'
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 90,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      fontFamily: WP.font
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: 'absolute',
      inset: 0,
      background: 'rgba(0,0,0,0.45)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width: 'min(460px, 100%)',
      background: WP.white,
      border: '1px solid ' + WP.border,
      borderRadius: 4,
      boxShadow: '0 8px 30px rgba(0,0,0,0.25)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '14px 18px',
      borderBottom: '1px solid ' + WP.border
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 17,
      fontWeight: 600
    }
  }, "Ajouter un produit"), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      fontSize: 18,
      color: WP.muted,
      background: 'none',
      border: 'none',
      cursor: 'pointer'
    }
  }, "\xD7")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 18,
      display: 'flex',
      flexDirection: 'column',
      gap: 15
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: lbl
  }, "Nom du produit"), /*#__PURE__*/React.createElement("input", {
    autoFocus: true,
    style: field,
    value: name,
    onChange: e => setName(e.target.value),
    placeholder: "ex. Ronflex Holo \u2014 Jungle"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: lbl
  }, "Cat\xE9gorie"), /*#__PURE__*/React.createElement("select", {
    style: field,
    value: cat,
    onChange: e => {
      const c = cats.find(x => x[0] === e.target.value);
      setCat(c[0]);
      setType(c[1]);
    }
  }, cats.map(c => /*#__PURE__*/React.createElement("option", {
    key: c[1],
    value: c[0]
  }, c[0])))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: lbl
  }, "Prix (\u20AC)"), /*#__PURE__*/React.createElement("input", {
    style: field,
    value: price,
    onChange: e => setPrice(e.target.value),
    placeholder: "0,00"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#f6f7f7',
      border: '1px solid ' + WP.border,
      borderLeft: '4px solid ' + WP.woo,
      borderRadius: 3,
      padding: '10px 12px',
      fontSize: 12.5,
      color: WP.muted
    }
  }, "Le produit sera publi\xE9 avec une image provisoire \xAB 151 \xBB. Vous pourrez ajouter la photo depuis la fiche produit WooCommerce.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 10,
      padding: '14px 18px',
      borderTop: '1px solid ' + WP.border,
      background: '#f6f7f7'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      fontFamily: WP.font,
      fontSize: 13,
      padding: '7px 14px',
      borderRadius: 3,
      border: '1px solid ' + WP.border,
      background: '#fff',
      color: WP.text,
      cursor: 'pointer'
    }
  }, "Annuler"), /*#__PURE__*/React.createElement("button", {
    onClick: submit,
    disabled: !name.trim() || price === '',
    style: {
      fontFamily: WP.font,
      fontSize: 13,
      padding: '7px 16px',
      borderRadius: 3,
      border: '1px solid ' + WP.blue,
      background: !name.trim() || price === '' ? '#7fb0d4' : WP.blue,
      color: '#fff',
      cursor: !name.trim() || price === '' ? 'not-allowed' : 'pointer',
      fontWeight: 600
    }
  }, "Publier"))));
}
ReactDOM.createRoot(document.getElementById('admin-root')).render(/*#__PURE__*/React.createElement(AdminApp, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/leclub151/Admin.jsx", error: String((e && e.message) || e) }); }

// ui_kits/leclub151/Cart.jsx
try { (() => {
/* leclub151 — Panier (slide-over drawer) */
function CartDrawer({
  open,
  onClose,
  navigate
}) {
  const DS = window.ADITCGDesignSystem_df75b7;
  const cart = useCart();
  const auth = useAuth();
  const {
    fmt,
    FREE_SHIP
  } = window.LC151;
  const items = cart.items();
  const subtotal = cart.subtotal();
  const remaining = Math.max(0, FREE_SHIP - subtotal);
  const pct = Math.min(100, subtotal / FREE_SHIP * 100);
  const loggedIn = auth.isLoggedIn();
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      pointerEvents: open ? 'auto' : 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: 'absolute',
      inset: 0,
      background: 'rgba(26,23,20,0.45)',
      opacity: open ? 1 : 0,
      transition: 'opacity 0.3s ease'
    }
  }), /*#__PURE__*/React.createElement("aside", {
    role: "dialog",
    "aria-modal": "true",
    "aria-label": "Votre panier",
    "aria-hidden": !open,
    style: {
      position: 'absolute',
      top: 0,
      right: 0,
      height: '100%',
      width: 'min(440px, 100%)',
      background: 'var(--paper)',
      borderLeft: '1.5px solid var(--line)',
      boxShadow: 'var(--shadow-lg)',
      transform: open ? 'translateX(0)' : 'translateX(100%)',
      transition: 'transform 0.32s cubic-bezier(0.2,0.8,0.2,1)',
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px 22px',
      borderBottom: '1.5px solid var(--line)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 19
    }
  }, "Votre panier ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--muted)',
      fontFamily: 'var(--font-mono)',
      fontSize: 14
    }
  }, "(", cart.count(), ")")), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    "aria-label": "Fermer",
    style: {
      width: 34,
      height: 34,
      borderRadius: 'var(--radius-sm)',
      border: '1.5px solid var(--line-strong)',
      fontSize: 16,
      color: 'var(--ink)'
    }
  }, "\xD7")), items.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      padding: 30,
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement(ProductStage, {
    glyph: "Panier vide"
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--ink-2)',
      fontSize: 14.5
    }
  }, "Votre panier est vide pour l'instant."), /*#__PURE__*/React.createElement(DS.Button, {
    variant: "primary",
    onClick: () => {
      onClose();
      navigate('catalogue');
    }
  }, "Explorer la boutique")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 22px',
      borderBottom: '1.5px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--ink-2)',
      marginBottom: 8
    }
  }, remaining > 0 ? /*#__PURE__*/React.createElement("span", null, "Plus que ", /*#__PURE__*/React.createElement("strong", {
    style: {
      color: 'var(--ink)'
    }
  }, fmt(remaining)), " pour la livraison offerte") : /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--green)',
      fontWeight: 600
    }
  }, "\u2713 Livraison offerte d\xE9bloqu\xE9e")), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 6,
      borderRadius: 3,
      background: 'var(--paper-2)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: pct + '%',
      height: '100%',
      background: 'var(--accent)',
      transition: 'width 0.3s ease'
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      padding: '8px 22px'
    }
  }, items.map(line => {
    const p = window.LC151.get(line.id);
    if (!p) return null; // stale line — Cart.reconcile() prunes it; never crash
    return /*#__PURE__*/React.createElement("div", {
      key: line.id,
      style: {
        display: 'flex',
        gap: 14,
        padding: '16px 0',
        borderBottom: '1.5px solid var(--line)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 64,
        height: 64,
        flexShrink: 0,
        borderRadius: 'var(--radius-sm)',
        background: 'var(--paper-2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 6,
        overflow: 'hidden'
      }
    }, p.image ? /*#__PURE__*/React.createElement("img", {
      src: p.image,
      alt: p.name,
      style: {
        maxHeight: '100%',
        objectFit: 'contain'
      }
    }) : /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-display)',
        fontWeight: 800,
        color: 'var(--muted)'
      }
    }, "151")), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: 14.5,
        lineHeight: 1.25
      }
    }, p.name), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 10.5,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'var(--muted)',
        margin: '3px 0 8px'
      }
    }, p.num), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8
      }
    }, window.LC151.Cart.isUnique(line.id) ? /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        fontWeight: 600,
        color: 'var(--ink-2)',
        border: '1.5px solid var(--line)',
        borderRadius: 'var(--radius-sm)',
        padding: '5px 9px'
      }
    }, "Pi\xE8ce unique \xB7 1") : /*#__PURE__*/React.createElement(DS.QtyStepper, {
      value: line.qty,
      onChange: q => cart.setQty(line.id, q),
      max: 10
    }), /*#__PURE__*/React.createElement(DS.PriceTag, {
      price: p.price * line.qty,
      size: "sm"
    }))), /*#__PURE__*/React.createElement("button", {
      onClick: () => cart.remove(line.id),
      "aria-label": "Retirer",
      style: {
        alignSelf: 'flex-start',
        fontSize: 13,
        color: 'var(--muted)',
        fontFamily: 'var(--font-mono)'
      }
    }, "\u2715"));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '18px 22px 22px',
      borderTop: '1.5px solid var(--line)',
      background: 'var(--card)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      color: 'var(--ink-2)'
    }
  }, "Sous-total"), /*#__PURE__*/React.createElement(DS.PriceTag, {
    price: subtotal,
    size: "lg"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: 'var(--muted)',
      marginBottom: 14
    }
  }, "Taxes incluses \xB7 livraison calcul\xE9e \xE0 l'\xE9tape suivante"), loggedIn ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 12,
      fontSize: 13,
      color: 'var(--ink-2)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 22,
      height: 22,
      borderRadius: '50%',
      background: 'var(--accent)',
      color: 'var(--on-accent)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 11,
      fontWeight: 700,
      textTransform: 'uppercase'
    }
  }, (auth.user().name || 'C')[0]), "Connect\xE9 \xB7 ", auth.user().name), /*#__PURE__*/React.createElement(DS.Button, {
    variant: "accent",
    size: "lg",
    block: true,
    iconRight: "\u2192",
    onClick: () => {
      onClose();
      openModal('checkout');
    }
  }, "Passer commande")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 9,
      padding: '12px 14px',
      marginBottom: 12,
      background: 'var(--paper-2)',
      border: '1.5px solid var(--line)',
      borderRadius: 'var(--radius-sm)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      color: 'var(--ink)',
      fontSize: 15,
      lineHeight: 1.4
    }
  }, "\uD83D\uDD12"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--ink-2)',
      lineHeight: 1.5
    }
  }, /*#__PURE__*/React.createElement("strong", {
    style: {
      color: 'var(--ink)'
    }
  }, "Un compte est requis pour commander."), " Connectez-vous ou cr\xE9ez votre compte client \u2014 c'est rapide et gratuit.")), /*#__PURE__*/React.createElement(DS.Button, {
    variant: "accent",
    size: "lg",
    block: true,
    iconRight: "\u2192",
    onClick: () => {
      onClose();
      openModal('account');
    }
  }, "Se connecter / cr\xE9er un compte"), /*#__PURE__*/React.createElement("button", {
    title: "Connexion requise",
    disabled: true,
    style: {
      width: '100%',
      marginTop: 10,
      height: 38,
      fontSize: 13.5,
      color: 'var(--muted)',
      fontFamily: 'var(--font-body)',
      background: 'transparent',
      border: '1.5px dashed var(--line-strong)',
      borderRadius: 'var(--radius-sm)',
      cursor: 'not-allowed'
    }
  }, "Passer commande (connexion requise)")), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      width: '100%',
      marginTop: 10,
      fontSize: 13.5,
      color: 'var(--ink-2)',
      fontFamily: 'var(--font-body)'
    }
  }, "Continuer mes achats")))));
}
function CartPage({
  navigate
}) {
  const DS = window.ADITCGDesignSystem_df75b7;
  const cart = useCart();
  const auth = useAuth();
  const {
    fmt,
    FREE_SHIP
  } = window.LC151;
  const items = cart.items();
  const subtotal = cart.subtotal();
  const remaining = Math.max(0, FREE_SHIP - subtotal);
  const pct = Math.min(100, subtotal / FREE_SHIP * 100);
  const loggedIn = auth.isLoggedIn();
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("section", {
    className: "container-wide",
    style: {
      padding: '28px 24px 8px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      color: 'var(--muted)'
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "index.html"
  }, "Accueil"), " \xA0/\xA0 ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--ink)'
    }
  }, "Panier"))), /*#__PURE__*/React.createElement("section", {
    className: "container-wide",
    style: {
      padding: '12px 24px 80px'
    }
  }, /*#__PURE__*/React.createElement("h1", {
    className: "display-2",
    style: {
      marginBottom: 24
    }
  }, "Votre panier"), items.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '60px 24px',
      border: '1.5px solid var(--line)',
      borderRadius: 'var(--radius-lg)',
      background: 'var(--card)'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 16,
      color: 'var(--ink-2)',
      marginBottom: 20
    }
  }, "Votre panier est vide pour l'instant."), /*#__PURE__*/React.createElement(DS.Button, {
    variant: "accent",
    onClick: () => navigate('catalogue', 'all')
  }, "Explorer la boutique")) : /*#__PURE__*/React.createElement("div", {
    className: "lc-cart-grid",
    style: {
      display: 'grid',
      gridTemplateColumns: '1.6fr 0.9fr',
      gap: 32,
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      border: '1.5px solid var(--line)',
      borderRadius: 'var(--radius)',
      overflow: 'hidden',
      background: 'var(--card)'
    }
  }, items.map(line => {
    const p = window.LC151.get(line.id);
    if (!p) return null;
    return /*#__PURE__*/React.createElement("div", {
      key: line.id,
      style: {
        display: 'flex',
        gap: 16,
        padding: '18px 20px',
        borderBottom: '1.5px solid var(--line)'
      }
    }, /*#__PURE__*/React.createElement("a", {
      href: window.LC151.productUrl(p.id),
      style: {
        width: 80,
        height: 80,
        flexShrink: 0,
        borderRadius: 'var(--radius-sm)',
        background: 'var(--paper-2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
        overflow: 'hidden'
      }
    }, p.image ? /*#__PURE__*/React.createElement("img", {
      src: p.image,
      alt: p.name,
      style: {
        maxHeight: '100%',
        objectFit: 'contain'
      }
    }) : /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-display)',
        fontWeight: 800,
        color: 'var(--muted)'
      }
    }, "151")), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("a", {
      href: window.LC151.productUrl(p.id),
      style: {
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: 16,
        lineHeight: 1.25,
        color: 'var(--ink)'
      }
    }, p.name), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 10.5,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'var(--muted)',
        margin: '4px 0 10px'
      }
    }, p.cat, " \xB7 ", p.num), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12
      }
    }, cart.isUnique(line.id) ? /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        fontWeight: 600,
        color: 'var(--ink-2)',
        border: '1.5px solid var(--line)',
        borderRadius: 'var(--radius-sm)',
        padding: '6px 10px'
      }
    }, "Pi\xE8ce unique \xB7 1") : /*#__PURE__*/React.createElement(DS.QtyStepper, {
      value: line.qty,
      onChange: q => cart.setQty(line.id, q),
      max: 10
    }), /*#__PURE__*/React.createElement(DS.PriceTag, {
      price: p.price * line.qty,
      size: "md"
    }))), /*#__PURE__*/React.createElement("button", {
      onClick: () => cart.remove(line.id),
      "aria-label": "Retirer",
      style: {
        alignSelf: 'flex-start',
        fontSize: 14,
        color: 'var(--muted)',
        fontFamily: 'var(--font-mono)',
        background: 'transparent'
      }
    }, "\u2715"));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      border: '1.5px solid var(--line)',
      borderRadius: 'var(--radius)',
      background: 'var(--card)',
      padding: '22px 22px 24px',
      position: 'sticky',
      top: 96
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 18,
      marginBottom: 16
    }
  }, "R\xE9capitulatif"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--ink-2)',
      marginBottom: 8
    }
  }, remaining > 0 ? /*#__PURE__*/React.createElement("span", null, "Plus que ", /*#__PURE__*/React.createElement("strong", {
    style: {
      color: 'var(--ink)'
    }
  }, fmt(remaining)), " pour la livraison offerte") : /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--green)',
      fontWeight: 600
    }
  }, "\u2713 Livraison offerte d\xE9bloqu\xE9e")), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 6,
      borderRadius: 3,
      background: 'var(--paper-2)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: pct + '%',
      height: '100%',
      background: 'var(--accent)',
      transition: 'width 0.3s ease'
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      color: 'var(--ink-2)'
    }
  }, "Sous-total (", cart.count(), ")"), /*#__PURE__*/React.createElement(DS.PriceTag, {
    price: subtotal,
    size: "lg"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: 'var(--muted)',
      marginBottom: 16
    }
  }, "Taxes incluses \xB7 livraison \xE0 l'\xE9tape suivante"), loggedIn ? /*#__PURE__*/React.createElement(DS.Button, {
    variant: "accent",
    size: "lg",
    block: true,
    iconRight: "\u2192",
    onClick: () => openModal('checkout')
  }, "Passer commande") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 9,
      padding: '12px 14px',
      marginBottom: 12,
      background: 'var(--paper-2)',
      border: '1.5px solid var(--line)',
      borderRadius: 'var(--radius-sm)',
      fontSize: 13,
      color: 'var(--ink-2)',
      lineHeight: 1.5
    }
  }, /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true"
  }, "\uD83D\uDD12"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", {
    style: {
      color: 'var(--ink)'
    }
  }, "Un compte est requis pour commander."), " C'est rapide et gratuit.")), /*#__PURE__*/React.createElement(DS.Button, {
    variant: "accent",
    size: "lg",
    block: true,
    iconRight: "\u2192",
    onClick: () => openModal('account')
  }, "Se connecter / cr\xE9er un compte")), /*#__PURE__*/React.createElement("a", {
    href: "boutique.html",
    style: {
      display: 'block',
      textAlign: 'center',
      marginTop: 12,
      fontSize: 13.5,
      color: 'var(--ink-2)'
    }
  }, "Continuer mes achats")))));
}
Object.assign(window, {
  CartDrawer,
  CartPage
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/leclub151/Cart.jsx", error: String((e && e.message) || e) }); }

// ui_kits/leclub151/Catalogue.jsx
try { (() => {
/* leclub151 — Catalogue (boutique grid + filters) */
function Catalogue({
  navigate,
  initialFilter
}) {
  const DS = window.ADITCGDesignSystem_df75b7;
  const {
    PRODUCTS,
    FILTERS
  } = window.LC151;
  const CHIPS = [...FILTERS, {
    key: 'preorder',
    label: 'Précommande'
  }];
  const [filter, setFilter] = React.useState(initialFilter || 'all');
  const [sort, setSort] = React.useState('feat');
  React.useEffect(() => {
    if (initialFilter) setFilter(initialFilter);
  }, [initialFilter]);

  // Catalogue source-of-truth state (drives loading / error / empty UI).
  const Store = window.LC151.Store;
  const wp = Store.wpStatus(); // { state: off|loading|ok|error, error }
  const loading = wp.state === 'loading';
  const errored = wp.state === 'error';
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(165px, 1fr))',
    gap: 18
  };
  const stateBox = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '72px 24px'
  };
  let list = PRODUCTS.filter(p => filter === 'all' ? true : filter === 'preorder' ? p.preorder : p.type === filter);
  if (sort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("section", {
    style: {
      borderBottom: '1.5px solid var(--line)',
      background: 'var(--paper-2)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "container-wide",
    style: {
      padding: '44px 24px 38px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      color: 'var(--muted)',
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      navigate('home');
    }
  }, "Accueil"), " \xA0/\xA0 Boutique"), /*#__PURE__*/React.createElement("h1", {
    className: "display-2",
    style: {
      marginBottom: 10
    }
  }, "La boutique"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 16,
      color: 'var(--ink-2)',
      maxWidth: 560
    }
  }, "Cartes \xE0 l'unit\xE9, grad\xE9es, scell\xE9 et accessoires. Le catalogue est g\xE9r\xE9 depuis WordPress / WooCommerce \u2014 il appara\xEEtra ici d\xE8s l'ajout de vos produits."))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'sticky',
      top: 124,
      zIndex: 30,
      background: 'var(--header-bg)',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      borderBottom: '1.5px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "container-wide",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '14px 24px',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, CHIPS.map(f => /*#__PURE__*/React.createElement(DS.Tag, {
    key: f.key,
    active: filter === f.key,
    onClick: () => setFilter(f.key)
  }, f.label))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: 'auto',
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      color: 'var(--muted)'
    }
  }, loading ? '…' : list.length + ' produits'), /*#__PURE__*/React.createElement("select", {
    value: sort,
    onChange: e => setSort(e.target.value),
    style: {
      padding: '9px 14px',
      borderRadius: 'var(--radius-sm)',
      border: '1.5px solid var(--line-strong)',
      background: 'var(--card)',
      fontSize: 13.5,
      fontWeight: 500,
      color: 'var(--ink)',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: "feat"
  }, "En vedette"), /*#__PURE__*/React.createElement("option", {
    value: "price-asc"
  }, "Prix croissant"), /*#__PURE__*/React.createElement("option", {
    value: "price-desc"
  }, "Prix d\xE9croissant"))))), /*#__PURE__*/React.createElement("section", {
    className: "container-wide",
    style: {
      padding: '36px 24px 80px'
    }
  }, loading ? /*#__PURE__*/React.createElement("div", {
    style: gridStyle,
    "aria-busy": "true",
    "aria-label": "Chargement du catalogue"
  }, Array.from({
    length: 8
  }).map((_, i) => /*#__PURE__*/React.createElement(SkeletonCard, {
    key: i
  }))) : errored ? /*#__PURE__*/React.createElement("div", {
    style: stateBox,
    role: "alert"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 18,
      marginBottom: 6
    }
  }, "Catalogue momentan\xE9ment indisponible"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      color: 'var(--ink-2)',
      marginBottom: 16,
      maxWidth: 440
    }
  }, "Impossible de charger les produits (", wp.error, "). V\xE9rifiez la connexion WooCommerce et r\xE9essayez."), /*#__PURE__*/React.createElement(DS.Button, {
    variant: "outline",
    onClick: () => Store.refreshFromWp()
  }, "R\xE9essayer")) : list.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: stateBox
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 18,
      marginBottom: 6
    }
  }, "Aucun produit pour le moment"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      color: 'var(--ink-2)',
      maxWidth: 440
    }
  }, "Le catalogue est g\xE9r\xE9 depuis WordPress / WooCommerce \u2014 vos produits appara\xEEtront ici d\xE8s leur ajout.")) : /*#__PURE__*/React.createElement("div", {
    style: gridStyle
  }, list.map(p => /*#__PURE__*/React.createElement(StoreCard, {
    key: p.id,
    product: p,
    navigate: navigate
  })))));
}
/* Skeleton placeholder shown while the WooCommerce catalogue loads. */
function SkeletonCard() {
  const bar = (w, h, mt) => /*#__PURE__*/React.createElement("div", {
    style: {
      width: w,
      height: h,
      marginTop: mt,
      borderRadius: 6,
      background: 'var(--paper-2)'
    }
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      border: '1.5px solid var(--line)',
      borderRadius: 'var(--radius)',
      overflow: 'hidden',
      animation: 'lcPulse 1.3s ease-in-out infinite'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      aspectRatio: '1 / 1',
      background: 'var(--paper-2)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 16px 16px'
    }
  }, bar('40%', 9, 0), bar('85%', 15, 10), bar('55%', 15, 8), bar('100%', 42, 14)));
}
Object.assign(window, {
  Catalogue,
  SkeletonCard
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/leclub151/Catalogue.jsx", error: String((e && e.message) || e) }); }

// ui_kits/leclub151/Checkout.jsx
try { (() => {
/* leclub151 — Tunnel de paiement (checkout multi-étapes)
   Livraison → Paiement → Confirmation. Crée une commande, vide le panier.
   Paiement simulé (validation Luhn / date / CVC) — à brancher sur un vrai PSP
   (Stripe, WooCommerce Payments) en production. */

function lcLuhn(num) {
  const s = (num || '').replace(/\s+/g, '');
  if (!/^\d{13,19}$/.test(s)) return false;
  let sum = 0,
    alt = false;
  for (let i = s.length - 1; i >= 0; i--) {
    let d = parseInt(s[i], 10);
    if (alt) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    alt = !alt;
  }
  return sum % 10 === 0;
}
function CheckoutModal({
  onClose
}) {
  const cart = useCart();
  const auth = useAuth();
  const {
    fmt,
    Orders,
    FREE_SHIP
  } = window.LC151;
  const items = cart.items();
  const subtotal = cart.subtotal();
  const [step, setStep] = React.useState('livraison'); // livraison | paiement | confirme
  const [order, setOrder] = React.useState(null);
  const u = auth.user() || {};
  const sa = u.address || {};
  const [ship, setShip] = React.useState({
    name: sa.name || u.name || '',
    email: u.email || '',
    addr: sa.addr || '',
    city: sa.city || '',
    zip: sa.zip || '',
    phone: sa.phone || '',
    method: 'standard'
  });
  const [pay, setPay] = React.useState({
    card: '',
    exp: '',
    cvc: '',
    holder: ''
  });
  const [errors, setErrors] = React.useState({});
  const shippingCost = Orders.shippingCost(ship.method, subtotal);
  const total = subtotal + shippingCost;
  const field = {
    width: '100%',
    padding: '11px 13px',
    borderRadius: 'var(--radius-sm)',
    border: '1.5px solid var(--line-strong)',
    background: 'var(--paper)',
    fontSize: 14.5,
    color: 'var(--ink)',
    outline: 'none',
    boxSizing: 'border-box'
  };
  const lbl = {
    fontFamily: 'var(--font-mono)',
    fontSize: 10.5,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--muted)',
    marginBottom: 6,
    display: 'block'
  };
  const errStyle = k => errors[k] ? {
    ...field,
    borderColor: 'var(--red)'
  } : field;
  const setS = (k, v) => setShip(s => ({
    ...s,
    [k]: v
  }));
  const setP = (k, v) => setPay(p => ({
    ...p,
    [k]: v
  }));
  const fmtCard = v => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const fmtExp = v => {
    const d = v.replace(/\D/g, '').slice(0, 4);
    return d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d;
  };
  const validateShip = () => {
    const e = {};
    ['name', 'email', 'addr', 'city', 'zip'].forEach(k => {
      if (!String(ship[k]).trim()) e[k] = 1;
    });
    if (ship.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(ship.email)) e.email = 1;
    if (ship.zip && !/^\d{4,5}$/.test(ship.zip.trim())) e.zip = 1;
    setErrors(e);
    return Object.keys(e).length === 0;
  };
  const validatePay = () => {
    if (ship.method === 'pickup') return true; // pay in store
    const e = {};
    if (!lcLuhn(pay.card)) e.card = 1;
    const m = pay.exp.match(/^(\d{2})\/(\d{2})$/);
    if (!m || +m[1] < 1 || +m[1] > 12) e.exp = 1;else {
      const exp = new Date(2000 + +m[2], +m[1], 0, 23, 59);
      if (exp < new Date()) e.exp = 1;
    }
    if (!/^\d{3,4}$/.test(pay.cvc)) e.cvc = 1;
    if (!pay.holder.trim()) e.holder = 1;
    setErrors(e);
    return Object.keys(e).length === 0;
  };
  const goPay = () => {
    if (validateShip()) {
      setErrors({});
      setStep('paiement');
    }
  };
  const placeOrder = () => {
    if (!validatePay()) return;
    // Re-resolve every line against the LIVE catalogue — never trust the cart blindly.
    const resolved = items.map(l => {
      const p = window.LC151.get(l.id);
      return p ? {
        p: p,
        l: l
      } : null;
    }).filter(Boolean);
    if (resolved.length === 0) {
      setErrors({
        cart: 1
      });
      return;
    } // nothing left to buy
    if (resolved.some(({
      p
    }) => p.inStock === false)) {
      setErrors({
        stock: 1
      });
      return;
    } // went OOS
    const o = Orders.add({
      email: ship.email,
      name: ship.name,
      items: resolved.map(({
        p,
        l
      }) => ({
        name: p.name,
        qty: l.qty,
        price: p.price
      })),
      subtotal,
      shipping: shippingCost,
      total,
      method: ship.method,
      address: ship.addr + ', ' + ship.zip + ' ' + ship.city,
      paid: ship.method !== 'pickup'
    });
    setOrder(o);
    cart.clear();
    setStep('confirme');
  };
  const steps = [['livraison', 'Livraison'], ['paiement', 'Paiement'], ['confirme', 'Confirmation']];
  const stepIdx = steps.findIndex(s => s[0] === step);
  const summary = /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--paper-2)',
      borderRadius: 'var(--radius)',
      padding: '18px 18px 20px',
      alignSelf: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 15,
      marginBottom: 14
    }
  }, "R\xE9capitulatif"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      marginBottom: 14,
      maxHeight: 220,
      overflowY: 'auto'
    }
  }, items.map(l => {
    const p = window.LC151.get(l.id);
    if (!p) return null;
    return /*#__PURE__*/React.createElement("div", {
      key: l.id,
      style: {
        display: 'flex',
        gap: 10,
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 40,
        height: 40,
        flexShrink: 0,
        borderRadius: 6,
        background: 'var(--card)',
        border: '1px solid var(--line)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }
    }, p.image ? /*#__PURE__*/React.createElement("img", {
      src: p.image,
      alt: "",
      style: {
        maxHeight: '100%',
        objectFit: 'contain'
      }
    }) : /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-display)',
        fontWeight: 800,
        fontSize: 11,
        color: 'var(--muted)'
      }
    }, "151")), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12.5,
        fontWeight: 600,
        lineHeight: 1.25,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }
    }, p.name), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: 'var(--muted)'
      }
    }, "\xD7", l.qty)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 12.5,
        fontWeight: 600
      }
    }, fmt(p.price * l.qty)));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: '1.5px solid var(--line)',
      paddingTop: 12,
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      color: 'var(--ink-2)'
    }
  }, /*#__PURE__*/React.createElement("span", null, "Sous-total"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)'
    }
  }, fmt(subtotal))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      color: 'var(--ink-2)'
    }
  }, /*#__PURE__*/React.createElement("span", null, "Livraison"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)'
    }
  }, shippingCost === 0 ? 'Offerte' : fmt(shippingCost))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontWeight: 700,
      fontSize: 16,
      marginTop: 4
    }
  }, /*#__PURE__*/React.createElement("span", null, "Total"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)'
    }
  }, fmt(total)))));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 120,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: 'absolute',
      inset: 0,
      background: 'rgba(0,0,0,0.55)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    role: "dialog",
    "aria-modal": "true",
    "aria-label": "Paiement s\xE9curis\xE9",
    style: {
      position: 'relative',
      width: 'min(760px, 100%)',
      maxHeight: '92vh',
      overflowY: 'auto',
      background: 'var(--card)',
      border: '1.5px solid var(--line)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-lg)',
      padding: 26
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 800,
      fontSize: 22,
      letterSpacing: '-0.02em'
    }
  }, step === 'confirme' ? 'Commande confirmée' : 'Paiement sécurisé'), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    "aria-label": "Fermer",
    style: {
      marginLeft: 'auto',
      width: 34,
      height: 34,
      borderRadius: 'var(--radius-sm)',
      border: '1.5px solid var(--line-strong)',
      fontSize: 17,
      color: 'var(--ink)',
      cursor: 'pointer',
      background: 'transparent'
    }
  }, "\xD7")), step !== 'confirme' && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 22
    }
  }, steps.slice(0, 2).map(([k, label], i) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: k
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 24,
      height: 24,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 12,
      fontWeight: 700,
      background: i <= stepIdx ? 'var(--accent)' : 'var(--paper-2)',
      color: i <= stepIdx ? 'var(--on-accent)' : 'var(--muted)'
    }
  }, i + 1), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13.5,
      fontWeight: 600,
      color: i <= stepIdx ? 'var(--ink)' : 'var(--muted)'
    }
  }, label)), i === 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      height: 1.5,
      background: 'var(--line)'
    }
  })))), step === 'confirme' ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '8px 0 4px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 60,
      height: 60,
      borderRadius: '50%',
      background: 'var(--green-soft)',
      color: 'var(--green)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 30,
      margin: '0 auto 16px'
    }
  }, "\u2713"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 16,
      color: 'var(--ink-2)',
      marginBottom: 6
    }
  }, "Merci ", order.name, " ! Votre commande est confirm\xE9e."), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 14,
      fontWeight: 600,
      marginBottom: 18
    }
  }, "N\xB0 ", order.number), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 420,
      margin: '0 auto 22px',
      textAlign: 'left',
      background: 'var(--paper-2)',
      borderRadius: 'var(--radius)',
      padding: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: 13.5,
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--ink-2)'
    }
  }, "Total"), /*#__PURE__*/React.createElement("strong", {
    style: {
      fontFamily: 'var(--font-mono)'
    }
  }, fmt(order.total))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: 13.5,
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--ink-2)'
    }
  }, "Livraison"), /*#__PURE__*/React.createElement("span", null, Orders.methods()[order.method].label)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: 'var(--muted)',
      marginTop: 8
    }
  }, order.paid ? 'Paiement reçu.' : 'À régler au retrait en boutique.', " Un e-mail de confirmation a \xE9t\xE9 envoy\xE9 \xE0 ", order.email, ".")), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      padding: '12px 28px',
      borderRadius: 'var(--radius-sm)',
      border: 'none',
      background: 'var(--accent)',
      color: 'var(--on-accent)',
      fontWeight: 600,
      fontSize: 15,
      cursor: 'pointer'
    }
  }, "Continuer mes achats")) : /*#__PURE__*/React.createElement("div", {
    className: "lc-checkout-grid",
    style: {
      display: 'grid',
      gridTemplateColumns: '1.3fr 0.9fr',
      gap: 24
    }
  }, /*#__PURE__*/React.createElement("div", null, step === 'livraison' ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 12,
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: lbl
  }, "Nom complet"), /*#__PURE__*/React.createElement("input", {
    style: errStyle('name'),
    value: ship.name,
    onChange: e => setS('name', e.target.value)
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: lbl
  }, "E-mail"), /*#__PURE__*/React.createElement("input", {
    style: errStyle('email'),
    value: ship.email,
    onChange: e => setS('email', e.target.value)
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: lbl
  }, "Adresse"), /*#__PURE__*/React.createElement("input", {
    style: errStyle('addr'),
    value: ship.addr,
    onChange: e => setS('addr', e.target.value),
    placeholder: "N\xB0 et rue"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 2fr',
      gap: 12,
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: lbl
  }, "Code postal"), /*#__PURE__*/React.createElement("input", {
    style: errStyle('zip'),
    value: ship.zip,
    onChange: e => setS('zip', e.target.value)
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: lbl
  }, "Ville"), /*#__PURE__*/React.createElement("input", {
    style: errStyle('city'),
    value: ship.city,
    onChange: e => setS('city', e.target.value)
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: lbl
  }, "T\xE9l\xE9phone (optionnel)"), /*#__PURE__*/React.createElement("input", {
    style: field,
    value: ship.phone,
    onChange: e => setS('phone', e.target.value)
  })), /*#__PURE__*/React.createElement("label", {
    style: lbl
  }, "Mode de livraison"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      marginBottom: 18
    }
  }, Object.values(Orders.methods()).map(m => {
    const cost = Orders.shippingCost(m.key, subtotal);
    const on = ship.method === m.key;
    return /*#__PURE__*/React.createElement("button", {
      key: m.key,
      onClick: () => setS('method', m.key),
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '11px 13px',
        borderRadius: 'var(--radius-sm)',
        border: '1.5px solid',
        borderColor: on ? 'var(--accent)' : 'var(--line)',
        background: on ? 'var(--accent-wash)' : 'var(--card)',
        cursor: 'pointer',
        textAlign: 'left'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 18,
        height: 18,
        borderRadius: '50%',
        border: '2px solid',
        borderColor: on ? 'var(--accent)' : 'var(--line-strong)',
        flexShrink: 0,
        position: 'relative'
      }
    }, on && /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'absolute',
        inset: 3,
        borderRadius: '50%',
        background: 'var(--accent)'
      }
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 600,
        fontSize: 14,
        display: 'block'
      }
    }, m.label), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: 'var(--ink-2)'
      }
    }, m.eta)), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontWeight: 600,
        fontSize: 13.5,
        color: cost === 0 ? 'var(--green)' : 'var(--ink)'
      }
    }, cost === 0 ? 'Offert' : fmt(cost)));
  })), /*#__PURE__*/React.createElement("button", {
    onClick: goPay,
    style: {
      width: '100%',
      height: 46,
      borderRadius: 'var(--radius-sm)',
      border: 'none',
      background: 'var(--accent)',
      color: 'var(--on-accent)',
      fontWeight: 600,
      fontSize: 15,
      cursor: 'pointer'
    }
  }, "Continuer vers le paiement \u2192")) : /*#__PURE__*/React.createElement(React.Fragment, null, ship.method === 'pickup' ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px',
      background: 'var(--accent-wash)',
      border: '1.5px solid var(--accent-soft)',
      borderRadius: 'var(--radius)',
      marginBottom: 16,
      fontSize: 14,
      color: 'var(--ink)',
      lineHeight: 1.6
    }
  }, "Vous avez choisi le ", /*#__PURE__*/React.createElement("strong", null, "retrait en boutique"), " \xE0 Vienne. Vous r\xE9glerez sur place \u2014 aucune carte requise maintenant.") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: lbl
  }, "Num\xE9ro de carte"), /*#__PURE__*/React.createElement("input", {
    inputMode: "numeric",
    style: errStyle('card'),
    value: pay.card,
    onChange: e => setP('card', fmtCard(e.target.value)),
    placeholder: "4242 4242 4242 4242"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 12,
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: lbl
  }, "Expiration"), /*#__PURE__*/React.createElement("input", {
    inputMode: "numeric",
    style: errStyle('exp'),
    value: pay.exp,
    onChange: e => setP('exp', fmtExp(e.target.value)),
    placeholder: "MM/AA"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: lbl
  }, "CVC"), /*#__PURE__*/React.createElement("input", {
    inputMode: "numeric",
    style: errStyle('cvc'),
    value: pay.cvc,
    onChange: e => setP('cvc', e.target.value.replace(/\D/g, '').slice(0, 4)),
    placeholder: "123"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: lbl
  }, "Titulaire de la carte"), /*#__PURE__*/React.createElement("input", {
    style: errStyle('holder'),
    value: pay.holder,
    onChange: e => setP('holder', e.target.value)
  })), (errors.card || errors.exp || errors.cvc || errors.holder) && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: 'var(--red)',
      marginBottom: 10
    }
  }, "V\xE9rifiez les informations de paiement saisies."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 7,
      fontSize: 12,
      color: 'var(--muted)',
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDD12"), " Paiement chiffr\xE9 \xB7 vos donn\xE9es ne sont pas stock\xE9es")), (errors.stock || errors.cart) && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: 'var(--red)',
      marginBottom: 10
    }
  }, errors.cart ? 'Votre panier est vide.' : 'Un article n’est plus disponible — retirez-le du panier pour continuer.'), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setErrors({});
      setStep('livraison');
    },
    style: {
      padding: '0 18px',
      height: 46,
      borderRadius: 'var(--radius-sm)',
      border: '1.5px solid var(--line-strong)',
      background: 'transparent',
      color: 'var(--ink)',
      fontWeight: 600,
      fontSize: 14,
      cursor: 'pointer'
    }
  }, "\u2190 Retour"), /*#__PURE__*/React.createElement("button", {
    onClick: placeOrder,
    style: {
      flex: 1,
      height: 46,
      borderRadius: 'var(--radius-sm)',
      border: 'none',
      background: 'var(--accent)',
      color: 'var(--on-accent)',
      fontWeight: 600,
      fontSize: 15,
      cursor: 'pointer'
    }
  }, ship.method === 'pickup' ? 'Valider la commande' : 'Payer ' + fmt(total))))), summary)));
}
Object.assign(window, {
  CheckoutModal
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/leclub151/Checkout.jsx", error: String((e && e.message) || e) }); }

// ui_kits/leclub151/Chrome.jsx
try { (() => {
/* leclub151 — shared chrome: Logo, Announcement, Header, Footer, ProductStage, useCart */

function useCart() {
  const [, force] = React.useReducer(x => x + 1, 0);
  React.useEffect(() => window.LC151.Cart.subscribe(force), []);
  return window.LC151.Cart;
}
function useStore() {
  const [, force] = React.useReducer(x => x + 1, 0);
  React.useEffect(() => window.LC151.Store.subscribe(force), []);
  return window.LC151.Store;
}
function useAuth() {
  const [, force] = React.useReducer(x => x + 1, 0);
  React.useEffect(() => window.LC151.Auth.subscribe(force), []);
  return window.LC151.Auth;
}
function useAlerts() {
  const [, force] = React.useReducer(x => x + 1, 0);
  React.useEffect(() => window.LC151.Alerts.subscribe(force), []);
  return window.LC151.Alerts;
}
let _lcAudioCtx = null;
function lcPlayPop() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    if (!_lcAudioCtx) _lcAudioCtx = new AC();
    const ctx = _lcAudioCtx;
    if (ctx.state === 'suspended') ctx.resume();
    const t = ctx.currentTime;
    // two-note bright "blip" — game-pickup feel
    const notes = [[880, 0], [1320, 0.08]];
    notes.forEach(([freq, delay]) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, t + delay);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, t + delay + 0.06);
      gain.gain.setValueAtTime(0.0001, t + delay);
      gain.gain.exponentialRampToValueAtTime(0.16, t + delay + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + delay + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t + delay);
      osc.stop(t + delay + 0.14);
    });
  } catch (e) {}
}
function lcFlyToCart(fromEl) {
  lcPlayPop();
  try {
    const cartBtn = document.querySelector('[data-cart-btn]');
    if (!cartBtn || !fromEl) return;
    const a = fromEl.getBoundingClientRect();
    const b = cartBtn.getBoundingClientRect();
    const startX = a.left + a.width / 2,
      startY = a.top + a.height / 2;
    const endX = b.left + b.width / 2,
      endY = b.top + b.height / 2;
    const ball = document.createElement('div');
    ball.setAttribute('aria-hidden', 'true');
    ball.style.cssText = 'position:fixed;left:' + (startX - 16) + 'px;top:' + (startY - 16) + 'px;width:32px;height:32px;z-index:9998;pointer-events:none;will-change:transform,opacity;transition:transform 0.62s cubic-bezier(0.5,-0.25,0.3,1),opacity 0.62s ease;filter:drop-shadow(0 6px 10px rgba(0,0,0,0.3));';
    ball.innerHTML = '<svg width="32" height="32" viewBox="0 0 100 100"><defs><clipPath id="flyclip"><circle cx="50" cy="50" r="47"/></clipPath></defs><g clip-path="url(#flyclip)"><rect x="0" y="0" width="100" height="50" fill="#EE1515"/><rect x="0" y="50" width="100" height="50" fill="#fff"/><rect x="0" y="44" width="100" height="12" fill="#1a1a1a"/></g><circle cx="50" cy="50" r="47" fill="none" stroke="#1a1a1a" stroke-width="5"/><circle cx="50" cy="50" r="15" fill="#fff" stroke="#1a1a1a" stroke-width="5"/></svg>';
    document.body.appendChild(ball);
    requestAnimationFrame(() => {
      ball.style.transform = 'translate(' + (endX - startX) + 'px,' + (endY - startY) + 'px) scale(0.3) rotate(540deg)';
      ball.style.opacity = '0.2';
    });
    setTimeout(() => ball.remove(), 680);
  } catch (e) {}
}
function Pokeball({
  size = 16,
  style,
  float = false
}) {
  const idRef = React.useRef(null);
  if (idRef.current === null) idRef.current = window.__pbSeq = (window.__pbSeq || 0) + 1;
  const u = 'pb' + idRef.current;
  return /*#__PURE__*/React.createElement("span", {
    className: 'lc-pb' + (float ? ' lc-pb-float' : ''),
    style: {
      display: 'inline-flex',
      flexShrink: 0,
      lineHeight: 0,
      ...style
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 100 100",
    "aria-hidden": "true",
    style: {
      display: 'block',
      overflow: 'visible'
    }
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("radialGradient", {
    id: u + 'r',
    cx: "36%",
    cy: "27%",
    r: "80%"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: "#ff9d9d"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "34%",
    stopColor: "#ee1515"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: "#990b0b"
  })), /*#__PURE__*/React.createElement("radialGradient", {
    id: u + 'w',
    cx: "36%",
    cy: "80%",
    r: "76%"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: "#ffffff"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "60%",
    stopColor: "#f0f0f0"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: "#b9b9b9"
  })), /*#__PURE__*/React.createElement("linearGradient", {
    id: u + 'b',
    x1: "0",
    y1: "0",
    x2: "0",
    y2: "1"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: "#4a4a4a"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "48%",
    stopColor: "#070707"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: "#242424"
  })), /*#__PURE__*/React.createElement("radialGradient", {
    id: u + 'btn',
    cx: "40%",
    cy: "35%",
    r: "70%"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: "#ffffff"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "66%",
    stopColor: "#ebebeb"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: "#aeaeae"
  })), /*#__PURE__*/React.createElement("radialGradient", {
    id: u + 's',
    cx: "36%",
    cy: "30%",
    r: "72%"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: "rgba(255,255,255,0)"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "56%",
    stopColor: "rgba(0,0,0,0)"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: "rgba(0,0,0,0.42)"
  })), /*#__PURE__*/React.createElement("clipPath", {
    id: u + 'c'
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "50",
    cy: "50",
    r: "47"
  }))), float && /*#__PURE__*/React.createElement("ellipse", {
    cx: "50",
    cy: "96",
    rx: "33",
    ry: "5",
    fill: "rgba(0,0,0,0.20)"
  }), /*#__PURE__*/React.createElement("g", {
    clipPath: 'url(#' + u + 'c)'
  }, /*#__PURE__*/React.createElement("rect", {
    x: "0",
    y: "0",
    width: "100",
    height: "53",
    fill: 'url(#' + u + 'r)'
  }), /*#__PURE__*/React.createElement("rect", {
    x: "0",
    y: "47",
    width: "100",
    height: "53",
    fill: 'url(#' + u + 'w)'
  }), /*#__PURE__*/React.createElement("rect", {
    x: "0",
    y: "43",
    width: "100",
    height: "14",
    fill: 'url(#' + u + 'b)'
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "50",
    cy: "50",
    r: "47",
    fill: 'url(#' + u + 's)'
  }), /*#__PURE__*/React.createElement("ellipse", {
    cx: "33",
    cy: "26",
    rx: "16",
    ry: "9",
    fill: "rgba(255,255,255,0.5)",
    transform: "rotate(-24 33 26)"
  })), /*#__PURE__*/React.createElement("circle", {
    cx: "50",
    cy: "50",
    r: "47",
    fill: "none",
    stroke: "#0d0d0d",
    strokeWidth: "4"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "50",
    cy: "50",
    r: "15.5",
    fill: "#0d0d0d"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "50",
    cy: "50",
    r: "11.5",
    fill: 'url(#' + u + 'btn)',
    stroke: "#0d0d0d",
    strokeWidth: "2.5"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "45.5",
    cy: "45.5",
    r: "3.1",
    fill: "rgba(255,255,255,0.95)"
  })));
}
function Logo({
  onClick,
  size = 22
}) {
  const uid = React.useId().replace(/:/g, '');
  const h = Math.round(size * 1.6);
  const w = Math.round(h * 3.95);
  return /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      onClick && onClick();
    },
    "aria-label": "leclub151",
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      lineHeight: 0
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: w,
    height: h,
    viewBox: "0 0 240 58",
    style: {
      overflow: 'visible',
      display: 'block'
    }
  }, /*#__PURE__*/React.createElement("path", {
    id: 'arc' + uid,
    d: "M 8,46 Q 120,20 232,46",
    fill: "none"
  }), /*#__PURE__*/React.createElement("text", {
    fontFamily: "var(--font-display)",
    fontWeight: "800",
    fontStyle: "italic",
    fontSize: "36",
    fill: "#FFFFFF",
    stroke: "rgba(0,0,0,0.35)",
    strokeWidth: "2.4",
    paintOrder: "stroke",
    strokeLinejoin: "round",
    strokeLinecap: "round",
    style: {
      letterSpacing: '-0.5px',
      filter: 'drop-shadow(1px 2px 0 rgba(0,0,0,0.25))'
    }
  }, /*#__PURE__*/React.createElement("textPath", {
    href: '#arc' + uid,
    startOffset: "50%",
    textAnchor: "middle"
  }, "leclub", /*#__PURE__*/React.createElement("tspan", {
    fill: "#FFCB05"
  }, "151")))));
}
function useLang() {
  const [, force] = React.useReducer(x => x + 1, 0);
  React.useEffect(() => {
    const h = () => force();
    window.addEventListener('lc151:lang', h);
    return () => window.removeEventListener('lc151:lang', h);
  }, []);
  return window.lcI18n && window.lcI18n.t || (k => k);
}
function Announcement() {
  const t = useLang();
  const socials = [['Facebook', 'https://facebook.com'], ['Instagram', 'https://instagram.com'], ['YouTube', 'https://youtube.com'], ['Discord', 'https://discord.com']];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--header-2)',
      color: 'rgba(234,239,251,0.9)',
      borderBottom: '1px solid rgba(255,255,255,0.08)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "container-wide lc-ann",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      minHeight: 38,
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      letterSpacing: '0.06em'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "lc-ann-side",
    style: {
      display: 'flex',
      gap: 14
    }
  }, socials.map(([s, url]) => /*#__PURE__*/React.createElement("a", {
    key: s,
    className: "lc-util",
    href: url,
    target: "_blank",
    rel: "noreferrer",
    style: {
      color: 'rgba(234,239,251,0.6)',
      textTransform: 'uppercase'
    }
  }, s))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      textAlign: 'center',
      textTransform: 'uppercase',
      color: 'rgba(234,239,251,0.92)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Pokeball, {
    size: 13
  }), " ", t('ann_free')), /*#__PURE__*/React.createElement("div", {
    className: "lc-ann-side",
    style: {
      display: 'flex',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    className: "lc-util",
    onClick: e => {
      e.preventDefault();
      openModal('contact');
    },
    style: {
      color: 'rgba(234,239,251,0.6)',
      textTransform: 'uppercase'
    }
  }, t('ann_contact')), /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      openModal('account');
    },
    style: {
      color: 'var(--yellow)',
      textTransform: 'uppercase',
      fontWeight: 600
    }
  }, t('ann_login')))));
}
function playThemeFx(nextTheme, onSwap) {
  // wipe colour: white → light mode, deep brand navy (matches the dark site) → dark mode
  const wipeBg = nextTheme === 'dark' ? 'radial-gradient(circle at 50% 42%, #1e306a 0%, #15224F 58%, #0d1633 100%)' : '#FFFFFF';
  const fx = document.createElement('div');
  fx.id = 'lc-theme-fx';
  fx.innerHTML = '<div class="wipe" style="background:' + wipeBg + '"></div>' + '<div class="flash"></div>' + '<div class="ball">' + '<svg width="96" height="96" viewBox="0 0 100 100" aria-hidden="true">' + '<defs><clipPath id="lcb"><circle cx="50" cy="50" r="46"/></clipPath></defs>' + '<g clip-path="url(#lcb)">' + '<rect x="0" y="0" width="100" height="50" fill="#EE1515"/>' + '<rect x="0" y="50" width="100" height="50" fill="#fff"/>' + '<rect x="0" y="44" width="100" height="12" fill="#161616"/>' + '</g>' + '<circle cx="50" cy="50" r="46" fill="none" stroke="#161616" stroke-width="4"/>' + '<circle cx="50" cy="50" r="15" fill="#fff" stroke="#161616" stroke-width="4"/>' + '<circle cx="50" cy="50" r="6" fill="#161616"/>' + '</svg>' + '</div>';
  document.body.appendChild(fx);
  // 3D page tilt — desktop only
  const desktop = window.matchMedia('(min-width: 1024px) and (pointer: fine)').matches;
  const root = document.getElementById('root');
  if (desktop && root) {
    root.classList.remove('lc-3d');
    void root.offsetWidth; // restart animation
    root.classList.add('lc-3d');
    setTimeout(() => root.classList.remove('lc-3d'), 860);
  }
  // swap theme mid-wipe so the reveal shows the new theme
  setTimeout(onSwap, 230);
  setTimeout(() => fx.remove(), 880);
}
function ThemeToggle({
  light
}) {
  const [dark, setDark] = React.useState(() => document.documentElement.getAttribute('data-theme') === 'dark');
  const toggle = () => {
    const next = dark ? 'light' : 'dark';
    setDark(!dark);
    playThemeFx(next, () => {
      document.documentElement.setAttribute('data-theme', next);
      try {
        localStorage.setItem('lc151_theme', next);
      } catch (e) {}
    });
  };
  return /*#__PURE__*/React.createElement("button", {
    onClick: toggle,
    "aria-label": "Basculer le th\xE8me",
    style: {
      width: 38,
      height: 38,
      borderRadius: 'var(--radius-sm)',
      border: light ? '1.5px solid rgba(255,255,255,0.25)' : '1.5px solid var(--line-strong)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: light ? '#EAEFFB' : 'var(--ink)',
      background: 'transparent'
    }
  }, dark ? /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
  })) : /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
  })));
}
function Header({
  navigate,
  active,
  onCart
}) {
  const cart = useCart();
  const auth = useAuth();
  const t = useLang();
  const count = cart.count();
  const loggedIn = auth.isLoggedIn();
  return /*#__PURE__*/React.createElement("header", {
    style: {
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'var(--header-bg)',
      borderBottom: '3px solid var(--accent)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "container-wide",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 24,
      height: 76
    }
  }, /*#__PURE__*/React.createElement(Logo, {
    onClick: () => navigate('home'),
    size: 26
  }), /*#__PURE__*/React.createElement("div", {
    className: "lc-search",
    style: {
      flex: 1,
      maxWidth: 540,
      marginLeft: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '0 6px 0 16px',
      height: 44,
      borderRadius: 'var(--radius-pill)',
      border: '1.5px solid transparent',
      background: 'var(--card)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 15,
      color: 'var(--muted)'
    }
  }, "\u2315"), /*#__PURE__*/React.createElement("input", {
    placeholder: t('search_ph'),
    onKeyDown: e => {
      if (e.key === 'Enter') navigate('catalogue', 'all');
    },
    style: {
      border: 'none',
      outline: 'none',
      background: 'transparent',
      fontSize: 14,
      color: 'var(--ink)',
      width: '100%'
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => navigate('catalogue', 'all'),
    style: {
      height: 34,
      padding: '0 16px',
      borderRadius: 'var(--radius-pill)',
      background: 'var(--accent)',
      color: 'var(--on-accent)',
      fontFamily: 'var(--font-mono)',
      fontSize: 11.5,
      fontWeight: 600,
      letterSpacing: '0.06em',
      textTransform: 'uppercase'
    }
  }, t('ok')))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: 'auto',
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(ThemeToggle, {
    light: true
  }), /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      openModal('account');
    },
    title: loggedIn ? 'Mon compte · ' + auth.user().name : 'Mon compte',
    "aria-label": "Mon compte",
    style: {
      width: 40,
      height: 40,
      borderRadius: 'var(--radius-sm)',
      border: '1.5px solid rgba(255,255,255,0.25)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: loggedIn ? 'var(--on-accent)' : '#EAEFFB',
      background: loggedIn ? 'var(--accent)' : 'transparent'
    }
  }, loggedIn ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      textTransform: 'uppercase'
    }
  }, (auth.user().name || 'C')[0]) : /*#__PURE__*/React.createElement("svg", {
    width: "19",
    height: "19",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "7",
    r: "4"
  }))), /*#__PURE__*/React.createElement("button", {
    onClick: onCart,
    "aria-label": "Panier",
    "data-cart-btn": "1",
    style: {
      position: 'relative',
      height: 40,
      padding: '0 18px 0 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 9,
      borderRadius: 'var(--radius-sm)',
      background: 'var(--accent)',
      color: 'var(--on-accent)',
      fontFamily: 'var(--font-mono)',
      fontSize: 12.5,
      fontWeight: 600
    }
  }, t('h_cart'), /*#__PURE__*/React.createElement("span", {
    key: count,
    className: count > 0 ? 'lc-bump' : undefined,
    style: {
      minWidth: 20,
      height: 20,
      padding: '0 5px',
      borderRadius: 'var(--radius-pill)',
      background: 'var(--on-accent)',
      color: 'var(--accent)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 11.5,
      fontWeight: 700
    }
  }, count)))), /*#__PURE__*/React.createElement(MegaNav, {
    navigate: navigate,
    active: active
  }));
}
const NAV = [{
  key: 'home',
  label: 'Accueil'
}, {
  key: 'single',
  label: "Cartes à l'unité",
  cols: [{
    title: 'Par série',
    items: ['Wizards (WOTC)', 'Bloc EX', 'Diamant & Perle', 'Platine', 'HeartGold SoulSilver', 'Noir & Blanc', 'XY', 'Soleil & Lune', 'Épée & Bouclier', 'Écarlate & Violet', 'Méga-Évolution', 'Promo']
  }, {
    title: 'Populaire',
    items: ['Dernière série', 'Meilleures ventes', 'Cartes Holo', 'Cartes rares', 'Édition 1ère']
  }]
}, {
  key: 'graded',
  label: 'Cartes gradées',
  cols: [{
    title: 'Certification',
    items: ['PSA', 'BGS', 'CGC']
  }, {
    title: 'Par série',
    items: ['Wizards', 'Bloc EX', 'XY', 'Soleil & Lune', 'Épée & Bouclier', 'Écarlate & Violet', 'Méga-Évolution']
  }]
}, {
  key: 'sealed',
  label: 'Scellé',
  cols: [{
    title: 'Type de produit',
    items: ['Display / Boîte de boosters', 'ETB — Dresseur d’Élite', 'Coffret', 'Booster', 'Pokébox', 'Tripack / Duopack', 'Deck']
  }, {
    title: 'Séries récentes',
    items: ['Méga-Évolution', 'Aventures Ensemble', 'Écarlate & Violet', 'Pokémon Japonais']
  }]
}, {
  key: 'accessory',
  label: 'Accessoires',
  cols: [{
    title: 'Protection',
    items: ['Protège-cartes', 'Classeurs', 'Folio / Binder', 'Deck Box', 'Toploaders', 'Tapis / Playmat']
  }, {
    title: 'Marques',
    items: ['Ultra Pro', 'Ultimate Guard', 'Dragon Shield', 'Gamegenic']
  }]
}, {
  key: 'preorder',
  label: 'Précommande'
}, {
  key: 'catalogue',
  label: 'Toute la boutique'
}];
function MegaNav({
  navigate,
  active
}) {
  const [open, setOpen] = React.useState(null);
  const t = useLang();
  const go = item => {
    setOpen(null);
    navigate(item.key === 'home' ? 'home' : 'catalogue', item.key === 'home' ? undefined : item.key === 'catalogue' ? 'all' : item.key);
  };
  return /*#__PURE__*/React.createElement("nav", {
    style: {
      borderTop: '1px solid rgba(255,255,255,0.12)',
      position: 'relative',
      background: 'var(--header-2)'
    },
    onMouseLeave: () => setOpen(null)
  }, /*#__PURE__*/React.createElement("div", {
    className: "container-wide lc-nav-scroll",
    style: {
      display: 'flex',
      gap: 2,
      height: 48,
      alignItems: 'stretch'
    }
  }, NAV.map(c => {
    const on = active === c.key || c.key === 'home' && active === 'home';
    return /*#__PURE__*/React.createElement("a", {
      key: c.key,
      href: "#",
      className: "lc-nav-link",
      onMouseEnter: () => setOpen(c.cols ? c.key : null),
      onClick: e => {
        e.preventDefault();
        go(c);
      },
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '0 15px',
        fontSize: 13.5,
        fontWeight: 600,
        color: on ? '#fff' : 'rgba(234,239,251,0.72)',
        borderBottom: '3px solid',
        borderColor: on ? 'var(--yellow)' : 'transparent',
        whiteSpace: 'nowrap'
      }
    }, t('nav_' + c.key), c.cols && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 9,
        opacity: 0.6
      }
    }, "\u25BE"));
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 'auto'
    }
  })), NAV.filter(c => c.cols).map(c => open === c.key ? /*#__PURE__*/React.createElement("div", {
    key: c.key,
    onMouseEnter: () => setOpen(c.key),
    style: {
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      background: 'var(--card)',
      borderTop: '1.5px solid var(--line)',
      borderBottom: '1.5px solid var(--line)',
      boxShadow: 'var(--shadow)',
      zIndex: 60
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "container-wide",
    style: {
      display: 'flex',
      gap: 56,
      padding: '26px 24px 30px'
    }
  }, c.cols.map(col => /*#__PURE__*/React.createElement("div", {
    key: col.title
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 10.5,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      color: 'var(--ink)',
      marginBottom: 14
    }
  }, col.title), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: col.items.length > 6 ? '1fr 1fr' : '1fr',
      gap: '9px 36px'
    }
  }, col.items.map(it => /*#__PURE__*/React.createElement("a", {
    key: it,
    href: "#",
    onClick: e => {
      e.preventDefault();
      go(c);
    },
    style: {
      fontSize: 14,
      color: 'var(--ink-2)',
      whiteSpace: 'nowrap'
    },
    onMouseEnter: e => {
      e.currentTarget.style.color = 'var(--ink)';
    },
    onMouseLeave: e => {
      e.currentTarget.style.color = 'var(--ink-2)';
    }
  }, it))))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: 'auto',
      alignSelf: 'stretch',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      gap: 8,
      paddingLeft: 40,
      borderLeft: '1.5px solid var(--line)',
      minWidth: 200
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 17
    }
  }, c.label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--ink-2)',
      lineHeight: 1.5
    }
  }, "Parcourez tout le rayon et filtrez par s\xE9rie, \xE9tat et prix."), /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      go(c);
    },
    style: {
      marginTop: 4,
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      fontWeight: 600,
      color: 'var(--ink)',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    }
  }, "Tout voir \u2192")))) : null));
}

/* Beige placeholder stage for sealed/accessory products (no card art). */
function ProductStage({
  glyph,
  label,
  ratio = '1 / 1',
  big
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      aspectRatio: ratio,
      background: 'var(--paper-2)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: big ? 96 : 64,
      height: big ? 132 : 88,
      borderRadius: 6,
      border: '2px solid var(--line-strong)',
      background: 'repeating-linear-gradient(135deg, transparent 0 9px, rgba(26,23,20,0.04) 9px 18px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 800,
      fontSize: big ? 22 : 15,
      color: 'var(--muted)'
    }
  }, "151")), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      letterSpacing: '0.16em',
      textTransform: 'uppercase',
      color: 'var(--muted)'
    }
  }, glyph || label));
}
function LangSelect() {
  const langs = window.lcI18n && window.lcI18n.langs || [['fr', 'Français', '🇫🇷']];
  const [open, setOpen] = React.useState(false);
  const [cur, setCur] = React.useState(() => window.lcI18n ? window.lcI18n.getLang() : 'fr');
  const ref = React.useRef(null);
  const sel = langs.find(l => l[0] === cur) || langs[0];
  const pick = code => {
    setCur(code);
    setOpen(false);
    if (window.lcI18n) window.lcI18n.setLang(code);
  };
  React.useEffect(() => {
    if (!open) return;
    const onDoc = e => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setOpen(o => !o),
    "aria-haspopup": "listbox",
    "aria-expanded": open,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '8px 14px',
      borderRadius: 8,
      border: '1px solid rgba(244,236,217,0.28)',
      background: 'rgba(255,255,255,0.05)',
      fontSize: 13.5,
      fontWeight: 700,
      color: '#fff',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 15
    }
  }, sel[2]), " ", sel[1], " ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      opacity: 0.7,
      transform: open ? 'rotate(180deg)' : 'none',
      transition: 'transform 0.18s'
    }
  }, "\u25BE")), open && /*#__PURE__*/React.createElement("div", {
    role: "listbox",
    style: {
      position: 'absolute',
      bottom: '100%',
      right: 0,
      marginBottom: 6,
      minWidth: 180,
      background: 'var(--card)',
      border: '1.5px solid var(--line)',
      borderRadius: 'var(--radius)',
      boxShadow: 'var(--shadow-lg)',
      overflow: 'hidden',
      zIndex: 30
    }
  }, langs.map(([code, name, flag]) => /*#__PURE__*/React.createElement("button", {
    key: code,
    role: "option",
    "aria-selected": code === cur,
    onClick: () => pick(code),
    style: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '11px 14px',
      background: code === cur ? 'var(--accent-wash)' : 'transparent',
      color: 'var(--ink)',
      fontSize: 14,
      fontWeight: code === cur ? 700 : 500,
      cursor: 'pointer',
      textAlign: 'left',
      borderBottom: '1px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 16
    }
  }, flag), " ", name, code === cur && /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 'auto',
      color: 'var(--accent)',
      fontWeight: 700
    }
  }, "\u2713")))));
}
function Footer({
  navigate
}) {
  const t = useLang();
  const col = (title, items) => /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 10.5,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      color: 'rgba(244,236,217,0.5)',
      marginBottom: 18
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 13
    }
  }, items.map(it => /*#__PURE__*/React.createElement("a", {
    key: it.label,
    href: it.href || '#',
    onClick: e => {
      if (it.onClick) {
        e.preventDefault();
        it.onClick();
      }
    },
    className: it.soon ? undefined : 'lc-foot-link',
    style: {
      fontSize: 14.5,
      fontWeight: 600,
      color: it.soon ? 'rgba(244,236,217,0.32)' : 'rgba(244,236,217,0.82)',
      cursor: it.soon ? 'default' : 'pointer',
      pointerEvents: it.soon ? 'none' : 'auto'
    }
  }, it.label, it.soon ? ' (' + t('f_soon') + ')' : ''))));
  const socials = [['Instagram', 'M12 2.2c3.2 0 3.6 0 4.9.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s0 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58 0-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.21 15.58 2.2 15.2 2.2 12s0-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.21 8.8 2.2 12 2.2m0 5.4A4.4 4.4 0 1 0 16.4 12 4.4 4.4 0 0 0 12 7.6m0 7.27A2.87 2.87 0 1 1 14.87 12 2.87 2.87 0 0 1 12 14.87m4.6-8.43a1.03 1.03 0 1 0 1.03 1.03 1.03 1.03 0 0 0-1.03-1.03'], ['Facebook', 'M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.5-3.89 3.78-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12'], ['TikTok', 'M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.1v12.4a2.59 2.59 0 1 1-2.59-2.59c.27 0 .53.05.78.12v-3.2a5.7 5.7 0 0 0-.78-.05A5.69 5.69 0 1 0 15.54 15.5V9.4a7.34 7.34 0 0 0 4.3 1.38V7.68a4.28 4.28 0 0 1-3.24-1.86'], ['YouTube', 'M21.6 7.2s-.2-1.37-.8-1.97c-.76-.8-1.6-.8-2-.85C16 4.1 12 4.1 12 4.1h-.02s-4 0-6.8.28c-.4.05-1.24.05-2 .85-.6.6-.8 1.97-.8 1.97S2.16 8.8 2.16 10.4v1.5c0 1.6.2 3.2.2 3.2s.2 1.37.8 1.97c.76.8 1.76.77 2.2.86 1.6.15 6.64.2 6.64.2s4 0 6.8-.29c.4-.05 1.24-.05 2-.85.6-.6.8-1.97.8-1.97s.2-1.6.2-3.2v-1.5c0-1.6-.2-3.2-.2-3.2M9.84 14.6V8.93l5.15 2.85z'], ['Google', 'M21.35 11.1H12v2.93h5.35c-.23 1.4-1.66 4.1-5.35 4.1a5.86 5.86 0 0 1 0-11.72 5.2 5.2 0 0 1 3.68 1.44l2-1.93A8.46 8.46 0 0 0 12 3.5a8.5 8.5 0 1 0 0 17 7.96 7.96 0 0 0 8.15-8.36c0-.7-.07-1.4-.16-2.04z'], ['Apple', 'M16.36 12.78c-.02-2.2 1.8-3.26 1.88-3.31-1.02-1.5-2.62-1.71-3.18-1.73-1.36-.14-2.65.8-3.34.8-.68 0-1.75-.78-2.88-.76-1.48.02-2.85.86-3.6 2.18-1.54 2.67-.4 6.62 1.1 8.79.73 1.06 1.6 2.25 2.74 2.2 1.1-.04 1.52-.71 2.85-.71 1.33 0 1.7.71 2.86.69 1.18-.02 1.93-1.07 2.65-2.14a9.3 9.3 0 0 0 1.2-2.45c-.03-.01-2.3-.88-2.32-3.49M14.18 6.1c.6-.74 1.01-1.75.9-2.77-.87.04-1.93.58-2.56 1.3-.56.64-1.05 1.68-.92 2.67.97.08 1.97-.49 2.58-1.2']];
  const appBadge = null;
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      background: 'var(--footer-bg)',
      color: 'var(--footer-text)',
      marginTop: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      borderBottom: '1px solid rgba(244,236,217,0.12)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "container-wide",
    style: {
      display: 'flex',
      justifyContent: 'center',
      flexWrap: 'wrap',
      gap: 56,
      padding: '26px 24px'
    }
  }, [['✓', t('r_auth_t'), t('r_auth_s')], ['⤓', t('r_ship_t'), t('r_ship_s')], ['◈', t('r_pay_t'), t('r_pay_s')]].map(([ic, ti, s]) => /*#__PURE__*/React.createElement("div", {
    key: ti,
    className: "lc-reassure",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 13
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "lc-reassure-ic",
    style: {
      width: 40,
      height: 40,
      flexShrink: 0,
      borderRadius: '50%',
      border: '1.5px solid rgba(244,236,217,0.25)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 17,
      color: 'var(--teal)'
    }
  }, ic), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 14.5
    }
  }, ti), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: 'rgba(244,236,217,0.55)'
    }
  }, s)))))), /*#__PURE__*/React.createElement("div", {
    className: "container-wide",
    style: {
      padding: '56px 24px 30px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "lc-foot-grid",
    style: {
      display: 'grid',
      gridTemplateColumns: '1.7fr 1fr 1fr 1fr',
      gap: 44,
      marginBottom: 40,
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement(Logo, {
    size: 30,
    onClick: () => navigate('home')
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap',
      marginBottom: 18
    }
  }, [['Visa', 'visa'], ['Mastercard', 'mastercard'], ['Maestro', 'maestro'], ['American Express', 'amex'], ['PayPal', 'paypal']].map(([name, slug]) => /*#__PURE__*/React.createElement("span", {
    key: slug,
    title: name,
    style: {
      height: 28,
      padding: '0 8px',
      borderRadius: 6,
      background: '#fff',
      border: '1px solid rgba(0,0,0,0.08)',
      display: 'inline-flex',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: 'https://cdn.jsdelivr.net/gh/aaronfagan/svg-credit-card-payment-icons@main/flat/' + slug + '.svg',
    alt: name,
    style: {
      height: 18,
      display: 'block'
    }
  })))), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      lineHeight: 1.6,
      color: 'rgba(244,236,217,0.6)',
      maxWidth: 320
    }
  }, "La boutique des collectionneurs Pok\xE9mon, \xE0 Vienne. On d\xE9niche, on authentifie et on conseille.")), col(t('f_buy'), [{
    label: t('nav_home'),
    href: 'index.html'
  }, {
    label: t('nav_single'),
    onClick: () => navigate('catalogue', 'single')
  }, {
    label: t('nav_graded'),
    onClick: () => navigate('catalogue', 'graded')
  }, {
    label: t('f_displays'),
    onClick: () => navigate('catalogue', 'sealed')
  }, {
    label: t('nav_accessory'),
    onClick: () => navigate('catalogue', 'accessory')
  }, {
    label: t('f_preorders'),
    onClick: () => navigate('catalogue', 'preorder')
  }]), col(t('f_house'), [{
    label: t('f_boutique'),
    onClick: () => openModal('contact')
  }, {
    label: t('f_auth'),
    onClick: () => openModal('contact')
  }, {
    label: t('f_about'),
    soon: true
  }, {
    label: t('f_news'),
    soon: true
  }, {
    label: t('f_events'),
    soon: true
  }]), col(t('f_account'), [{
    label: t('h_account'),
    onClick: () => openModal('account')
  }, {
    label: t('f_orders'),
    onClick: () => openModal('orders')
  }, {
    label: t('f_addresses'),
    onClick: () => openModal('addresses')
  }, {
    label: t('f_alerts'),
    onClick: () => openModal('alerts')
  }, {
    label: t('h_cart'),
    onClick: () => navigate('cart')
  }])), /*#__PURE__*/React.createElement("div", {
    style: {
      paddingTop: 26,
      borderTop: '1px solid rgba(244,236,217,0.14)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 14,
      marginBottom: 22
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13.5,
      fontWeight: 600,
      color: 'rgba(244,236,217,0.6)'
    }
  }, t('f_copyright')), /*#__PURE__*/React.createElement(LangSelect, null)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 14
    }
  }, socials.map(([name, d]) => /*#__PURE__*/React.createElement("a", {
    key: name,
    href: "#",
    onClick: e => e.preventDefault(),
    "aria-label": name,
    title: name,
    className: "lc-social"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "19",
    height: "19",
    viewBox: "0 0 24 24",
    fill: "currentColor",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: d
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 18,
      flexWrap: 'wrap',
      fontSize: 13,
      fontWeight: 600
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "confidentialite.html",
    className: "lc-foot-link",
    style: {
      color: 'rgba(244,236,217,0.6)'
    }
  }, t('f_cookies')), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'rgba(244,236,217,0.25)'
    }
  }, "|"), /*#__PURE__*/React.createElement("a", {
    href: "cgv.html",
    className: "lc-foot-link",
    style: {
      color: 'rgba(244,236,217,0.6)'
    }
  }, t('f_terms')), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'rgba(244,236,217,0.25)'
    }
  }, "|"), /*#__PURE__*/React.createElement("a", {
    href: "confidentialite.html",
    className: "lc-foot-link",
    style: {
      color: 'rgba(244,236,217,0.6)'
    }
  }, t('f_privacy')))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 22,
      paddingTop: 16,
      borderTop: '1px solid rgba(244,236,217,0.08)',
      fontFamily: 'var(--font-mono)',
      fontSize: 10.5,
      letterSpacing: '0.04em',
      color: 'rgba(244,236,217,0.4)'
    }
  }, "Pok\xE9mon\u2122 Nintendo / Game Freak \u2014 produits authentifi\xE9s \xB7 leclub151 n'est pas affili\xE9 \xE0 The Pok\xE9mon Company.")));
}

/* StoreCard — wraps the DS ProductCard for art items; renders a beige
   placeholder card for sealed/accessory items. One consistent unit.
   Self-contained (inline badges + price) so the grid never depends on the
   compiled bundle lagging a turn behind component edits. */
function lcBadgeStyle(tone) {
  const map = {
    sale: {
      background: 'var(--ink)',
      color: 'var(--on-ink)',
      border: '1.5px solid var(--ink)'
    },
    new: {
      background: 'var(--accent)',
      color: 'var(--on-accent)',
      border: '1.5px solid var(--accent)'
    },
    graded: {
      background: 'var(--card)',
      color: 'var(--ink)',
      border: '1.5px solid var(--line-strong)'
    },
    oos: {
      background: 'var(--red-soft)',
      color: 'var(--red)',
      border: '1.5px solid transparent'
    }
  };
  return {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '3px 9px',
    borderRadius: 'var(--radius-xs)',
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    lineHeight: 1.4,
    whiteSpace: 'nowrap',
    ...(map[tone] || map.new)
  };
}
function StoreCard({
  product,
  navigate
}) {
  const cart = useCart();
  const open = () => navigate('product', product.id);
  const [hover, setHover] = React.useState(false);
  const [liked, setLiked] = React.useState(false);
  const fmt = n => new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(n);
  const pct = product.oldPrice && product.oldPrice > product.price ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;
  const low = product.inStock && typeof product.stockLeft === 'number' && product.stockLeft <= 3;
  const unique = cart.isUnique(product.id);
  const inCart = cart.items().some(l => l.id === product.id);
  const lockedUnique = unique && inCart; // already in cart → can't add another

  return /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      open();
    },
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--card)',
      border: '1.5px solid',
      borderColor: hover ? 'var(--line-strong)' : 'var(--line)',
      borderRadius: 'var(--radius)',
      overflow: 'hidden',
      transition: 'all 0.2s ease',
      transform: hover ? 'translateY(-4px)' : 'none',
      boxShadow: hover ? 'var(--shadow-lg)' : 'var(--shadow-xs)',
      color: 'var(--ink)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 12,
      left: 12,
      zIndex: 2,
      display: 'flex',
      gap: 6
    }
  }, pct > 0 && /*#__PURE__*/React.createElement("span", {
    style: lcBadgeStyle('sale')
  }, "\u2212", pct, "%"), product.badge && product.badge.tone !== 'graded' && /*#__PURE__*/React.createElement("span", {
    style: lcBadgeStyle(product.badge.tone)
  }, product.badge.label)), !product.inStock && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 12,
      right: 12,
      zIndex: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: lcBadgeStyle('oos')
  }, "Rupture")), product.inStock && /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": "Favoris",
    onClick: e => {
      e.preventDefault();
      e.stopPropagation();
      setLiked(v => !v);
    },
    style: {
      position: 'absolute',
      top: 10,
      right: 10,
      zIndex: 2,
      width: 32,
      height: 32,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--card)',
      border: '1.5px solid var(--line)',
      fontSize: 14,
      color: liked ? 'var(--accent)' : 'var(--muted)',
      opacity: hover || liked ? 1 : 0,
      transition: 'opacity 0.2s ease'
    }
  }, liked ? '♥' : '♡'), product.image ? /*#__PURE__*/React.createElement("div", {
    style: {
      aspectRatio: '1 / 1',
      background: 'var(--paper-2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 22,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: product.image,
    alt: product.name,
    loading: 'lazy',
    decoding: 'async',
    style: {
      maxWidth: '100%',
      maxHeight: '100%',
      objectFit: 'contain',
      filter: 'drop-shadow(0 12px 20px rgba(0,0,0,0.18))',
      transition: 'transform 0.35s cubic-bezier(0.2,0.8,0.2,1)',
      transform: hover ? 'scale(1.06)' : 'scale(1)'
    }
  })) : /*#__PURE__*/React.createElement(ProductStage, {
    glyph: product.glyph
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 16px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 5,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 12.5,
      fontWeight: 600,
      color: 'var(--muted)'
    }
  }, product.cat), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 16.5,
      lineHeight: 1.22,
      letterSpacing: '-0.01em',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
      minHeight: 40
    }
  }, product.name), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 8,
      flexWrap: 'wrap',
      marginTop: 2
    }
  }, product.oldPrice > product.price && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 13,
      color: 'var(--muted)',
      textDecoration: 'line-through',
      fontVariantNumeric: 'tabular-nums'
    }
  }, fmt(product.oldPrice), "\xA0\u20AC"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontWeight: 600,
      fontSize: 18,
      color: 'var(--ink)',
      fontVariantNumeric: 'tabular-nums',
      letterSpacing: '-0.01em'
    }
  }, fmt(product.price), "\xA0\u20AC"), pct > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      fontWeight: 600,
      color: 'var(--green)'
    }
  }, "\u2212", fmt(product.oldPrice - product.price), "\xA0\u20AC")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      fontFamily: 'var(--font-mono)',
      fontSize: 10.5,
      letterSpacing: '0.04em',
      color: product.inStock ? low ? 'var(--ink)' : 'var(--green)' : 'var(--muted)',
      fontWeight: low ? 600 : 400
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: '50%',
      background: product.inStock ? low ? 'var(--accent)' : 'var(--green)' : 'var(--line-strong)'
    }
  }), product.inStock ? product.preorder ? 'Précommande · à la sortie' : low ? `Plus que ${product.stockLeft} en stock` : 'En stock · expédié sous 48 h' : 'Bientôt de retour'), /*#__PURE__*/React.createElement("button", {
    type: "button",
    disabled: !product.inStock || lockedUnique,
    "aria-label": "Ajouter au panier",
    onClick: e => {
      e.preventDefault();
      e.stopPropagation();
      if (product.inStock && !lockedUnique) {
        cart.add(product.id);
        lcFlyToCart(e.currentTarget);
      }
    },
    style: {
      marginTop: 12,
      width: '100%',
      height: 42,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      borderRadius: 'var(--radius-sm)',
      fontFamily: 'var(--font-body)',
      fontWeight: 600,
      fontSize: 14,
      cursor: product.inStock && !lockedUnique ? 'pointer' : 'not-allowed',
      transition: 'all 0.18s ease',
      border: '1.5px solid',
      borderColor: lockedUnique ? 'var(--green)' : product.inStock ? 'var(--ink)' : 'var(--line)',
      background: lockedUnique ? 'var(--green-soft)' : !product.inStock ? 'transparent' : hover ? 'var(--accent)' : 'var(--ink)',
      color: lockedUnique ? 'var(--green)' : !product.inStock ? 'var(--muted)' : hover ? 'var(--on-accent)' : 'var(--on-ink)',
      boxShadow: product.inStock && hover && !lockedUnique ? 'var(--shadow-accent)' : 'none'
    }
  }, lockedUnique ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 15
    }
  }, "\u2713"), " Dans le panier (1/1)") : product.inStock ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 16
    }
  }, "\uFF0B"), " ", product.preorder ? 'Précommander' : 'Ajouter au panier') : 'Indisponible')));
}

/* ProductRow — a titled horizontal carousel of StoreCards (shop rayon). */
function ProductRow({
  eyebrow,
  title,
  products,
  navigate,
  onSeeAll
}) {
  const ref = React.useRef(null);
  const scroll = dir => {
    if (ref.current) ref.current.scrollBy({
      left: dir * 560,
      behavior: 'smooth'
    });
  };
  if (!products.length) return null;
  return /*#__PURE__*/React.createElement("section", {
    style: {
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      marginBottom: 18,
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 26,
      letterSpacing: '-0.02em',
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Pokeball, {
    size: 22
  }), title)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      onSeeAll && onSeeAll();
    },
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 14,
      fontWeight: 600,
      color: 'var(--ink)'
    }
  }, "Tout voir \u2192"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6
    }
  }, [-1, 1].map(d => /*#__PURE__*/React.createElement("button", {
    key: d,
    onClick: () => scroll(d),
    "aria-label": d < 0 ? 'Précédent' : 'Suivant',
    style: {
      width: 36,
      height: 36,
      borderRadius: 'var(--radius-sm)',
      border: '1.5px solid var(--line-strong)',
      background: 'var(--card)',
      color: 'var(--ink)',
      fontSize: 15
    }
  }, d < 0 ? '‹' : '›'))))), /*#__PURE__*/React.createElement("div", {
    ref: ref,
    style: {
      display: 'grid',
      gridAutoFlow: 'column',
      gridAutoColumns: '248px',
      gap: 18,
      overflowX: 'auto',
      scrollSnapType: 'x mandatory',
      paddingBottom: 6,
      scrollbarWidth: 'none'
    }
  }, products.map(p => /*#__PURE__*/React.createElement("div", {
    key: p.id,
    style: {
      scrollSnapAlign: 'start'
    }
  }, /*#__PURE__*/React.createElement(StoreCard, {
    product: p,
    navigate: navigate
  })))));
}

/* ---- lightweight modal bus (mock account / contact / newsletter / checkout) ---- */
const __lcModalSubs = new Set();
let __lcModal = null;
function openModal(name) {
  __lcModal = name;
  __lcModalSubs.forEach(f => f());
}
function closeModal() {
  __lcModal = null;
  __lcModalSubs.forEach(f => f());
}
function useModalState() {
  const [, force] = React.useReducer(x => x + 1, 0);
  React.useEffect(() => {
    __lcModalSubs.add(force);
    return () => __lcModalSubs.delete(force);
  }, []);
  return __lcModal;
}
const lcField = {
  width: '100%',
  padding: '11px 13px',
  borderRadius: 'var(--radius-sm)',
  border: '1.5px solid var(--line-strong)',
  background: 'var(--paper)',
  fontSize: 14.5,
  color: 'var(--ink)',
  outline: 'none',
  marginBottom: 12,
  boxSizing: 'border-box'
};
function lcCta() {
  return {
    width: '100%',
    height: 46,
    borderRadius: 'var(--radius-sm)',
    border: 'none',
    fontFamily: 'var(--font-body)',
    fontWeight: 600,
    fontSize: 15,
    cursor: 'pointer',
    background: 'var(--accent)',
    color: 'var(--on-accent)'
  };
}
function ModalShell({
  title,
  children,
  onClose
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 120,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: 'absolute',
      inset: 0,
      background: 'rgba(0,0,0,0.5)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width: 'min(440px, 100%)',
      background: 'var(--card)',
      border: '1.5px solid var(--line)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-lg)',
      padding: 26
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 800,
      fontSize: 22,
      letterSpacing: '-0.02em'
    }
  }, title), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    "aria-label": "Fermer",
    style: {
      width: 34,
      height: 34,
      borderRadius: 'var(--radius-sm)',
      border: '1.5px solid var(--line-strong)',
      fontSize: 17,
      color: 'var(--ink)',
      cursor: 'pointer'
    }
  }, "\xD7")), children));
}
function LcSuccess({
  message,
  onClose
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '12px 0 6px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 54,
      height: 54,
      borderRadius: '50%',
      background: 'var(--accent)',
      color: 'var(--on-accent)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 26,
      margin: '0 auto 16px'
    }
  }, "\u2713"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 15.5,
      color: 'var(--ink-2)',
      marginBottom: 20,
      lineHeight: 1.55
    }
  }, message), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: lcCta()
  }, "Fermer"));
}
function FormModal({
  title,
  fields,
  cta,
  success,
  onClose
}) {
  const [sent, setSent] = React.useState(false);
  return /*#__PURE__*/React.createElement(ModalShell, {
    title: title,
    onClose: onClose
  }, sent ? /*#__PURE__*/React.createElement(LcSuccess, {
    message: success,
    onClose: onClose
  }) : /*#__PURE__*/React.createElement("form", {
    onSubmit: e => {
      e.preventDefault();
      setSent(true);
    }
  }, fields.map(f => f.type === 'textarea' ? /*#__PURE__*/React.createElement("textarea", {
    key: f.ph,
    required: true,
    placeholder: f.ph,
    rows: 4,
    style: {
      ...lcField,
      resize: 'vertical'
    }
  }) : /*#__PURE__*/React.createElement("input", {
    key: f.ph,
    type: f.type || 'text',
    required: true,
    placeholder: f.ph,
    style: lcField
  })), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    style: lcCta()
  }, cta)));
}
function AccountModal({
  onClose
}) {
  const auth = useAuth();
  const [tab, setTab] = React.useState('login');
  const [sent, setSent] = React.useState(false);
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  if (auth.isLoggedIn()) {
    const u = auth.user();
    return /*#__PURE__*/React.createElement(ModalShell, {
      title: "Mon compte",
      onClose: onClose
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 18
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 44,
        height: 44,
        borderRadius: '50%',
        background: 'var(--accent)',
        color: 'var(--on-accent)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 18,
        fontWeight: 700,
        textTransform: 'uppercase'
      }
    }, (u.name || 'C')[0]), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: 16
      }
    }, u.name), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        color: 'var(--ink-2)'
      }
    }, u.email))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        marginBottom: 18
      }
    }, [['Mes commandes', 'orders'], ['Mes adresses', 'addresses'], ['Mes alertes', 'alerts']].map(([it, target]) => /*#__PURE__*/React.createElement("button", {
      key: it,
      onClick: () => {
        openModal(target);
      },
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        textAlign: 'left',
        padding: '11px 12px',
        borderRadius: 'var(--radius-sm)',
        border: '1.5px solid var(--line)',
        background: 'var(--card)',
        color: 'var(--ink)',
        fontSize: 14,
        cursor: 'pointer'
      }
    }, it, it === 'Mes alertes' && window.LC151.Alerts.count() > 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        minWidth: 20,
        height: 20,
        padding: '0 6px',
        borderRadius: 'var(--radius-pill)',
        background: 'var(--accent)',
        color: 'var(--on-accent)',
        fontSize: 11.5,
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, window.LC151.Alerts.count())))), /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        auth.logout();
        onClose();
      },
      style: {
        ...lcCta(),
        background: 'var(--ink)',
        color: 'var(--on-ink)'
      }
    }, "Se d\xE9connecter"));
  }
  const title = tab === 'login' ? 'Connexion' : 'Créer un compte';
  const submit = e => {
    e.preventDefault();
    window.LC151.Auth.login(email, tab === 'register' ? name : '');
    setSent(true);
  };
  return /*#__PURE__*/React.createElement(ModalShell, {
    title: title,
    onClose: onClose
  }, sent ? /*#__PURE__*/React.createElement(LcSuccess, {
    message: tab === 'login' ? 'Connexion réussie. Vous pouvez finaliser votre commande.' : 'Compte créé. Bienvenue ! Vous pouvez maintenant commander.',
    onClose: onClose
  }) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginBottom: 16
    }
  }, [['login', 'Connexion'], ['register', 'Créer un compte']].map(([k, l]) => /*#__PURE__*/React.createElement("button", {
    key: k,
    onClick: () => setTab(k),
    style: {
      flex: 1,
      height: 38,
      borderRadius: 'var(--radius-sm)',
      border: '1.5px solid',
      borderColor: tab === k ? 'var(--ink)' : 'var(--line-strong)',
      background: tab === k ? 'var(--ink)' : 'transparent',
      color: tab === k ? 'var(--on-ink)' : 'var(--ink)',
      fontWeight: 600,
      fontSize: 13.5,
      cursor: 'pointer'
    }
  }, l))), /*#__PURE__*/React.createElement("form", {
    onSubmit: submit
  }, tab === 'register' && /*#__PURE__*/React.createElement("input", {
    required: true,
    placeholder: "Nom",
    value: name,
    onChange: e => setName(e.target.value),
    style: lcField
  }), /*#__PURE__*/React.createElement("input", {
    required: true,
    type: "email",
    placeholder: "E-mail",
    value: email,
    onChange: e => setEmail(e.target.value),
    style: lcField
  }), /*#__PURE__*/React.createElement("input", {
    required: true,
    type: "password",
    placeholder: "Mot de passe",
    style: lcField
  }), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    style: lcCta()
  }, tab === 'login' ? 'Se connecter' : 'Créer mon compte'))));
}
function AlertsModal({
  onClose
}) {
  const auth = useAuth();
  const alerts = useAlerts();
  const [kw, setKw] = React.useState('');
  if (!auth.isLoggedIn()) return /*#__PURE__*/React.createElement(AccountModal, {
    onClose: onClose
  });
  const topics = alerts.topics();
  const data = alerts.all();
  const addKw = e => {
    e.preventDefault();
    alerts.addKeyword(kw);
    setKw('');
  };
  return /*#__PURE__*/React.createElement(ModalShell, {
    title: "Mes alertes",
    onClose: onClose
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13.5,
      color: 'var(--ink-2)',
      lineHeight: 1.55,
      marginBottom: 16
    }
  }, "Soyez pr\xE9venu\xB7e par e-mail d\xE8s qu'un produit arrive ou revient en stock. Cochez les cat\xE9gories qui vous int\xE9ressent."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      marginBottom: 18
    }
  }, topics.map(t => {
    const on = alerts.hasTopic(t.key);
    return /*#__PURE__*/React.createElement("button", {
      key: t.key,
      onClick: () => alerts.toggleTopic(t.key),
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '11px 12px',
        borderRadius: 'var(--radius-sm)',
        border: '1.5px solid',
        borderColor: on ? 'var(--ink)' : 'var(--line)',
        background: on ? 'var(--accent-wash)' : 'var(--card)',
        color: 'var(--ink)',
        fontSize: 14,
        cursor: 'pointer',
        textAlign: 'left'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 38,
        height: 22,
        borderRadius: 'var(--radius-pill)',
        background: on ? 'var(--accent)' : 'var(--line-strong)',
        position: 'relative',
        flexShrink: 0,
        transition: 'background 0.18s ease'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'absolute',
        top: 2,
        left: on ? 18 : 2,
        width: 18,
        height: 18,
        borderRadius: '50%',
        background: on ? 'var(--on-accent)' : 'var(--card)',
        transition: 'left 0.18s ease'
      }
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        fontWeight: on ? 600 : 400
      }
    }, t.label));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 14,
      marginBottom: 8
    }
  }, "Alerte sur un mot-cl\xE9"), /*#__PURE__*/React.createElement("form", {
    onSubmit: addKw,
    style: {
      display: 'flex',
      gap: 8,
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("input", {
    value: kw,
    onChange: e => setKw(e.target.value),
    placeholder: "ex. Dracaufeu, M\xE9ga-\xC9volution\u2026",
    style: {
      ...lcField,
      marginBottom: 0
    }
  }), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    style: {
      flexShrink: 0,
      padding: '0 16px',
      borderRadius: 'var(--radius-sm)',
      border: 'none',
      background: 'var(--ink)',
      color: 'var(--on-ink)',
      fontWeight: 600,
      fontSize: 13.5,
      cursor: 'pointer'
    }
  }, "Ajouter")), data.keywords.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 16
    }
  }, data.keywords.map(k => /*#__PURE__*/React.createElement("span", {
    key: k,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 7,
      padding: '6px 8px 6px 12px',
      borderRadius: 'var(--radius-pill)',
      background: 'var(--paper-2)',
      border: '1.5px solid var(--line)',
      fontSize: 13
    }
  }, k, /*#__PURE__*/React.createElement("button", {
    onClick: () => alerts.removeKeyword(k),
    "aria-label": 'Retirer ' + k,
    style: {
      width: 18,
      height: 18,
      borderRadius: '50%',
      border: 'none',
      background: 'var(--line-strong)',
      color: 'var(--paper)',
      fontSize: 11,
      cursor: 'pointer',
      lineHeight: 1
    }
  }, "\u2715")))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: 'var(--muted)',
      textAlign: 'center',
      paddingTop: 6,
      borderTop: '1.5px solid var(--line)'
    }
  }, alerts.count() > 0 ? `${alerts.count()} alerte${alerts.count() > 1 ? 's' : ''} active${alerts.count() > 1 ? 's' : ''} · envoyées à ${auth.user().email}` : 'Aucune alerte active pour le moment.'));
}
function OrdersModal({
  onClose
}) {
  const auth = useAuth();
  const [, force] = React.useReducer(x => x + 1, 0);
  React.useEffect(() => window.LC151.Orders.subscribe(force), []);
  if (!auth.isLoggedIn()) return /*#__PURE__*/React.createElement(AccountModal, {
    onClose: onClose
  });
  const {
    fmt,
    Orders
  } = window.LC151;
  const list = Orders.forUser(auth.user().email);
  return /*#__PURE__*/React.createElement(ModalShell, {
    title: "Mes commandes",
    onClose: onClose
  }, list.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '20px 0'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14.5,
      color: 'var(--ink-2)',
      marginBottom: 18
    }
  }, "Vous n'avez pas encore pass\xE9 de commande."), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: lcCta()
  }, "Explorer la boutique")) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, list.map(o => /*#__PURE__*/React.createElement("div", {
    key: o.number,
    style: {
      border: '1.5px solid var(--line)',
      borderRadius: 'var(--radius-sm)',
      padding: '14px 16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontWeight: 600,
      fontSize: 13.5
    }
  }, o.number), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11.5,
      padding: '3px 9px',
      borderRadius: 'var(--radius-pill)',
      background: 'var(--green-soft)',
      color: 'var(--green)',
      fontWeight: 600
    }
  }, o.status)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: 'var(--ink-2)',
      marginBottom: 8
    }
  }, new Date(o.date).toLocaleDateString('fr-FR'), " \xB7 ", o.items.reduce((s, i) => s + i.qty, 0), " article(s)"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: 13.5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--ink-2)'
    }
  }, window.LC151.Orders.methods()[o.method].label), /*#__PURE__*/React.createElement("strong", {
    style: {
      fontFamily: 'var(--font-mono)'
    }
  }, fmt(o.total)))))));
}
function AddressesModal({
  onClose
}) {
  const auth = useAuth();
  if (!auth.isLoggedIn()) return /*#__PURE__*/React.createElement(AccountModal, {
    onClose: onClose
  });
  const u = auth.user();
  const saved = u.address || {};
  const [a, setA] = React.useState({
    name: saved.name || u.name || '',
    addr: saved.addr || '',
    zip: saved.zip || '',
    city: saved.city || '',
    phone: saved.phone || ''
  });
  const [done, setDone] = React.useState(false);
  const [err, setErr] = React.useState({});
  const set = (k, v) => {
    setA(s => ({
      ...s,
      [k]: v
    }));
    setDone(false);
  };
  const save = () => {
    const e = {};
    ['name', 'addr', 'zip', 'city'].forEach(k => {
      if (!String(a[k]).trim()) e[k] = 1;
    });
    if (a.zip && !/^\d{4,5}$/.test(a.zip.trim())) e.zip = 1;
    setErr(e);
    if (Object.keys(e).length) return;
    auth.setAddress(a);
    setDone(true);
  };
  const fld = k => ({
    ...lcField,
    ...(err[k] ? {
      borderColor: 'var(--red)'
    } : {})
  });
  const lbl = {
    fontFamily: 'var(--font-mono)',
    fontSize: 10.5,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--muted)',
    marginBottom: 6,
    display: 'block'
  };
  return /*#__PURE__*/React.createElement(ModalShell, {
    title: "Mes adresses",
    onClose: onClose
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13.5,
      color: 'var(--ink-2)',
      marginBottom: 16
    }
  }, "Votre adresse de livraison par d\xE9faut \u2014 pr\xE9-remplie automatiquement au paiement."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: lbl
  }, "Nom complet"), /*#__PURE__*/React.createElement("input", {
    style: fld('name'),
    value: a.name,
    onChange: e => set('name', e.target.value)
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: lbl
  }, "Adresse"), /*#__PURE__*/React.createElement("input", {
    style: fld('addr'),
    value: a.addr,
    onChange: e => set('addr', e.target.value),
    placeholder: "N\xB0 et rue"
  })), /*#__PURE__*/React.createElement("div", {
    className: "lc-addr-grid",
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 2fr',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: lbl
  }, "Code postal"), /*#__PURE__*/React.createElement("input", {
    style: fld('zip'),
    value: a.zip,
    onChange: e => set('zip', e.target.value)
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: lbl
  }, "Ville"), /*#__PURE__*/React.createElement("input", {
    style: fld('city'),
    value: a.city,
    onChange: e => set('city', e.target.value)
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: lbl
  }, "T\xE9l\xE9phone (optionnel)"), /*#__PURE__*/React.createElement("input", {
    style: lcField,
    value: a.phone,
    onChange: e => set('phone', e.target.value)
  })), done && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--green)',
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", null, "\u2713"), " Adresse enregistr\xE9e."), /*#__PURE__*/React.createElement("button", {
    onClick: save,
    style: lcCta()
  }, done ? 'Enregistré ✓' : 'Enregistrer l’adresse')));
}
function ModalHost() {
  const name = useModalState();
  if (!name) return null;
  if (name === 'account') return /*#__PURE__*/React.createElement(AccountModal, {
    onClose: closeModal
  });
  if (name === 'alerts') return /*#__PURE__*/React.createElement(AlertsModal, {
    onClose: closeModal
  });
  if (name === 'contact') return /*#__PURE__*/React.createElement(FormModal, {
    title: "Nous contacter",
    onClose: closeModal,
    cta: "Envoyer le message",
    success: "Merci ! Votre message a bien \xE9t\xE9 envoy\xE9 \u2014 nous vous r\xE9pondons sous 24 h.",
    fields: [{
      ph: 'Votre nom'
    }, {
      ph: 'Votre e-mail',
      type: 'email'
    }, {
      ph: 'Votre message',
      type: 'textarea'
    }]
  });
  if (name === 'newsletter') return /*#__PURE__*/React.createElement(FormModal, {
    title: "\xCAtre pr\xE9venu des nouveaut\xE9s",
    onClose: closeModal,
    cta: "Je m'inscris",
    success: "Inscription confirm\xE9e ! Vous recevrez nos arrivages et pr\xE9commandes en avant-premi\xE8re.",
    fields: [{
      ph: 'Votre e-mail',
      type: 'email'
    }]
  });
  if (name === 'checkout') return window.CheckoutModal ? /*#__PURE__*/React.createElement(window.CheckoutModal, {
    onClose: closeModal
  }) : null;
  if (name === 'orders') return /*#__PURE__*/React.createElement(OrdersModal, {
    onClose: closeModal
  });
  if (name === 'addresses') return /*#__PURE__*/React.createElement(AddressesModal, {
    onClose: closeModal
  });
  return null;
}
function lcNavigate(view, arg) {
  if (view === 'product') {
    window.location.href = window.LC151.productUrl(arg);
    return;
  }
  if (view === 'catalogue') {
    window.location.href = '/boutique.html' + (arg && arg !== 'all' ? '?cat=' + encodeURIComponent(arg) : '');
    return;
  }
  if (view === 'cart') {
    window.location.href = 'panier.html';
    return;
  }
  window.location.href = 'index.html';
}
Object.assign(window, {
  lcNavigate,
  useCart,
  useStore,
  useAuth,
  useAlerts,
  Pokeball,
  lcFlyToCart,
  Logo,
  Announcement,
  ThemeToggle,
  Header,
  ProductStage,
  Footer,
  StoreCard,
  ProductRow,
  openModal,
  closeModal,
  ModalHost
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/leclub151/Chrome.jsx", error: String((e && e.message) || e) }); }

// ui_kits/leclub151/Home.jsx
try { (() => {
/* leclub151 — Accueil. Works with an EMPTY catalogue (no demo products).
   When products are added (via WordPress/WooCommerce or the back-office),
   the rayons appear automatically. */

function Home({
  navigate
}) {
  const DS = window.ADITCGDesignSystem_df75b7;
  const Store = window.LC151.Store;
  const all = Store.all();
  const has = all.length > 0;
  const by = t => all.filter(p => p.type === t);
  const preorders = all.filter(p => p.preorder);
  const nouveautes = [...new Map(all.filter(p => p.badge && p.badge.tone === 'new' || p.type === 'sealed').map(p => [p.id, p])).values()].slice(0, 8);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("section", {
    style: {
      position: 'relative',
      overflow: 'hidden',
      borderBottom: '1.5px solid var(--line)',
      background: 'var(--paper)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      backgroundImage: 'url(assets/hero-cards.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center right',
      opacity: 0.9,
      pointerEvents: 'none',
      animation: 'lcKenburns 22s ease-in-out infinite alternate',
      transformOrigin: 'center'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(90deg, var(--paper) 0%, var(--paper) 28%, rgba(0,0,0,0) 78%)',
      pointerEvents: 'none'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(0deg, var(--paper) 0%, rgba(0,0,0,0) 42%)',
      pointerEvents: 'none'
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "container-wide",
    style: {
      position: 'relative',
      padding: '76px 24px 80px',
      minHeight: 420
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 560
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 800,
      fontSize: 'clamp(34px, 5vw, 66px)',
      letterSpacing: '-0.03em',
      lineHeight: 1.02,
      marginBottom: 20
    }
  }, "Votre boutique", /*#__PURE__*/React.createElement("br", null), "Pok\xE9mon, \xE0 ", /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'relative',
      whiteSpace: 'nowrap',
      borderBottom: '5px solid var(--yellow)',
      paddingBottom: 2
    }
  }, "Vienne"), "."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 17.5,
      lineHeight: 1.6,
      color: 'var(--ink-2)',
      maxWidth: 480,
      marginBottom: 30
    }
  }, "On d\xE9niche, on authentifie et on conseille \u2014 du Set de Base aux derni\xE8res sorties. Cartes \xE0 l'unit\xE9, pi\xE8ces grad\xE9es, scell\xE9 et accessoires, \xE0 retirer en magasin ou livr\xE9s chez vous."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      flexWrap: 'wrap',
      marginBottom: 28
    }
  }, /*#__PURE__*/React.createElement(DS.Button, {
    variant: "accent",
    size: "lg",
    as: "a",
    href: "#",
    onClick: e => {
      e.preventDefault();
      navigate('catalogue', 'all');
    }
  }, "Explorer la boutique"), /*#__PURE__*/React.createElement(DS.Button, {
    variant: "outline",
    size: "lg",
    as: "a",
    href: "#",
    onClick: e => {
      e.preventDefault();
      navigate('catalogue', 'graded');
    }
  }, "Cartes grad\xE9es")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 22,
      flexWrap: 'wrap',
      fontSize: 13.5,
      color: 'var(--ink-2)'
    }
  }, [['✓', 'Authentifié'], ['⤓', 'Expédié sous 48 h'], ['↺', 'Retours 14 jours']].map(([ic, t]) => /*#__PURE__*/React.createElement("span", {
    key: t,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 9
    }
  }, /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      width: 26,
      height: 26,
      borderRadius: '50%',
      border: '1.5px solid var(--yellow)',
      color: 'var(--yellow)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 13,
      flexShrink: 0
    }
  }, ic), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 500
    }
  }, t))))))), /*#__PURE__*/React.createElement("section", {
    style: {
      background: 'var(--card)',
      borderBottom: '1.5px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "container-wide",
    style: {
      display: 'flex',
      justifyContent: 'center',
      flexWrap: 'wrap',
      gap: 56,
      padding: '20px 24px'
    }
  }, [['✓', 'Authentifié', 'Chaque pièce vérifiée'], ['⤓', 'Livraison offerte', 'Dès 100 € d’achat'], ['◈', 'Paiement sécurisé', 'CB · PayPal · Apple Pay']].map(([ic, t, s]) => /*#__PURE__*/React.createElement("div", {
    key: t,
    className: "lc-reassure",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 13
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "lc-reassure-ic",
    style: {
      width: 40,
      height: 40,
      flexShrink: 0,
      borderRadius: '50%',
      border: '1.5px solid var(--line-strong)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 17,
      color: 'var(--accent)'
    }
  }, ic), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 14.5
    }
  }, t), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: 'var(--ink-2)'
    }
  }, s)))))), /*#__PURE__*/React.createElement("section", {
    className: "container-wide",
    style: {
      padding: '48px 24px 8px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "lc-cat-tiles",
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 16
    }
  }, [["Cartes à l'unité", 'single', 'Du Set de Base à aujourd’hui'], ['Cartes gradées', 'graded', 'PSA · BGS authentifiées'], ['Scellé', 'sealed', 'Displays · ETB · coffrets'], ['Accessoires', 'accessory', 'Sleeves · classeurs · tapis']].map(([t, key, sub]) => /*#__PURE__*/React.createElement("a", {
    key: key,
    href: "#",
    onClick: e => {
      e.preventDefault();
      navigate('catalogue', key);
    },
    style: {
      background: 'var(--card)',
      border: '1.5px solid var(--line)',
      borderRadius: 'var(--radius)',
      padding: '18px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 16
    }
  }, t), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12.5,
      color: 'var(--ink-2)'
    }
  }, sub), /*#__PURE__*/React.createElement("span", {
    style: {
      marginTop: 8,
      fontFamily: 'var(--font-body)',
      fontSize: 13,
      color: 'var(--ink)',
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(Pokeball, {
    size: 14
  }), "D\xE9couvrir \u2192"))))), has ? /*#__PURE__*/React.createElement("div", {
    className: "container-wide",
    style: {
      padding: '40px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: 48
    }
  }, /*#__PURE__*/React.createElement(ProductRow, {
    eyebrow: "Tout juste arriv\xE9",
    title: "Nouveaut\xE9s",
    products: nouveautes,
    navigate: navigate,
    onSeeAll: () => navigate('catalogue', 'all')
  }), /*#__PURE__*/React.createElement(ProductRow, {
    eyebrow: "R\xE9servez les prochaines sorties",
    title: "Pr\xE9commandes",
    products: preorders,
    navigate: navigate,
    onSeeAll: () => navigate('catalogue', 'preorder')
  }), /*#__PURE__*/React.createElement(ProductRow, {
    eyebrow: "Sous coque, certifi\xE9es",
    title: "Cartes grad\xE9es PSA",
    products: by('graded'),
    navigate: navigate,
    onSeeAll: () => navigate('catalogue', 'graded')
  }), /*#__PURE__*/React.createElement(ProductRow, {
    eyebrow: "Scell\xE9 & coffrets",
    title: "Produits scell\xE9s",
    products: by('sealed'),
    navigate: navigate,
    onSeeAll: () => navigate('catalogue', 'sealed')
  }), /*#__PURE__*/React.createElement(ProductRow, {
    eyebrow: "Du Set de Base \xE0 aujourd'hui",
    title: "Cartes \xE0 l'unit\xE9",
    products: by('single'),
    navigate: navigate,
    onSeeAll: () => navigate('catalogue', 'single')
  })) : /*#__PURE__*/React.createElement("section", {
    className: "container-wide",
    style: {
      padding: '56px 24px 64px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--card)',
      border: '1.5px solid var(--line)',
      borderRadius: 'var(--radius-lg)',
      padding: '48px 32px',
      textAlign: 'center',
      maxWidth: 720,
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 800,
      fontSize: 30,
      letterSpacing: '-0.02em',
      marginBottom: 12
    }
  }, "On garnit les rayons"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 16,
      lineHeight: 1.6,
      color: 'var(--ink-2)',
      maxWidth: 500,
      margin: '0 auto 24px'
    }
  }, "La boutique en ligne ouvre tr\xE8s bient\xF4t. En attendant, passez nous voir rue de la Juiverie \u2014 ou dites-nous la carte que vous cherchez, on l'a souvent en r\xE9serve."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      justifyContent: 'center',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(DS.Button, {
    variant: "accent",
    as: "a",
    href: "#",
    onClick: e => {
      e.preventDefault();
      openModal('contact');
    }
  }, "Nous \xE9crire"), /*#__PURE__*/React.createElement(DS.Button, {
    variant: "outline",
    as: "a",
    href: "#",
    onClick: e => {
      e.preventDefault();
      openModal('newsletter');
    }
  }, "Pr\xE9venez-moi du lancement")))), /*#__PURE__*/React.createElement("section", {
    className: "container-wide",
    style: {
      padding: '8px 24px 16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "lc-shop-grid",
    style: {
      display: 'grid',
      gridTemplateColumns: '1.1fr 0.9fr',
      gap: 0,
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      border: '1.5px solid var(--line)',
      background: 'var(--card)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '36px 36px 38px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      color: 'var(--accent)',
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement(Pokeball, {
    size: 14
  }), "Boutique physique"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 800,
      fontSize: 28,
      letterSpacing: '-0.02em',
      marginBottom: 12
    }
  }, "Retrouvez-nous \xE0 Vienne"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 15.5,
      lineHeight: 1.6,
      color: 'var(--ink-2)',
      maxWidth: 440,
      marginBottom: 22
    }
  }, "Poussez la porte de la boutique pour voir les pi\xE8ces en vrai, faire estimer vos cartes ou retirer une commande. On adore parler collection."), /*#__PURE__*/React.createElement("div", {
    className: "lc-addr-grid",
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 18,
      marginBottom: 24
    }
  }, [['Adresse', 'Rue de la Juiverie\n38200 Vienne'], ['Horaires', 'Mar–Sam · 10h–19h\nDimanche · 14h–18h'], ['Téléphone', '04 74 00 00 00'], ['Services', 'Estimation · Retrait\nAchat de collections']].map(([k, v]) => /*#__PURE__*/React.createElement("div", {
    key: k
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 10.5,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color: 'var(--muted)',
      marginBottom: 5
    }
  }, k), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14.5,
      fontWeight: 500,
      lineHeight: 1.45,
      whiteSpace: 'pre-line'
    }
  }, v)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(DS.Button, {
    variant: "accent",
    onClick: () => openModal('contact')
  }, "Nous contacter"), /*#__PURE__*/React.createElement(DS.Button, {
    variant: "outline",
    as: "a",
    href: "https://maps.google.com/?q=Rue+de+la+Juiverie+Vienne",
    target: "_blank"
  }, "Itin\xE9raire \u2192"))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      background: 'var(--header-bg)',
      minHeight: 340,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0 18px, transparent 18px 36px)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      textAlign: 'center',
      color: '#fff'
    }
  }, /*#__PURE__*/React.createElement(Pokeball, {
    size: 64,
    style: {
      marginBottom: 14
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 800,
      fontStyle: 'italic',
      fontSize: 30,
      color: '#fff'
    }
  }, "leclub", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--yellow)'
    }
  }, "151")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      letterSpacing: '0.16em',
      textTransform: 'uppercase',
      color: 'rgba(255,255,255,0.65)',
      marginTop: 8
    }
  }, "Vienne \xB7 Is\xE8re (38)"))))), /*#__PURE__*/React.createElement("section", {
    style: {
      background: 'var(--ink)',
      color: 'var(--on-ink)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "container-wide",
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 24,
      padding: '40px 24px',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 800,
      fontSize: 28,
      letterSpacing: '-0.02em',
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Pokeball, {
    size: 26
  }), "Passez nous voir \u2014 on adore parler cartes")), /*#__PURE__*/React.createElement(DS.Button, {
    variant: "accent",
    size: "lg",
    as: "a",
    href: "#",
    onClick: e => {
      e.preventDefault();
      openModal('contact');
    }
  }, "Nous trouver"))));
}
Object.assign(window, {
  Home
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/leclub151/Home.jsx", error: String((e && e.message) || e) }); }

// ui_kits/leclub151/Legal.jsx
try { (() => {
/* leclub151 — Pages légales (gabarits à compléter)
   Mentions légales · CGV · Politique de confidentialité.
   Les champs [À COMPLÉTER] sont surlignés — remplace-les par tes infos réelles.
   ⚠️ Gabarit informatif, non contractuel : fais-le valider par un juriste. */

function LegalPage({
  navigate,
  kind
}) {
  const F = ({
    children
  }) => /*#__PURE__*/React.createElement("mark", {
    style: {
      background: 'var(--accent-wash)',
      color: 'var(--accent)',
      padding: '1px 7px',
      borderRadius: 4,
      fontWeight: 700,
      fontFamily: 'var(--font-mono)',
      fontSize: '0.86em',
      letterSpacing: '0.02em'
    }
  }, children);
  const H = ({
    children
  }) => /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 20,
      letterSpacing: '-0.01em',
      margin: '34px 0 12px'
    }
  }, children);
  const P = ({
    children
  }) => /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 15,
      lineHeight: 1.7,
      color: 'var(--ink-soft)',
      margin: '0 0 12px'
    }
  }, children);
  const LI = ({
    children
  }) => /*#__PURE__*/React.createElement("li", {
    style: {
      fontSize: 14.5,
      lineHeight: 1.65,
      color: 'var(--ink-soft)',
      marginBottom: 7,
      paddingLeft: 20,
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      left: 2,
      top: 9,
      width: 6,
      height: 6,
      borderRadius: '50%',
      background: 'var(--accent)'
    }
  }), children);
  const UL = ({
    children
  }) => /*#__PURE__*/React.createElement("ul", {
    style: {
      listStyle: 'none',
      margin: '0 0 14px',
      padding: 0
    }
  }, children);
  const meta = {
    mentions: {
      title: 'Mentions légales',
      crumb: 'Mentions légales'
    },
    cgv: {
      title: 'Conditions générales de vente',
      crumb: 'CGV'
    },
    confidentialite: {
      title: 'Politique de confidentialité',
      crumb: 'Confidentialité'
    }
  }[kind] || {
    title: 'Informations légales',
    crumb: 'Légal'
  };
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("section", {
    style: {
      borderBottom: '1.5px solid var(--line)',
      background: 'var(--paper-2)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 880,
      margin: '0 auto',
      padding: '40px 24px 34px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      color: 'var(--muted)',
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "index.html"
  }, "Accueil"), " \xA0/\xA0 ", meta.crumb), /*#__PURE__*/React.createElement("h1", {
    className: "display-2"
  }, meta.title), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13.5,
      color: 'var(--muted)',
      marginTop: 10,
      fontFamily: 'var(--font-mono)'
    }
  }, "Derni\xE8re mise \xE0 jour : ", /*#__PURE__*/React.createElement(F, null, "JJ/MM/AAAA")))), /*#__PURE__*/React.createElement("section", {
    style: {
      maxWidth: 880,
      margin: '0 auto',
      padding: '8px 24px 72px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--accent-wash)',
      border: '1.5px solid var(--accent-soft)',
      borderRadius: 'var(--radius)',
      padding: '14px 18px',
      margin: '24px 0 8px',
      fontSize: 13.5,
      color: 'var(--ink-soft)',
      lineHeight: 1.55
    }
  }, /*#__PURE__*/React.createElement("strong", {
    style: {
      color: 'var(--ink)'
    }
  }, "Gabarit \xE0 compl\xE9ter."), " Remplace chaque champ ", /*#__PURE__*/React.createElement(F, null, "surlign\xE9"), " par tes informations r\xE9elles. Ce mod\xE8le est fourni \xE0 titre informatif \u2014 fais-le relire par un professionnel du droit avant mise en ligne."), kind === 'mentions' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(H, null, "1. \xC9diteur du site"), /*#__PURE__*/React.createElement(P, null, "Le site ", /*#__PURE__*/React.createElement("strong", null, "leclub151"), " est \xE9dit\xE9 par :"), /*#__PURE__*/React.createElement(UL, null, /*#__PURE__*/React.createElement(LI, null, "Raison sociale / nom : ", /*#__PURE__*/React.createElement(F, null, "Nom de l'entreprise")), /*#__PURE__*/React.createElement(LI, null, "Forme juridique : ", /*#__PURE__*/React.createElement(F, null, "EI / EURL / SASU\u2026"), " \u2014 Capital social : ", /*#__PURE__*/React.createElement(F, null, "montant \u20AC")), /*#__PURE__*/React.createElement(LI, null, "SIRET : ", /*#__PURE__*/React.createElement(F, null, "000 000 000 00000"), " \u2014 RCS / RM : ", /*#__PURE__*/React.createElement(F, null, "Ville + n\xB0")), /*#__PURE__*/React.createElement(LI, null, "N\xB0 TVA intracommunautaire : ", /*#__PURE__*/React.createElement(F, null, "FR00 000000000")), /*#__PURE__*/React.createElement(LI, null, "Si\xE8ge social : ", /*#__PURE__*/React.createElement(F, null, "Adresse compl\xE8te, 38200 Vienne")), /*#__PURE__*/React.createElement(LI, null, "E-mail : ", /*#__PURE__*/React.createElement(F, null, "contact@leclub151.fr"), " \u2014 T\xE9l\xE9phone : ", /*#__PURE__*/React.createElement(F, null, "04 00 00 00 00"))), /*#__PURE__*/React.createElement(H, null, "2. Directeur de la publication"), /*#__PURE__*/React.createElement(P, null, /*#__PURE__*/React.createElement(F, null, "Pr\xE9nom Nom"), ", en qualit\xE9 de ", /*#__PURE__*/React.createElement(F, null, "g\xE9rant / responsable"), "."), /*#__PURE__*/React.createElement(H, null, "3. H\xE9bergeur"), /*#__PURE__*/React.createElement(P, null, "Le site est h\xE9berg\xE9 par :"), /*#__PURE__*/React.createElement(UL, null, /*#__PURE__*/React.createElement(LI, null, "Soci\xE9t\xE9 : ", /*#__PURE__*/React.createElement(F, null, "Nom de l'h\xE9bergeur")), /*#__PURE__*/React.createElement(LI, null, "Adresse : ", /*#__PURE__*/React.createElement(F, null, "Adresse de l'h\xE9bergeur")), /*#__PURE__*/React.createElement(LI, null, "T\xE9l\xE9phone : ", /*#__PURE__*/React.createElement(F, null, "T\xE9l\xE9phone de l'h\xE9bergeur"))), /*#__PURE__*/React.createElement(H, null, "4. Propri\xE9t\xE9 intellectuelle"), /*#__PURE__*/React.createElement(P, null, "\xAB Pok\xE9mon \xBB, les noms de personnages, s\xE9ries et logos sont des marques d\xE9pos\xE9es de Nintendo, Creatures Inc. et GAME FREAK inc. ", /*#__PURE__*/React.createElement("strong", null, "leclub151 n'est ni affili\xE9, ni sponsoris\xE9, ni approuv\xE9 par The Pok\xE9mon Company."), " Les produits propos\xE9s sont des articles authentiques revendus dans le cadre de l'\xE9puisement des droits. Les visuels, textes et \xE9l\xE9ments graphiques propres au site sont la propri\xE9t\xE9 de ", /*#__PURE__*/React.createElement(F, null, "Nom de l'entreprise"), "."), /*#__PURE__*/React.createElement(H, null, "5. Donn\xE9es personnelles & cookies"), /*#__PURE__*/React.createElement(P, null, "Le traitement des donn\xE9es est d\xE9crit dans notre ", /*#__PURE__*/React.createElement("a", {
    href: "confidentialite.html",
    style: {
      color: 'var(--accent)',
      fontWeight: 600
    }
  }, "politique de confidentialit\xE9"), ".")), kind === 'cgv' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(H, null, "Article 1 \u2014 Objet"), /*#__PURE__*/React.createElement(P, null, "Les pr\xE9sentes conditions g\xE9n\xE9rales de vente (CGV) r\xE9gissent les ventes de cartes et produits Pok\xE9mon r\xE9alis\xE9es sur le site leclub151 entre ", /*#__PURE__*/React.createElement(F, null, "Nom de l'entreprise"), " (le vendeur) et tout acheteur particulier (le client)."), /*#__PURE__*/React.createElement(H, null, "Article 2 \u2014 Produits"), /*#__PURE__*/React.createElement(P, null, "Les produits sont des articles ", /*#__PURE__*/React.createElement("strong", null, "authentiques"), " (cartes \xE0 l'unit\xE9, cartes grad\xE9es, produits scell\xE9s, accessoires). Les cartes \xE0 l'unit\xE9 et grad\xE9es sont des ", /*#__PURE__*/React.createElement("strong", null, "pi\xE8ces uniques"), " : une fois vendues, elles ne sont plus disponibles. Les photographies sont les plus fid\xE8les possibles ; de l\xE9g\xE8res variations d'\xE9tat peuvent exister et sont pr\xE9cis\xE9es dans la fiche produit."), /*#__PURE__*/React.createElement(H, null, "Article 3 \u2014 Prix"), /*#__PURE__*/React.createElement(P, null, "Les prix sont indiqu\xE9s en euros toutes taxes comprises (TTC). ", /*#__PURE__*/React.createElement(F, null, "Nom de l'entreprise"), " se r\xE9serve le droit de modifier ses prix \xE0 tout moment ; les produits sont factur\xE9s sur la base des tarifs en vigueur au moment de la commande."), /*#__PURE__*/React.createElement(H, null, "Article 4 \u2014 Commande & paiement"), /*#__PURE__*/React.createElement(P, null, "La cr\xE9ation d'un compte client est requise pour commander. Le paiement s'effectue par ", /*#__PURE__*/React.createElement(F, null, "CB, PayPal, \u2026 via Stripe/WooCommerce"), ". La commande est confirm\xE9e apr\xE8s validation du paiement. ", /*#__PURE__*/React.createElement(F, null, "Nom de l'entreprise"), " se r\xE9serve le droit d'annuler toute commande en cas de litige de paiement."), /*#__PURE__*/React.createElement(H, null, "Article 5 \u2014 Livraison"), /*#__PURE__*/React.createElement(P, null, "Livraison en France ", /*#__PURE__*/React.createElement(F, null, "(et/ou international)"), " sous ", /*#__PURE__*/React.createElement(F, null, "48 h ouvr\xE9es"), ", en envoi suivi et prot\xE9g\xE9. Frais : standard ", /*#__PURE__*/React.createElement(F, null, "4,90 \u20AC"), " (offert d\xE8s 100 \u20AC), point relais ", /*#__PURE__*/React.createElement(F, null, "3,90 \u20AC"), ", ou retrait gratuit en boutique \xE0 Vienne. Les d\xE9lais sont indicatifs."), /*#__PURE__*/React.createElement(H, null, "Article 6 \u2014 Droit de r\xE9tractation"), /*#__PURE__*/React.createElement(P, null, "Conform\xE9ment au Code de la consommation, le client dispose d'un d\xE9lai de ", /*#__PURE__*/React.createElement("strong", null, "14 jours"), " \xE0 compter de la r\xE9ception pour exercer son droit de r\xE9tractation, sans avoir \xE0 se justifier. Les produits doivent \xEAtre retourn\xE9s ", /*#__PURE__*/React.createElement("strong", null, "non ouverts / scell\xE9s et dans leur \xE9tat d'origine"), ". Les frais de retour sont \xE0 la charge ", /*#__PURE__*/React.createElement(F, null, "du client / du vendeur"), ". Remboursement sous 14 jours apr\xE8s r\xE9ception du retour."), /*#__PURE__*/React.createElement(H, null, "Article 7 \u2014 Garanties"), /*#__PURE__*/React.createElement(P, null, "Les produits b\xE9n\xE9ficient de la garantie l\xE9gale de conformit\xE9 et de la garantie contre les vices cach\xE9s. L'authenticit\xE9 de chaque pi\xE8ce de plus de 100 \u20AC est v\xE9rifi\xE9e avant mise en vente."), /*#__PURE__*/React.createElement(H, null, "Article 8 \u2014 Donn\xE9es personnelles"), /*#__PURE__*/React.createElement(P, null, "Les donn\xE9es sont trait\xE9es conform\xE9ment \xE0 notre ", /*#__PURE__*/React.createElement("a", {
    href: "confidentialite.html",
    style: {
      color: 'var(--accent)',
      fontWeight: 600
    }
  }, "politique de confidentialit\xE9"), " et au RGPD."), /*#__PURE__*/React.createElement(H, null, "Article 9 \u2014 Litiges & droit applicable"), /*#__PURE__*/React.createElement(P, null, "Les pr\xE9sentes CGV sont soumises au droit fran\xE7ais. En cas de litige, une solution amiable sera recherch\xE9e avant toute action ; le client peut recourir \xE0 un m\xE9diateur de la consommation (", /*#__PURE__*/React.createElement(F, null, "nom du m\xE9diateur"), "). \xC0 d\xE9faut, les tribunaux comp\xE9tents seront ceux du ressort de ", /*#__PURE__*/React.createElement(F, null, "Ville"), ".")), kind === 'confidentialite' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(H, null, "1. Responsable du traitement"), /*#__PURE__*/React.createElement(P, null, "Le responsable du traitement des donn\xE9es est ", /*#__PURE__*/React.createElement(F, null, "Nom de l'entreprise"), ", ", /*#__PURE__*/React.createElement(F, null, "adresse"), ", joignable \xE0 ", /*#__PURE__*/React.createElement(F, null, "contact@leclub151.fr"), "."), /*#__PURE__*/React.createElement(H, null, "2. Donn\xE9es collect\xE9es"), /*#__PURE__*/React.createElement(UL, null, /*#__PURE__*/React.createElement(LI, null, "Identit\xE9 & contact : nom, e-mail, adresse de livraison, t\xE9l\xE9phone"), /*#__PURE__*/React.createElement(LI, null, "Commande : produits, montants, historique d'achat"), /*#__PURE__*/React.createElement(LI, null, "Paiement : g\xE9r\xE9 par notre prestataire ", /*#__PURE__*/React.createElement(F, null, "Stripe / WooCommerce Payments"), " (aucune donn\xE9e carte stock\xE9e par nos soins)"), /*#__PURE__*/React.createElement(LI, null, "Navigation : cookies, adresse IP, statistiques de visite")), /*#__PURE__*/React.createElement(H, null, "3. Finalit\xE9s & base l\xE9gale"), /*#__PURE__*/React.createElement(UL, null, /*#__PURE__*/React.createElement(LI, null, "Gestion des commandes et du compte client (ex\xE9cution du contrat)"), /*#__PURE__*/React.createElement(LI, null, "Service client et alertes produits (consentement)"), /*#__PURE__*/React.createElement(LI, null, "Obligations comptables et l\xE9gales (obligation l\xE9gale)"), /*#__PURE__*/React.createElement(LI, null, "Am\xE9lioration du site et mesure d'audience (int\xE9r\xEAt l\xE9gitime / consentement)")), /*#__PURE__*/React.createElement(H, null, "4. Dur\xE9e de conservation"), /*#__PURE__*/React.createElement(P, null, "Les donn\xE9es sont conserv\xE9es le temps de la relation commerciale puis archiv\xE9es selon les d\xE9lais l\xE9gaux (ex. ", /*#__PURE__*/React.createElement(F, null, "10 ans"), " pour les factures), ou jusqu'au retrait du consentement pour les alertes/newsletter."), /*#__PURE__*/React.createElement(H, null, "5. Destinataires"), /*#__PURE__*/React.createElement(P, null, "Les donn\xE9es ne sont transmises qu'aux prestataires n\xE9cessaires (h\xE9bergeur, transporteur, prestataire de paiement) et ne sont ", /*#__PURE__*/React.createElement("strong", null, "jamais revendues"), "."), /*#__PURE__*/React.createElement(H, null, "6. Vos droits (RGPD)"), /*#__PURE__*/React.createElement(P, null, "Vous disposez d'un droit d'acc\xE8s, de rectification, d'effacement, de limitation, d'opposition et de portabilit\xE9. Pour les exercer : ", /*#__PURE__*/React.createElement(F, null, "contact@leclub151.fr"), ". Vous pouvez aussi saisir la CNIL (cnil.fr)."), /*#__PURE__*/React.createElement(H, null, "7. Cookies"), /*#__PURE__*/React.createElement(P, null, "Le site utilise des cookies techniques (panier, session) et, sous r\xE9serve de votre consentement, des cookies de mesure d'audience. Vous pouvez les g\xE9rer \xE0 tout moment via le bandeau cookies / les r\xE9glages de votre navigateur.")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 40,
      paddingTop: 22,
      borderTop: '1.5px solid var(--line)',
      display: 'flex',
      gap: 16,
      flexWrap: 'wrap',
      fontFamily: 'var(--font-mono)',
      fontSize: 12.5
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "mentions-legales.html",
    style: {
      color: kind === 'mentions' ? 'var(--accent)' : 'var(--ink-2)',
      fontWeight: 600
    }
  }, "Mentions l\xE9gales"), /*#__PURE__*/React.createElement("a", {
    href: "cgv.html",
    style: {
      color: kind === 'cgv' ? 'var(--accent)' : 'var(--ink-2)',
      fontWeight: 600
    }
  }, "CGV"), /*#__PURE__*/React.createElement("a", {
    href: "confidentialite.html",
    style: {
      color: kind === 'confidentialite' ? 'var(--accent)' : 'var(--ink-2)',
      fontWeight: 600
    }
  }, "Confidentialit\xE9"))));
}
Object.assign(window, {
  LegalPage
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/leclub151/Legal.jsx", error: String((e && e.message) || e) }); }

// ui_kits/leclub151/Product.jsx
try { (() => {
/* leclub151 — Fiche produit (product detail) */
function Product({
  navigate,
  productId,
  onCart
}) {
  const DS = window.ADITCGDesignSystem_df75b7;
  const {
    PRODUCTS,
    Cart,
    FREE_SHIP,
    fmt
  } = window.LC151;
  const cart = useCart();
  const product = window.LC151.get(productId) || PRODUCTS[0];
  const [qty, setQty] = React.useState(1);
  const [added, setAdded] = React.useState(false);
  const lockedUnique = product ? cart.isUnique(product.id) && cart.items().some(l => l.id === product.id) : false;
  if (!product) {
    return /*#__PURE__*/React.createElement("div", {
      className: "container-wide",
      style: {
        padding: '120px 24px',
        textAlign: 'center',
        color: 'var(--ink-2)'
      }
    }, /*#__PURE__*/React.createElement("h1", {
      className: "display-3",
      style: {
        marginBottom: 10
      }
    }, "Produit indisponible"), /*#__PURE__*/React.createElement("p", {
      style: {
        marginBottom: 24
      }
    }, "Ce produit n'est pas encore en ligne."), /*#__PURE__*/React.createElement(DS.Button, {
      variant: "accent",
      onClick: () => navigate('home')
    }, "Retour \xE0 l'accueil"));
  }
  const related = PRODUCTS.filter(p => p.id !== product.id && p.type === product.type).slice(0, 4);
  const relList = related.length ? related : PRODUCTS.filter(p => p.id !== product.id).slice(0, 4);
  const addToCart = e => {
    Cart.add(product.id, qty);
    if (e && e.currentTarget && window.lcFlyToCart) window.lcFlyToCart(e.currentTarget);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };
  const specs = [['Série', product.set], ['Numéro', product.num], ['Rareté', product.rarity || '—'], ['État', product.type === 'graded' ? 'Sous coque — certifié' : 'Near Mint'], ['Référence', 'LC151-' + product.id.toUpperCase()]];
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("section", {
    className: "container-wide",
    style: {
      padding: '28px 24px 16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      color: 'var(--muted)'
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      navigate('home');
    }
  }, "Accueil"), " \xA0/\xA0", /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      navigate('catalogue', product.type);
    }
  }, " ", product.cat), " \xA0/\xA0", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--ink)'
    }
  }, " ", product.name))), /*#__PURE__*/React.createElement("section", {
    className: "container-wide lc-prod-grid",
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 56,
      padding: '20px 24px 72px',
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "lc-prod-gallery",
    style: {
      position: 'sticky',
      top: 92
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--card)',
      border: '1.5px solid var(--line)',
      borderRadius: 'var(--radius-lg)',
      padding: 40,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 460
    }
  }, product.image ? /*#__PURE__*/React.createElement("img", {
    src: product.image,
    alt: product.name,
    style: {
      maxHeight: 440,
      filter: 'drop-shadow(0 22px 36px rgba(26,23,20,0.30))'
    }
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      width: '70%'
    }
  }, /*#__PURE__*/React.createElement(ProductStage, {
    glyph: product.glyph,
    ratio: "3 / 4",
    big: true
  })))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginBottom: 16
    }
  }, product.badge && /*#__PURE__*/React.createElement(DS.Badge, {
    tone: product.badge.tone
  }, product.badge.label), /*#__PURE__*/React.createElement(DS.Badge, {
    tone: product.inStock ? 'stock' : 'oos'
  }, product.inStock ? 'En stock' : 'Rupture')), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11.5,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      color: 'var(--muted)',
      marginBottom: 12
    }
  }, product.cat, " \xB7 ", product.set), /*#__PURE__*/React.createElement("h1", {
    className: "display-2",
    style: {
      marginBottom: 18
    }
  }, product.name), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 22
    }
  }, /*#__PURE__*/React.createElement(DS.PriceTag, {
    price: product.price,
    oldPrice: product.oldPrice,
    size: "lg"
  })), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 16,
      lineHeight: 1.65,
      color: 'var(--ink-2)',
      marginBottom: 28,
      maxWidth: 520
    }
  }, product.desc), window.LC151.Cart.isUnique(product.id) && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 9,
      padding: '10px 14px',
      marginBottom: 20,
      background: 'var(--accent-wash)',
      border: '1.5px solid var(--accent-soft)',
      borderRadius: 'var(--radius-sm)',
      fontSize: 13.5,
      color: 'var(--ink)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700,
      color: 'var(--accent)'
    }
  }, "1 / 1"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--ink-2)'
    }
  }, "Pi\xE8ce unique \u2014 une seule \xE9dition disponible en boutique.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      alignItems: 'center',
      marginBottom: 14
    }
  }, !window.LC151.Cart.isUnique(product.id) && /*#__PURE__*/React.createElement(DS.QtyStepper, {
    value: qty,
    onChange: setQty,
    max: 10
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement(DS.Button, {
    variant: "accent",
    size: "lg",
    block: true,
    disabled: !product.inStock || lockedUnique,
    iconLeft: lockedUnique ? '✓' : added ? '✓' : '＋',
    onClick: lockedUnique ? undefined : addToCart
  }, lockedUnique ? 'Déjà dans le panier (1/1)' : added ? 'Ajouté au panier' : product.inStock ? 'Ajouter au panier' : 'Indisponible'))), /*#__PURE__*/React.createElement(DS.Button, {
    variant: "outline",
    size: "lg",
    block: true,
    onClick: () => {
      Cart.add(product.id, qty);
      onCart();
    },
    disabled: !product.inStock
  }, "Acheter maintenant"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 18,
      padding: '12px 16px',
      background: 'var(--accent-wash)',
      border: '1.5px solid var(--accent-soft)',
      borderRadius: 'var(--radius-sm)',
      fontSize: 13.5,
      color: 'var(--ink-soft)',
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--ink)'
    }
  }, "\u2605"), " Livraison offerte d\xE8s ", FREE_SHIP, " \u20AC \xB7 exp\xE9dition prot\xE9g\xE9e sous 48 h"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 32,
      border: '1.5px solid var(--line)',
      borderRadius: 'var(--radius)',
      overflow: 'hidden'
    }
  }, specs.map(([k, v], i) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '13px 18px',
      background: i % 2 ? 'transparent' : 'var(--paper-2)',
      fontSize: 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11.5,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: 'var(--muted)'
    }
  }, k), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 500
    }
  }, v)))))), /*#__PURE__*/React.createElement("section", {
    style: {
      borderTop: '1.5px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "container-wide",
    style: {
      padding: '56px 24px 80px'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    className: "display-3",
    style: {
      marginBottom: 26
    }
  }, "Dans la m\xEAme s\xE9rie"), /*#__PURE__*/React.createElement("div", {
    className: "lc-grid-auto",
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 20
    }
  }, relList.map(p => /*#__PURE__*/React.createElement(StoreCard, {
    key: p.id,
    product: p,
    navigate: navigate
  }))))));
}
Object.assign(window, {
  Product
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/leclub151/Product.jsx", error: String((e && e.message) || e) }); }

// ui_kits/leclub151/data.js
try { (() => {
/* leclub151 — storefront data + cart + editable Store
   Catalogue is EMPTY by default. Real products are managed in WordPress /
   WooCommerce; nothing is hard-coded here. The owner can also add products
   from the back-office (admin.html), which persist to localStorage. */
(function () {
  // ---- Catalogue ----
  // Demo products across every category for testing. Replace with your real
  // catalogue via WordPress / WooCommerce (admin.html) — these disappear once
  // a WooCommerce site is connected and returns products.
  const img = (set, n) => `https://assets.tcgdex.net/en/base/${set}/${n}/high.webp`;
  const DEFAULTS = [
  // ----- Cartes à l'unité -----
  {
    id: 'd1',
    name: 'Dracaufeu — Set de Base',
    set: 'Set de Base · 1999',
    num: '4/102',
    type: 'single',
    cat: "Carte à l'unité",
    price: 1890,
    image: img('base1', 4),
    rarity: 'Rare Holo',
    inStock: true,
    unique: true,
    desc: "Dracaufeu holographique du Set de Base, édition 1999. État Near Mint, centrage excellent."
  }, {
    id: 'd2',
    name: 'Tortank Holo',
    set: 'Set de Base · 1999',
    num: '2/102',
    type: 'single',
    cat: "Carte à l'unité",
    price: 329.9,
    oldPrice: 399.9,
    image: img('base1', 2),
    rarity: 'Rare Holo',
    inStock: true,
    unique: true,
    badge: {
      tone: 'sale',
      label: 'Promo'
    },
    desc: "Tortank holographique, Set de Base. Near Mint."
  }, {
    id: 'd3',
    name: 'Pikachu — Joues Rouges',
    set: 'Set de Base · 1999',
    num: '58/102',
    type: 'single',
    cat: "Carte à l'unité",
    price: 54.9,
    image: img('base1', 58),
    rarity: 'Common',
    inStock: true,
    unique: true,
    badge: {
      tone: 'new',
      label: 'Nouveau'
    },
    desc: "Pikachu « joues rouges », variante recherchée du Set de Base."
  },
  // ----- Cartes gradées -----
  {
    id: 'd4',
    name: 'Dracaufeu — Gradée PSA 10',
    set: 'Set de Base · 1999',
    num: '4/102',
    type: 'graded',
    cat: 'Carte gradée',
    price: 8900,
    image: img('base1', 4),
    rarity: 'Gem Mint',
    inStock: true,
    unique: true,
    badge: {
      tone: 'graded',
      label: 'PSA 10'
    },
    desc: "Dracaufeu Set de Base certifié PSA 10 Gem Mint. Sous coque, scellé."
  }, {
    id: 'd5',
    name: 'Mewtwo Holo — Gradée PSA 9',
    set: 'Set de Base · 1999',
    num: '10/102',
    type: 'graded',
    cat: 'Carte gradée',
    price: 460,
    image: img('base1', 10),
    rarity: 'Mint',
    inStock: true,
    unique: true,
    badge: {
      tone: 'graded',
      label: 'PSA 9'
    },
    desc: "Mewtwo holographique certifié PSA 9 Mint."
  },
  // ----- Scellé : ETB, display, coffret, booster -----
  {
    id: 'd6',
    name: "ETB — Pokémon 151",
    set: 'Écarlate & Violet · 151',
    num: 'sv3.5',
    type: 'sealed',
    cat: "Coffret Dresseur d'Élite",
    price: 64.9,
    image: 'https://images.pokemontcg.io/sv3pt5/logo.png',
    glyph: 'ETB',
    inStock: true,
    badge: {
      tone: 'new',
      label: 'Nouveau'
    },
    desc: "Coffret Dresseur d'Élite Pokémon 151. Scellé, version française. 9 boosters + accessoires."
  }, {
    id: 'd7',
    name: "Display — Étincelles Déferlantes",
    set: 'EV8 · Scellé FR',
    num: '36 boosters',
    type: 'sealed',
    cat: 'Boîte de boosters',
    price: 209.9,
    image: 'https://images.pokemontcg.io/sv8/logo.png',
    glyph: 'DISPLAY',
    inStock: true,
    desc: "Display scellé Étincelles Déferlantes (EV8), 36 boosters, version française."
  }, {
    id: 'd8',
    name: "Coffret — Évolutions Prismatiques",
    set: 'EV8.5 · FR',
    num: 'Collection',
    type: 'sealed',
    cat: 'Coffret',
    price: 39.9,
    image: 'https://images.pokemontcg.io/sv8pt5/logo.png',
    glyph: 'COFFRET',
    inStock: true,
    desc: "Coffret Collection Évolutions Prismatiques, scellé, version française."
  }, {
    id: 'd9',
    name: "Booster — Flammes Obsidiennes",
    set: 'EV3 · FR',
    num: 'x1',
    type: 'sealed',
    cat: 'Booster',
    price: 5.5,
    image: 'https://images.pokemontcg.io/sv3/logo.png',
    glyph: 'BOOSTER',
    inStock: false,
    desc: "Booster scellé Flammes Obsidiennes (EV3), 10 cartes, version française."
  },
  // ----- Accessoires -----
  {
    id: 'd10',
    name: 'Sleeves Ultra Pro — Pack 100',
    set: 'Ultra Pro · Matte',
    num: 'x100',
    type: 'accessory',
    cat: 'Protège-cartes',
    price: 9.9,
    image: null,
    glyph: 'SLEEVES',
    inStock: true,
    desc: "100 protège-cartes Ultra Pro finition matte, format standard."
  }, {
    id: 'd11',
    name: 'Classeur 360 cartes',
    set: 'Ultimate Guard',
    num: '360',
    type: 'accessory',
    cat: 'Classeur',
    price: 24.9,
    image: null,
    glyph: 'CLASSEUR',
    inStock: true,
    desc: "Classeur 360 cartes à fermeture zip, pochettes Side-Loading."
  },
  // ----- Précommandes -----
  {
    id: 'd12',
    name: "Display — Couronne Stellaire",
    set: 'Sortie 10-10-2026 · FR',
    num: '36 boosters',
    type: 'sealed',
    cat: 'Boîte de boosters',
    price: 219.9,
    image: 'https://images.pokemontcg.io/sv7/logo.png',
    glyph: 'DISPLAY',
    inStock: true,
    preorder: true,
    badge: {
      tone: 'sale',
      label: 'Précommande'
    },
    desc: "Display scellé Couronne Stellaire. Précommande — expédié à la sortie le 10/10/2026."
  }, {
    id: 'd13',
    name: "ETB — Mascarade Crépusculaire",
    set: 'Sortie 28-08-2026 · FR',
    num: 'Dresseur d’Élite',
    type: 'sealed',
    cat: "Coffret Dresseur d'Élite",
    price: 54.9,
    image: 'https://images.pokemontcg.io/sv6/logo.png',
    glyph: 'ETB',
    inStock: true,
    preorder: true,
    badge: {
      tone: 'sale',
      label: 'Précommande'
    },
    desc: "Coffret Dresseur d'Élite Mascarade Crépusculaire. Précommande."
  }];
  const FILTERS = [{
    key: 'all',
    label: 'Tout'
  }, {
    key: 'single',
    label: "Cartes à l'unité"
  }, {
    key: 'graded',
    label: 'Gradées PSA'
  }, {
    key: 'sealed',
    label: 'Scellé'
  }, {
    key: 'accessory',
    label: 'Accessoires'
  }];
  const K_OVR = 'lc151_overrides'; // { id: {price, oldPrice, inStock, badge} }
  const K_CUSTOM = 'lc151_custom'; // [ product, ... ]
  const K_WP = 'lc151_wp_url'; // WordPress / WooCommerce site URL
  const EDITABLE = ['price', 'oldPrice', 'inStock', 'badge'];
  function load(key, fallback) {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : fallback;
    } catch (e) {
      return fallback;
    }
  }
  function save(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {}
  }

  // ---- WordPress / WooCommerce ----
  // Reads the public WooCommerce Store API (no key needed):
  //   GET {site}/wp-json/wc/store/v1/products
  // Set the site URL in the back-office (admin.html) → « Connexion WordPress ».
  let wpUrl = '';
  try {
    wpUrl = localStorage.getItem(K_WP) || '';
  } catch (e) {}
  let wpProducts = [];
  let wpStatus = {
    state: wpUrl ? 'loading' : 'off',
    count: 0,
    error: ''
  }; // off|loading|ok|error

  function typeFromCategories(cats) {
    const s = (cats || []).map(c => (c.name || '').toLowerCase()).join(' ');
    if (/grad|psa|bgs|cgc/.test(s)) return 'graded';
    if (/scell|display|booster|coffret|etb|box|boîte/.test(s)) return 'sealed';
    if (/accessoir|sleeve|protège|classeur|toploader|tapis|deck box/.test(s)) return 'accessory';
    return 'single';
  }
  function mapWoo(p) {
    const minor = p.prices && p.prices.currency_minor_unit != null ? p.prices.currency_minor_unit : 2;
    const div = Math.pow(10, minor);
    const price = p.prices && p.prices.price != null ? Number(p.prices.price) / div : 0;
    const regular = p.prices && p.prices.regular_price != null ? Number(p.prices.regular_price) / div : price;
    const onSale = !!p.on_sale && regular > price;
    const cat = p.categories && p.categories[0] && p.categories[0].name || 'Carte';
    const img = p.images && p.images[0] && p.images[0].src || null;
    const strip = html => (html || '').replace(/<[^>]*>/g, '').trim();
    return {
      id: 'wp' + p.id,
      name: p.name,
      cat: cat,
      set: cat,
      num: p.sku || '—',
      type: typeFromCategories(p.categories),
      price: Math.round(price * 100) / 100,
      oldPrice: onSale ? Math.round(regular * 100) / 100 : undefined,
      image: img,
      inStock: p.is_in_stock !== false,
      badge: p.on_sale ? {
        tone: 'sale',
        label: 'Promo'
      } : undefined,
      rarity: '—',
      desc: strip(p.short_description) || strip(p.description),
      wp: true
    };
  }
  function refreshFromWp() {
    if (!wpUrl) {
      wpProducts = [];
      wpStatus = {
        state: 'off',
        count: 0,
        error: ''
      };
      rebuild();
      emitStore();
      return;
    }
    wpStatus = {
      state: 'loading',
      count: 0,
      error: ''
    };
    rebuild(); // drop demo data immediately → show loading, never demo cards
    emitStore();
    const base = wpUrl.replace(/\/+$/, '');
    fetch(base + '/wp-json/wc/store/v1/products?per_page=100').then(r => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(list => {
      wpProducts = (Array.isArray(list) ? list : []).map(mapWoo);
      wpStatus = {
        state: 'ok',
        count: wpProducts.length,
        error: ''
      };
      rebuild();
      emitStore();
    }).catch(err => {
      wpProducts = [];
      wpStatus = {
        state: 'error',
        count: 0,
        error: String(err.message || err)
      };
      rebuild();
      emitStore();
    });
  }

  // ---- Build live PRODUCTS = defaults (+overrides) ++ custom ----
  let overrides = load(K_OVR, {});
  let custom = load(K_CUSTOM, []);
  let PRODUCTS = [];
  function rebuild() {
    overrides = load(K_OVR, {});
    custom = load(K_CUSTOM, []);
    // ROOT-CAUSE FIX: demo seed data must appear ONLY when no real shop is
    // connected. Once a WooCommerce URL is configured, the catalogue is the
    // real products (+ owner-added) — demo cards never leak into production.
    const base = wpUrl ? wpProducts : DEFAULTS;
    const combined = base.concat(custom);
    const merged = combined.map(p => {
      const o = overrides[p.id] || {};
      const m = {
        ...p
      };
      EDITABLE.forEach(f => {
        if (f in o) m[f] = o[f];
      });
      return m;
    });
    // mutate in place so existing references stay valid
    PRODUCTS.length = 0;
    merged.forEach(p => PRODUCTS.push(p));
  }
  rebuild();
  if (wpUrl) refreshFromWp();

  // ---- product-change emitter ----
  const storeListeners = new Set();
  function emitStore() {
    storeListeners.forEach(fn => fn());
  }
  const Store = {
    all: () => PRODUCTS,
    get: id => PRODUCTS.find(p => p.id === id),
    subscribe(fn) {
      storeListeners.add(fn);
      return () => storeListeners.delete(fn);
    },
    update(id, field, value) {
      if (!EDITABLE.includes(field)) return;
      const isCustom = custom.some(c => c.id === id);
      if (isCustom) {
        const c = custom.find(x => x.id === id);
        if (c) c[field] = value;
        save(K_CUSTOM, custom);
      } else {
        overrides[id] = overrides[id] || {};
        overrides[id][field] = value;
        save(K_OVR, overrides);
      }
      rebuild();
      emitStore();
    },
    add(product) {
      const p = {
        id: 'c' + Date.now(),
        inStock: true,
        image: null,
        glyph: 'NOUVEAU',
        set: '—',
        num: '—',
        rarity: '—',
        desc: '',
        ...product
      };
      custom.push(p);
      save(K_CUSTOM, custom);
      rebuild();
      emitStore();
      return p.id;
    },
    remove(id) {
      custom = custom.filter(c => c.id !== id);
      save(K_CUSTOM, custom);
      if (overrides[id]) {
        delete overrides[id];
        save(K_OVR, overrides);
      }
      rebuild();
      emitStore();
    },
    resetAll() {
      overrides = {};
      custom = [];
      try {
        localStorage.removeItem(K_OVR);
        localStorage.removeItem(K_CUSTOM);
      } catch (e) {}
      rebuild();
      emitStore();
    },
    isCustom: id => custom.some(c => c.id === id),
    isModified: id => !!overrides[id],
    isUnique: id => isUnique(Store.get(id)),
    // ---- WordPress / WooCommerce ----
    getWpUrl: () => wpUrl,
    setWpUrl(url) {
      wpUrl = (url || '').trim();
      try {
        if (wpUrl) localStorage.setItem(K_WP, wpUrl);else localStorage.removeItem(K_WP);
      } catch (e) {}
      refreshFromWp();
    },
    refreshFromWp,
    wpStatus: () => wpStatus
  };

  // cross-tab / cross-page sync: admin edits → shop updates live
  window.addEventListener('storage', e => {
    if (e.key === K_OVR || e.key === K_CUSTOM) {
      rebuild();
      emitStore();
    }
  });

  // A single card or a graded card is a one-of-one: only ONE edition exists.
  function isUnique(p) {
    return !!p && (p.unique === true || p.type === 'single' || p.type === 'graded');
  }

  // ---- Cart store ----
  const cartListeners = new Set();
  const K_CART = 'lc151_cart';
  let cart = load(K_CART, []);
  function emitCart() {
    save(K_CART, cart);
    cartListeners.forEach(fn => fn());
  }
  const Cart = {
    items: () => cart,
    count: () => cart.reduce((s, l) => s + l.qty, 0),
    subtotal: () => cart.reduce((s, l) => {
      const p = Store.get(l.id);
      return s + (p ? p.price * l.qty : 0);
    }, 0),
    isUnique: id => isUnique(Store.get(id)),
    add(id, qty = 1) {
      const p = Store.get(id);
      if (!p) return; // never add an unknown / stale product
      const line = cart.find(l => l.id === id);
      if (isUnique(p)) {
        // unique edition — never more than 1 in the cart
        if (!line) cart.push({
          id,
          qty: 1
        });
      } else if (line) {
        line.qty += qty;
      } else {
        cart.push({
          id,
          qty
        });
      }
      emitCart();
    },
    setQty(id, qty) {
      const p = Store.get(id);
      const line = cart.find(l => l.id === id);
      if (line) {
        line.qty = isUnique(p) ? 1 : Math.max(1, qty);
        emitCart();
      }
    },
    remove(id) {
      cart = cart.filter(l => l.id !== id);
      emitCart();
    },
    clear() {
      cart = [];
      emitCart();
    },
    // Keep the cart consistent with the live catalogue (single source of truth):
    // drop lines whose product vanished, clamp unique lines to qty 1. Returns the
    // removed lines so the UI can notify the shopper.
    reconcile() {
      let changed = false;
      const removed = [];
      cart = cart.filter(l => {
        if (!Store.get(l.id)) {
          removed.push(l);
          changed = true;
          return false;
        }
        return true;
      });
      cart.forEach(l => {
        if (isUnique(Store.get(l.id)) && l.qty !== 1) {
          l.qty = 1;
          changed = true;
        }
      });
      if (changed) emitCart();
      return removed;
    },
    subscribe(fn) {
      cartListeners.add(fn);
      return () => cartListeners.delete(fn);
    }
  };

  // Cart self-heals whenever the catalogue changes (admin edit, WooCommerce
  // refresh, cross-tab delete) — a stale line can never reach render and crash.
  Store.subscribe(function () {
    Cart.reconcile();
  });
  const FREE_SHIP = 100;

  // ---- Auth (compte client) ----
  const K_USER = 'lc151_user';
  const K_ALERTS = 'lc151_alerts';
  let user = load(K_USER, null);
  const authListeners = new Set();
  const Auth = {
    user: () => user,
    isLoggedIn: () => !!user,
    login(email, name) {
      user = {
        email: email,
        name: name || (email ? email.split('@')[0] : 'Client')
      };
      save(K_USER, user);
      authListeners.forEach(fn => fn());
    },
    logout() {
      user = null;
      try {
        localStorage.removeItem(K_USER);
      } catch (e) {}
      authListeners.forEach(fn => fn());
    },
    setAddress(addr) {
      if (!user) return;
      user = {
        ...user,
        address: addr
      };
      save(K_USER, user);
      authListeners.forEach(fn => fn());
    },
    subscribe(fn) {
      authListeners.add(fn);
      return () => authListeners.delete(fn);
    }
  };

  // ---- Alerts (notifications produit — réservé aux comptes) ----
  // Curated product themes a client can watch (ETB, display, etc.) + free keywords.
  const ALERT_TOPICS = [{
    key: 'etb',
    label: "ETB — Coffret Dresseur d'Élite"
  }, {
    key: 'display',
    label: 'Display / Boîte de boosters'
  }, {
    key: 'coffret',
    label: 'Coffrets & Pokébox'
  }, {
    key: 'booster',
    label: 'Boosters à l\u2019unité'
  }, {
    key: 'graded',
    label: 'Cartes gradées PSA'
  }, {
    key: 'single',
    label: "Cartes à l'unité"
  }, {
    key: 'preorder',
    label: 'Précommandes & sorties'
  }, {
    key: 'accessory',
    label: 'Accessoires'
  }];
  let alerts = load(K_ALERTS, {
    topics: [],
    keywords: []
  });
  const alertListeners = new Set();
  function emitAlerts() {
    save(K_ALERTS, alerts);
    alertListeners.forEach(fn => fn());
  }
  const Alerts = {
    topics: () => ALERT_TOPICS,
    all: () => alerts,
    hasTopic: key => alerts.topics.indexOf(key) !== -1,
    toggleTopic(key) {
      const i = alerts.topics.indexOf(key);
      if (i === -1) alerts.topics.push(key);else alerts.topics.splice(i, 1);
      emitAlerts();
    },
    addKeyword(kw) {
      kw = (kw || '').trim();
      if (kw && alerts.keywords.indexOf(kw) === -1) {
        alerts.keywords.push(kw);
        emitAlerts();
      }
    },
    removeKeyword(kw) {
      alerts.keywords = alerts.keywords.filter(k => k !== kw);
      emitAlerts();
    },
    count: () => alerts.topics.length + alerts.keywords.length,
    subscribe(fn) {
      alertListeners.add(fn);
      return () => alertListeners.delete(fn);
    }
  };

  // ---- Orders (commandes passées) ----
  const K_ORDERS = 'lc151_orders';
  let orders = load(K_ORDERS, []);
  const orderListeners = new Set();
  const SHIPPING = {
    standard: {
      key: 'standard',
      label: 'Livraison standard',
      eta: '2–4 jours ouvrés',
      price: 4.9
    },
    relais: {
      key: 'relais',
      label: 'Point relais',
      eta: '3–5 jours ouvrés',
      price: 3.9
    },
    pickup: {
      key: 'pickup',
      label: 'Retrait en boutique (Vienne)',
      eta: 'Sous 24 h',
      price: 0
    }
  };
  const Orders = {
    methods: () => SHIPPING,
    shippingCost(methodKey, subtotal) {
      const m = SHIPPING[methodKey] || SHIPPING.standard;
      if (m.key === 'pickup') return 0;
      if (m.key === 'standard' && subtotal >= FREE_SHIP) return 0; // free over threshold
      return m.price;
    },
    all: () => orders,
    forUser(email) {
      return orders.filter(o => o.email === email);
    },
    add(order) {
      const num = 'LC151-' + Date.now().toString(36).toUpperCase().slice(-6);
      const full = {
        number: num,
        date: new Date().toISOString(),
        status: 'Confirmée',
        ...order
      };
      orders.unshift(full);
      save(K_ORDERS, orders);
      orderListeners.forEach(fn => fn());
      return full;
    },
    subscribe(fn) {
      orderListeners.add(fn);
      return () => orderListeners.delete(fn);
    }
  };
  window.LC151 = {
    PRODUCTS,
    FILTERS,
    Cart,
    Store,
    Auth,
    Alerts,
    Orders,
    FREE_SHIP,
    get: id => Store.get(id),
    fmt: n => new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(n) + ' €'
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/leclub151/data.js", error: String((e && e.message) || e) }); }

// ui_kits/leclub151/i18n.js
try { (() => {
/* leclub151 — i18n léger. Traduit le "chrome" présent sur toutes les pages
   (bandeau, navigation, footer, réassurance). Le choix persiste et déclenche
   un re-rendu via l'événement 'lc151:lang'. Le corps produit (descriptions,
   fiches) reste géré côté contenu (WordPress/WPML en production). */
(function () {
  var DICT = {
    fr: {
      ann_free: 'Livraison offerte dès 100 € · Authentification garantie',
      ann_contact: 'Nous contacter',
      ann_login: 'Connexion',
      search_ph: 'Rechercher une carte, une série, un coffret…',
      ok: 'OK',
      nav_home: 'Accueil',
      nav_single: "Cartes à l'unité",
      nav_graded: 'Cartes gradées',
      nav_sealed: 'Scellé',
      nav_accessory: 'Accessoires',
      nav_preorder: 'Précommande',
      nav_catalogue: 'Toute la boutique',
      h_cart: 'Panier',
      h_account: 'Mon compte',
      f_buy: 'Acheter',
      f_house: 'La maison',
      f_account: 'Compte',
      f_displays: 'Displays scellés',
      f_preorders: 'Précommandes',
      f_boutique: 'La boutique',
      f_auth: 'Authentification',
      f_about: 'À propos',
      f_news: 'Actualités',
      f_events: 'Évènements',
      f_orders: 'Mes commandes',
      f_addresses: 'Mes adresses',
      f_alerts: 'Mes alertes',
      f_desc: 'La boutique des collectionneurs Pokémon, à Vienne. On déniche, on authentifie et on conseille.',
      f_copyright: '© 2026 leclub151. Tous droits réservés.',
      f_cookies: 'Utilisation des cookies',
      f_terms: "Conditions d'utilisation",
      f_privacy: 'Politique de confidentialité',
      f_soon: 'Disponible prochainement',
      r_auth_t: 'Authentification garantie',
      r_auth_s: 'Chaque pièce vérifiée',
      r_ship_t: 'Livraison offerte',
      r_ship_s: 'Dès 100 € d’achat',
      r_pay_t: 'Paiement sécurisé',
      r_pay_s: 'CB · PayPal · Apple Pay'
    },
    en: {
      ann_free: 'Free shipping over €100 · Authenticity guaranteed',
      ann_contact: 'Contact us',
      ann_login: 'Sign in',
      search_ph: 'Search a card, a set, a box…',
      ok: 'GO',
      nav_home: 'Home',
      nav_single: 'Single cards',
      nav_graded: 'Graded cards',
      nav_sealed: 'Sealed',
      nav_accessory: 'Accessories',
      nav_preorder: 'Pre-order',
      nav_catalogue: 'Shop all',
      h_cart: 'Cart',
      h_account: 'My account',
      f_buy: 'Shop',
      f_house: 'The shop',
      f_account: 'Account',
      f_displays: 'Sealed displays',
      f_preorders: 'Pre-orders',
      f_boutique: 'Our store',
      f_auth: 'Authentication',
      f_about: 'About',
      f_news: 'News',
      f_events: 'Events',
      f_orders: 'My orders',
      f_addresses: 'My addresses',
      f_alerts: 'My alerts',
      f_desc: 'The Pokémon collectors’ shop in Vienne, France. We source, authenticate and advise.',
      f_copyright: '© 2026 leclub151. All rights reserved.',
      f_cookies: 'Cookie usage',
      f_terms: 'Terms of use',
      f_privacy: 'Privacy policy',
      f_soon: 'Coming soon',
      r_auth_t: 'Authenticity guaranteed',
      r_auth_s: 'Every item verified',
      r_ship_t: 'Free shipping',
      r_ship_s: 'On orders over €100',
      r_pay_t: 'Secure payment',
      r_pay_s: 'Card · PayPal · Apple Pay'
    },
    es: {
      ann_free: 'Envío gratis desde 100 € · Autenticidad garantizada',
      ann_contact: 'Contáctanos',
      ann_login: 'Iniciar sesión',
      search_ph: 'Buscar una carta, una serie, una caja…',
      ok: 'IR',
      nav_home: 'Inicio',
      nav_single: 'Cartas sueltas',
      nav_graded: 'Cartas gradadas',
      nav_sealed: 'Sellado',
      nav_accessory: 'Accesorios',
      nav_preorder: 'Reserva',
      nav_catalogue: 'Toda la tienda',
      h_cart: 'Cesta',
      h_account: 'Mi cuenta',
      f_buy: 'Comprar',
      f_house: 'La tienda',
      f_account: 'Cuenta',
      f_displays: 'Displays sellados',
      f_preorders: 'Reservas',
      f_boutique: 'Nuestra tienda',
      f_auth: 'Autenticación',
      f_about: 'Quiénes somos',
      f_news: 'Noticias',
      f_events: 'Eventos',
      f_orders: 'Mis pedidos',
      f_addresses: 'Mis direcciones',
      f_alerts: 'Mis alertas',
      f_desc: 'La tienda de coleccionistas Pokémon en Vienne, Francia. Buscamos, autentificamos y asesoramos.',
      f_copyright: '© 2026 leclub151. Todos los derechos reservados.',
      f_cookies: 'Uso de cookies',
      f_terms: 'Condiciones de uso',
      f_privacy: 'Política de privacidad',
      f_soon: 'Próximamente',
      r_auth_t: 'Autenticidad garantizada',
      r_auth_s: 'Cada pieza verificada',
      r_ship_t: 'Envío gratis',
      r_ship_s: 'Desde 100 € de compra',
      r_pay_t: 'Pago seguro',
      r_pay_s: 'Tarjeta · PayPal · Apple Pay'
    },
    de: {
      ann_free: 'Kostenloser Versand ab 100 € · Echtheit garantiert',
      ann_contact: 'Kontakt',
      ann_login: 'Anmelden',
      search_ph: 'Karte, Serie oder Box suchen…',
      ok: 'LOS',
      nav_home: 'Start',
      nav_single: 'Einzelkarten',
      nav_graded: 'Gegradete Karten',
      nav_sealed: 'Versiegelt',
      nav_accessory: 'Zubehör',
      nav_preorder: 'Vorbestellung',
      nav_catalogue: 'Ganzer Shop',
      h_cart: 'Warenkorb',
      h_account: 'Mein Konto',
      f_buy: 'Kaufen',
      f_house: 'Der Laden',
      f_account: 'Konto',
      f_displays: 'Versiegelte Displays',
      f_preorders: 'Vorbestellungen',
      f_boutique: 'Unser Laden',
      f_auth: 'Authentifizierung',
      f_about: 'Über uns',
      f_news: 'Neuigkeiten',
      f_events: 'Events',
      f_orders: 'Meine Bestellungen',
      f_addresses: 'Meine Adressen',
      f_alerts: 'Meine Alerts',
      f_desc: 'Der Pokémon-Sammlerladen in Vienne, Frankreich. Wir beschaffen, prüfen und beraten.',
      f_copyright: '© 2026 leclub151. Alle Rechte vorbehalten.',
      f_cookies: 'Cookie-Nutzung',
      f_terms: 'Nutzungsbedingungen',
      f_privacy: 'Datenschutz',
      f_soon: 'Demnächst',
      r_auth_t: 'Echtheit garantiert',
      r_auth_s: 'Jedes Stück geprüft',
      r_ship_t: 'Kostenloser Versand',
      r_ship_s: 'Ab 100 € Bestellwert',
      r_pay_t: 'Sichere Zahlung',
      r_pay_s: 'Karte · PayPal · Apple Pay'
    },
    it: {
      ann_free: 'Spedizione gratis da 100 € · Autenticità garantita',
      ann_contact: 'Contattaci',
      ann_login: 'Accedi',
      search_ph: 'Cerca una carta, un set, una box…',
      ok: 'VAI',
      nav_home: 'Home',
      nav_single: 'Carte singole',
      nav_graded: 'Carte gradate',
      nav_sealed: 'Sigillato',
      nav_accessory: 'Accessori',
      nav_preorder: 'Preordine',
      nav_catalogue: 'Tutto lo shop',
      h_cart: 'Carrello',
      h_account: 'Il mio account',
      f_buy: 'Acquista',
      f_house: 'Il negozio',
      f_account: 'Account',
      f_displays: 'Display sigillati',
      f_preorders: 'Preordini',
      f_boutique: 'Il negozio',
      f_auth: 'Autenticazione',
      f_about: 'Chi siamo',
      f_news: 'Novità',
      f_events: 'Eventi',
      f_orders: 'I miei ordini',
      f_addresses: 'I miei indirizzi',
      f_alerts: 'I miei avvisi',
      f_desc: 'Il negozio per collezionisti Pokémon a Vienne, Francia. Cerchiamo, autentichiamo e consigliamo.',
      f_copyright: '© 2026 leclub151. Tutti i diritti riservati.',
      f_cookies: 'Uso dei cookie',
      f_terms: 'Condizioni d’uso',
      f_privacy: 'Informativa sulla privacy',
      f_soon: 'Prossimamente',
      r_auth_t: 'Autenticità garantita',
      r_auth_s: 'Ogni pezzo verificato',
      r_ship_t: 'Spedizione gratuita',
      r_ship_s: 'Da 100 € di spesa',
      r_pay_t: 'Pagamento sicuro',
      r_pay_s: 'Carta · PayPal · Apple Pay'
    },
    nl: {
      ann_free: 'Gratis verzending vanaf €100 · Echtheid gegarandeerd',
      ann_contact: 'Contact',
      ann_login: 'Inloggen',
      search_ph: 'Zoek een kaart, set of box…',
      ok: 'GA',
      nav_home: 'Home',
      nav_single: 'Losse kaarten',
      nav_graded: 'Graded kaarten',
      nav_sealed: 'Verzegeld',
      nav_accessory: 'Accessoires',
      nav_preorder: 'Pre-order',
      nav_catalogue: 'Hele shop',
      h_cart: 'Winkelwagen',
      h_account: 'Mijn account',
      f_buy: 'Kopen',
      f_house: 'De winkel',
      f_account: 'Account',
      f_displays: 'Verzegelde displays',
      f_preorders: 'Pre-orders',
      f_boutique: 'Onze winkel',
      f_auth: 'Authenticatie',
      f_about: 'Over ons',
      f_news: 'Nieuws',
      f_events: 'Evenementen',
      f_orders: 'Mijn bestellingen',
      f_addresses: 'Mijn adressen',
      f_alerts: 'Mijn meldingen',
      f_desc: 'De Pokémon-verzamelwinkel in Vienne, Frankrijk. Wij zoeken, verifiëren en adviseren.',
      f_copyright: '© 2026 leclub151. Alle rechten voorbehouden.',
      f_cookies: 'Cookiegebruik',
      f_terms: 'Gebruiksvoorwaarden',
      f_privacy: 'Privacybeleid',
      f_soon: 'Binnenkort',
      r_auth_t: 'Echtheid gegarandeerd',
      r_auth_s: 'Elk stuk geverifieerd',
      r_ship_t: 'Gratis verzending',
      r_ship_s: 'Vanaf €100 besteld',
      r_pay_t: 'Veilig betalen',
      r_pay_s: 'Kaart · PayPal · Apple Pay'
    }
  };
  function getLang() {
    try {
      return localStorage.getItem('lc151_lang') || 'fr';
    } catch (e) {
      return 'fr';
    }
  }
  function setLang(code) {
    if (!DICT[code]) return;
    try {
      localStorage.setItem('lc151_lang', code);
    } catch (e) {}
    document.documentElement.setAttribute('lang', code);
    window.dispatchEvent(new CustomEvent('lc151:lang', {
      detail: code
    }));
  }
  function t(key) {
    var lang = getLang();
    return DICT[lang] && DICT[lang][key] || DICT.fr[key] || key;
  }
  // apply saved lang attribute on load
  try {
    document.documentElement.setAttribute('lang', getLang());
  } catch (e) {}
  window.lcI18n = {
    DICT: DICT,
    t: t,
    getLang: getLang,
    setLang: setLang,
    langs: [['fr', 'Français', '🇫🇷'], ['en', 'English', '🇬🇧'], ['es', 'Español', '🇪🇸'], ['de', 'Deutsch', '🇩🇪'], ['it', 'Italiano', '🇮🇹'], ['nl', 'Nederlands', '🇳🇱']]
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/leclub151/i18n.js", error: String((e && e.message) || e) }); }

// ui_kits/leclub151/reveal.js
try { (() => {
/* leclub151 — section entrance is now CSS-only (storefront.css @keyframes lcRise),
   which can never leave content stuck hidden. This file is intentionally a no-op,
   kept so existing <script src="reveal.js"> tags resolve. */
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/leclub151/reveal.js", error: String((e && e.message) || e) }); }

__ds_ns.QtyStepper = __ds_scope.QtyStepper;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.PriceTag = __ds_scope.PriceTag;

__ds_ns.ProductCard = __ds_scope.ProductCard;

})();
