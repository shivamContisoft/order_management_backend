const express = require('express');

const authorizationMiddleware = require('../../middlewares/auth.middlerware');

const CustomerController = require('../../controllers/administrator/customer.controller');

const router = express.Router();


router.get('/', (req, res) => {
    res.json({
        status: 200,
        message: "This is customer page!"
    });
});

router.post('/create', CustomerController.createCustomer);
router.post('/create/bulk', CustomerController.createBulkCustomer);
router.post('/update', CustomerController.updateCustomer);
router.get('/read', CustomerController.getCustomers);
router.get('/remove', CustomerController.removeCustomer);
router.get('/read/entity', CustomerController.getCustomersByEntity);

module.exports = router;