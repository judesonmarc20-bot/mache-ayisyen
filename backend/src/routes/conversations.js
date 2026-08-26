const router = require('express').Router();
const ctrl = require('../controllers/conversationController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);
router.get('/', ctrl.list);
router.post('/', ctrl.start);
router.get('/:id/messages', ctrl.messages);
router.post('/:id/messages', ctrl.send);

module.exports = router;
