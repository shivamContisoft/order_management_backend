const Sequelize = require('sequelize');
const dbConfig = require('../../config/database.config');

const SubModule = dbConfig.define('tbl_sub_modules', {
    parentModule: {
        type: Sequelize.INTEGER
    },
    orderId: {
        type: Sequelize.INTEGER
    },
    moduleName: {
        type: Sequelize.STRING
    },
    moduleIcon: {
        type: Sequelize.STRING
    },
    moduleUrl: {
        type: Sequelize.STRING
    },
    createdAt: {
        type: Sequelize.DATEONLY
    },
})

module.exports = SubModule;