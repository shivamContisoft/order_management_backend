const passGenerator = require('generate-password');
const bcrypt = require('bcryptjs');
const dotEnv = require('dotenv');
const multer = require('multer');
const fs = require("fs");
const path = require("path");
//const Op=Sequelize.Op;
const Op = require('sequelize').Op
const Sequelize = require('sequelize');
const BdmModel = require('../../models/administrator/bdm.model');
const AmModel = require('../../models/administrator/am.model');
const AuthModel = require('../../models/auth/auth.model');
const UserModel = require('../../models/administrator/user.model');
const BusinessUnitModel = require('../../models/administrator/business_unit.model');
const BdmTargetModel = require('../../models/administrator/bdm_target.model');
const AMTargetModel = require('../../models/administrator/am_target.model');
const BdmBusinessUnitModel = require('../../models/administrator/bdm_business_unit.model');
const BdmUnitModel = require('../../models/administrator/bdm_unit.model');
const EntityModel = require('../../models/administrator/entity.model');
const CustomerModel = require('../../models/administrator/customer.model');
const VendorModel = require('../../models/administrator/vendor.model');
const ProductModel = require('../../models/administrator/product.model');
const OemModel = require('../../models/administrator/oem.model');
const ApprovalModel = require('../../models/administrator/approval.model');
const OrderModel = require('../../models/order/order.model');
const OrderSaleModel = require('../../models/order/order_sale.model');
const OrderPurchaseModel = require('../../models/order/order_purchase.model');
const OrderAttachmentModel = require('../../models/order/order_attachment.model');
const OrderVendorModel = require('../../models/order/order_vendor.model');
const emails = require('../../common/email.common');
const OrderApprovalModel = require('../../models/order/order_approval.model');
const invoiceModel = require('../../models/order/invoice.model');
const invoicePurchaseModel = require('../../models/order/invoicePurchase.model');
const paymentDataModel = require('../../models/order/payment_Data.model');
const paymentPurchaseModel = require('../../models/order/paymentPerchase.model');
const vendorInvoiceModel = require('../../models/order/invoice_vendor.model');
const { sequelize } = require('sequelize');
const OrderOemModel = require('../../models/order/order_oem.model');
//const AMTargetModel =require('../../models/admimistrator/am_target.model')
const { raw } = require('body-parser');
const { LOADIPHLPAPI } = require('dns');
const { log } = require('console');
//const AMTarget = require('../../models/administrator/am_target.model');
dotEnv.config();

//File upload code is starting from here!
let DIR_PATH = "./uploads/temporary_uploads";
const store = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, DIR_PATH);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: store }).array('files[]');

function copyFile(file, dir2) {

    //gets file name and adds it to dir2
    var f = path.basename(file);
    var source = fs.createReadStream(file);
    var dest = fs.createWriteStream(path.resolve(dir2, f));

    source.pipe(dest);
    source.on('end', function () { console.log('Succesfully copied'); });
    source.on('error', function (err) { console.log(err); });
};

exports.createOrder = async (req, res) => {

    const current_timestamp = Date.now();
    DIR_PATH = DIR_PATH + '/' + current_timestamp;

    if (!fs.existsSync(DIR_PATH)) {
        fs.mkdirSync(DIR_PATH);
    }

    let current_order_no = 0;
    await OrderModel.findAll({
        limit: 1,

        order: [['id', 'DESC']],
        raw: true,
    }).then(resu => {
        if (resu != 0) {
            console.log(resu != 0);
            current_order_no = resu[0].orderCode + 1;
        } else {
            current_order_no = 1000;
        }
    });




    upload(req, res, function (err) {
        if (err) {
            return res.status(501).json({ error: err });
        }

        let uploaded_file = [];
        let attachments = [];
        let is_attachment = 0;
        let totalEUP = 0;
        let TotalSalePoValue = 0;
        let TotalpoPurchaseValue = 0;
        let poPurchaseValue = 0;
        let poValue = 0;
        let PM = 0;

        if (req.files) {
            req.files.forEach(element => {
                uploaded_file.push(element.filename);
                is_attachment = 1;
            });
        }

        const orderData = JSON.parse(req.body.data);


        const todaysDate = new Date();

        if (Object.keys(orderData).length <= 0)
            return res.json({ status: 201, message: 'No data provided to create order.' });

        let { amId, entity, companyName, companyPaymentTerms, businessUnit, bdm,
            bdmPercentage, productType, productDescription, orderType, poNo, poDate, duration, addOnOem, externalCost } = orderData;




        for (let index = 0; index < addOnOem.length; index++) {
            let element = addOnOem[index].poValue;
            TotalSalePoValue = TotalSalePoValue + element;
            let purchaseElement = addOnOem[index].poPurchaseValue;
            TotalpoPurchaseValue = TotalpoPurchaseValue + purchaseElement;
        }

        let POGM = TotalSalePoValue - TotalpoPurchaseValue;
        let POGMPercent = POGM / TotalSalePoValue * 100;

        if (productType != 8) {
            console.log("companyPaymentTerms", companyPaymentTerms);
            console.log("vendorPaymentTerms", addOnOem[0].addOnVendor[0].vendorPaymentValue)
            PM = TotalSalePoValue * 0.25 / 100;

            if ((companyPaymentTerms == 0) && (addOnOem[0].addOnVendor[0].vendorPaymentValue > 0)) {
                BR = 0

            } else if (companyPaymentTerms > addOnOem[0].addOnVendor[0].vendorPaymentValue) {
                BR = TotalSalePoValue * 2 / 100;

            } else if (companyPaymentTerms < addOnOem[0].addOnVendor[0].vendorPaymentValue) {
                BR = TotalSalePoValue * 1 / 100;

            } else if (companyPaymentTerms == addOnOem[0].addOnVendor[0].vendorPaymentValue) {
                BR = TotalSalePoValue * 1 / 100;

            }
            else {
                BR = TotalSalePoValue * 0 / 100;
            }


        }
        else {
            console.log("productType==>", productType);
            PM = TotalSalePoValue * 1 / 100;
            console.log(PM, "PMPM");
            BR = TotalSalePoValue * 0 / 100;
        }

        GP = POGM - PM - BR - externalCost;

        GPPercent = GP / TotalSalePoValue * 100;




        OrderModel.create({
            amId: amId,
            entity: entity,
            companyName: companyName,
            companyPaymentTerms: companyPaymentTerms,
            // oem,
            // oemDealerId,
            // businessUnit: businessUnit,
            // bdm: bdm,
            // bdmPercentage: bdmPercentage,
            // productType:productType,
            // productDescription:productDescription,
            poNo: poNo,
            orderType,
            poDate: poDate,
            duration: duration,
            poValue: TotalSalePoValue,
            poPurchaseValue: TotalpoPurchaseValue,
            externalCost: externalCost,
            is_attachment: is_attachment,
            status: 'Pending',
            pendingAt: 0,
            step: 1,
            orderCode: current_order_no,
            POGM: POGM,
            POGMPercent: POGMPercent,
            PM: PM,
            BR: BR,
            GP: GP,
            GPPercent: GPPercent,
            createdAt: todaysDate,
            updatedAt: todaysDate
        }).then(result => {
            console.log(result, "resultresult resultresult")

            let orderId = result.id;
            let productType = result.productType;
            console.log(addOnOem, "----------= addOnOem")
            addOnOem.forEach(element => {
                // ============================================================================================

                const BdmEUP = (element.poValue * element.bdmPercentage / 100)
                const BdmTP = (element.poPurchaseValue * element.bdmPercentage / 100)
                console.log(bdmPercentage, "bdmPercentage")
                console.log(poValue, "poValue");
                console.log(element.bdmPercentage, "element.bdmPercentage");
                console.log(element.poValue, "element.poValue")

                // ========================================================================================================

                //========================================GP for BDM================================================================ 



                let BDM_POGM = BdmEUP - BdmTP;
                console.log(BDM_POGM, "BDM_POGM ")
                let BDM_POGMPercent = BDM_POGM / BdmEUP * 100;
                console.log(BDM_POGMPercent, "BDM_POGMPercent ")

                if (productType != 8) {
                    console.log("companyPaymentTerms", companyPaymentTerms);
                    console.log("vendorPaymentTerms", addOnOem[0].addOnVendor[0].vendorPaymentValue)
                    BDM_PM = BdmEUP * 0.25 / 100;

                    if ((companyPaymentTerms == 0) && (addOnOem[0].addOnVendor[0].vendorPaymentValue > 0)) {
                        BDM_BR = 0

                    } else if (companyPaymentTerms > addOnOem[0].addOnVendor[0].vendorPaymentValue) {
                        BDM_BR = BdmEUP * 2 / 100;

                    } else if (companyPaymentTerms < addOnOem[0].addOnVendor[0].vendorPaymentValue) {
                        BDM_BR = BdmEUP * 1 / 100;

                    } else if (companyPaymentTerms == addOnOem[0].addOnVendor[0].vendorPaymentValue) {
                        BDM_BR = BdmEUP * 1 / 100;

                    }
                    else {
                        BDM_BR = BdmEUP * 0 / 100;
                    }


                }
                else {
                    console.log("productType==>", productType);
                    BDM_PM = BdmEUP * 1 / 100;
                    console.log(BDM_PM, "PMPM");
                    BDM_BR = BdmEUP * 0 / 100;
                }

                BDM_GP = BDM_POGM - BDM_PM - BDM_BR - externalCost;

                BDM_GPPercent = 0;// BDM_GP / BdmEUP * 100;

                // if (!isNaN(BDM_GPPercent)) { BDM_GPPercent = BDM_GPPercent }

                // =========================================================================================================



                OrderOemModel.create({
                    orderId: orderId,
                    oem: element.oem,
                    oemDealerId: element.oemDealerId,
                    productType: element.productType,
                    productDescription: element.productDescription,
                    // srno: element.srno,
                    businessUnit: element.businessUnit,
                    bdm: element.bdm,
                    bdmPercentage: element.bdmPercentage,
                    customerPoValue: BdmEUP,
                    vendorPoValue: BdmTP,
                    totalCustomerPoValue: element.poValue,
                    totalVendorPoValue: element.poPurchaseValue,
                    BDM_POGM: BDM_POGM,
                    BDM_POGMPercent: BDM_POGMPercent,
                    BDM_PM: BDM_PM,
                    BDM_BR: BDM_BR,
                    BDM_GP: BDM_GP,
                    BDM_GPPercent: BDM_GPPercent,

                }).catch(error => {
                    console.log(error, "OrderOemModel");
                })
            });

            //Insert order sale data
            addOnOem.forEach(element => {
                console.log(element, "elementelement")
                OrderSaleModel.create({
                    orderId: orderId,
                    saleProductValue: element.saleProductValue,
                    saleProductAttachValue: element.saleProductAttachValue,
                    saleProductServiceValue: element.saleProductServiceValue,
                }).catch(error => {
                    console.log(error, "OrderSaleModel");
                })
            })
            //Insert order purchase data
            addOnOem.forEach(element => {
                OrderPurchaseModel.create({
                    orderId: orderId,
                    purchaseProductValue: element.purchaseProductValue,
                    purchaseProductAttachValue: element.purchaseProductAttachValue,
                    purchaseProductServiceValue: element.purchaseProductServiceValue,
                }).catch(error => {
                    console.log(error, "OrderPurchaseModel");
                })
            })
            //Insert order add on vendor data
            addOnOem.forEach(element => {
                element.addOnVendor.forEach(ele => {
                    OrderVendorModel.create({
                        orderId: orderId,
                        vendorValue: ele.vendorValue,
                        vendorPaymentValue: ele.vendorPaymentValue,
                        vendorPoValue: ele.vendorPoValue
                    }).catch(error => {
                        console.log(error, "OrderVendorModel");
                    })
                })
            });




            //Update order pending userid data
            console.log(addOnOem, "addOnOem999999")
            let productType1 = addOnOem[0].productType
            console.log(productType1, "productType1111111111");
            ApprovalModel.findAll({

                where: { productType: productType1 },
                distinct: true,
                order: [['stageOrder', 'ASC']]
            }).then(resul => {
                let userId = resul[0].userId;
                console.log(resul, "result result result");
                console.log(resul[0].userId, "uuuuuuuuuuuuuuuuu");
                // UserModel.findOne({
                //     where: { id: userId },

                //     raw: true,
                // }).then(resu0 => {

                //     emails.approverEmail(resu.firstName, resu.lastName, resu.email);

                // });
                CustomerModel.findOne({
                    where: { id: companyName },
                    raw: true,
                }).then(result2 => {
                    console.log(result2, "customer name")

                    // OrderOemModel.findOne({
                    //     where: { id: productType},
                    //     raw: true,
                    // }).then(result4 => {
                    //     console.log(result4,"email step product type")



                    // ProductModel.findOne({
                    //     where: { id: productType },
                    //     raw: true,
                    // }).then(result1 => {

                    // console.log(result1, "result1result1result1");

                    UserModel.findOne({
                        where: { id: resul[0].userId },

                        raw: true,
                    }).then(resu => {
                        console.log("resu================>", resu);
                        const approverName = resu.firstName + ' ' + resu.lastName;
                        console.log(resu.email, "emailemailemailemailemailemailemailemail");
                        emails.approverEmail(resu.firstName, resu.lastName, resu.email, result.orderCode, result2.customerName, result.poNo, result.poValue, approverName);





                        AmModel.findOne({
                            where: { userTableId: orderData.amId }
                        }).then(resu => {
                            // console.log(result1.productName, result2.customerName, result.poNo, result.poValue, "wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww");
                            console.log(result.orderCode, "result.orderCoderesult.orderCode");
                            console.log(approverName, "approverNameapproverNameapproverName");
                            emails.emailgoesToOrderOwner(resu.firstName, resu.lastName, resu.email, result.orderCode, result2.customerName, result.poNo, result.poValue, approverName);
                        })
                    }).catch(error => error)

                        .catch(error => error)
                        .catch(error => error)


                    OrderModel.update({
                        pendingAt: resul[0].userId,
                    }, {
                        where: { id: orderId }

                    }).then(result1 => result1).catch(error => error)



                })
            }).catch(error => error)

            //Creating order directory to store files from order starts here 
            var dir = './uploads/' + '/orders/' + orderId;

            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
                fs.mkdirSync(dir + '/orders/')
                fs.mkdirSync(dir + '/orders/' + orderId)
            }

            ORG_DIR_PATH = './uploads/' + '/orders/' + orderId;

            if (uploaded_file.length > 0) {
                for (let index = 0; index < uploaded_file.length; index++) {
                    const element = uploaded_file[index];
                    copyFile(DIR_PATH + '/' + element, ORG_DIR_PATH);

                    OrderAttachmentModel.create({
                        orderId: orderId,
                        fileName: element,
                        createdAt: todaysDate,
                        updatedAt: todaysDate
                    }).then(result => {
                        attachments.push({
                            fileName: element,
                            path: './uploads/' + '/orders/' + orderId + element
                        });

                        if ((index + 1) === uploaded_file.length) {
                            return res.json({
                                status: 200,
                                message: 'Order created successfully.'
                            })
                        }

                    }).catch(error => {
                        return res.json({
                            status: 500,
                            message: 'Error while storing file details!',
                            error: error
                        });
                    });
                }
            } else {
                return res.json({
                    status: 200,
                    message: 'Order created successfully.'
                })
            }
        }).catch(error => {
            console.log(error);
            return res.json({
                status: 203,
                err: error,
                message: 'Couldnnt assiged auth details to the order.'
            });
        });



    })

}

