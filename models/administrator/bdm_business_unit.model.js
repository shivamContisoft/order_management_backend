const Sequelize = require('sequelize');
const dbConfig = require('../../config/database.config');

const   BdmBusinessUnit = dbConfig.define('tbl_masters_bdm_business_units', {
    bdmId: {
        type: Sequelize.INTEGER
    },
    buId: {
        type: Sequelize.INTEGER
    },
    description: {
        type: Sequelize.STRING
    },
    createdAt: {
        type: Sequelize.DATEONLY
    },
    updatedAt: {
        type: Sequelize.DATEONLY
    },
})

module.exports = BdmBusinessUnit;