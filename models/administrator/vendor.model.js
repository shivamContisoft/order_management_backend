const Sequelize = require('sequelize');
const dbConfig = require('../../config/database.config');

const Product = dbConfig.define('tbl_masters_vendors', {
    vendorName: {
        type: Sequelize.STRING
    },
   
    address: {
        type: Sequelize.STRING
    },
    
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
    panNo: {
        type: Sequelize.STRING
    },
    gstNo: {
        type: Sequelize.STRING
    },
    bankName: {
        type: Sequelize.STRING
    },
    accountNo: {
        type: Sequelize.STRING
    },
    ifscNo: {
        type: Sequelize.STRING
    },
    branchName: {
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

module.exports = Product;