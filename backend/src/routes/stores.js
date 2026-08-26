const router = require('express').Router();
const ctrl = require('../controllers/storeController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.get('/', ctrl.listPublic);
router.get('/mine', requireAuth, requireRole('VENDOR'), ctrl.myStore);
router.put('/mine', requireAuth, requireRole('VENDOR'), ctrl.updateMyStore);
router.get('/:slug', ctrl.getBySlug);

module.exports = router;
