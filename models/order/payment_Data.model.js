const Sequelize = require('sequelize');
const dbConfig = require('../../config/database.config');

const paymentData = dbConfig.define('tbl_invoice_payments', {
    order_id: {
        type: Sequelize.INTEGER
    },
    invoice_id: {
        type: Sequelize.INTEGER
    },
    paymentDate: {
        type: Sequelize.DATEONLY
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
    amount: {
        type: Sequelize.INTEGER
    },
    details: {
        type: Sequelize.STRING
    },
    
})

module.exports = paymentData;