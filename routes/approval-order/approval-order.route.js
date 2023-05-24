const express = require('express');

const ApprovalOrderController = require('../../controllers/approval-order/approval-order.controller');

const router = express.Router();

router.get('/', (req, res) => {
    res.json({
        status: 200,
        message: "This is book approval-order page!"
    });
});

router.get('/read', ApprovalOrderController.getApprovalOrders);
router.get('/markasapproval/read', ApprovalOrderController.markAsApproved);
router.get('/markasreject/read', ApprovalOrderController.markAsRejected);
router.get('/downloadFile',ApprovalOrderController.downloadFile);
module.exports = router;