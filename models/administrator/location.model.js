const Sequelize = require('sequelize');
const dbConfig = require('../../config/database.config');

const Location = dbConfig.define('tbl_masters_location', {
    location: {
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

module.exports = Location;