const Sequelize = require('sequelize');
const dbConfig = require('../../config/database.config');

const Auth = dbConfig.define('tbl_auths', {
    userId: {
        type: Sequelize.INTEGER
    },
    userName: {
        type: Sequelize.STRING
    },
    password: {
        type: Sequelize.STRING
    },
    accountType: {
        type: Sequelize.INTEGER
    },
    createdAt: {
        type: Sequelize.DATEONLY
    },
    updatedAt: {
        type: Sequelize.DATEONLY
    },
})

module.exports = Auth;