exports.getOrders = async (req, res) => {

    let offset = 'offset' in req.query ? (parseInt(req.query.offset) > 0 ? parseInt(req.query.offset) : 1) : 1;
    let limit = 'limit' in req.query ? (parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 9999) : 9999;
    offset = (offset - 1) * limit;

    OrderModel.belongsTo(AmModel, { foreignKey: 'amId' })
    OrderModel.belongsTo(EntityModel, { foreignKey: 'entity' })
    OrderModel.belongsTo(CustomerModel, { foreignKey: 'companyName' })
    OrderModel.belongsTo(BdmModel, { foreignKey: 'bdm' })
    OrderModel.belongsTo(BusinessUnitModel, { foreignKey: 'businessUnit' })
    OrderModel.belongsTo(OemModel, { foreignKey: 'oem' })

    OrderModel.hasMany(OrderOemModel, { foreignKey: 'orderId' })
    OrderOemModel.belongsTo(ProductModel, { foreignKey: 'productType' })

    OrderModel.hasMany(OrderOemModel, { foreignKey: 'orderId' })
    OrderOemModel.belongsTo(BusinessUnitModel, { foreignKey: 'businessUnit' })


    OrderModel.hasMany(OrderSaleModel, { foreignKey: 'orderId' })
    OrderModel.hasMany(OrderPurchaseModel, { foreignKey: 'orderId' })
    OrderModel.hasMany(OrderAttachmentModel, { foreignKey: 'id' })
    OrderModel.hasMany(OrderVendorModel, { foreignKey: 'orderId' })
    OrderVendorModel.belongsTo(VendorModel, { foreignKey: 'vendorValue' })

    OrderModel.hasMany(OrderOemModel, { foreignKey: 'orderId' })
    OrderOemModel.belongsTo(OemModel, { foreignKey: 'oem' })

    OrderApprovalModel.belongsTo(UserModel, { foreignKey: 'userId' })

    const orders = await OrderModel.findAll({
        attributes: ['poPurchaseValue', 'poDate', 'poValue', 'orderType', 'orderCode', 'id', 'createdAt', 'status', 'poNo', 'externalCost', 'POGM', 'POGMPercent', 'PM', 'BR', 'GP', 'GPPercent', 'duration', 'bdmPercentage', 'companyPaymentTerms'],
        include: [
            {
                model: AmModel,
                attributes: ['id', 'firstName', 'lastName', 'userTableId'],
                required: false
            },
            {
                model: EntityModel,
                attributes: ['id', 'entityName'],
                required: false
            },
            {
                model: CustomerModel,
                attributes: ['id', 'customerName'],
                required: false
            },
            {
                model: BdmModel,
                attributes: ['id', 'firstName', 'lastName'],
                required: false
            },
            {
                model: BusinessUnitModel,
                attributes: ['id', 'categoryName'],
                required: false
            },
            {
                model: OemModel,
                attributes: ['id', 'oemName'],
                required: false
            },
            {
                model: OrderSaleModel,
                attributes: ['id', 'orderId', 'saleProductValue', 'saleProductAttachValue', 'saleProductServiceValue'],
                required: false
            },
            {
                model: OrderPurchaseModel,
                attributes: ['id', 'orderId', 'purchaseProductValue', 'purchaseProductAttachValue', 'purchaseProductServiceValue'],
                required: false
            },
            {
                model: OrderAttachmentModel,
                attributes: ['id', 'orderId', 'fileName'],
                required: false
            },
            {
                model: OrderVendorModel,
                attributes: ['id', 'orderId', 'vendorValue', 'vendorPaymentValue', 'vendorPoValue'],
                required: false,
                include: {
                    model: VendorModel, attributes: ['id', 'vendorName'],
                    required: false
                }
            },
            {
                model: OrderOemModel,
                attributes: ['id', 'orderId', 'oem', 'oemDealerId', 'productType', 'productDescription', 'businessUnit', 'bdm', 'bdmPercentage', 'customerPoValue'],
                required: false,
                include: [
                    {
                        model: OemModel, attributes: ['id', 'oemName'],
                        required: false
                    },
                    {
                        model: ProductModel, attributes: ['id', 'productName'],
                        required: false
                    }
                    ,
                    {
                        model: BusinessUnitModel, attributes: ['id', 'categoryName'],
                        required: false
                    }
                ]

            },


        ],
        order: [['id', 'DESC']],
        offset: offset,
        limit: limit,
        // raw: true
    }).then(async orders => {

        order_arr_length = orders.length;

        for (let index = 0; index < order_arr_length; index++) {
            const element = orders[index];

            let approval_data = await OrderApprovalModel.findAll({
                attributes: ['id', 'orderId', 'comment', 'status', 'userId', 'createdAt', 'time'],
                include: {
                    model: UserModel,
                    attributes: ['id', 'firstName', 'lastName', 'department'],
                    required: false
                },
                where: { orderId: element.id },
                order: [['id', 'ASC']],
            }).then(result => { return result }).catch(error => { console.log(error); })

            if (approval_data.length > 0) {
                orders[index]['dataValues']['order_approval'] = approval_data;
            } else {
                orders[index]['dataValues']['order_approval'] = [];
            }
        }
        return orders;
    }).catch(error => { console.log(error) });

    if (orders)
        return res.json({ status: 200, message: 'Orders data is in node.', data: orders });
    else
        return res.json({ status: 201, message: orders });
}



