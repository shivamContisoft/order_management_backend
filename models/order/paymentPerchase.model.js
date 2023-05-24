const Sequelize = require('sequelize');
const dbConfig = require('../../config/database.config');

const paymentPurchase = dbConfig.define('tbl_invoice_purchase_payment', {
    order_id: {
        type: Sequelize.INTEGER
    },
    invoice_id: {
        type: Sequelize.INTEGER
    },
    paymentDate: {
        type: Sequelize.DATEONLY
    },
    paymentBuy: {
        type: Sequelize.STRING
    },
    paymentMethod: {
        type: Sequelize.STRING
    },
    paymentReference: {
        type: Sequelize.STRING
    },
    isDeleted: {
        type: Sequelize.INTEGER
    },
    paymentCollection: {
        type: Sequelize.INTEGER
    },
    amount: {
        type: Sequelize.INTEGER
    },
    details: {
        type: Sequelize.STRING
    },
    
})

module.exports = paymentPurchase;