const Sequelize = require('sequelize');
const dbConfig = require('../../config/database.config');

const AccessMainModule = dbConfig.define('tbl_main_module_accesses', {
    accountType: {
        type: Sequelize.INTEGER
    },
    accountId: {
        type: Sequelize.INTEGER
    },
    moduleId: {
        type: Sequelize.INTEGER
    },
    createdAt: {
        type: Sequelize.DATEONLY
    },
})

module.exports = AccessMainModule;