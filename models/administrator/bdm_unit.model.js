const Sequelize = require('sequelize');
const dbConfig = require('../../config/database.config');

const BdmUnit = dbConfig.define('tbl_masters_bdm_units', {
    bdmId: {
        type: Sequelize.INTEGER
    },
    buId: {
        type: Sequelize.INTEGER
    }
})

module.exports = BdmUnit;