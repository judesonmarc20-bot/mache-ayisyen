const Order = require('../models/Order');
const Store = require('../models/Store');

// Kreye yon kòmand PENDING (san peman ankò). Frontend la ap rele
// /api/payments/moncash/initiate (oswa /stripe) touswit apre pou peman an.
exports.checkout = async (req, res) => {
  try {
    const { shippingZoneId, couponCode, paymentMethod } = req.body || {};
    const order = await Order.createPending(req.user.id, {
      shippingZoneId,
      couponCode,
      paymentMethod,
    });
    res.status(201).json({ order });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.myOrders = async (req, res) => {
  res.json({ orders: await Order.listByUser(req.user.id) });
};

// Vandè: wè kòmand ki gen pwodwi ki soti nan pwòp magazen li.
exports.storeOrders = async (req, res) => {
  const store = await Store.findByOwnerId(req.user.id);
  if (!store) return res.json({ orders: [] });
  res.json({ orders: await Order.listByStore(store.id) });
};

// Admin: wè TOUT kòmand sou platfòm lan.
exports.allOrders = async (req, res) => {
  res.json({ orders: await Order.listAll() });
};

exports.updateStatus = async (req, res) => {
  const { status } = req.body;
  const allowed = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
  if (!allowed.includes(status)) return res.status(400).json({ error: 'Estati envalid.' });
  const order = await Order.updateStatus(req.params.id, status);
  res.json({ order });
};
