const express = require('express');

const authorizationMiddleware = require('../../middlewares/auth.middlerware');

const EmployeeController = require('../../controllers/administrator/employee.controller');

const router = express.Router();


router.get('/', (req, res) => {
    res.json({
        status: 200,
        message: "This is employee page!"
    });
});

router.post('/create', EmployeeController.createEmployee);
router.post('/update', EmployeeController.updateEmployee);
router.get('/read', EmployeeController.getEmployees);
router.get('/remove', EmployeeController.removeEmployee);

module.exports = router;