const Sequelize = require('sequelize');
const dbConfig = require('../../config/database.config');

const Customer = dbConfig.define('tbl_masters_customers', {
    customerName: {
        type: Sequelize.STRING
    },
    // contact: {
    //     type: Sequelize.STRING
    // },
    // email: {
    //     type: Sequelize.INTEGER
    // },
    entity: {
        type: Sequelize.STRING
    },
    accountManager:{
        type: Sequelize.STRING
    },
    address: {
        type: Sequelize.STRING
    },
    // location: {
    //     type: Sequelize.STRING
    // },
    country: {
        type: Sequelize.STRING
    },
    state: {
        type: Sequelize.STRING
    },
    city: {
        type: Sequelize.STRING
    },
    pincode: {
        type: Sequelize.STRING
    },
    PaymentTerm: {
        type: Sequelize.STRING
    },
    contactPersonName1: {
        type: Sequelize.STRING
    },
    contactPersonContact1: {
        type: Sequelize.STRING
    },
    contactPersonEmail1: {
        type: Sequelize.STRING
    },
    contactPersonName2: {
        type: Sequelize.STRING
    },
    contactPersonContact2: {
        type: Sequelize.STRING
    },
    contactPersonEmail2: {
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

module.exports = Customer;