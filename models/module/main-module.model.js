const Sequelize = require('sequelize');
const dbConfig = require('../../config/database.config');

const MainModule = dbConfig.define('tbl_main_modules', {
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
    accountType: {
        type: Sequelize.INTEGER
    },
    createdAt: {
        type: Sequelize.DATEONLY
    },
})

module.exports = MainModule;