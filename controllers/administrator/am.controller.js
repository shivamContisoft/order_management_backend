const passGenerator = require('generate-password');
const bcrypt = require('bcryptjs');
const dotEnv = require('dotenv');
const OrderModel = require('../../models/order/order.model');
const emails = require('../../common/email.common');
const InvoiceModel = require('../../models/order/invoice.model');
const AmModel = require('../../models/administrator/am.model');
const AuthModel = require('../../models/auth/auth.model');
const UserModel = require('../../models/administrator/user.model');
const AmTargetModel = require('../../models/administrator/am_target.model');

dotEnv.config();

exports.createAm = async (req, res) => {

    const amData = req.body.data;
    const todaysDate = new Date();

    let password = passGenerator.generate({ length: parseInt(process.env.length), numbers: process.env.numbers });
    let hashPassword = bcrypt.hashSync(password, parseInt(process.env.rounds));

    if (Object.keys(amData).length <= 0)
        return res.json({ status: 201, message: 'No data provided to create am.' });

    let { employeeId, firstName, lastName, contact, email, designation, location, year, totalAchieved, minEligiblity, percentageAchieved, targetAllote, targetAchieve, ctc, variables, variablePercentage, minAchievement, appraisalYear } = amData;

    UserModel.findOne({
        where: { email: email, isDeleted: 0 }
    }).then(result => {

        if (result) {
            return res.json({
                status: 202, message: 'This user is already exist in the system!! '
            });

        } else {

            AmModel.create({
                employeeId,
                firstName,
                lastName,
                contact,
                email,
                designation,
                location,
                createdAt: todaysDate,
                updatedAt: todaysDate
            }).then(result => {

                let amid = result.id

                AmTargetModel.create({
                    amId: amid,
                    year,
                    appraisalYear,
                    totalAchieved,
                    minEligiblity,
                    percentageAchieved,
                    targetAllote,
                    targetAchieve,
                    ctc,
                    variables,
                    variablePercentage,
                    minAchievement,

                }).then(result => {

                    UserModel.create({
                        firstName,
                        lastName,
                        designation: 'Account Manager',
                        email,
                        contact,
                        department: 0,
                        createdAt: todaysDate,
                        updatedAt: todaysDate
                    }).then(async (result) => {
                        let userid = result.id
                        let useremail = result.email


                        await AmModel.update({
                            userTableId: userid
                        }, { where: { id: amid } }).then(resul => {

                            return resul;
                        }).catch(error => {
                            return error;
                        })



                        AuthModel.create({
                            userId: userid,
                            userName: useremail,
                            password: hashPassword,
                            accountType: 2,
                            createdAt: todaysDate,
                            updatedAt: todaysDate
                        }).then(result => {

                            console.log("email=>", result.userName)

                            emails.emailForNewAccount(result.userName, password);
                            return res.json({
                                status: 200,
                                message: 'AM created successfully.'
                            })
                        }).catch(error => {
                            return res.json({
                                status: 203,
                                err: error,
                                message: 'Couldnnt assiged auth details to the am.'
                            });
                        });
                    }).catch(error => {
                        return error;
                    });

                }).catch(error => {
                    return error;
                });
            }).catch(error => {
                return error;
            })
        }
    })

}
exports.addTarget = async (req, res) => {

    const amData = req.body.data;

    if (Object.keys(amData).length <= 0)
        return res.json({ status: 201, message: 'No data provided to create am.' });

    let { id, year, totalAchieved, minEligiblity, percentageAchieved, targetAllote, targetAchieve, ctc, variables, variablePercentage, minAchievement, appraisalYear } = amData;

    AmTargetModel.create({
        amId: id,
        year,
        appraisalYear,
        totalAchieved,
        minEligiblity,
        percentageAchieved,
        targetAllote,
        targetAchieve,
        ctc,
        variables,
        variablePercentage,
        minAchievement,

    }).then(result => {
        return res.json({
            status: 200,
            message: "Add target successfuly.",
        });


    }).catch(error => {
        return error;
    });

}



