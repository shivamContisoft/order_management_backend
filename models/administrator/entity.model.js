const Sequelize = require('sequelize');
const dbConfig = require('../../config/database.config');

const Entity = dbConfig.define('tbl_masters_entitys', {
    entityName: {
        type: Sequelize.STRING
    },
    createdAt: {
        type: Sequelize.DATEONLY
    },
    updatedAt: {
        type: Sequelize.DATEONLY
    },
})

module.exports = Entity;