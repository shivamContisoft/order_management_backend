const Sequelize = require('sequelize');
const dbConfig = require('../../config/database.config');

const AddOnVendor = dbConfig.define('tbl_masters_vendor_add_ons', {
    vendorId: {
        type: Sequelize.INTEGER
    },
    contactPersonName: {
        type: Sequelize.STRING
    },
    contactPersonContact: {
        type: Sequelize.STRING
    },
    contactPersonEmail: {
        type: Sequelize.STRING
    }
})

module.exports = AddOnVendor;