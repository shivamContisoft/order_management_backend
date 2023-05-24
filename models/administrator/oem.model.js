const Sequelize = require('sequelize');
const dbConfig = require('../../config/database.config');

const OEM = dbConfig.define('tbl_masters_oems', {
    oemName: {
        type: Sequelize.STRING
    },
    description: {
        type: Sequelize.STRING
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

module.exports = OEM;