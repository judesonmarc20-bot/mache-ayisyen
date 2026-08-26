const router = require('express').Router();
const ctrl = require('../controllers/cartController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);
router.get('/', ctrl.get);
router.post('/', ctrl.add);
router.put('/:itemId', ctrl.updateItem);
router.delete('/:itemId', ctrl.removeItem);

module.exports = router;