exports.getAms = async (req, res) => {

    let offset = 'offset' in req.query ? (parseInt(req.query.offset) > 0 ? parseInt(req.query.offset) : 1) : 1;
    let limit = 'limit' in req.query ? (parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 9999) : 9999;
    offset = (offset - 1) * limit;

    AmModel.hasMany(AmTargetModel, { foreignKey: 'amId' })
    AmModel.hasMany(OrderModel, { foreignKey: 'amId', sourceKey: 'userTableId' })

    AmModel.findAll({
        include: [{
            model: AmTargetModel, attributes: ['year', 'appraisalYear', 'totalAchieved', 'minEligiblity', 'percentageAchieved', 'targetAllote', 'targetAchieve', 'ctc', 'variables', 'variablePercentage', 'minAchievement']
        },
        {
            model: OrderModel, attributes: ['GP', 'bdmPercentage'], required: false
        },
        ], order: [['id', 'DESC']],
        where: { isDeleted: 0 },
        offset: offset, limit: limit
    }).then(ams => {
        res.json({ status: 200, message: 'Ams data is in ams node.', data: ams });
    }).catch(error => {
        res.json({ status: 201, message: 'Somthing went wrong !!', err: error });
    });
}

exports.updateAm = async (req, res) => {

    const amData = req.body.data;
    const todaysDate = new Date();

    if (Object.keys(amData).length <= 0)
        return res.json({ status: 201, message: 'No data provided to update am.' });

    let { id, employeeId, firstName, lastName, contact, email, designation, userTableId, location, year, totalAchieved, minEligiblity, percentageAchieved, targetAllote, targetAchieve, ctc, variables, variablePercentage, minAchievement } = amData;

    const amResult = AmModel.update({
        employeeId,
        firstName,
        lastName,
        contact,
        email,
        designation,
        userTableId,
        location,
        year,
        totalAchieved,
        minEligiblity,
        percentageAchieved,
        targetAllote,
        targetAchieve,
        ctc,
        variables,
        variablePercentage,
        minAchievement,
        createdAt: todaysDate,
        updatedAt: todaysDate
    }, { where: { id } }).then(result => {

        let amid = id;

        AmTargetModel.update({
            amId: amid,
            year,
            totalAchieved: totalAchieved,
            minEligiblity: minEligiblity,
            percentageAchieved,
            targetAllote,
            targetAchieve,
            ctc,
            variables,
            variablePercentage,
            minAchievement
        }, { where: { amId: amid } }).then(result => {
            // res.json({ status: 200, message: 'AM created successfully.' });

            AuthModel.update({
                userId: userTableId,
                userName: email,
                // password: hashPassword,
                // accountType: 2,
                // createdAt: todaysDate,
                // updatedAt: todaysDate
            }, { where: { userId: userTableId } }).then(result => {

                console.log("email=>", result.userName)

                // emails.emailForNewAccount(result.userName, password);
                return res.json({
                    status: 200,
                    message: 'User Updated successfully.'
                })
            }).catch(error => {
                return res.json({
                    status: 203,
                    err: error,
                    message: 'Couldnnt assiged auth details to the am.'
                });
            });


        }).catch(error => {
            console.log(error);
            res.json({ status: 203, err: error, message: 'Couldnnt assiged auth details to the am.' });
        });

    }).catch(error => {
        return error;
    })

    // if (amResult)
    //     return res.json({ status: 200, message: 'Am updated successfuly.' });
    // else
    //     return res.json({ status: 202, message: amResult })
}