exports.getOrdersforXL = async (req, res) => {

    let offset = 'offset' in req.query ? (parseInt(req.query.offset) > 0 ? parseInt(req.query.offset) : 1) : 1;
    let limit = 'limit' in req.query ? (parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 9999) : 9999;
    offset = (offset - 1) * limit;

    // OrderModel.belongsTo(AmModel, { foreignKey: 'amId' })
    OrderModel.hasOne(AmModel, { sourceKey: 'amId', foreignKey: 'userTableId' })
    OrderModel.belongsTo(EntityModel, { foreignKey: 'entity' })
    OrderModel.belongsTo(CustomerModel, { foreignKey: 'companyName' })
    // OrderModel.belongsTo(BdmModel, { foreignKey: 'bdm' })
    OrderModel.belongsTo(BusinessUnitModel, { foreignKey: 'businessUnit' })
    OrderModel.belongsTo(OemModel, { foreignKey: 'oem' })


    OrderModel.hasMany(OrderOemModel, { foreignKey: 'orderId' })
    OrderOemModel.belongsTo(BdmModel, { foreignKey: 'bdm' })

    OrderModel.hasMany(OrderOemModel, { foreignKey: 'orderId' })
    OrderOemModel.belongsTo(ProductModel, { foreignKey: 'productType' })

    OrderModel.hasMany(OrderOemModel, { foreignKey: 'orderId' })
    OrderOemModel.belongsTo(BusinessUnitModel, { foreignKey: 'businessUnit' })


    OrderModel.hasMany(OrderSaleModel, { foreignKey: 'orderId' })
    OrderModel.hasMany(OrderPurchaseModel, { foreignKey: 'orderId' })
    OrderModel.hasMany(OrderAttachmentModel, { foreignKey: 'id' })
    OrderModel.hasMany(OrderVendorModel, { foreignKey: 'orderId' })
    OrderVendorModel.belongsTo(VendorModel, { foreignKey: 'vendorValue' })

    OrderModel.hasMany(OrderOemModel, { foreignKey: 'orderId' })
    OrderOemModel.belongsTo(OemModel, { foreignKey: 'oem' })

    OrderApprovalModel.belongsTo(UserModel, { foreignKey: 'userId' })

    const orders = await OrderModel.findAll({
        attributes: ['poPurchaseValue', 'poDate', 'poValue', 'orderType', 'orderCode', 'id', 'createdAt', 'status', 'poNo', 'externalCost', 'POGM', 'POGMPercent', 'PM', 'BR', 'GP', 'GPPercent', 'duration', 'bdmPercentage', 'companyPaymentTerms', 'purchaseRecievedAmount', 'purchasePaymentReceivedAmount', 'receivedAmount', 'salePaymentReceivedAmount'],
        include: [
            {
                model: AmModel,
                attributes: ['id', 'firstName', 'lastName'],
                required: false
            },
            {
                model: EntityModel,
                attributes: ['id', 'entityName'],
                required: false
            },
            {
                model: CustomerModel,
                attributes: ['id', 'customerName'],
                required: false
            },
            {
                model: BdmModel,
                attributes: ['id', 'firstName', 'lastName'],
                required: false
            },
            {
                model: BusinessUnitModel,
                attributes: ['id', 'categoryName'],
                required: false
            },
            {
                model: OemModel,
                attributes: ['id', 'oemName'],
                required: false
            },
            {
                model: OrderSaleModel,
                attributes: ['id', 'orderId', 'saleProductValue', 'saleProductAttachValue', 'saleProductServiceValue'],
                required: false
            },
            {
                model: OrderPurchaseModel,
                attributes: ['id', 'orderId', 'purchaseProductValue', 'purchaseProductAttachValue', 'purchaseProductServiceValue'],
                required: false
            },
            {
                model: OrderAttachmentModel,
                attributes: ['id', 'orderId', 'fileName'],
                required: false
            },
            {
                model: OrderVendorModel,
                attributes: ['id', 'orderId', 'vendorValue', 'vendorPaymentValue', 'vendorPoValue'],
                required: false,
                include: {
                    model: VendorModel, attributes: ['id', 'vendorName'],
                    required: false
                }
            },
            {
                model: OrderOemModel,
                attributes: ['id', 'orderId', 'oem', 'oemDealerId', 'productType', 'productDescription', 'businessUnit', 'bdm', 'bdmPercentage'],
                required: false,
                include: [
                    {
                        model: OemModel, attributes: ['id', 'oemName'],
                        required: false
                    },
                    {
                        model: ProductModel, attributes: ['id', 'productName'],
                        required: false
                    }
                    ,
                    {
                        model: BusinessUnitModel, attributes: ['id', 'categoryName'],
                        required: false
                    }
                    ,
                    {
                        model: BdmModel,
                        attributes: ['id', 'firstName', 'lastName'],
                        required: false
                    }
                ]

            },


        ],
        order: [['id', 'DESC']],
        offset: offset,
        limit: limit,
        // raw: true
        // }).then(async orders => {

        //     order_arr_length = orders.length;

        //     for (let index = 0; index < order_arr_length; index++) {
        //         const element = orders[index];

        //         let approval_data = await OrderApprovalModel.findAll({
        //             attributes: ['id', 'orderId', 'comment', 'status', 'userId', 'createdAt', 'time'],
        //             include: {
        //                 model: UserModel,
        //                 attributes: ['id', 'firstName', 'lastName', 'department'],
        //                 required: false
        //             },
        //             where: { orderId: element.id },
        //             order: [['id', 'ASC']],
        //         }).then(result => { return result }).catch(error => { console.log(error); })

        //         if (approval_data.length > 0) {
        //             orders[index]['dataValues']['order_approval'] = approval_data;
        //         } else {
        //             orders[index]['dataValues']['order_approval'] = [];
        //         }
        //     }
        //     return orders;
    }).catch(error => { console.log(error) });

    if (orders)
        return res.json({ status: 200, message: 'Orders data is in node.', data: orders });
    else
        return res.json({ status: 201, message: orders });
}





