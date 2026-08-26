const router = require('express').Router();
const ctrl = require('../controllers/wishlistController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);
router.get('/', ctrl.list);
router.get('/ids', ctrl.ids);
router.post('/', ctrl.add);
router.delete('/:productId', ctrl.remove);

module.exports = router;
