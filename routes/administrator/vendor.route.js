const express = require('express');

const authorizationMiddleware = require('../../middlewares/auth.middlerware');

const VendorController = require('../../controllers/administrator/vendor.controller');

const router = express.Router();


router.get('/', (req, res) => {
    res.json({
        status: 200,
        message: "This is vendor page!"
    });
});
router.post('/create/bulk', VendorController.createBulkVendor);
router.post('/create', VendorController.createVendor);
router.post('/update', VendorController.updateVendor);
router.get('/read', VendorController.getVendors);
router.get('/remove', VendorController.removeVendor);

module.exports = router;