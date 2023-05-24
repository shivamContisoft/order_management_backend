const Sequelize = require('sequelize');
const dbConfig = require('../../config/database.config');

const AccessSubModule = dbConfig.define('tbl_sub_module_accesses', {
    accountType: {
        type: Sequelize.INTEGER
    },
    accountId: {
        type: Sequelize.INTEGER
    },
    moduleId: {
        type: Sequelize.INTEGER
    },
    subModuleId: {
        type: Sequelize.INTEGER
    },
    createdAt: {
        type: Sequelize.DATEONLY
    },
})

module.exports = AccessSubModule;