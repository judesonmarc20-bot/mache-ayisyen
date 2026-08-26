const Cart = require('../models/Cart');

exports.get = async (req, res) => {
  res.json({ items: await Cart.getItems(req.user.id) });
};

exports.add = async (req, res) => {
  const { productId, quantity } = req.body;
  if (!productId) return res.status(400).json({ error: 'productId obligatwa.' });
  const items = await Cart.addItem(req.user.id, productId, Number(quantity) || 1);
  res.status(201).json({ items });
};

exports.updateItem = async (req, res) => {
  const { quantity } = req.body;
  const items = await Cart.updateQuantity(req.user.id, req.params.itemId, Number(quantity));
  res.json({ items });
};

exports.removeItem = async (req, res) => {
  const items = await Cart.removeItem(req.user.id, req.params.itemId);
  res.json({ items });
};
