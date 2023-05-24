const Sequelize = require('sequelize');
const dbConfig = require('../../config/database.config');

const Product = dbConfig.define('tbl_masters_products', {
    productName: {
        type: Sequelize.STRING
    },
    orderType:{
        type: Sequelize.INTEGER
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

module.exports = Product;