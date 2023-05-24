const express = require('express');

const authorizationMiddleware = require('../../middlewares/auth.middlerware');

const OemController = require('../../controllers/administrator/oem.controller');

const router = express.Router();


router.get('/', (req, res) => {
    res.json({
        status: 200,
        message: "This is oem page!"
    });
});

router.post('/create', OemController.createOem);
router.post('/create/bulk', OemController.createBulkOem);
router.post('/update', OemController.updateOem);
router.get('/read', OemController.getOem);
router.get('/remove', OemController.removeOem);

module.exports = router;