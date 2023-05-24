const passGenerator = require('generate-password');
const bcrypt = require('bcryptjs');
const dotEnv = require('dotenv');
const Op = require('sequelize').Op
const emails = require('../../common/email.common');

const BdmModel = require('../../models/administrator/bdm.model');
const AuthModel = require('../../models/auth/auth.model');
const UserModel = require('../../models/administrator/user.model');
const BusinessUnitModel = require('../../models/administrator/business_unit.model');
const BdmTargetModel = require('../../models/administrator/bdm_target.model');
const BdmBusinessUnitModel = require('../../models/administrator/bdm_business_unit.model');
const BdmUnitModel = require('../../models/administrator/bdm_unit.model');
const OrderModel = require('../../models/order/order.model');
const InvoiceModel = require('../../models/order/invoice.model');
const Sequelize = require('sequelize');
const AmTargetModel = require('../../models/administrator/am_target.model');
const AmModel = require('../../models/administrator/am.model');
const { parse, log } = require('handlebars');
const OrderOem = require('../../models/order/order_oem.model');

//const { where } = require('sequelize/types');
dotEnv.config();

exports.createBdm = async (req, res) => {

    const bdmData = req.body.data;
    const todaysDate = new Date();


    let password = passGenerator.generate({ length: parseInt(process.env.length), numbers: process.env.numbers });

    let hashPassword = bcrypt.hashSync(password, parseInt(process.env.rounds));


    if (Object.keys(bdmData).length <= 0) {
        return res.json({ status: 201, message: 'No data provided to create bdm.' });
    }

    let { employeeId, firstName, lastName, contact, email, designation, location, businessUnit, year, totalAchieved, minEligiblity, percentageAchieved, targetAllote, targetAchieve, ctc, variables, variablePercentage, minAchievement, appraisalYear } = bdmData;

    UserModel.findOne({
        where: { email: email, isDeleted: 0 }
    }).then(result => {

        if (result) {
            return res.json({
                status: 202, message: 'This user is already exist in the system!! '
            });

        } else {


            BdmModel.create({
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
                for (let index = 0; index <= businessUnit.length; index++) {
                    let element = businessUnit[index];
                    const bdmid = result.id;

                    BdmBusinessUnitModel.create({
                        bdmId: bdmid,
                        buId: element,
                        description: 'Description',
                        createdAt: todaysDate,
                        updatedAt: todaysDate
                    }).then(result => {
                        let buid = result.id;
                        BdmUnitModel.create({
                            bdmId: bdmid,
                            buId: buid
                        })
                    }).catch(error => {
                        return error;
                    });

                    if (index == businessUnit.length) {
                        BdmTargetModel.create({
                            bdmId: bdmid,
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
                                designation: 'Business Development Manager',
                                email,
                                contact,
                                department: 0,
                                createdAt: todaysDate,
                                updatedAt: todaysDate
                            }).then(async (result) => {
                                let userid = result.id
                                let useremail = result.email


                                await BdmModel.update({
                                    userTableId: userid
                                }, { where: { id: bdmid } }).then(resul => {

                                    return resul;
                                }).catch(error => {
                                    return error;
                                })

                                AuthModel.create({
                                    userId: userid,
                                    userName: useremail,
                                    password: hashPassword,
                                    accountType: 3,
                                    createdAt: todaysDate,
                                    updatedAt: todaysDate
                                }).then(result => {
                                    console.log("email=>", result.userName)
                                    emails.emailForNewAccount(result.userName, password);
                                    return res.json({
                                        status: 200,
                                        message: 'BDM created successfully.'
                                    })
                                }).catch(error => {
                                    return res.json({
                                        status: 203,
                                        err: error,
                                        message: 'Couldnnt assiged auth details to the bdm.'
                                    });
                                });
                            }).catch(error => {
                                return error;
                            });

                        }).catch(error => {
                            return error;
                        });
                    }
                }

            }).catch(error => {
                console.log(error);
                // return error;
            });
        }
    })

}
exports.addTarget = async (req, res) => {

    const amData = req.body.data;

    if (Object.keys(amData).length <= 0)
        return res.json({ status: 201, message: 'No data provided to create am.' });

    let { id, year, totalAchieved, minEligiblity, percentageAchieved, targetAllote, targetAchieve, ctc, variables, variablePercentage, minAchievement, appraisalYear } = amData;

    BdmTargetModel.create({
        bdmId: id,
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
exports.getBdms = async (req, res) => {

    let offset = 'offset' in req.query ? (parseInt(req.query.offset) > 0 ? parseInt(req.query.offset) : 1) : 1;
    let limit = 'limit' in req.query ? (parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 9999) : 9999;
    offset = (offset - 1) * limit;

    BdmModel.hasMany(BdmBusinessUnitModel, { foreignKey: 'bdmId' })
    BdmModel.hasMany(BdmTargetModel, { foreignKey: 'bdmId' })
    BdmBusinessUnitModel.belongsTo(BusinessUnitModel, { foreignKey: 'buId' })
    BdmModel.hasMany(OrderModel, { foreignKey: 'bdm' })

    BdmModel.findAll({
        include: [
            { model: BdmTargetModel, attributes: ['year', 'appraisalYear', 'totalAchieved', 'minEligiblity', 'percentageAchieved', 'targetAllote', 'targetAchieve', 'ctc', 'variables', 'variablePercentage', 'minAchievement'], required: false },
            {
                model: BdmBusinessUnitModel, attributes: ['buid'], required: false, include: [
                    { model: BusinessUnitModel, attributes: ['id', 'categoryName'], required: false }
                ]
            },
            { model: OrderModel, attributes: ['GP', 'bdmPercentage'], required: false },
        ], order: [['id', 'DESC']],
        where: { isDeleted: 0 },
        offset: offset, limit: limit
    }).then(bdms => {
        res.json({ status: 200, message: 'Bdms data is in bdms node.', data: bdms });
    }).catch(error => {
        res.json({ status: 201, message: 'Somthing went wrong !!', err: error });
    });

}

exports.updateBdm = async (req, res) => {

    const bdmData = req.body.data;
    const todaysDate = new Date();

    if (Object.keys(bdmData).length <= 0)
        return res.json({ status: 201, message: 'No data provided to update bdm.' });

    let { id, employeeId, firstName, lastName, userTableId, contact, email, designation, location, businessUnit, year, totalAchieved, minEligiblity, percentageAchieved, targetAllote, targetAchieve, ctc, variables, variablePercentage, minAchievement } = bdmData;

    const bdmResult = await BdmModel.update({
        employeeId,
        firstName,
        lastName,
        contact,
        email,
        designation,
        userTableId,
        location,
        businessUnit,
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
    }, { where: { id } }).then(async (result) => {
        let bdmid = id;

        await BdmBusinessUnitModel.destroy({ where: { bdmId: bdmid } }).then(destroyed => { console.log(destroyed); }).catch(error => { console.log(error); });

        for (let index = 0; index < businessUnit.length; index++) {

            let element = businessUnit[index];
            BdmBusinessUnitModel.create({
                bdmId: bdmid,
                buId: element,
                description: 'Description',
                createdAt: todaysDate,
                updatedAt: todaysDate
            }).then(result => {
                console.log("result==>", result);
            }).catch(error => {
                return res.json({ status: 203, err: error, message: 'not updated' });
            });
        }
        BdmTargetModel.update({
            bdmId: bdmid,
            year,
            totalAchieved,
            minEligiblity,
            percentageAchieved,
            targetAllote,
            targetAchieve,
            ctc,
            variables,
            variablePercentage,
            minAchievement
        }, { where: { bdmId: bdmid } })
            .then(result => {


                AuthModel.update({
                    userId: userTableId,
                    userName: email,

                }, { where: { userId: userTableId } }).then(result => {

                })

                return res.json({ status: 200, message: 'BDM target updated successfully.' });
            }).catch(error => {
                return res.json({ status: 203, err: error, message: 'Couldnnt assiged target details to the bdm.' });
            });

    }).catch(error => {
        return error;
    })
}








exports.removeBdm = async (req, res) => {

    const bdm_id = req.query.id;
    const created_at = new Date();
    let authId;

    const bdgData = await BdmModel.findOne({
        where: {
            id: bdm_id
        }
    }).then(result => {
        return result;
    }).catch(error => console.log(error))

    const authRe = await AuthModel.destroy({ where: { userId: bdgData.userTableId } }).then(resu => {
        console.log(resu, "result2")
        console.log("auth data removed successfully!");
        return resu;
    }).catch(error => console.log(error, "-Auth error"))

    const userRes = await UserModel.destroy({ where: { id: bdgData.userTableId } }).then(resul => {
        console.log(resul, "resul");
        console.log("user data removed successfull!");
        return resul;
    }).catch(error => console.log(error, "-user error"))

    const targetRes = await BdmTargetModel.destroy({ where: { bdmId: bdm_id } }).then(results => {
        console.log(results, "resul");
        console.log("user data removed successfull!");
        return results;
    }).catch(error => console.log(error, "-user error"))

    const UnitRes = await BdmUnitModel.destroy({ where: { bdmId: bdm_id } }).then(resultss => {
        console.log(resultss, "resul");
        console.log("user data removed successfull!");
        return resultss;
    }).catch(error => console.log(error, "-user error"))

    const BussinessUnitRes = await BdmBusinessUnitModel.destroy({ where: { bdmId: bdm_id } }).then(re => {
        console.log(re, "resul");
        console.log("user data removed successfull!");
        return re;
    }).catch(error => console.log(error, "-user error"))



    const bdmRes = await BdmModel.destroy({ where: { id: bdm_id } }).then(result => {
        console.log(result, "resul");
        return result;
    }).catch(error => {
        console.log(error, "-----Error")
        return res.json({
            status: 500,
            message: error
        });
    });

    return res.json({ status: 200, message: "Record has been deleted successfully" })
}

exports.getBdmYearData = async (req, res) => {
    const bdm_id = req.query.bdmid;
    const year = req.query.year;
    const created_at = new Date();

    BdmTargetModel.findAndCountAll({
        where: { bdmId: bdm_id, year: year }
    }).then(result => {

        if (result.rows.length == 0) {
            res.json({
                status: 200,
                message: "BDM Year data Not Found"
            })
        } else {
            res.json({
                status: 200,
                message: 'BDM Year data is in bdms node.',
                data: result
            });
        }

    }).catch(error => {
        return res.json({ status: 201, message: error });
    });

}

exports.getYearTarget = async (req, res) => {
    const year = req.query.year;
    let arre = [];
    let counter = 1;
    let totalamount = 0;
    BdmTargetModel.belongsTo(BdmModel, { foreignKey: 'bdmId' })
    BdmModel.hasMany(OrderOem, { foreignKey: 'bdm' });
    OrderOem.belongsTo(OrderModel, { foreignKey: 'orderId' })
    OrderModel.hasMany(InvoiceModel, { foreignKey: 'order_id' });

    // OrderModel.hasMany(OrderOemModel, { foreignKey: 'orderId' })
    // OrderOemModel.belongsTo(ProductModel, { foreignKey: 'productType' })

    AmModel.hasMany(OrderModel, { foreignKey: 'amId', sourceKey: 'userTableId' })
    OrderModel.hasMany(OrderOem, { foreignKey: 'orderId' });
    AmTargetModel.belongsTo(AmModel, { foreignKey: 'amId', })

    let arr1 = await AmTargetModel.findAll({

        include: [
            {
                model: AmModel, attributes: ['id', 'firstName', 'lastName'],
                include:
                    [
                        {
                            model: OrderModel, attributes: ['id', 'poValue', 'salePaymentReceivedAmount', 'GP', 'receivedAmount', 'purchaseRecievedAmount', 'status'],
                            where: { status: "Fully Approved!!" },
                            required: false,
                            include: [
                                {
                                    model: OrderOem, attributes: ['id', 'orderId', 'productType']
                                }
                            ]
                        },

                    ]
            },


        ],
        where: { year: year }
    }).then(result => {
        return result;
    }).catch(error => {
        console.log(error);
    });

    let arr2 = await BdmTargetModel.findAll({
        include: [
            {
                model: BdmModel, attributes: ['id', 'firstName', 'lastName'],
                include:
                    [{
                        model: OrderOem,
                        attributes: ['id', 'bdm', 'bdmPercentage', 'businessUnit', 'productType', 'customerPoValue', 'vendorPoValue', 'BDM_POGM', 'BDM_POGMPercent', 'BDM_PM', 'BDM_BR', 'BDM_GP', 'BDM_GPPercent'],

                        include: [
                            {
                                model: OrderModel,
                                attributes: ['id', 'poValue', 'salePaymentReceivedAmount', 'purchasePaymentReceivedAmount', 'GP', 'receivedAmount', 'purchaseRecievedAmount'],
                                where: { status: "Fully Approved!!" },

                            },
                        ]
                    }]
            },
        ],
        where: { year: year }
    }).then(result => {
        return result
    }).catch(error => {
        console.log(error);
    });

    // setTimeout(() => {
    arre.push(arr1);
    // console.log(arr1,"array1")
    arre.push(arr2);
    // console.log(arr2,"array2")
    if (arre != 0) {
        return res.json({ status: 200, message: 'data is in node.', data: arre });
    }
    else {
        return res.json({ status: 203, message: 'data not found in node.' });
    }
    // }, 5000);


}


exports.getBusinessUnit = async (req, res) => {

    let offset = 'offset' in req.query ? (parseInt(req.query.offset) > 0 ? parseInt(req.query.offset) : 1) : 1;
    let limit = 'limit' in req.query ? (parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 9999) : 9999;
    offset = (offset - 1) * limit;

    const businessUnit = await BusinessUnitModel.findAndCountAll({ offset: offset, limit: limit }).then(businessUnit => businessUnit).catch(error => error);

    if (businessUnit)
        return res.json({ status: 200, message: 'Business Unit data is in Business Unit node.', data: businessUnit });
    else
        return res.json({ status: 201, message: businessUnit });
}

exports.getBdmById = async (req, res) => {
    const buid = req.query.buId;

    const created_at = new Date();
    let bdmdata = [];
    BdmBusinessUnitModel.belongsTo(BdmModel, { foreignKey: 'bdmId' });
    BdmBusinessUnitModel.findAndCountAll({
        include: [
            {
                model: BdmModel, attributes: ['id', 'firstName', 'lastName', 'employeeId'], required: false
            }
        ],
        where: { buId: buid }
    }).then(result => {
        if (result.length == 0) {
            res.json({
                status: 200,
                message: "BDM Not Found"
            })
        } else {
            result.rows.forEach(element => {
                bdmdata.push(element.tbl_masters_bdm);
            });
            return res.json({
                status: 200,
                message: 'BDM according to business unit data is in bdms node.',
                data: bdmdata
            });
        }
    }).catch(error => {
        return res.json({ status: 201, message: error });
    });
}


exports.getBdmUser = async (req, res) => {

    const userId = req.query.userId;


    BdmModel.hasMany(BdmBusinessUnitModel, { foreignKey: 'bdmId' })
    BdmModel.hasMany(BdmTargetModel, { foreignKey: 'bdmId' })

    BdmModel.hasMany(OrderModel, { foreignKey: 'bdm', sourceKey: 'userTableId' })
    OrderModel.hasMany(InvoiceModel, { foreignKey: 'order_id', sourceKey: 'id' });


    let arr = await BdmModel.findAll({

        include: [
            {
                model: BdmTargetModel, attributes: ['year', 'ctc', 'variables', 'variablePercentage', 'minAchievement', 'totalAchieved', 'minEligiblity', 'percentageAchieved', 'targetAllote', 'targetAchieve'], required: false
            },
            {
                model: BdmBusinessUnitModel, attributes: ['buid'], required: false
            },
            {
                model: OrderModel, attributes: ['id', 'poValue', 'salePaymentReceivedAmount', 'GP'], required: false
            },
        ],
        where: { isDeleted: 0, userTableId: userId },
    }).then(bdms => {
        console.log(bdms, "bdmsbdmsbdmsbdmsbdmsbdmsbdmsbdmsbdmsbdmsbdmsbdmsbdmsbdmsbdms");
        return bdms;

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