exports.removeAm = async (req, res) => {

    const am_id = req.query.id;
    const created_at = new Date();
    let authId;
    const amData = await AmModel.findOne({
        where: {
            id: am_id
        }
    }).then(result => {
        return result;
    }).catch(error => console.log(error))

    const authRe = await AuthModel.destroy({ where: { userId: amData.userTableId } }).then(resu => {
        console.log(resu, "result2")
        console.log("auth data deleted successfully");
        return resu;
    }).catch(error => console.log(error))

    const userRes = await UserModel.destroy({ where :{ id: amData.userTableId}}).then(resul=> { 
        console.log(resul,"resul");
        console.log("user data removed successfull!");
        return resul;
    }).catch(error => console.log(error, "-user error"))

    const targetRes = await AmTargetModel.destroy({ where :{ amid: am_id}}).then(results=> { 
        console.log(results,"resul");
        console.log("user data removed successfull!");
        return results;
    }).catch(error => console.log(error, "-user error"))


    const amRes = await AmModel.destroy({ where: { id: am_id } }).then(result => {
        console.log(result, "resul");
        return result;
    }).catch(error => {
        console.log(error, "Error")
        return res.json({
            status: 500,
            message: error
        })
    })
    return res.json({ status: 200, message: "Record has been deleted successfully" })
}


exports.getAmYearData = async (req, res) => {
    const am_id = req.query.amid;
    const year = req.query.year;
    const created_at = new Date();

    AmTargetModel.findAndCountAll({
        where: { amId: am_id, year: year }
    }).then(result => {

        if (result.rows.length == 0) {
            res.json({
                status: 200,
                message: "AM Year data Not Found"
            })
        } else {
            res.json({
                status: 200,
                message: 'AM Year data is in ams node.',
                data: result
            });
        }

    }).catch(error => {
        return res.json({ status: 201, message: error });
    });
}

exports.getAmUser = async (req, res) => {
    const userId = req.query.userId;

    AmModel.hasMany(AmTargetModel, { foreignKey: 'amId' })
    AmModel.hasMany(OrderModel, { foreignKey: 'amId', sourceKey: 'userTableId' })
    // AmModel.hasMany(OrderModel, { foreignKey: 'amId', sourceKey: 'userTableId' })
    OrderModel.hasMany(InvoiceModel, { foreignKey: 'order_id' });

    let arr = await AmModel.findAll({
        include: [
            {
                model: AmTargetModel, attributes: ['year', 'ctc', 'variables', 'variablePercentage', 'minAchievement', 'totalAchieved', 'minEligiblity', 'percentageAchieved', 'targetAllote', 'targetAchieve'], required: false
            },
            {
                model: OrderModel, attributes: ['poValue', 'bdmPercentage'], required: false
            },
            { model: OrderModel, attributes: ['id', 'poValue', 'salePaymentReceivedAmount', 'GP'], required: false }
        ],
        where: { isDeleted: 0, userTableId: userId },
    }).then(ams => {
        console.log(ams, "aaaaaaaaaaaaaaaaaaa");
        return ams;

    })

    arr.forEach(bdm => {

        let salePaymentReceivedAmount = 0
        let orderCounter = 1;
        let gpValue = 0;

        bdm['tbl_orders'].forEach(order => {

            if (parseFloat(order.poValue) == parseFloat(order.salePaymentReceivedAmount)) {
                let invCounter = 1;
                salePaymentReceivedAmount = salePaymentReceivedAmount + parseFloat(order.salePaymentReceivedAmount);
                gpValue = gpValue + parseFloat(order.GP);

                if (orderCounter >= bdm['tbl_orders'].length) {
                    bdm['dataValues']['salePaymentReceivedAmount'] = salePaymentReceivedAmount;
                    bdm['dataValues']['GP'] = gpValue;
                }
                orderCounter++;
            }
            else {
                bdm['dataValues']['salePaymentReceivedAmount'] = salePaymentReceivedAmount;
                bdm['dataValues']['GP'] = gpValue;


                orderCounter++;

            }
        })

    });


    if (arr != 0) {
        return res.json({ status: 200, message: 'data is in node.', data: arr });
    }
    else {
        return res.json({ status: 203, message: 'data not found in node.' });
    }

}