const express = require('express');

const BookOrderController = require('../../controllers/order/order.controller');

const router = express.Router();

router.get('/', (req, res) => {
    res.json({
        status: 200,
        message: "This is book order page!"
    });
});


router.post('/create', BookOrderController.createOrder);
router.get('/read', BookOrderController.getOrders);

router.get('/getOrdersforXL', BookOrderController.getOrdersforXL)

router.get('/readAM', BookOrderController.getOrdersAM);
router.get('/readBDM', BookOrderController.getOrdersBDM);
router.get('/getFullyApprovedOrder', BookOrderController.getFullyApprovedOrder);
router.post('/createdata', BookOrderController.createdata);
router.post('/purchaseInvoice', BookOrderController.purchaseInvoice);
router.post('/paymentData', BookOrderController.paymentData);
router.post('/paymentPurchaseData', BookOrderController.paymentPurchaseData);

router.get('/readInvoice', BookOrderController.getInvoice);
router.get('/readPurchaseInvoice', BookOrderController.getPurchaseInvoice);
router.get('/readInvoiceByOrder', BookOrderController.getInvoiceByOrder);
router.get('/readPurchaseInvoiceByOrder', BookOrderController.getPurchaseInvoiceByOrder);
router.get('/readPurchaseInvoicePayment', BookOrderController.getPurchasePaymentByInvoice);

router.get('/readInvoicePayment', BookOrderController.getPaymentByInvoice);
router.post('/vendorData', BookOrderController.createVendorData);
router.get('/readVendorPoByOrder', BookOrderController.getVendorPoByOrder);
router.get('/getApprovedByMeOrders' , BookOrderController.getApprovedByMeOrders);
router.get('/dateFilter' , BookOrderController.getDateWiseData);
// router.get('/dateFilter' , BookOrderController.getDateWiseDatapurchase);
router.get('/dateFilterPurchase', BookOrderController.getDateWiseDatapurchase)
router.get('/remove' , BookOrderController.deleteSaleInvoice);
router.get('/removePurchaseInvoice', BookOrderController.deletePurchesInvoice);

router.get('/removeFullOrder', BookOrderController.deleteFullOrder);

router.post('/purchaseinvoiceupdate',BookOrderController.updatePurchaseInvoice);
router.post('/saleinvoiceupdate',BookOrderController.updateSaleInvoice);

router.post('/updateCustomerPaymentInvoice',BookOrderController.updateCustomerPaymentInvoice);
router.post('/updateVendorPaymentInvoice',BookOrderController.updatePurchasePaymentInvoice);


router.get('/deleteSalePaymentInvoice',BookOrderController.deleteSalePaymentInvoice);
router.get('/deleteVendorPaymentInvoice',BookOrderController.deleteVendorPaymentInvoice);


module.exports = router;
