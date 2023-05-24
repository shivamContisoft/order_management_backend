const express = require('express');

const ModuleController = require('../../controllers/module/module.controller');

const router = express.Router();

router.get('/', (req, res) => {
    res.json({
        status: 200,
        message: "This is module page!"
    });
});

router.get('/get-main-modules', ModuleController.getMainModules);
router.get('/get-sub-modules', ModuleController.getSubModules);
router.get('/get-user-modules', ModuleController.getUserModules);
router.post('/allocate-main-modules', ModuleController.allocateUserModule);

module.exports = router;