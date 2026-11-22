// Faux module « stripe » pour les tests (jamais chargé en production).
// Il reproduit ce que le site utilise de la vraie bibliothèque :
//  - paymentIntents.create / retrieve / update (en mémoire, avec clé d'idempotence) ;
//  - webhooks.constructEvent, avec le VRAI schéma de signature de Stripe :
//    en-tête « t=<horodatage>,v1=<HMAC-SHA256 de "t.corps" avec le secret> »,
//    tolérance de 5 minutes.
const crypto = require('crypto');

const store = { intents: {}, byKey: {}, n: 0, createCalls: [], updateCalls: [] };

function sign(payload, secret, t) {
  const ts = t || Math.floor(Date.now() / 1000);
  const v1 = crypto.createHmac('sha256', secret).update(ts + '.' + payload).digest('hex');
  return 't=' + ts + ',v1=' + v1;
}

function Stripe(secretKey) {
  return {
    paymentIntents: {
      async create(params, opts) {
        const key = opts && opts.idempotencyKey;
        if (key && store.byKey[key]) return store.byKey[key];
        store.n += 1;
        const id = 'pi_test' + String(store.n).padStart(12, '0');
        const pi = { id: id, client_secret: id + '_secret_test', amount: params.amount, currency: params.currency,
          receipt_email: params.receipt_email, shipping: params.shipping, status: 'requires_payment_method',
          metadata: Object.assign({}, params.metadata), livemode: !/^sk_test_/.test(String(secretKey)) };
        store.intents[id] = pi;
        if (key) store.byKey[key] = pi;
        store.createCalls.push({ params: params, key: key });
        return pi;
      },
      async retrieve(id) {
        if (!store.intents[id]) { const e = new Error('No such payment_intent: ' + id); e.code = 'resource_missing'; throw e; }
        return store.intents[id];
      },
      async update(id, patch) {
        if (!store.intents[id]) throw new Error('No such payment_intent: ' + id);
        Object.assign(store.intents[id].metadata, (patch && patch.metadata) || {});
        store.updateCalls.push({ id: id, patch: patch });
        return store.intents[id];
      },
    },
    checkout: { sessions: { async create() { throw new Error('non simulé'); }, async retrieve() { throw new Error('non simulé'); } } },
    coupons: { async create() { return { id: 'coupon_test' }; } },
    webhooks: {
      constructEvent(raw, header, secret) {
        const payload = Buffer.isBuffer(raw) ? raw.toString('utf8') : String(raw);
        const parts = {};
        String(header || '').split(',').forEach(function (kv) { const i = kv.indexOf('='); if (i > 0) parts[kv.slice(0, i)] = kv.slice(i + 1); });
        if (!parts.t || !parts.v1) throw new Error('Unable to extract timestamp and signatures from header');
        const expected = crypto.createHmac('sha256', secret).update(parts.t + '.' + payload).digest('hex');
        const a = Buffer.from(expected); const b = Buffer.from(String(parts.v1));
        if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
          throw new Error('No signatures found matching the expected signature for payload');
        }
        if (Math.abs(Date.now() / 1000 - Number(parts.t)) > 300) throw new Error('Timestamp outside the tolerance zone');
        return JSON.parse(payload);
      },
    },
  };
}
Stripe.__store = store;
Stripe.__sign = sign;
module.exports = Stripe;
