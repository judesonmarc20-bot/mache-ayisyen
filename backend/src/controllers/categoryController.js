const Category = require('../models/Category');

exports.list = async (req, res) => {
  res.json({ categories: await Category.listAll() });
};

exports.create = async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Non kategori a obligatwa.' });
  res.status(201).json({ category: await Category.create({ name }) });
};
