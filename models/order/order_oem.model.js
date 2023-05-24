const Sequelize = require('sequelize');
const dbConfig = require('../../config/database.config');

const OrderOem = dbConfig.define('tbl_order_oems', {
    orderId: {
        type: Sequelize.INTEGER
    },
    oem: {
        type: Sequelize.INTEGER
    },
    oemDealerId: {
        type: Sequelize.STRING
    },
    productType:{
        type: Sequelize.INTEGER
    },
    productDescription:{
        type: Sequelize.STRING
    },
    // srno: {
    //     type: Sequelize.STRING
    // },
    bdm: {
        type: Sequelize.INTEGER
    },
    bdmPercentage: {
        type: Sequelize.INTEGER
    },
    businessUnit: {
        type: Sequelize.INTEGER,
   
    },
    customerPoValue:{
        type: Sequelize.INTEGER
    },
    vendorPoValue:{
        type: Sequelize.INTEGER
    },
    totalCustomerPoValue:{
        type: Sequelize.INTEGER
    },
    totalVendorPoValue:{
        type: Sequelize.INTEGER
    },
    BDM_POGM:{
        type: Sequelize.INTEGER
    },
    BDM_POGMPercent:{
        type: Sequelize.INTEGER
    },
    BDM_PM:{
        type: Sequelize.INTEGER
    },
    BDM_BR:{
        type: Sequelize.INTEGER
    },
    BDM_GP:{
        type: Sequelize.INTEGER
    },
    BDM_GPPercent:{
        type: Sequelize.INTEGER
    }

})

module.exports = OrderOem;