const router = require('express').Router();
const ctrl = require('../controllers/adminController');
const storeCtrl = require('../controllers/storeController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.use(requireAuth, requireRole('ADMIN'));
router.get('/users', ctrl.listUsers);
router.get('/stats', ctrl.stats);
router.get('/stores', storeCtrl.listAll);
router.put('/stores/:id/active', storeCtrl.setActive);

module.exports = router;
