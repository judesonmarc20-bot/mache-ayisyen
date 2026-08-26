// =========================================================================
// stripe.js — Kliyan pou peman ak kat kredi/debi (pou dyaspora a)
// =========================================================================
// Nou itilize "Stripe Checkout": nou kreye yon "session" epi nou redirije
// kliyan an sou paj sekirize Stripe la kote li antre enfòmasyon kat li
// (nou pa janm wè/manyen nimewo kat la -- se Stripe ki jere sa). Apre,
// nou verifye bò sèvè si peman an reyisi anvan nou make kòmand lan PAID.
//
// Pri yo estoke an GOUD (HTG). Stripe pa toujou sipòte HTG, e dyaspora a
// abitye peye an DOLA. Kidonk nou konvèti total la an USD ak yon to chanj
// ki konfigire (GOURDES_PER_USD nan .env). Ajiste to a selon mache a.
// =========================================================================
let stripeClient = null;

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      'STRIPE_SECRET_KEY pa konfigire nan backend/.env — ale jwenn li sou ' +
        'https://dashboard.stripe.com/apikeys (gen yon mòd "test" gratis).'
    );
  }
  if (!stripeClient) {
    // require anndan fonksyon an pou aplikasyon an pa krache si pakè a absan
    const Stripe = require('stripe');
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}

function gourdesToUsdCents(gourdes) {
  const rate = Number(process.env.GOURDES_PER_USD) || 132;
  return Math.round((gourdes / rate) * 100);
}

// Kreye yon sesyon Checkout pou yon kòmand. Retounen URL redireksyon an.
async function createCheckoutSession({ order, successUrl, cancelUrl }) {
  const stripe = getStripe();
  const currency = (process.env.STRIPE_CURRENCY || 'usd').toLowerCase();

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency,
          product_data: { name: `Kòmand Mache Ayisyen #${order.id.slice(0, 8)}` },
          unit_amount: gourdesToUsdCents(order.total),
        },
        quantity: 1,
      },
    ],
    // Nou pase orderId nan URL siksè a AK nan metadata pou verifikasyon.
    success_url: `${successUrl}?orderId=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl,
    metadata: { orderId: order.id },
  });

  return { url: session.url, sessionId: session.id };
}

// Verifye si yon sesyon Checkout fin peye.
async function retrieveSession(sessionId) {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  return {
    paid: session.payment_status === 'paid',
    orderId: session.metadata?.orderId,
    paymentIntent: session.payment_intent,
  };
}

module.exports = { createCheckoutSession, retrieveSession };
