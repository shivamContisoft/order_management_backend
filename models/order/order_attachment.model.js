const Sequelize = require('sequelize');
const dbConfig = require('../../config/database.config');

const OrderFile = dbConfig.define('tbl_order_file_datas', {
    orderId: {
        type: Sequelize.INTEGER
    },
    documentName: {
        type: Sequelize.INTEGER
    },
    fileName: {
        type: Sequelize.STRING
    },
    createdAt: {
        type: Sequelize.DATEONLY
    },
    updatedAt: {
        type: Sequelize.DATEONLY
    },
})

module.exports = OrderFile;