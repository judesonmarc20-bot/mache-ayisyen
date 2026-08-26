const ShippingZone = require('../models/ShippingZone');

exports.listPublic = async (req, res) => {
  res.json({ zones: await ShippingZone.listActive() });
};

exports.listAll = async (req, res) => {
  res.json({ zones: await ShippingZone.listAll() });
};

exports.create = async (req, res) => {
  const { name, fee } = req.body;
  if (!name || fee == null) return res.status(400).json({ error: 'Non ak frè obligatwa.' });
  res.status(201).json({ zone: await ShippingZone.create({ name, fee: Number(fee) }) });
};

exports.update = async (req, res) => {
  const zone = await ShippingZone.update(req.params.id, req.body);
  if (!zone) return res.status(404).json({ error: 'Zòn pa jwenn.' });
  res.json({ zone });
};

exports.remove = async (req, res) => {
  await ShippingZone.delete(req.params.id);
  res.status(204).end();
};
