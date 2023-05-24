const Sequelize = require('sequelize');
const dbConfig = require('../../config/database.config');

const vendorInvoice = dbConfig.define('tbl_invoice_vendor', {
    order_id: {
        type: Sequelize.INTEGER
    },
     tiplPoNumber: {
        type: Sequelize.STRING
    },
    tiplPoDate: {
        type: Sequelize.DATEONLY
    },
   
})

module.exports = vendorInvoice;