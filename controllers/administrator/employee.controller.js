const dotEnv = require('dotenv');

const EmployeeModel = require('../../models/administrator/employee.model');

dotEnv.config();

exports.createEmployee = async (req, res) => {

    const employeeData = req.body.data;
    const todaysDate = new Date();

    if (Object.keys(employeeData).length <= 0)
        return res.json({ status: 201, message: 'No data provided to create employee.' });

    let { firstName, lastName, contact, email, designation } = employeeData;

    const employeeResult = await EmployeeModel.create({
        firstName,
        lastName,
        contact,
        email,
        designation,
        createdAt: todaysDate,
        updatedAt: todaysDate
    }).then(result => {
        return result;
    }).catch(error => {
        return error;
    })

    if ('id' in employeeResult)
        return res.json({ status: 200, message: 'Employee created successfully.' });
    else
        return res.json({ status: 202, err: employeeResult, message: 'Couldnt assiged auth details to the employee.' });
}

exports.getEmployees = async (req, res) => {

    let offset = 'offset' in req.query ? (parseInt(req.query.offset) > 0 ? parseInt(req.query.offset) : 1) : 1;
    let limit = 'limit' in req.query ? (parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 9999) : 9999;
    offset = (offset - 1) * limit;

    const employees = await EmployeeModel.findAndCountAll({ order: [['id', 'DESC']], where: { isDeleted: 0 }, offset: offset, limit: limit }).then(employees => employees).catch(error => error);

    if (employees)
        return res.json({ status: 200, message: 'Employees data is in employees node.', data: employees });
    else
        return res.json({ status: 201, message: employees });

}

exports.updateEmployee = async (req, res) => {

    const employeeData = req.body.data;
    const todaysDate = new Date();

    if (Object.keys(employeeData).length <= 0)
        return res.json({ status: 201, message: 'No data provided to update employee.' });

        let { id, firstName, lastName, contact, email, designation} = employeeData;

        const employeeResult = await EmployeeModel.update({
            firstName,
            lastName,
            contact,
            email,
            designation,
            createdAt: todaysDate,
            updatedAt: todaysDate
        }, { where: { id } }).then(result => {
            return result;
        }).catch(error => {
            return error;
        })

    if (employeeResult)
        return res.json({ status: 200, message: 'Employee updated successfuly.' });
    else
        return res.json({ status: 202, message: employeeResult })

}

exports.removeEmployee = async (req, res) => {

    const employee_id = req.query.id;
    const created_at = new Date();
    const isDeleted = 1;

    EmployeeModel.findOne({ where: { id: employee_id } }).then(result => {

        EmployeeModel.update({
            isDeleted: isDeleted,
        }, { where: { id: employee_id } }).then(result => {
            return res.json({
                status: 200,
                message: 'Employee removed successfully!'
            });    
        }).catch(error => {
            return res.json({
                status: 500,
                message: error
            });
        });
    }).catch(error => {
        return res.json({
            status: 500,
            message: error
        });
    });

}