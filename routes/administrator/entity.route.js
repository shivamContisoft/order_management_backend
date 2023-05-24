const express = require('express');

const authorizationMiddleware = require('../../middlewares/auth.middlerware');

const EntityController = require('../../controllers/administrator/entity.controller');

const router = express.Router();


router.get('/', (req, res) => {
    res.json({
        status: 200,
        message: "This is entity page!"
    });
});

router.get('/read', EntityController.getEntitys);
router.post('/create',EntityController.createEntity );
router.get('/remove',EntityController.removeEntity);

module.exports = router;