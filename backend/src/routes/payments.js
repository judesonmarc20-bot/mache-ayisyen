const router = require('express').Router();
const ctrl = require('../controllers/paymentController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);
router.post('/moncash/initiate', ctrl.initiate);
router.post('/moncash/verify', ctrl.verify);
router.post('/stripe/initiate', ctrl.stripeInitiate);
router.post('/stripe/verify', ctrl.stripeVerify);

module.exports = router;
