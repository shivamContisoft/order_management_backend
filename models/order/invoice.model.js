const Sequelize = require('sequelize');
const dbConfig = require('../../config/database.config');

const invoice = dbConfig.define('tbl_invoice_datas', {
    order_id: {
        type: Sequelize.INTEGER
    },
    invoiceRaisedDate: {
        type: Sequelize.DATEONLY
    },
    tiplInvoiceNo: {
        type: Sequelize.STRING
    },
    qre:{
        type:Sequelize.INTEGER
    },
    invoiceSalesAmount:{
        type:Sequelize.INTEGER
    },
    receivedAmount:{
        type:Sequelize.INTEGER
    },
    dueDate: {
        type: Sequelize.DATEONLY
    },
    isDeleted: {
        type : Sequelize.INTEGER
    },
    // tiplPoNumber: {
    //     type: Sequelize.INTEGER
    // },
    // tiplPoDate: {
    //     type: Sequelize.DATEONLY
    // },
    // vendorName: {
    //     type: Sequelize.INTEGER
    // },
    purchaseInvoiceDate: {
        type: Sequelize.DATEONLY
    },
    invoiceNumber: {
        type: Sequelize.STRING
    },
    invoiceAmount: {
        type: Sequelize.INTEGER
    },
    QBR_GP:{
        type:Sequelize.INTEGER
    },
    RR_GP:{
        type:Sequelize.INTEGER
    },
    invoiceRecievedDate: {
        type: Sequelize.DATEONLY
    },
})

module.exports = invoice;