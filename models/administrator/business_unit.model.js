const Sequelize = require('sequelize');
const dbConfig = require('../../config/database.config');

const BusinessUnit = dbConfig.define('tbl_masters_business_units', {
    bdmId: {
        type: Sequelize.INTEGER
    },
    categoryName: {
        type: Sequelize.STRING
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

module.exports = BusinessUnit;