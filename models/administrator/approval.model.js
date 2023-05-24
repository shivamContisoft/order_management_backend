const Sequelize = require('sequelize');
const dbConfig = require('../../config/database.config');

const Approval = dbConfig.define('tbl_masters_approvals', {
    productType: {
        type: Sequelize.INTEGER
    },
    productName: {
        type: Sequelize.STRING
    },
    departmentId: {
        type: Sequelize.INTEGER
    },
    departmentName: {
        type: Sequelize.STRING
    },
    userId: {
        type: Sequelize.INTEGER
    },
    userName: {
        type: Sequelize.STRING
    },
    stageOrder: {
        type: Sequelize.INTEGER
    },
    isDeleted: {
        type: Sequelize.INTEGER
    },
    createdAt: {
        type: Sequelize.DATEONLY
    },
    updatedAt: {
        type: Sequelize.DATEONLY
    },
})

module.exports = Approval;