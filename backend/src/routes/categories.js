const router = require('express').Router();
const ctrl = require('../controllers/categoryController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.get('/', ctrl.list);
router.post('/', requireAuth, requireRole('ADMIN'), ctrl.create);

module.exports = router;