exports.getOrdersAM = async (req, res) => {


    var userId = req.query.userId

    let offset = 'offset' in req.query ? (parseInt(req.query.offset) > 0 ? parseInt(req.query.offset) : 1) : 1;
    let limit = 'limit' in req.query ? (parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 9999) : 9999;
    offset = (offset - 1) * limit;

    OrderModel.belongsTo(AmModel, { foreignKey: 'amId' })
    OrderModel.belongsTo(EntityModel, { foreignKey: 'entity' })
    OrderModel.belongsTo(CustomerModel, { foreignKey: 'companyName' })
    OrderModel.belongsTo(BdmModel, { foreignKey: 'bdm' })
    OrderModel.belongsTo(BusinessUnitModel, { foreignKey: 'businessUnit' })
    OrderModel.belongsTo(OemModel, { foreignKey: 'oem' })
    OrderModel.belongsTo(ProductModel, { foreignKey: 'productType' })
    //OrderModel.belongsTo(OemModel,)

    OrderModel.hasMany(OrderOemModel, { foreignKey: 'id' })
    OrderOemModel.belongsTo(BusinessUnitModel, { foreignKey: 'businessUnit' })

    OrderModel.hasMany(OrderSaleModel, { foreignKey: 'orderId' })
    OrderModel.hasMany(OrderPurchaseModel, { foreignKey: 'orderId' })
    OrderModel.hasMany(OrderAttachmentModel, { foreignKey: 'orderId' })
    OrderModel.hasMany(OrderVendorModel, { foreignKey: 'orderId' })

    OrderModel.hasMany(OrderOemModel, { foreignKey: 'orderId' })
    OrderOemModel.belongsTo(ProductModel, { foreignKey: 'productType' })

    OrderVendorModel.belongsTo(VendorModel, { foreignKey: 'vendorValue' })
    OrderModel.hasMany(OrderOemModel, { foreignKey: 'orderId' })
    OrderOemModel.belongsTo(OemModel, { foreignKey: 'oem' })
    OrderApprovalModel.belongsTo(UserModel, { foreignKey: 'userId' })
    OrderModel.hasMany(OrderApprovalModel, { foreignKey: 'orderId' })
    const orders = await OrderModel.findAll({
        attributes: ['poPurchaseValue', 'poDate', 'poValue', 'orderCode', 'orderType', 'id', 'createdAt', 'status', 'productDescription', 'poNo', 'externalCost', 'POGM', 'POGMPercent', 'PM', 'BR', 'GP', 'GPPercent', 'duration', 'bdmPercentage', 'companyPaymentTerms'],
        include: [
            {
                model: AmModel, attributes: ['id', 'firstName', 'lastName', 'userTableId'], required: false
            },
            {
                model: EntityModel, attributes: ['id', 'entityName'], required: false
            },
            {
                model: CustomerModel, attributes: ['id', 'customerName'], required: false
            },
            {
                model: BdmModel, attributes: ['id', 'firstName', 'lastName'], required: false
            },
            {
                model: BusinessUnitModel, attributes: ['id', 'categoryName'], required: false
            },
            {
                model: OemModel, attributes: ['id', 'oemName'], required: false
            },
            {
                model: ProductModel, attributes: ['id', 'productName'], required: false
            },
            {
                model: OrderSaleModel, attributes: ['id', 'orderId', 'saleProductValue', 'saleProductAttachValue', 'saleProductServiceValue'], required: false
            },
            {
                model: OrderPurchaseModel, attributes: ['id', 'orderId', 'purchaseProductValue', 'purchaseProductAttachValue', 'purchaseProductServiceValue'], required: false
            },
            {
                model: OrderAttachmentModel, attributes: ['id', 'orderId', 'fileName'], required: false
            },
            {
                model: OrderVendorModel, attributes: ['id', 'orderId', 'vendorValue', 'vendorPaymentValue', 'vendorPoValue'], required: false,
                include: {
                    model: VendorModel, attributes: ['id', 'vendorName'], required: false
                }
            },
            // {
            //     model: OrderApprovalModel, attributes: ['id', 'orderId', 'comment', 'status', 'userId', 'createdAt', 'time'], required: false,
            //     include: {
            //         model: UserModel, attributes: ['id', 'firstName', 'lastName'], required: false
            //     }
            // },
            {
                model: OrderOemModel,
                attributes: ['id', 'orderId', 'oem', 'oemDealerId', 'productType', 'productDescription', 'businessUnit', 'bdm', 'bdmPercentage'],
                required: false,
                include: [
                    {
                        model: OemModel, attributes: ['id', 'oemName'],
                        required: false
                    },
                    {
                        model: ProductModel, attributes: ['id', 'productName'],
                        required: false
                    },
                    {
                        model: BusinessUnitModel, attributes: ['id', 'categoryName'],
                        required: false
                    }
                ]

            },

        ],
        where: { amId: userId },
        order: [['id', 'DESC']], offset: offset, limit: limit
    }).then(async orders => {

        order_arr_length = orders.length;

        for (let index = 0; index < order_arr_length; index++) {
            const element = orders[index];

            let approval_data = await OrderApprovalModel.findAll({
                attributes: ['id', 'orderId', 'comment', 'status', 'userId', 'createdAt', 'time'],
                include: {
                    model: UserModel,
                    attributes: ['id', 'firstName', 'lastName', 'department'],
                    required: false
                },
                where: { orderId: element.id },
                order: [['id', 'ASC']],
            }).then(result => { return result }).catch(error => { console.log(error); })

            if (approval_data.length > 0) {
                orders[index]['dataValues']['order_approval'] = approval_data;
            } else {
                orders[index]['dataValues']['order_approval'] = [];
            }
        }
        return orders;
    }).catch(error => { console.log(error) });

    if (orders)
        return res.json({ status: 200, message: 'Orders data is in node.', data: orders });
    else
        return res.json({ status: 201, message: orders });
}
exports.getOrdersBDM = async (req, res) => {


    var bdmID;
    const userId = req.query.userId


    let offset = 'offset' in req.query ? (parseInt(req.query.offset) > 0 ? parseInt(req.query.offset) : 1) : 1;
    let limit = 'limit' in req.query ? (parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 9999) : 9999;
    offset = (offset - 1) * limit;

    OrderModel.belongsTo(AmModel, { foreignKey: 'amId' })
    OrderModel.belongsTo(EntityModel, { foreignKey: 'entity' })
    OrderModel.belongsTo(CustomerModel, { foreignKey: 'companyName' })



    OrderModel.hasMany(OrderOemModel, { foreignKey: 'orderId' })


    OrderOemModel.hasOne(BdmModel, { foreignKey: 'id', sourceKey: 'bdm' })

    OrderOemModel.hasMany(OemModel, { foreignKey: 'id', sourceKey: 'oem' })


    OrderModel.belongsTo(ProductModel, { foreignKey: 'productType' })


    OrderOemModel.belongsTo(ProductModel, { foreignKey: 'productType' })


    OrderOemModel.belongsTo(BusinessUnitModel, { foreignKey: 'businessUnit' })


    OrderModel.hasMany(OrderSaleModel, { foreignKey: 'orderId' })
    OrderModel.hasMany(OrderPurchaseModel, { foreignKey: 'orderId' })
    OrderModel.hasMany(OrderAttachmentModel, { foreignKey: 'orderId' })
    OrderModel.hasMany(OrderVendorModel, { foreignKey: 'orderId' })

    OrderVendorModel.belongsTo(VendorModel, { foreignKey: 'vendorValue' })

    OrderApprovalModel.belongsTo(UserModel, { foreignKey: 'userId' })
    OrderModel.hasMany(OrderApprovalModel, { foreignKey: 'orderId' })
    const orders = await OrderModel.findAll({
        attributes: ['poPurchaseValue', 'poDate', 'poValue', 'orderCode', 'id', 'createdAt', 'status', 'productDescription', 'poNo', 'externalCost', 'POGM', 'POGMPercent', 'PM', 'BR', 'GP', 'GPPercent', 'duration', 'bdmPercentage', 'companyPaymentTerms'],
        include: [
            {
                model: AmModel, attributes: ['id', 'firstName', 'lastName'], required: false
            },
            {
                model: EntityModel, attributes: ['id', 'entityName'], required: false
            },
            {
                model: CustomerModel, attributes: ['id', 'customerName'], required: false
            },


            {
                model: ProductModel, attributes: ['id', 'productName'], required: false
            },

            {
                model: OrderSaleModel, attributes: ['id', 'orderId', 'saleProductValue', 'saleProductAttachValue', 'saleProductServiceValue'], required: false
            },
            {
                model: OrderPurchaseModel, attributes: ['id', 'orderId', 'purchaseProductValue', 'purchaseProductAttachValue', 'purchaseProductServiceValue'], required: false
            },
            {
                model: OrderAttachmentModel, attributes: ['id', 'orderId', 'fileName'], required: false
            },
            {
                model: OrderVendorModel, attributes: ['id', 'orderId', 'vendorValue', 'vendorPaymentValue', 'vendorPoValue'], required: false,
                include: {
                    model: VendorModel, attributes: ['id', 'vendorName'], required: false
                }
            },

            {
                model: OrderOemModel,
                attributes: ['id', 'orderId', 'oem', 'oemDealerId', 'productType', 'productDescription', 'businessUnit', 'bdm', 'bdmPercentage', 'customerPoValue', 'vendorPoValue', 'BDM_POGM', 'BDM_POGMPercent', 'BDM_PM', 'BDM_BR', 'BDM_GP', 'BDM_GPPercent', 'totalCustomerPoValue', 'totalVendorPoValue'],
                required: true,

                where: { bdm: { [Op.ne]: 0 } },
                include: [
                    {
                        model: BdmModel,
                        where: { userTableId: userId },
                        required: true
                    },
                    {
                        model: OemModel, attributes: ['id', 'oemName'],
                        required: false
                    },
                    {
                        model: ProductModel, attributes: ['id', 'productName'],
                        required: false
                    },
                    {
                        model: BusinessUnitModel, attributes: ['id', 'categoryName'],
                        required: false
                    }
                ]

            },

        ],
        // where: { bdm: bdmID },
        order: [['id', 'DESC']],
        // offset: offset,
        // limit: limit,
    }).then(async orders => {
        console.log(orders, "&&&&&&&&&&**********")
        order_arr_length = orders.length;

        for (let index = 0; index < order_arr_length; index++) {
            const element = orders[index];

            let approval_data = await OrderApprovalModel.findAll({
                attributes: ['id', 'orderId', 'comment', 'status', 'userId', 'createdAt', 'time'],
                include: {
                    model: UserModel,
                    attributes: ['id', 'firstName', 'lastName', 'department'],
                    required: false
                },
                where: { orderId: element.id },
                order: [['id', 'ASC']],
            }).then(result => { return result }).catch(error => { console.log(error); })

            if (approval_data.length > 0) {
                orders[index]['dataValues']['order_approval'] = approval_data;
            } else {
                orders[index]['dataValues']['order_approval'] = [];
            }
        }
        return orders;
    }).catch(error => { console.log(error) });

    if (orders)
        return res.json({ status: 200, message: 'Orders data is in node.', data: orders });
    else
        return res.json({ status: 201, message: orders });
}


exports.getFullyApprovedOrder = (req, res) => {


    OrderModel.belongsTo(CustomerModel, { foreignKey: 'companyName' })

    OrderModel.belongsTo(ProductModel, { foreignKey: 'productType' })

    OrderVendorModel.belongsTo(VendorModel, { foreignKey: 'vendorValue' })
    OrderModel.hasMany(OrderVendorModel, { foreignKey: 'id' })


    OrderModel.hasMany(OrderOemModel, { foreignKey: 'orderId' })
    OrderOemModel.belongsTo(ProductModel, { foreignKey: 'productType' })

    OrderOemModel.belongsTo(OemModel, { foreignKey: 'oem' })

    OrderOemModel.belongsTo(BdmModel, { foreignKey: 'bdm' })



    AmModel.hasMany(AMTargetModel, { foreignKey: 'amId' });
    BdmModel.hasMany(BdmTargetModel, { foreignKey: 'bdmId' });

    OrderModel.hasOne(AmModel, { sourceKey: 'amId', foreignKey: 'userTableId' })

    OrderModel.hasOne(BdmModel, { sourceKey: 'bdm', foreignKey: 'id' })


    OrderModel.findAll({
        include: [
            {
                model: CustomerModel, attributes: ['id', 'customerName'], required: false
            },
            {
                model: ProductModel, attributes: ['id', 'productName'], required: false
            },
            {
                model: OrderVendorModel, attributes: ['id', 'orderId', 'vendorValue', 'vendorPaymentValue', 'vendorPoValue'], required: false,
                include: {
                    model: VendorModel, attributes: ['id', 'vendorName'], required: false
                }
            },
            {
                model: AmModel, attributes: ['id', 'firstName', 'lastName', 'userTableId'], required: false,
                include: {
                    model: AMTargetModel, attributes: ['id', 'year', 'totalAchieved', 'minEligiblity', 'percentageAchieved', 'targetAllote', 'targetAchieve', 'ctc', 'variables', 'variablePercentage', 'minAchievement'], required: false
                }
            },
            {
                model: BdmModel, attributes: ['id', 'firstName', 'lastName', 'userTableId'], required: false,
                include: {
                    model: BdmTargetModel, attributes: ['id', 'year', 'totalAchieved', 'minEligiblity', 'percentageAchieved', 'targetAllote', 'targetAchieve', 'ctc', 'variables', 'variablePercentage', 'minAchievement'], required: false
                }
            },
            {
                model: OrderOemModel,
                attributes: ['id', 'orderId', 'oem', 'oemDealerId', 'productType', 'productDescription', 'bdm', 'businessUnit', 'bdmPercentage', 'customerPoValue', 'vendorPoValue', 'BDM_POGM', 'BDM_POGMPercent', 'BDM_PM', 'BDM_BR', 'BDM_GP', 'BDM_GPPercent'],
                required: false,
                include: [
                    {
                        model: OemModel, attributes: ['id', 'oemName'],
                        required: false
                    },
                    {
                        model: ProductModel, attributes: ['id', 'productName'],
                        required: false
                    },
                    {
                        model: BusinessUnitModel, attributes: ['id', 'categoryName'],
                        required: false
                    },
                    {
                        model: BdmModel, attributes: ['id', 'firstName', 'lastName', 'userTableId'],
                        include: [
                            {
                                model: BdmTargetModel, attributes: ['id', 'year', 'totalAchieved', 'minEligiblity', 'percentageAchieved', 'targetAllote', 'targetAchieve', 'ctc', 'variables', 'variablePercentage', 'minAchievement'],
                                required: false
                            }
                        ],
                        required: false
                    }

                ]

            },

        ],
        where: { status: "Fully Approved!!" },
        order: [['id', 'desc']],
    }).then(resu => {


        console.log(resu, "resuresuresuresuresuresuresuresuresuresuresuresuresuresuresuresuresuresu");
        return res.json({ status: 200, message: 'Approval Orders data is in node.', data: resu });

    }).catch(error => {
        console.error(error)
    })

}





