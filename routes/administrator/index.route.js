const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
    res.json({
        status: 200,
        message: "This is administrator page!"
    });
});

router.use('/user', require('./user.route'));
router.use('/am', require('./am.route'));
router.use('/bdm', require('./bdm.route'));
router.use('/product', require('./product.route'));
router.use('/employee', require('./employee.route'));
router.use('/oem', require('./oem.route'));
router.use('/location', require('./location.route'));
router.use('/vendor', require('./vendor.route'));
router.use('/customer', require('./customer.route'));
router.use('/entity', require('./entity.route'));
router.use('/approval', require('./approval.route'));

module.exports = router;