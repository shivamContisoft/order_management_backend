const sequelize = require('sequelize');
const Sequelize = require('sequelize');
const dbConfig = require('../../config/database.config');

const Order = dbConfig.define('tbl_orders', {
    amId: {
        type: Sequelize.INTEGER
    },
    entity: {
        type: Sequelize.INTEGER
    },
    companyName: {
        type: Sequelize.INTEGER
    },
    companyPaymentTerms: {
        type: Sequelize.STRING
    },
    oem: {
        type: Sequelize.INTEGER
    },
    oemDealerId: {
        type: Sequelize.STRING
    },
    businessUnit: {
        type: Sequelize.INTEGER
    },
    bdm: {
        type: Sequelize.INTEGER
    },
    bdmPercentage: {
        type: Sequelize.INTEGER
    },
    orderType:{
        type: Sequelize.INTEGER
    },
    productType: {
        type: Sequelize.INTEGER
    },
    productDescription: {
        type: Sequelize.STRING
    },
    poNo: {
        type: Sequelize.STRING
    },
    poDate: {
        type: Sequelize.DATEONLY
    },
    duration: {
        type: Sequelize.STRING
    },
    poValue: {
        type: Sequelize.STRING
    },
    // balancePoValue:{
    //     type: Sequelize.INTEGER
    // },
    poPurchaseValue: {
        type: Sequelize.STRING
    },
    poPurchaseValue: {
        type: Sequelize.STRING
    },
    receivedAmount:{
        type:Sequelize.INTEGER
    },
    purchaseRecievedAmount:{
        type:Sequelize.INTEGER
    },
    salePaymentReceivedAmount:{
        type:Sequelize.INTEGER
    },
    purchasePaymentReceivedAmount:{
        type:Sequelize.INTEGER
    },
    externalCost: {
        type: sequelize.INTEGER
    },
    vendorSelection: {
        type: Sequelize.INTEGER
    },
    vendorPaymentTerms: {
        type: Sequelize.STRING
    },
    vendorPoValue: {
        type: Sequelize.STRING
    },
    is_attachment: {
        type: Sequelize.INTEGER
    },
    status: {
        type: Sequelize.STRING
    },
    pendingAt: {
        type: Sequelize.INTEGER
    },
    step: {
        type: Sequelize.INTEGER
    },
    orderCode: {
        type: Sequelize.INTEGER
    },
    POGM: {
        type: Sequelize.INTEGER
    },
    POGMPercent: {
        type: Sequelize.INTEGER
    },
    PM: {
        type: Sequelize.INTEGER
    },
    BR: {
        type: Sequelize.INTEGER
    },
    GP: {
        type: Sequelize.INTEGER
    },
    GPPercent: {
        type: Sequelize.INTEGER
    },
    createdAt: {
        type: Sequelize.DATEONLY
    },
    updatedAt: {
        type: Sequelize.DATEONLY
    },
})

module.exports = Order;