const Store = require('../models/Store');

exports.listPublic = async (req, res) => {
  res.json({ stores: await Store.listActive() });
};

exports.getBySlug = async (req, res) => {
  const store = await Store.findBySlug(req.params.slug);
  if (!store) return res.status(404).json({ error: 'Magazen pa jwenn.' });
  res.json({ store });
};

exports.myStore = async (req, res) => {
  const store = await Store.findByOwnerId(req.user.id);
  res.json({ store });
};

exports.updateMyStore = async (req, res) => {
  const store = await Store.findByOwnerId(req.user.id);
  if (!store) return res.status(404).json({ error: 'Ou pa gen yon magazen.' });
  const updated = await Store.update(store.id, req.body);
  res.json({ store: updated });
};

// Admin: wè tout magazen yo, oswa aktive/dezaktive nenpòt magazen.
exports.listAll = async (req, res) => {
  res.json({ stores: await Store.listAll() });
};

exports.setActive = async (req, res) => {
  const updated = await Store.update(req.params.id, { active: !!req.body.active });
  if (!updated) return res.status(404).json({ error: 'Magazen pa jwenn.' });
  res.json({ store: updated });
};
