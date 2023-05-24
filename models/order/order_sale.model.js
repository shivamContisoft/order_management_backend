const Sequelize = require('sequelize');
const dbConfig = require('../../config/database.config');

const OrderSales = dbConfig.define('tbl_order_sales', {
    orderId: {
        type: Sequelize.INTEGER
    },
    saleProductValue: {
        type: Sequelize.STRING
    },
    saleProductAttachValue: {
        type: Sequelize.STRING
    },
    saleProductServiceValue: {
        type: Sequelize.STRING
    }
})

module.exports = OrderSales;