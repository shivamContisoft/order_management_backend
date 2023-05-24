const express = require('express');

const authorizationMiddleware = require('../../middlewares/auth.middlerware');

const ApprovalController = require('../../controllers/administrator/approval.controller');

const router = express.Router();


router.get('/', (req, res) => {
    res.json({
        status: 200,
        message: "This is approval page!"
    });
});

router.post('/create', ApprovalController.createApproval);
router.post('/update', ApprovalController.updateApproval);
router.get('/read', ApprovalController.getApprovals);
router.get('/getProducts', ApprovalController.getProducts);
router.get('/remove', ApprovalController.removeApproval);
router.get('/byproduct', ApprovalController.getApprovalByProduct);

module.exports = router;