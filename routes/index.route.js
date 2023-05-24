const express = require('express');

const authorizationMiddleware = require('../middlewares/auth.middlerware');

const router = express.Router();

router.get('/', (req, res) => {
    res.json({
        status: 200,
        message: "This is api page!"
    });
});

router.use('/administrator', require('./administrator/index.route'));
router.use('/module', require('./module/module.route'));
router.use('/authenticate', require('./auth/auth.route'));
router.use('/order', require('./order/order.route'));
router.use('/approval', require('./approval-order/approval-order.route'));


module.exports = router;