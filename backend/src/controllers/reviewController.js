const Review = require('../models/Review');
const Product = require('../models/Product');

// Lis review pou yon pwodwi (piblik) + rezime + èske itilizatè konekte a gen
// dwa/deja bay review.
exports.listForProduct = async (req, res) => {
  const productId = req.params.id;
  const reviews = await Review.listByProduct(productId);
  const summary = await Review.summary(productId);

  let canReview = false;
  let hasReviewed = false;
  if (req.user) {
    hasReviewed = await Review.hasReviewed(req.user.id, productId);
    canReview = !hasReviewed && (await Review.canReview(req.user.id, productId));
  }

  res.json({ reviews, summary, canReview, hasReviewed });
};

exports.create = async (req, res) => {
  const productId = req.params.id;
  const { rating, comment } = req.body;

  if (!(await Product.findById(productId))) {
    return res.status(404).json({ error: 'Pwodwi pa jwenn.' });
  }
  const r = Number(rating);
  if (!r || r < 1 || r > 5) {
    return res.status(400).json({ error: 'Zetwal la dwe ant 1 ak 5.' });
  }
  if (!(await Review.canReview(req.user.id, productId))) {
    return res
      .status(403)
      .json({ error: 'Ou dwe achte epi resevwa pwodwi sa a anvan ou ka evalye l.' });
  }
  if (await Review.hasReviewed(req.user.id, productId)) {
    return res.status(409).json({ error: 'Ou deja bay yon evalyasyon pou pwodwi sa a.' });
  }

  const review = await Review.create({ userId: req.user.id, productId, rating: r, comment });
  res.status(201).json({ review });
};