exports.createVendorData = async (req, res) => {
    const venodrData = req.body.data;

    const todaysDate = new Date();

    if (Object.keys(venodrData).length <= 0)
        return res.json({ status: 201, message: 'No data provided to create invoice.' });

    let { orderId, tiplPoNumber, tiplPoDate, } = venodrData;
    vendorInvoiceModel.findOne({
        where: { order_id: orderId }
    }).then(result => {
        if (result) {
            return res.json({
                status: 202, message: ' already created in the system!! '
            });

        } else {

            vendorInvoiceModel.create({
                order_id: orderId,

                tiplPoNumber: tiplPoNumber,
                tiplPoDate: tiplPoDate,
                //vendorName:vendorName,
                createdAt: todaysDate,
                updatedAt: todaysDate
            }).then(result => {


                return res.json({
                    status: 200
                })
            }).catch(error => {
                console.log(error);
            })
        }
    })
}
exports.getVendorPoByOrder = async (req, res) => {

    const order_id = req.query.orderid


    let offset = 'offset' in req.query ? (parseInt(req.query.offset) > 0 ? parseInt(req.query.offset) : 1) : 1;
    let limit = 'limit' in req.query ? (parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 9999) : 9999;
    offset = (offset - 1) * limit;

    OrderModel.findOne({
        where: { id: order_id }
    }).then(async (result1) => {




        const vendorPo = await vendorInvoiceModel.findAll({
            where: { order_id: result1.id },
            offset: offset, limit: limit
        }).then(vendorPo => {
            if (vendorPo)
                return res.json({ status: 200, message: 'Vendor PO data is in Vendor PO node.', data: vendorPo });
            else
                return res.json({ status: 201, message: vendorPo });
        }).catch(error => error);
    })
    // if (vendorPo)
    //     return res.json({ status: 200, message: 'Vendor PO data is in Vendor PO node.', data: vendorPo });
    // else
    //     return res.json({ status: 201, message: vendorPo });

}


//for sale invoice
exports.createdata = async (req, res) => {


    const invoiceData = req.body.data;

    const todaysDate = new Date();

    if (Object.keys(invoiceData).length <= 0)
        return res.json({ status: 201, message: 'No data provided to create invoice.' });

    let { orderId, invoiceRaisedDate, invoiceSalesAmount, tiplInvoiceNo, receivedAmount, dueDate, purchaseInvoiceDate, invoiceNumber, invoiceAmount, invoiceRecievedDate, qre } = invoiceData;

    OrderModel.findOne({
        where: { id: orderId }
    }).then(async (result1) => {
        console.log(result1.id);


        await invoiceModel.create({
            order_id: result1.id,
            invoiceRaisedDate: invoiceRaisedDate,
            invoiceSalesAmount: invoiceSalesAmount,
            tiplInvoiceNo: tiplInvoiceNo,
            dueDate: dueDate,
            receivedAmount: 0,
            // tiplPoNumber: tiplPoNumber,
            // tiplPoDate: tiplPoDate,
            //vendorName:vendorName,

            purchaseInvoiceDate: purchaseInvoiceDate,
            //invoiceNumber: invoiceNumber,
            //invoiceAmount: invoiceAmount,
            // invoiceRecievedDate: invoiceRecievedDate,
            qre: 0,
            QBR_GP: 0,
            RR_GP: 0,
            createdAt: todaysDate,
            updatedAt: todaysDate
        }).then(result => {

            OrderModel.findOne({
                where: { id: result1.id },
                // raw: true,
            }).then(resu => {

                receivedAmount = parseFloat(resu.receivedAmount) + parseFloat(invoiceSalesAmount);

                OrderModel.update({
                    receivedAmount: receivedAmount,
                }, { where: { id: result1.id } }).then(result => {
                    return res.json({
                        status: 200
                    });
                }).catch(error => {
                    console.error(error)
                })
            })
        })
    }).catch(error => {
        console.log(error);
    })
}

//for purchase invoice
exports.purchaseInvoice = async (req, res) => {


    const invoiceData = req.body.data;

    const todaysDate = new Date();

    if (Object.keys(invoiceData).length <= 0)
        return res.json({ status: 201, message: 'No data provided to create invoice.' });

    let { orderId, invoiceRaisedDate, invoiceSalesAmount, tiplInvoiceNo, receivedAmount, dueDate, purchaseInvoiceDate, invoiceNumber, invoiceAmount, invoiceRecievedDate, qre } = invoiceData;

    OrderModel.findOne({
        where: { id: orderId }
    }).then(async (result1) => {
        console.log(result1.id);


        await invoicePurchaseModel.create({
            order_id: result1.id,
            // invoiceRaisedDate: invoiceRaisedDate,
            // invoiceSalesAmount: invoiceSalesAmount,
            // tiplInvoiceNo: tiplInvoiceNo,
            // dueDate: dueDate,
            receivedAmount: 0,
            // tiplPoNumber: tiplPoNumber,
            // tiplPoDate: tiplPoDate,
            //vendorName:vendorName,

            purchaseInvoiceDate: purchaseInvoiceDate,
            invoiceNumber: invoiceNumber,
            invoiceAmount: invoiceAmount,
            invoiceRecievedDate: invoiceRecievedDate,
            // qre: 0,
            // QBR_GP: 0,
            // RR_GP: 0,
            createdAt: todaysDate,
            updatedAt: todaysDate
        }, { where: { orderId } }).then(result => {
            OrderModel.findOne({
                where: { id: result1.id },

            }).then(resu => {

                purchaseRecievedAmount = parseFloat(resu.purchaseRecievedAmount) + parseFloat(invoiceAmount);

                OrderModel.update({
                    purchaseRecievedAmount: purchaseRecievedAmount,
                }, { where: { id: result1.id } }).then(result => {
                    return res.json({
                        status: 200
                    });
                }).catch(error => {
                    console.error(error)
                })
            })
        })
    }).catch(error => {
        console.log(error);
    })
}
//for sale payment invoice
exports.paymentData = async (req, res) => {


    const paymentData = req.body.data;

    const todaysDate = new Date();

    if (Object.keys(paymentData).length <= 0)
        return res.json({ status: 201, message: 'No data provided to create invoice.' });

    let { orderId, invoiceId, paymentDate, paymentMethod, paymentBuy, paymentReference, amount, paymentCollection, details, } = paymentData;

    OrderModel.findOne({
        where: { orderCode: orderId }
    }).then(async (result1) => {
        console.log(result1.id);


        await paymentDataModel.create({
            order_id: result1.id,
            invoice_id: invoiceId,
            paymentDate: paymentDate,
            paymentMethod: paymentMethod,
            paymentBuy: paymentBuy,
            paymentReference: paymentReference,
            amount: amount,
            paymentCollection,
            details: details,
            createdAt: todaysDate,
            updatedAt: todaysDate

        },
            { where: { invoiceId, orderId } }).then(result => {

                //invoice 
                invoiceModel.findOne({
                    where: { id: invoiceId },
                    // raw: true,
                }).then(resu => {
                    receivedAmount = parseFloat(resu.receivedAmount) + parseFloat(amount);
                }).then(resu => {
                    invoiceModel.update({
                        receivedAmount: receivedAmount,
                    }, { where: { id: invoiceId } }).then(result => {

                    }).catch(error => {
                        console.error(error)
                    })
                }).catch(error => {
                    console.error(error)
                })



                OrderModel.findOne({
                    where: { id: result1.id },

                }).then(resu => {
                    console.log(resu);
                    salePaymentReceivedAmount = parseFloat(resu.salePaymentReceivedAmount) + parseFloat(amount);

                    OrderModel.update({
                        salePaymentReceivedAmount: salePaymentReceivedAmount,
                    }, { where: { id: result1.id } }).then(result => {
                        return res.json({
                            status: 200
                        });
                    }).catch(error => {
                        console.error(error)
                    })
                })

            })
    }).catch(error => {
        console.log(error);
    })

}

//for Purchase payment invoice
exports.paymentPurchaseData = async (req, res) => {


    const paymentData = req.body.data;

    const todaysDate = new Date();

    if (Object.keys(paymentData).length <= 0)
        return res.json({ status: 201, message: 'No data provided to create invoice.' });

    let { orderId, purchaseInvoiceId, paymentDate, paymentMethod, paymentBuy, paymentReference, amount, paymentCollection, details, } = paymentData;

    OrderModel.findOne({
        where: { orderCode: orderId }
    }).then(async (result1) => {
        console.log(result1.id);


        await paymentPurchaseModel.create({
            order_id: result1.id,
            invoice_id: purchaseInvoiceId,
            paymentDate: paymentDate,
            paymentMethod: paymentMethod,
            paymentBuy: paymentBuy,
            paymentReference: paymentReference,
            amount: amount,
            paymentCollection,
            details: details,
            createdAt: todaysDate,
            updatedAt: todaysDate

        }, { where: { purchaseInvoiceId, orderId } }).then(result => {

            invoicePurchaseModel.findOne({
                where: { id: purchaseInvoiceId },

            }).then(resu => {

                receivedAmount = parseFloat(resu.receivedAmount) + parseFloat(amount);
            }).then(resu => {
                invoicePurchaseModel.update({
                    receivedAmount: receivedAmount,
                }, { where: { id: purchaseInvoiceId } }).then(result => {
                    return res.json({
                        status: 200
                    });
                }).catch(error => {
                    console.error(error)
                })
            })

            OrderModel.findOne({
                where: { id: result1.id },

            }).then(resu => {

                purchasePaymentReceivedAmount = parseFloat(resu.purchasePaymentReceivedAmount) + parseFloat(amount);

                OrderModel.update({
                    purchasePaymentReceivedAmount: purchasePaymentReceivedAmount,
                }, { where: { id: result1.id } }).then(result => {
                    return res.json({
                        status: 200
                    });
                }).catch(error => {
                    console.error(error)
                })
            })
        })

    }).catch(error => {
        console.log(error);
    })


}

//for get sale invoice
exports.getInvoice = async (req, res) => {

    let offset = 'offset' in req.query ? (parseInt(req.query.offset) > 0 ? parseInt(req.query.offset) : 1) : 1;
    let limit = 'limit' in req.query ? (parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 9999) : 9999;
    offset = (offset - 1) * limit;
    OrderModel.belongsTo(CustomerModel, { foreignKey: 'companyName' })
    invoiceModel.belongsTo(OrderModel, { foreignKey: 'order_id' })

    const invoice = await invoiceModel.findAll({
        include: [
            {
                model: OrderModel, attributes: ['id', 'poValue', 'poPurchaseValue', 'companyName', 'receivedAmount', 'orderCode', 'poNo'], required: false,
                include: {
                    model: CustomerModel, attributes: ['id', 'customerName'], required: false
                }
            },

        ],
        where: { isDeleted: 0 },
        offset: offset, limit: limit
    }).then(invoice => invoice).catch(error => error);

    if (invoice)
        return res.json({ status: 200, message: 'Invoice data is in invoice node.', data: invoice });
    else
        return res.json({ status: 201, message: invoice });

}

