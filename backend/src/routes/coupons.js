const router = require('express').Router();
const ctrl = require('../controllers/couponController');
const { requireAuth, requireRole } = require('../middleware/auth');

// Valide yon kòd: nenpòt itilizatè konekte (nan panye a).
router.post('/validate', requireAuth, ctrl.validate);

// Jesyon: admin oswa vandè
router.get('/', requireAuth, requireRole('ADMIN', 'VENDOR'), ctrl.list);
router.post('/', requireAuth, requireRole('ADMIN', 'VENDOR'), ctrl.create);
router.put('/:id/toggle', requireAuth, requireRole('ADMIN', 'VENDOR'), ctrl.toggle);
router.delete('/:id', requireAuth, requireRole('ADMIN', 'VENDOR'), ctrl.remove);

module.exports = router;
