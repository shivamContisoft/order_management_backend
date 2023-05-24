const sequelize = require('sequelize');
const Sequelize = require('sequelize');
const dbConfig = require('../../config/database.config');

const AMTarget = dbConfig.define('tbl_masters_am_year_targets', {
    amId: {
        type: Sequelize.INTEGER
    },
    year: {
        type: Sequelize.STRING
    },
    appraisalYear:{
        type:sequelize.STRING
    }, 
    totalAchieved: {
        type: Sequelize.STRING
    },
    minEligiblity: {
        type: Sequelize.STRING
    },
    percentageAchieved: {
        type: Sequelize.STRING
    }, 
    targetAllote: {
        type: Sequelize.STRING
    },  
    targetAchieve: {
        type: Sequelize.STRING
    },
    ctc: {
        type: Sequelize.INTEGER
    },
    variables: {
        type: Sequelize.INTEGER
    },
    variablePercentage: {
        type: Sequelize.INTEGER
    },
    minAchievement: {
        type: Sequelize.INTEGER
    },
})

module.exports = AMTarget;