const Sequelize = require('sequelize');
const dbConfig = require('../../config/database.config');

const AM = dbConfig.define('tbl_masters_ams', {
    employeeId: {
        type: Sequelize.STRING
    },
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
    location: {
        type: Sequelize.STRING
    },  
    isDeleted: {
        type: Sequelize.INTEGER
    },
    userTableId: {
        type: Sequelize.INTEGER
    },
    createdAt: {
        type: Sequelize.DATEONLY
    },
    updatedAt: {
        type: Sequelize.DATEONLY
    },
})

module.exports = AM;