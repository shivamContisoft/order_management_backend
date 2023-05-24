const express = require('express');

const authorizationMiddleware = require('../../middlewares/auth.middlerware');

const ProductController = require('../../controllers/administrator/product.controller');

const router = express.Router();


router.get('/', (req, res) => {
    res.json({
        status: 200,
        message: "This is product page!"
    });
});

router.post('/create', ProductController.createProduct);
router.post('/update', ProductController.updateProduct);
router.get('/read', ProductController.getProducts);
router.get('/remove', ProductController.removeProduct);
router.get('/read/ordertype',ProductController.getProductsByorderType );


module.exports = router;