//for get purchase invoice
exports.getPurchaseInvoice = async (req, res) => {

    let offset = 'offset' in req.query ? (parseInt(req.query.offset) > 0 ? parseInt(req.query.offset) : 1) : 1;
    let limit = 'limit' in req.query ? (parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 9999) : 9999;
    offset = (offset - 1) * limit;
    OrderModel.belongsTo(CustomerModel, { foreignKey: 'companyName' })
    invoicePurchaseModel.belongsTo(OrderModel, { foreignKey: 'order_id' })


    const invoice = await invoicePurchaseModel.findAll({
        include: [
            {
                model: OrderModel, attributes: ['id', 'poValue', 'poPurchaseValue', 'companyName', 'receivedAmount', 'orderCode', 'poNo'], required: false,
                include: {
                    model: CustomerModel, attributes: ['id', 'customerName'], required: false
                }
            },
        ],
        where: { isDeleted: 0 },
        offset: offset, limit: limit
    }).then(invoice => {

        return invoice;

    }).catch(error => error);

    if (invoice)
        return res.json({ status: 200, message: 'Invoice data is in invoice node.', data: invoice });
    else
        return res.json({ status: 201, message: invoice });

}

//for get sale invoice by order
exports.getInvoiceByOrder = async (req, res) => {

    const order_id = req.query.orderid
    console.log(order_id, "order_id");

    let offset = 'offset' in req.query ? (parseInt(req.query.offset) > 0 ? parseInt(req.query.offset) : 1) : 1;
    let limit = 'limit' in req.query ? (parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 9999) : 9999;
    offset = (offset - 1) * limit;

    invoiceModel.belongsTo(OrderModel, { foreignKey: 'order_id' })

    OrderModel.findOne({
        where: { orderCode: order_id },
    }).then(async (result) => {
        console.log(result);

        console.log(result.id, "result.id");
        const invoice = await invoiceModel.findAll({

            include: [
                {
                    model: OrderModel, attributes: ['id', 'poNo', 'poValue', 'poPurchaseValue', 'receivedAmount','salePaymentReceivedAmount','purchasePaymentReceivedAmount'], required: false
                }
            ],

            where: { order_id: result.id, isDeleted: 0 },
            offset: offset, limit: limit
        }).then(invoice => {
            console.log(invoice, "invoice");
            return res.json({ status: 200, message: 'Invoice data is in invoice node.', data: invoice });

        }).catch(error => error);
    })

    // if (invoice)
    //     return res.json({ status: 200, message: 'Invoice data is in invoice node.', data: invoice });
    // else
    //     return res.json({ status: 201, message: invoice });

}

//for get purchase invoice by order
exports.getPurchaseInvoiceByOrder = async (req, res) => {

    const order_id = req.query.orderid;
    console.log("Order ID - ", order_id);

    let offset = 'offset' in req.query ? (parseInt(req.query.offset) > 0 ? parseInt(req.query.offset) : 1) : 1;
    let limit = 'limit' in req.query ? (parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 9999) : 9999;
    offset = (offset - 1) * limit;

    invoicePurchaseModel.belongsTo(OrderModel, { foreignKey: 'order_id' })
    OrderModel.findOne({
        where: { orderCode: order_id },
    }).then(async (result) => {
        console.log(result);
        if (result) {
            const purchaseInvoice = await invoicePurchaseModel.findAll({

                include: [
                    {
                        model: OrderModel, attributes: ['id', 'poNo', 'poValue', 'poPurchaseValue', 'purchaseRecievedAmount','salePaymentReceivedAmount', 'purchasePaymentReceivedAmount'], required: false
                    }
                ],

                where: { order_id: result.id, isDeleted: 0 },
                offset: offset, limit: limit
            }).then(purchaseInvoice => {
                console.log(purchaseInvoice, "purchaseInvoice");
                return res.json({ status: 200, message: 'Invoice data is in invoice node.', data: purchaseInvoice });

            }).catch(error => error);
        } else {
            return res.json({ status: 200, message: 'Invoice data is in invoice node.', data: [] });
        }


    })

    // if (purchaseInvoice)
    //     return res.json({ status: 200, message: 'Invoice data is in invoice node.', data: purchaseInvoice });
    // else
    //     return res.json({ status: 201, message: purchaseInvoice });

}

exports.getPaymentByInvoice = async (req, res) => {

    const invoice_id = req.query.invoiceid


    let offset = 'offset' in req.query ? (parseInt(req.query.offset) > 0 ? parseInt(req.query.offset) : 1) : 1;
    let limit = 'limit' in req.query ? (parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 9999) : 9999;
    offset = (offset - 1) * limit;

    const payment = await paymentDataModel.findAll({
        where: { invoice_id: invoice_id, isDeleted: 0 },
        offset: offset, limit: limit
    }).then(payment => payment)

        .catch(error => error);

    if (payment)
        return res.json({ status: 200, message: 'payment data is in payment node.', data: payment });
    else
        return res.json({ status: 201, message: payment });

}
exports.getPurchasePaymentByInvoice = async (req, res) => {

    const invoice_id = req.query.invoiceid


    let offset = 'offset' in req.query ? (parseInt(req.query.offset) > 0 ? parseInt(req.query.offset) : 1) : 1;
    let limit = 'limit' in req.query ? (parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 9999) : 9999;
    offset = (offset - 1) * limit;

    const payment = await paymentPurchaseModel.findAll({
        where: { invoice_id: invoice_id, isDeleted: 0 },
        offset: offset, limit: limit
    }).then(payment => {

        return payment;

    }).catch(error => error);

    if (payment)
        return res.json({ status: 200, message: 'payment data is in payment node.', data: payment });
    else
        return res.json({ status: 201, message: payment });

}

exports.getApprovedByMeOrders = async (req, res) => {
    let userId = req.query.userId
    console.log(userId, "qqqqqqqqqqqqqqqqqqqqqqqqqqqqq");


    OrderApprovalModel.belongsTo(OrderModel, { foreignKey: 'orderId' });
    OrderModel.belongsTo(ProductModel, { foreignKey: 'producttype' });
    CustomerModel.belongsTo(CustomerModel, { foreignKey: 'customerName' })
    OrderApprovalModel.findAndCountAll({
        include: [
            {
                model: OrderModel, attributes: ['id', 'orderCode', 'productType', 'poNo', 'poValue', 'productDescription', 'poDate', 'status'],
                include: [
                    {
                        model: ProductModel, attributes: ['productName']
                    },
                    {
                        model: CustomerModel, attributes: ['customerName']
                    },

                ]
            }


        ],
        // where: {userId, status: 'Approved'}

        // where: { userId, [Op.or]: [{ status: 'Fully Approved!!' , status: 'Approved',} ] },
        where: { userId, status: { [Op.or]: ['Fully Approved!!', 'Approved'] } },
    }).then(result => {
        console.log(result, "sdfffffffffffffffffffffffffffffffffff");
        const dt = result.rows.filter(item => item.tbl_order != null);
        return res.json({ status: 200, message: 'Approval Orders data is in node.', data: dt });
    }).catch(error => { console.log(error) });

    // OrderModel.belongsTo(CustomerModel, { foreignKey: 'companyName' })
    // OrderModel.belongsTo(ProductModel, { foreignKey: 'productType' })
    // OrderModel.hasMany(OrderApprovalModel, { foreignKey:'orderId' })
    // OrderModel.findAndCountAll({
    //         include: [
    //             {
    //                 model: OrderApprovalModel, attributes: ['id', 'orderId', 'status'], required: false,
    //                 where: { userId: userId, status: 'Approved' }
    //             },
    //             {
    //                 model: ProductModel, attributes: ['id', 'productName'], required: false
    //             },
    //             {
    //                 model: CustomerModel, attributes: ['id', 'customerName'], required: false
    //             }
    //         ],
    //     // where: { pendingAt: userId },
    //     // raw: true
    // }).then(resu => {
    //     console.log(resu, "resuresuresuresuresuresuresuresuresuresu");
    //     return res.json({ status: 200, message: 'Approval Orders data is in node.', data: resu });
    // }).catch(error => {
    //     console.error(error)
    // })

}

//for Get Datewise invoice Data
exports.getDateWiseData = async (req, res) => {
    let allInvoice = [];
    const fromDate = req.query.fromDate;
    const toDate = req.query.toDate;
    console.log(fromDate);
    console.log(toDate);

    OrderModel.belongsTo(CustomerModel, { foreignKey: 'companyName' })
    invoiceModel.belongsTo(OrderModel, { foreignKey: 'order_id' })
    // invoicePurchaseModel.belongsTo(OrderModel, { foreignKey: 'order_id' })


    const invoice = await invoiceModel.findAll({
        include: [
            {
                model: OrderModel, attributes: ['id', 'poValue', 'poPurchaseValue', 'companyName', 'receivedAmount', 'orderCode', 'poNo'], required: false,
                include: {
                    model: CustomerModel, attributes: ['id', 'customerName'], required: false
                }
            },
        ],

        where: {
            [Op.and]: [{
                createdAt: {
                    [Op.between]: [fromDate, toDate]
                }, isDeleted: 0
            }
            ]
        },

    }).then(invoice => invoice)

        .catch(error => error);

    if (invoice)
        return res.json({ status: 200, message: 'payment data is in payment node.', data: invoice });
    else
        return res.json({ status: 201, message: invoice });
    // invoice.forEach(function (element) {
    //     allInvoice.push(element)
    // });


    // const purchaseInvoice = await invoicePurchaseModel.findAll({
    //     include: [
    //         {
    //             model: OrderModel, attributes: ['id', 'poValue', 'poPurchaseValue', 'companyName', 'receivedAmount', 'orderCode', 'poNo'], required: false,
    //             include: {
    //                 model: CustomerModel, attributes: ['id', 'customerName'], required: false
    //             }
    //         },
    //     ],
    //     where: {
    //         [Op.and]: [{
    //             createdAt: {
    //                 [Op.between]: [fromDate, toDate]
    //             }, isDeleted: 0
    //         }
    //         ]
    //     },

    // }).then(purchaseInvoice => purchaseInvoice).catch(error => error);

    // console.log(purchaseInvoice, "ppppppppppppppppppppppppppppp");

    // //allInvoice = invoice.concat(purchaseInvoice);


    // purchaseInvoice.forEach(function (element) {
    //     allInvoice.push(element)
    // });


    // console.log(allInvoice, "allInvoicexvccccccccccccccccccccccccccccccc");

    // if (allInvoice)
    //     return res.json({ status: 200, message: 'Invoice data is in invoice node.', data: allInvoice });
    // else
    //     return res.json({ status: 201, message: allInvoice });



}



