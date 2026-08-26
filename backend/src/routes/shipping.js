const router = require('express').Router();
const ctrl = require('../controllers/shippingController');
const { requireAuth, requireRole } = require('../middleware/auth');

// Piblik pou kliyan
router.get('/', ctrl.listPublic);

// Jesyon admin
router.get('/all', requireAuth, requireRole('ADMIN'), ctrl.listAll);
router.post('/', requireAuth, requireRole('ADMIN'), ctrl.create);
router.put('/:id', requireAuth, requireRole('ADMIN'), ctrl.update);
router.delete('/:id', requireAuth, requireRole('ADMIN'), ctrl.remove);

module.exports = router;
