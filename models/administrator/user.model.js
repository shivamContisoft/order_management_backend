const Sequelize = require('sequelize');
const dbConfig = require('../../config/database.config');

const User = dbConfig.define('tbl_users', {
    firstName: {
        type: Sequelize.STRING
    },
    lastName: {
        type: Sequelize.STRING
    },
    designation: {
        type: Sequelize.STRING
    },
    email: {
        type: Sequelize.STRING
    },
    contact: {
        type: Sequelize.STRING
    },
    department: {
        type: Sequelize.INTEGER
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

module.exports = User;