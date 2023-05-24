const express = require('express');

const authorizationMiddleware = require('../../middlewares/auth.middlerware');

const LocationController = require('../../controllers/administrator/location.controller');

const router = express.Router();


router.get('/', (req, res) => {
    res.json({
        status: 200,
        message: "This is location page!"
    });
});

router.post('/create', LocationController.createLocation);
router.post('/update', LocationController.updateLocation);
router.get('/read', LocationController.getLocation);
router.get('/remove', LocationController.removeLocation);

module.exports = router;