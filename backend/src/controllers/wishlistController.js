const Wishlist = require('../models/Wishlist');

exports.list = async (req, res) => {
  res.json({ items: await Wishlist.list(req.user.id) });
};

exports.ids = async (req, res) => {
  res.json({ productIds: await Wishlist.productIds(req.user.id) });
};

exports.add = async (req, res) => {
  const { productId } = req.body;
  if (!productId) return res.status(400).json({ error: 'productId obligatwa.' });
  await Wishlist.add(req.user.id, productId);
  res.status(201).json({ productIds: await Wishlist.productIds(req.user.id) });
};

exports.remove = async (req, res) => {
  await Wishlist.remove(req.user.id, req.params.productId);
  res.json({ productIds: await Wishlist.productIds(req.user.id) });
};
