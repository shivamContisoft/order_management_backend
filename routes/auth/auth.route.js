const express = require('express');

const AuthController = require('../../controllers/auth/auth.controller');

const router = express.Router();

router.get('/', (req, res) => {
    res.json({
        status: 200,
        message: "This is auth page!"
    });
});

router.use('/user', AuthController.authenticate);

module.exports = router;