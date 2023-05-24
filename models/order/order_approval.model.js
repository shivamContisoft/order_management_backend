const Sequelize = require('sequelize');
const dbConfig = require('../../config/database.config');

const OrderApproval = dbConfig.define('tbl_approval_datas', {
    orderId: {
        type: Sequelize.INTEGER
    },
    comment: {
        type: Sequelize.STRING
    },
    status: {
        type: Sequelize.STRING
    },
    userId: {
        type: Sequelize.INTEGER
    },
    createdAt: {
        type: Sequelize.DATEONLY
    },
    time: {
        type: Sequelize.TIME
    }
})

module.exports = OrderApproval;