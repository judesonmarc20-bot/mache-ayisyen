const router = require('express').Router();
const ctrl = require('../controllers/orderController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.use(requireAuth);
router.post('/checkout', ctrl.checkout);
router.get('/mine', ctrl.myOrders);
router.get('/store', requireRole('VENDOR'), ctrl.storeOrders);
router.get('/all', requireRole('ADMIN'), ctrl.allOrders);
router.put('/:id/status', requireRole('VENDOR', 'ADMIN'), ctrl.updateStatus);

module.exports = router;
