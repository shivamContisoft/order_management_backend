const express = require('express');

const authorizationMiddleware = require('../../middlewares/auth.middlerware');

const UserController = require('../../controllers/administrator/user.controller');

const router = express.Router();


router.get('/', (req, res) => {
    res.json({
        status: 200,
        message: "This is user page!"
    });
});

router.post('/create', UserController.createUser);
router.post('/update', UserController.updateUser);
router.post('/update-password', UserController.updatePassword);
router.post('/reset-password', UserController.resetPassword);

router.get('/get', UserController.getUsers);
router.get('/remove', UserController.removeUser);
router.get('/bydepartment', UserController.getUserByDepartment);

module.exports = router;