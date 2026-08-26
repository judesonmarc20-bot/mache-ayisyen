const Coupon = require('../models/Coupon');
const Store = require('../models/Store');

// Valide yon kòd koupon kont yon sou-total.
exports.validate = async (req, res) => {
  const { code, subtotal } = req.body;
  if (!code) return res.status(400).json({ error: 'Antre yon kòd koupon.' });
  const result = await Coupon.validate(code, Number(subtotal) || 0);
  if (!result.valid) return res.status(400).json({ error: result.error });
  res.json({
    valid: true,
    discount: result.discount,
    code: result.coupon.code,
    type: result.coupon.type,
    value: result.coupon.value,
  });
};

// Lis koupon: admin wè tout; vandè wè sèlman pa magazen li.
exports.list = async (req, res) => {
  if (req.user.role === 'ADMIN') {
    return res.json({ coupons: await Coupon.listAll() });
  }
  const store = await Store.findByOwnerId(req.user.id);
  res.json({ coupons: store ? await Coupon.listByStore(store.id) : [] });
};

exports.create = async (req, res) => {
  const { code, type, value, minOrder, maxUses, expiresAt } = req.body;
  if (!code || value == null) {
    return res.status(400).json({ error: 'Kòd ak valè rabè obligatwa.' });
  }
  if (await Coupon.findByCode(code)) {
    return res.status(409).json({ error: 'Yon koupon ak kòd sa a deja egziste.' });
  }
  let storeId = null;
  if (req.user.role === 'VENDOR') {
    const store = await Store.findByOwnerId(req.user.id);
    if (!store) return res.status(400).json({ error: 'Ou pa gen yon magazen.' });
    storeId = store.id;
  }
  const coupon = await Coupon.create({
    code,
    type: type === 'FIXED' ? 'FIXED' : 'PERCENT',
    value: Number(value),
    minOrder: Number(minOrder) || 0,
    maxUses: maxUses ? Number(maxUses) : null,
    storeId,
    expiresAt: expiresAt || null,
  });
  res.status(201).json({ coupon });
};

async function assertOwner(req, res, coupon) {
  if (!coupon) {
    res.status(404).json({ error: 'Koupon pa jwenn.' });
    return false;
  }
  if (req.user.role === 'ADMIN') return true;
  const store = await Store.findByOwnerId(req.user.id);
  if (!store || coupon.storeId !== store.id) {
    res.status(403).json({ error: 'Koupon sa a pa pou ou.' });
    return false;
  }
  return true;
}

exports.toggle = async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!(await assertOwner(req, res, coupon))) return;
  const updated = await Coupon.setActive(req.params.id, !coupon.active);
  res.json({ coupon: updated });
};

exports.remove = async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!(await assertOwner(req, res, coupon))) return;
  await Coupon.delete(req.params.id);
  res.status(204).end();
};
