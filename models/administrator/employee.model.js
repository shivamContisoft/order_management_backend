const Sequelize = require('sequelize');
const dbConfig = require('../../config/database.config');

const Employee = dbConfig.define('tbl_masters_employees', {
    firstName: {
        type: Sequelize.STRING
    },
    lastName: {
        type: Sequelize.STRING
    },
    contact: {
        type: Sequelize.STRING
    },
    email: {
        type: Sequelize.STRING
    },
    designation: {
        type: Sequelize.STRING
    },
    isDeleted: {
        type: Sequelize.INTEGER
    },
    createdAt: {
        type: Sequelize.DATEONLY
    },
    updatedAt: {
        type: Sequelize.DATEONLY
    },
})

module.exports = Employee;