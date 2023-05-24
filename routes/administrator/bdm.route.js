const express = require('express');

const authorizationMiddleware = require('../../middlewares/auth.middlerware');

const BdmController = require('../../controllers/administrator/bdm.controller');

const router = express.Router();


router.get('/', (req, res) => {
    res.json({
        status: 200,
        message: "This is bdm page!"
    });
});

router.post('/create', BdmController.createBdm);
router.post('/addTarget', BdmController.addTarget);
router.post('/update', BdmController.updateBdm);
router.get('/read', BdmController.getBdms);
router.get('/remove', BdmController.removeBdm);
router.get('/year/data', BdmController.getBdmYearData);
router.get('/read/business/unit', BdmController.getBusinessUnit);
router.get('/byid',BdmController.getBdmById);
router.get('/getuser',BdmController.getBdmUser);
router.get('/year',BdmController.getYearTarget);

module.exports = router;