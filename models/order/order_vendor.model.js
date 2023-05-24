const Sequelize = require('sequelize');
const dbConfig = require('../../config/database.config');

const OrderVendor = dbConfig.define('tbl_order_vendors', {
    orderId: {
        type: Sequelize.INTEGER
    },
    vendorValue: {
        type: Sequelize.STRING
    },
    vendorPaymentValue: {
        type: Sequelize.STRING
    },
    vendorPoValue: {
        type: Sequelize.STRING
    },
})

module.exports = OrderVendor;