exports.getDateWiseDatapurchase = async (req, res) => {
    const fromDate = req.query.fromDate;
    const toDate = req.query.toDate;
    console.log(fromDate);
    console.log(toDate);

    OrderModel.belongsTo(CustomerModel, { foreignKey: 'companyName' })
    // invoiceModel.belongsTo(OrderModel, { foreignKey: 'order_id' })
    invoicePurchaseModel.belongsTo(OrderModel, { foreignKey: 'order_id' })

    const purchaseInvoice = await invoicePurchaseModel.findAll({
        include: [
            {
                model: OrderModel, attributes: ['id', 'poValue', 'poPurchaseValue', 'companyName', 'receivedAmount', 'orderCode', 'poNo'], required: false,
                include: {
                    model: CustomerModel, attributes: ['id', 'customerName'], required: false
                }
            },
        ],
        where: {
            [Op.and]: [{
                createdAt: {
                    [Op.between]: [fromDate, toDate]
                }, isDeleted: 0
            }
            ]
        },

    }).then(purchaseInvoice => purchaseInvoice)

        .catch(error => error);

    if (purchaseInvoice)
        return res.json({ status: 200, message: 'payment data is in payment node.', data: purchaseInvoice });
    else
        return res.json({ status: 201, message: purchaseInvoice });


}

exports.deleteSaleInvoice = (req, res) => {
    const invoice_id = req.query.id;
    //const created_at = new Date();
    const isDeleted = 1;

    invoiceModel.findOne({ where: { id: invoice_id } }).then(resu2 => {

        console.log(resu2);
        OrderModel.findOne({
            where: { id: resu2.order_id },
            // raw: true,
        }).then(resu => {
            //console.log(resu,"ordeerrrrrrrrrrrrrr");
            receivedAmount = parseFloat(resu.receivedAmount) - parseFloat(resu2.invoiceSalesAmount);
            paymentAmount = parseFloat(resu.salePaymentReceivedAmount) - parseFloat(resu2.receivedAmount);
            OrderModel.update({
                receivedAmount: receivedAmount,
                salePaymentReceivedAmount: paymentAmount
            }, { where: { id: resu2.order_id } }).then(result => {
                console.log(result, "result11223333");
                // return res.json({
                //     status: 200
                // });
            }).catch(error => {
                console.error(error)
            })


            // console.log(invoice_id,"invoice_idinvoice_idinvoice_id");


        }).catch(error => {
            console.log(error);
        })




    }).catch(error => {
        return res.json({
            status: 500,
            message: error
        });
    });
    invoiceModel.update({
        isDeleted: 1,
    }, { where: { id: invoice_id } }).then(result => {

        console.log(result, "invoicePurchaseModelinvoicePurchaseModelinvoicePurchaseModel");
        return res.json({
            status: 200,
            message: 'purchase invoice removed successfully!'
        });
    }).catch(error => {
        return res.json({
            status: 500,
            message: error
        });
    });


}

exports.deletePurchesInvoice = async (req, res) => {

    const invoice_id = req.query.id;
    //const created_at = new Date();
    const isDeleted = 1;

    invoicePurchaseModel.findOne({ where: { id: invoice_id } }).then(resu1 => {

        console.log(resu1);
        OrderModel.findOne({
            where: { id: resu1.order_id },
            // raw: true,
        }).then(resu => {
            //console.log(resu,"ordeerrrrrrrrrrrrrr");
            receivedAmount = parseFloat(resu.purchaseRecievedAmount) - parseFloat(resu1.invoiceAmount);
            paymentAmount = parseFloat(resu.purchasePaymentReceivedAmount) - parseFloat(resu1.receivedAmount);
            OrderModel.update({
                purchaseRecievedAmount: receivedAmount,
                purchasePaymentReceivedAmount: paymentAmount
            }, { where: { id: resu1.order_id } }).then(result => {
                console.log(result, "result11223333");
                // return res.json({
                //     status: 200
                // });
            }).catch(error => {
                console.error(error)
            })


            // console.log(invoice_id,"invoice_idinvoice_idinvoice_id");


        }).catch(error => {
            console.log(error);
        })




    }).catch(error => {
        return res.json({
            status: 500,
            message: error
        });
    });
    invoicePurchaseModel.update({
        isDeleted: 1,
    }, {
        where: { id: invoice_id }
    }).then(result => {

        console.log(result, "invoicePurchaseModelinvoicePurchaseModelinvoicePurchaseModel");
        return res.json({
            status: 200,
            message: 'purchase invoice removed successfully!'
        });
    }).catch(error => {
        return res.json({
            status: 500,
            message: error
        });
    });

}

exports.updateSaleInvoice = async (req, res) => {

    const updateInvoiceData = req.body.data;
    console.log(updateInvoiceData, "updateInvoiceData");

    const todaysDate = new Date();

    if (!updateInvoiceData)
        return res.json({ status: 201, message: 'No data provided to create invoice.' });

    let { invoiceId, orderId, invoiceRaisedDate, tiplInvoiceNo, dueDate, invoiceSalesAmount } = updateInvoiceData;


    invoiceModel.findOne({
        where: { id: invoiceId },
    }).then(invoiceResult => {
        console.log(invoiceResult, "invoiceModel");


        OrderModel.findOne({
            where: { id: invoiceResult.order_id },

        }).then(resue1 => {
            console.log(resue1, "OrderModel111");
            console.log(invoiceResult.invoiceSalesAmount, "invoiceResult.invoiceSalesAmount");
            console.log(resue1.receivedAmount, "resue.receivedAmount111111111");
            receivedAmountSale = parseFloat(resue1.receivedAmount) - parseFloat(invoiceResult.invoiceSalesAmount);

            OrderModel.update({
                receivedAmount: receivedAmountSale,
            }, { where: { orderCode: orderId } }).then(resultR => {
                console.log(resultR, "update order 1");


                invoiceModel.update({
                    invoiceRaisedDate,
                    tiplInvoiceNo,
                    dueDate,
                    invoiceSalesAmount,
                    createdAt: todaysDate,
                    updatedAt: todaysDate
                }, { where: { id: invoiceId } }).then(result1 => {
                    console.log(result1, "sale invoice ");

                    OrderModel.findOne({
                        where: { orderCode: orderId },

                    }).then(resue => {
                        console.log(resue, "order");
                        console.log(invoiceSalesAmount, "invoiceSalesAmount ");
                        console.log(resue.receivedAmount, "resue.receivedAmount22222");

                        receivedAmount = parseFloat(resue.receivedAmount) + (+parseFloat(invoiceSalesAmount));

                        OrderModel.update({
                            receivedAmount: receivedAmount,
                        }, { where: { id: invoiceResult.order_id } }).then(result2 => {
                            console.log(result2, "update order 2");
                        }).catch(error => {
                            console.error(error)
                        })
                    })
                    return res.json({
                        status: 200
                    });
                }).catch(error => {
                    console.error(error)
                })


            }).catch(error => {
                console.error(error)
            })
        })

    }).catch(error => {
        console.error(error)
    })
    if (result)
        return res.json({ status: 200, message: 'invoice updated successfully.' });
    else
        return res.json({ status: 202, message: updateInvoiceData })

}



exports.updatePurchaseInvoice = async (req, res) => {
    const updatePurchaesInvoiceData = req.body.data;
    console.log(updatePurchaesInvoiceData, "updatePurchaesInvoiceData");

    const todaysDate = new Date();

    if (!updatePurchaesInvoiceData)
        return res.json({ status: 201, message: 'No data provided to create Invoice.' });

    let { purchaseInvoiceId, orderId, purchaseInvoiceDate, invoiceNumber, invoiceAmount, invoiceRecievedDate } = updatePurchaesInvoiceData;



    invoicePurchaseModel.findOne({
        where: { id: purchaseInvoiceId },
    }).then(invoiceResult => {
        console.log(invoiceResult, "invoiceModel");


        OrderModel.findOne({
            where: { id: invoiceResult.order_id },

        }).then(resue1 => {

            receivedAmountPurchase = parseFloat(resue1.purchaseRecievedAmount) - parseFloat(invoiceResult.invoiceAmount);

            OrderModel.update({
                purchaseRecievedAmount: receivedAmountPurchase,
            }, { where: { orderCode: orderId } }).then(resultR => {
                console.log(resultR, "update order 1");


                invoicePurchaseModel.update({
                    purchaseInvoiceDate,
                    invoiceNumber,
                    invoiceAmount,
                    invoiceRecievedDate,
                    createdAt: todaysDate,
                    updatedAt: todaysDate
                }, { where: { id: purchaseInvoiceId } }).then(result1 => {
                    console.log(result1, "sale invoice ");

                    OrderModel.findOne({
                        where: { orderCode: orderId },

                    }).then(resue => {

                        receivedAmount = parseFloat(resue.purchaseRecievedAmount) + (+parseFloat(invoiceAmount));

                        OrderModel.update({
                            purchaseRecievedAmount: receivedAmount,
                        }, { where: { id: invoiceResult.order_id } }).then(result2 => {
                            console.log(result2, "update order 2");
                        }).catch(error => {
                            console.error(error)
                        })
                    })
                    return res.json({
                        status: 200
                    });
                }).catch(error => {
                    console.error(error)
                })


            }).catch(error => {
                console.error(error)
            })
        })

    }).catch(error => {
        console.error(error)
    })

    if (result)
        return res.json({ status: 200, message: 'invoice updated successfully.' });
    else
        return res.json({ status: 202, message: updatePurchaesInvoiceData })

}





