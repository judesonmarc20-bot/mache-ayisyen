const router = require('express').Router();
const ctrl = require('../controllers/productController');
const reviewCtrl = require('../controllers/reviewController');
const { requireAuth, requireRole, optionalAuth } = require('../middleware/auth');

router.get('/', ctrl.list);
router.get('/mine', requireAuth, requireRole('VENDOR'), ctrl.myProducts);
router.get('/:id', ctrl.get);
router.post('/', requireAuth, requireRole('VENDOR'), ctrl.create);
router.put('/:id', requireAuth, requireRole('VENDOR', 'ADMIN'), ctrl.update);
router.delete('/:id', requireAuth, requireRole('VENDOR', 'ADMIN'), ctrl.remove);

// Reviews pou yon pwodwi
router.get('/:id/reviews', optionalAuth, reviewCtrl.listForProduct);
router.post('/:id/reviews', requireAuth, reviewCtrl.create);

module.exports = router;
