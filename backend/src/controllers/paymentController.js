// =========================================================================
// paymentController.js — Kontwole peman (MonCash + Stripe kat)
// =========================================================================
const moncash = require('../utils/moncash');
const stripe = require('../utils/stripe');
const Order = require('../models/Order');
const Payment = require('../models/Payment');

// POST /api/payments/moncash/initiate  { orderId }
// Kreye yon peman MonCash pou yon kòmand PENDING ki apatyen a itilizatè
// konekte a, epi retounen lyen (redirectUrl) pou navigatè a redirije
// kliyan an sou paj MonCash la (kote li antre telefòn + PIN li).
exports.initiate = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order || order.userId !== req.user.id) {
      return res.status(404).json({ error: 'Kòmand pa jwenn.' });
    }
    if (order.status === 'PAID') {
      return res.status(400).json({ error: 'Kòmand sa a deja peye.' });
    }

    // ID nimerik nou envante pou MonCash (diferan de UUID kòmand nou an).
    const moncashOrderId = `${Date.now()}${Math.floor(Math.random() * 900 + 100)}`;

    const payment = await moncash.createPayment({
      amount: order.total,
      moncashOrderId,
    });

    await Payment.create({ orderId: order.id, moncashOrderId });

    res.json({ redirectUrl: payment.redirectUrl, orderId: order.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Erè pandan n ap kòmanse peman an." });
  }
};

// POST /api/payments/moncash/verify  { orderId }
// Rele apre kliyan an tounen soti sou paj MonCash la (swa li fin peye,
// swa li anile). Nou verifye DIRÈKTEMAN bò kote MonCash si peman an
// reyèlman reyisi anvan nou make kòmand lan PAID -- nou pa janm fè
// konfyans a sa navigatè a di san verifikasyon sèvè-a-sèvè.
exports.verify = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order || order.userId !== req.user.id) {
      return res.status(404).json({ error: 'Kòmand pa jwenn.' });
    }
    if (order.status === 'PAID') {
      return res.json({ status: 'PAID', order });
    }

    const payment = await Payment.findLatestByOrderId(orderId);
    if (!payment) {
      return res.status(400).json({ error: 'Pa gen tantativ peman pou kòmand sa a.' });
    }

    const result = await moncash.retrieveOrderPayment(payment.moncashOrderId);

    if (result.success) {
      await Payment.markCompleted(payment.moncashOrderId, {
        transactionId: result.transactionId,
        payerPhone: result.payer,
      });
      const updated = await Order.markPaid(orderId);
      return res.json({ status: 'PAID', order: updated });
    }

    return res.json({ status: 'PENDING', message: 'Peman an poko konfime.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Erè pandan verifikasyon peman an.' });
  }
};

// ---- STRIPE (peman kat pou dyaspora) ----

// POST /api/payments/stripe/initiate  { orderId }
// Kreye yon sesyon Stripe Checkout epi retounen URL pou redirije kliyan an.
exports.stripeInitiate = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order || order.userId !== req.user.id) {
      return res.status(404).json({ error: 'Kòmand pa jwenn.' });
    }
    if (order.status === 'PAID') {
      return res.status(400).json({ error: 'Kòmand sa a deja peye.' });
    }

    const base = process.env.FRONTEND_URL || 'http://localhost:5173';
    const session = await stripe.createCheckoutSession({
      order,
      successUrl: `${base}/payment/return`,
      cancelUrl: `${base}/cart`,
    });

    res.json({ redirectUrl: session.url, orderId: order.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Erè pandan n ap kòmanse peman kat la." });
  }
};

// POST /api/payments/stripe/verify  { orderId, sessionId }
exports.stripeVerify = async (req, res) => {
  try {
    const { orderId, sessionId } = req.body;
    const order = await Order.findById(orderId);
    if (!order || order.userId !== req.user.id) {
      return res.status(404).json({ error: 'Kòmand pa jwenn.' });
    }
    if (order.status === 'PAID') {
      return res.json({ status: 'PAID', order });
    }
    if (!sessionId) {
      return res.status(400).json({ error: 'Pa gen sesyon peman pou verifye.' });
    }

    const result = await stripe.retrieveSession(sessionId);
    // Sekirite: sesyon an dwe koresponn ak kòmand sa a EPI dwe fin peye.
    if (result.paid && result.orderId === orderId) {
      const updated = await Order.markPaid(orderId);
      return res.json({ status: 'PAID', order: updated });
    }

    return res.json({ status: 'PENDING', message: 'Peman kat la poko konfime.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Erè pandan verifikasyon peman kat la.' });
  }
};
