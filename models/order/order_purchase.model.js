const Sequelize = require('sequelize');
const dbConfig = require('../../config/database.config');

const OrderPurchase = dbConfig.define('tbl_order_purchases', {
    orderId: {
        type: Sequelize.INTEGER
    },
    purchaseProductValue: {
        type: Sequelize.STRING
    },
    purchaseProductAttachValue: {
        type: Sequelize.STRING
    },
    purchaseProductServiceValue: {
        type: Sequelize.STRING
    }
})

module.exports = OrderPurchase;