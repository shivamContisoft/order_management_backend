const express = require('express');

const authorizationMiddleware = require('../../middlewares/auth.middlerware');

const AmController = require('../../controllers/administrator/am.controller');

const router = express.Router();


router.get('/', (req, res) => {
    res.json({
        status: 200,
        message: "This is am page!"
    });
});

router.post('/create', AmController.createAm);
router.post('/addTarget', AmController.addTarget);
router.post('/update', AmController.updateAm);
router.get('/read', AmController.getAms);
router.get('/remove', AmController.removeAm);
router.get('/year/data', AmController.getAmYearData);
router.get('/get', AmController.getAmUser);
module.exports = router;