exports.updateCustomerPaymentInvoice = async (req, res) => {

    const updatepurchaseInvoiceData = req.body;


    console.log(updatepurchaseInvoiceData, "paymentAmount");
    //console.log(paymentId, "paymentId");
    const todaysDate = new Date();

    if (!updatepurchaseInvoiceData)
        return res.json({ status: 201, message: 'No data provided to create invoice.' });

    let { id, data } = updatepurchaseInvoiceData;


    paymentId = id;
    paymentAmount = data;



    paymentDataModel.findOne({
        where: { id: paymentId }
    }).then(invoicePaymentResult => {

        console.log(invoicePaymentResult, "invoicePaymentResult");
        invoiceModel.findOne({
            where: { id: invoicePaymentResult.invoice_id },
        }).then(invoiceResult => {
            console.log(invoiceResult, "invoiceModel");

            receivedAmountsale = parseFloat(invoiceResult.receivedAmount) - (parseFloat(invoicePaymentResult.amount));
            console.log(receivedAmountsale, "receivedAmountsale");
            console.log(invoicePaymentResult.invoice_id, "invoicePaymentResult.invoice_id");

            invoiceModel.update({
                receivedAmount: receivedAmountsale,
            }, { where: { id: invoicePaymentResult.invoice_id } }).then(resultR => {
                console.log(resultR, "update Invoice Model");


                OrderModel.findOne({
                    where: { id: invoicePaymentResult.order_id },
                    // raw: true,
                }).then(resue1 => {
                    // console.log(resue1,"resue1 Order model");
                    salePaymentReceivedAmount = parseFloat(resue1.salePaymentReceivedAmount) - (parseFloat(invoicePaymentResult.amount));

                    OrderModel.update({
                        salePaymentReceivedAmount: salePaymentReceivedAmount,
                    }, { where: { id: invoicePaymentResult.order_id } }).then(resultP => {
                        console.log(resultP, "update order 1");

                        paymentDataModel.update({
                            amount: paymentAmount,
                            createdAt: todaysDate,
                            updatedAt: todaysDate
                        }, { where: { id: paymentId } }).then(result1 => {
                            console.log(result1, "sale invoice ");

                            invoiceModel.findOne({
                                where: { id: invoicePaymentResult.invoice_id },
                            }).then(invoiceResult => {

                                console.log(invoiceResult, "invoiceModel222");
                                receivedAmount = parseFloat(invoiceResult.receivedAmount) + parseFloat(paymentAmount);


                                invoiceModel.update({
                                    receivedAmount: receivedAmount,
                                }, { where: { id: invoicePaymentResult.invoice_id } }).then(resultR => {

                                    console.log(resultR, "resultR");

                                    OrderModel.findOne({
                                        where: { id: invoicePaymentResult.order_id },
                                        // raw: true,
                                    }).then(resue2 => {
                                        // console.log(resue1,"resue1 order list");
                                        salePaymentReceivedAmount = parseFloat(resue2.salePaymentReceivedAmount) + parseFloat(paymentAmount);

                                        OrderModel.update({
                                            salePaymentReceivedAmount: salePaymentReceivedAmount,
                                        }, { where: { id: invoicePaymentResult.order_id } }).then(resultR => {
                                            console.log(resultR, "update order 1");

                                            return res.json({
                                                status: 200
                                            });
                                        }).catch(error => {
                                            console.error(error)
                                        })
                                    }).catch(error => {
                                        console.error(error)
                                    })

                                }).catch(error => {
                                    console.error(error)
                                })
                            }).catch(error => {
                                console.error(error)
                            })
                        }).catch(error => {
                            console.error(error)
                        })

                    }).catch(error => {
                        console.error(error)
                    })
                })

            }).catch(error => {
                console.error(error)
            })


        }).catch(error => {
            console.error(error)
        })
    }).catch(error => {
        console.error(error)
    })

    // if (saleInvoiceResult)
    //     return res.json({ status: 200, message: 'invoice updated successfully.' });
    // else
    //     return res.json({ status: 202, message: updateInvoiceData })

}



exports.updatePurchasePaymentInvoice = async (req, res) => {


    const updatepurchaseInvoiceData = req.body;


    console.log(updatepurchaseInvoiceData, "paymentAmount");
    //console.log(paymentId, "paymentId");
    const todaysDate = new Date();

    if (!updatepurchaseInvoiceData)
        return res.json({ status: 201, message: 'No data provided to create invoice.' });

    let { id, data } = updatepurchaseInvoiceData;


    paymentId = id;
    paymentAmount = data;



    paymentPurchaseModel.findOne({
        where: { id: paymentId }
    }).then(invoicePaymentResult => {

        console.log(invoicePaymentResult, "invoicePaymentResult");
        invoicePurchaseModel.findOne({
            where: { id: invoicePaymentResult.invoice_id },
        }).then(invoiceResult => {
            console.log(invoiceResult, "invoiceModel");

            receivedAmountsale = parseFloat(invoiceResult.receivedAmount) - (parseFloat(invoicePaymentResult.amount));

            invoicePurchaseModel.update({
                receivedAmount: receivedAmountsale,
            }, { where: { id: invoicePaymentResult.invoice_id } }).then(resultR => {
                console.log(resultR, "update Invoice Model");


                OrderModel.findOne({
                    where: { id: invoicePaymentResult.order_id },
                    // raw: true,
                }).then(resue1 => {
                    // console.log(resue1,"resue1 Order model");
                    purchasePaymentReceivedAmount = parseFloat(resue1.purchasePaymentReceivedAmount) - (parseFloat(invoicePaymentResult.amount));

                    OrderModel.update({
                        purchasePaymentReceivedAmount: purchasePaymentReceivedAmount,
                    }, { where: { id: invoicePaymentResult.order_id } }).then(resultP => {
                        console.log(resultP, "update order 1");

                        paymentPurchaseModel.update({
                            amount: paymentAmount,
                            createdAt: todaysDate,
                            updatedAt: todaysDate
                        }, { where: { id: paymentId } }).then(result1 => {
                            console.log(result1, "sale invoice ");

                            invoicePurchaseModel.findOne({
                                where: { id: invoicePaymentResult.invoice_id },
                            }).then(invoiceResult => {

                                console.log(invoiceResult, "invoiceModel222");
                                receivedAmount = parseFloat(invoiceResult.receivedAmount) + parseFloat(paymentAmount);


                                invoicePurchaseModel.update({
                                    receivedAmount: receivedAmount,
                                }, { where: { id: invoicePaymentResult.invoice_id } }).then(resultR => {

                                    console.log(resultR, "resultR");

                                    OrderModel.findOne({
                                        where: { id: invoicePaymentResult.order_id },
                                        // raw: true,
                                    }).then(resue2 => {
                                        // console.log(resue1,"resue1 order list");
                                        purchasePaymentReceivedAmount = parseFloat(resue2.purchasePaymentReceivedAmount) + parseFloat(paymentAmount);

                                        OrderModel.update({
                                            purchasePaymentReceivedAmount: purchasePaymentReceivedAmount,
                                        }, { where: { id: invoicePaymentResult.order_id } }).then(resultR => {
                                            console.log(resultR, "update order 1");

                                            return res.json({
                                                status: 200
                                            });
                                        }).catch(error => {
                                            console.error(error)
                                        })
                                    }).catch(error => {
                                        console.error(error)
                                    })

                                }).catch(error => {
                                    console.error(error)
                                })
                            }).catch(error => {
                                console.error(error)
                            })
                        }).catch(error => {
                            console.error(error)
                        })

                    }).catch(error => {
                        console.error(error)
                    })
                })

            }).catch(error => {
                console.error(error)
            })


        }).catch(error => {
            console.error(error)
        })
    }).catch(error => {
        console.error(error)
    })

    // if (saleInvoiceResult)
    //     return res.json({ status: 200, message: 'invoice updated successfully.' });
    // else
    //     return res.json({ status: 202, message: updateInvoiceData })

}

exports.deleteFullOrder = (req, res) => {
    const order_id = req.query.id;
    console.log(order_id, "12345order_idorder_idorder_idorder_idorder_id")
}


exports.deleteSalePaymentInvoice = (req, res) => {
    const paymentInvoiceId = req.query.id;
    console.log(paymentInvoiceId, "paymentInvoiceId");
    const isDeleted = 1;
    paymentDataModel.findOne({
        where: { id: paymentInvoiceId },
        // raw: true,
    }).then(result => {
        //console.log(result, "payment invoice");

        invoiceModel.findOne({
            where: { id: result.invoice_id },
            // raw: true,
        }).then(resue => {
            console.log(resue, "invoiceModel");
            receivedAmount = parseFloat(resue.receivedAmount) - parseFloat(result.amount);

            invoiceModel.update({
                receivedAmount: receivedAmount,
            }, { where: { id: result.invoice_id } }).then(result1 => {
                console.log(result1, "updated invoices");

                OrderModel.findOne({
                    where: { id: result.order_id },
                    // raw: true,
                }).then(resue => {
                    console.log(resue, "OrderModel");
                    salePaymentReceivedAmount = parseFloat(resue.salePaymentReceivedAmount) - parseFloat(result.amount);
                    OrderModel.update({
                        salePaymentReceivedAmount: salePaymentReceivedAmount,
                    }, { where: { id: result.order_id } }).then(resul => {
                        console.log(resul, "order updated");
                    }).catch(error => {
                        console.error(error)
                    })
                })

                paymentDataModel.update({
                    isDeleted: 1,
                }, {
                    where: { id: paymentInvoiceId }
                }).then(result => {
                    console.log(result, "sale payment invoice removed successfully!");
                    return res.json({
                        status: 200,
                        message: 'sale payment invoice removed successfully!'
                    });
                }).catch(error => {
                    return res.json({
                        status: 500,
                        message: error
                    });
                });



            }).catch(error => {
                console.error(error)
            })
        })



    }).catch(error => {
        return res.json({
            status: 500,
            message: error
        });
    });


}


exports.deleteVendorPaymentInvoice = (req, res) => {
    const paymentInvoiceId = req.query.id;
    const isDeleted = 1;

    paymentPurchaseModel.findOne({
        where: { id: paymentInvoiceId },
        // raw: true,
    }).then(result => {
        console.log(result, "payment invoice");

        invoicePurchaseModel.findOne({
            where: { id: result.invoice_id },
            // raw: true,
        }).then(resue => {
            console.log(resue, "invoicePurchaseModel");
            receivedAmountP = parseFloat(resue.receivedAmount) - parseFloat(result.amount);

            invoicePurchaseModel.update({
                receivedAmount: receivedAmountP,
            }, { where: { id: result.invoice_id } }).then(invoiceresult => {
                console.log(invoiceresult, "invoicePurchaseModel updated");


                OrderModel.findOne({
                    where: { id: result.order_id },
                    // raw: true,
                }).then(resue => {
                    console.log(resue, "OrderModel");
                    purchasePaymentReceivedAmount = parseFloat(resue.purchasePaymentReceivedAmount) - parseFloat(result.amount);

                    OrderModel.update({
                        purchasePaymentReceivedAmount: purchasePaymentReceivedAmount,
                    }, { where: { id: result.order_id } }).then(resul => {
                        console.log(resul, "order updated");
                    }).catch(error => {
                        console.error(error)
                    })
                })

                paymentPurchaseModel.update({
                    isDeleted: 1,
                }, { where: { id: paymentInvoiceId } }).then(result => {

                    console.log(result, "purchase payment invoice removed successfully!");
                    return res.json({
                        status: 200,
                        message: 'purchase payment invoice removed successfully!'
                    });
                }).catch(error => {
                    return res.json({
                        status: 500,
                        message: error
                    });
                });





            }).catch(error => {
                console.error(error)
            })
        })





    }).catch(error => {
        return res.json({
            status: 500,
            message: error
        });
    });










}

