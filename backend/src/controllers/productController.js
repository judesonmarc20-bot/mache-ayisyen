const Product = require('../models/Product');
const Store = require('../models/Store');

exports.list = async (req, res) => {
  const { storeId, categoryId, search } = req.query;
  const products = await Product.list({ storeId, categoryId, search, activeOnly: true });
  res.json({ products });
};

exports.get = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ error: 'Pwodwi pa jwenn.' });
  res.json({ product });
};

// Vandè kreye yon pwodwi pou PWÒP magazen li sèlman.
exports.create = async (req, res) => {
  const store = await Store.findByOwnerId(req.user.id);
  if (!store) return res.status(400).json({ error: 'Ou pa gen yon magazen ankò.' });

  const { name, description, price, imageUrl, stock, categoryId } = req.body;
  if (!name || !description || price == null) {
    return res.status(400).json({ error: 'Non, deskripsyon ak pri obligatwa.' });
  }

  const product = await Product.create({
    name,
    description,
    price: Number(price),
    imageUrl,
    stock: Number(stock) || 0,
    storeId: store.id,
    categoryId: categoryId || null,
  });
  res.status(201).json({ product });
};

async function assertOwnership(req, res, product) {
  if (!product) {
    res.status(404).json({ error: 'Pwodwi pa jwenn.' });
    return false;
  }
  if (req.user.role === 'ADMIN') return true;
  const store = await Store.findByOwnerId(req.user.id);
  if (!store || store.id !== product.storeId) {
    res.status(403).json({ error: 'Pwodwi sa a pa pou ou.' });
    return false;
  }
  return true;
}

exports.update = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!(await assertOwnership(req, res, product))) return;
  const updated = await Product.update(req.params.id, req.body);
  res.json({ product: updated });
};

exports.remove = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!(await assertOwnership(req, res, product))) return;
  await Product.delete(req.params.id);
  res.status(204).end();
};

// Lis pwodwi pwòp magazen vandè a (pou dashboard vandè a).
exports.myProducts = async (req, res) => {
  const store = await Store.findByOwnerId(req.user.id);
  if (!store) return res.json({ products: [] });
  const products = await Product.list({ storeId: store.id, activeOnly: false });
  res.json({ products });
};
