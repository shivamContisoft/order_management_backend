const Sequelize = require('sequelize');
const dotEnv = require('dotenv');

dotEnv.config();

module.exports = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: console.log,
    define: {
        timestamps: false
    },
    operatorsAliases: false,

    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    keys: {
        secret: process.env.DB_KEY, // Should not be made public
    }
});