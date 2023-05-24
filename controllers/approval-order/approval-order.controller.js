const dotEnv = require('dotenv');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const ApprovalModel = require('../../models/administrator/approval.model');
//const dateFormat = require('dateformat');
const OrderModel = require('../../models/order/order.model');
const OrderSaleModel = require('../../models/order/order_sale.model');
const OrderPurchaseModel = require('../../models/order/order_purchase.model');
const OrderAttachmentModel = require('../../models/order/order_attachment.model');
const OrderVendorModel = require('../../models/order/order_vendor.model');
const UserModel = require('../../models/administrator/user.model');
const BdmModel = require('../../models/administrator/bdm.model');
const AmModel = require('../../models/administrator/am.model');
const BusinessUnitModel = require('../../models/administrator/business_unit.model');
const EntityModel = require('../../models/administrator/entity.model');
const CustomerModel = require('../../models/administrator/customer.model');
const ProductModel = require('../../models/administrator/product.model');
const OemModel = require('../../models/administrator/oem.model');
const VendorModel = require('../../models/administrator/vendor.model');
const emails = require('../../common/email.common');
const OrderApprovalModel = require('../../models/order/order_approval.model');
const AuthModel = require('../../models/auth/auth.model');
const OrderOemModel = require('../../models/order/order_oem.model');
//const OrderVendorModel = require('../../models/order/order_vendor.model');
dotEnv.config();

exports.getApprovalOrders = async (req, res) => {

    const userId = req.query.id;
    console.log('called');
    // OrderVendorModel.hasMany(VendorModel, {sourceKey: 'vendorValue', foreignKey: 'id'})
    OrderModel.belongsTo(AmModel, { foreignKey: 'amId' })
    OrderModel.belongsTo(EntityModel, { foreignKey: 'entity' })
    OrderModel.belongsTo(CustomerModel, { foreignKey: 'companyName' })
    // OrderModel.belongsTo(BdmModel, { foreignKey: 'bdm' })
    // OrderModel.belongsTo(BusinessUnitModel, { foreignKey: 'businessUnit' })
    // OrderModel.belongsTo(OemModel, { foreignKey: 'oem' })
    OrderModel.belongsTo(ProductModel, { foreignKey: 'productType' })

    OrderModel.hasMany(OrderOemModel, { foreignKey: 'orderId' })
    OrderOemModel.belongsTo(BusinessUnitModel, { foreignKey: 'businessUnit' })

    OrderModel.hasMany(OrderOemModel, { foreignKey: 'orderId' })
    OrderOemModel.belongsTo(ProductModel, { foreignKey: 'productType' })

    OrderModel.belongsTo(VendorModel, { foreignKey: 'vendorSelection' })
    OrderModel.hasMany(OrderSaleModel, { foreignKey: 'orderId' })
    OrderModel.hasMany(OrderPurchaseModel, { foreignKey: 'orderId' })
    OrderModel.hasMany(OrderAttachmentModel, { foreignKey: 'orderId' })
    OrderModel.hasMany(OrderVendorModel, { foreignKey: 'orderId' })
    OrderApprovalModel.belongsTo(UserModel, { foreignKey: 'userId' })
    // OrderModel.hasMany(OrderVendorModel, { foreignKey: 'orderId' })
    OrderModel.hasMany(OrderOemModel, { foreignKey: 'orderId' })
    OrderOemModel.belongsTo(OemModel, { foreignKey: 'oem' })
    OrderVendorModel.belongsTo(VendorModel, { foreignKey: 'vendorValue' })
    //OrderModel.belongsTo(AmModel, { foreignKey: 'amId' })
    OrderModel.hasMany(OrderApprovalModel, { foreignKey: 'orderId' })

    const orders = await OrderModel.findAll({

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
            // {
            //     model: BdmModel, attributes: ['id', 'firstName', 'lastName'], required: false
            // },
            // {
            //     model: BusinessUnitModel, attributes: ['id', 'categoryName'], required: false
            // },
            // {
            //     model: OemModel, attributes: ['id', 'oemName'], required: false
            // },
            // {
            //     model: ProductModel, attributes: ['id', 'productName'], required: false
            // },

            {
                model: OrderVendorModel, attributes: ['id', 'orderId', 'vendorValue', 'vendorPaymentValue', 'vendorPoValue'], required: false,
                include: {
                    model: VendorModel, attributes: ['id', 'vendorName'], required: false
                }
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
                model: OrderVendorModel, attributes: ['id', 'orderId', 'vendorValue', 'vendorPaymentValue'], required: false
            },
            {
                model: OrderApprovalModel, attributes: ['id', 'orderId', 'comment', 'status', 'userId', 'createdAt', 'time'], required: false,
                include: {
                    model: UserModel, attributes: ['id', 'firstName', 'lastName'], required: false
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
                    },
                    {
                        model: BusinessUnitModel, attributes: ['id', 'categoryName'],
                        required: false
                    }
                ]

            },


        ], order: [['id', 'DESC']],
        where: { pendingAt: userId },
    }).then

        (orders => orders).catch(error => error);

    if (orders) {
        console.log(orders, "%%%")
        return res.json({ status: 200, message: 'Approval Orders data is in node.', data: orders });
    }
    else
        return res.json({ status: 201, message: orders });
}

exports.markAsApproved = async (req, res) => {

    const orderId = req.query.orderid;
    const productType = req.query.producttype;
    const approveComment = req.query.approveComment;

    OrderModel.findOne({
        where: { id: orderId }
    }).then(result => {
        let pendingUserId = result.pendingAt;
        let step = result.step;
        //  Update order approved userid data
        ApprovalModel.findAll({
            where: { productType: productType },
            distinct: true,
            order: [['stageOrder', 'ASC']]
        }).then(result1 => {
            let approverUserId;
            let stepplus;
            stepplus = step + 1;
            result1.forEach(element => {
                if (element.stageOrder === stepplus) {
                    approverUserId = element.userId;

                }
            });
            ApprovalModel.count({
                where: { productType: productType, stageOrder: stepplus },
            }).then(count => {
                if (count == 0) {

                    OrderModel.update({
                        status: 'Fully Approved!!',
                        pendingAt: 0
                    }, {
                        where: { id: orderId }
                    }).then(result => {
                        OrderModel.findOne({
                            where: { id: orderId }
                        }).then(result => {
                            console.log(result.orderCode, "result.orderCode");




                            CustomerModel.findOne({
                                where: { id: result.companyName },
                                raw: true,
                            }).then(result2 => {
                                console.log(result2, "customer name")

                                // OrderOemModel.findOne({
                                //     where: { id: productType},
                                //     raw: true,
                                // }).then(result4 => {
                                //     console.log(result4,"email step product type")


                                // ProductModel.findOne({
                                //     where: { id: result.productType },
                                //     raw: true,
                                // }).then(result1 => {


                                AmModel.findOne({
                                    where: { userTableId: result.amId }
                                }).then(resu => {

                                    emails.emailFullyApproved(resu.firstName, resu.lastName, resu.email, result.orderCode, result2.customerName, result.poNo, result.poValue);
                                })

                                BdmModel.findOne({
                                    where: { id: result.bdm }
                                }).then(resu => {
                                    if (resu == null) {
                                        return false;
                                    } else {
                                        console.log(resu, "1111111111111111111111111111111111");
                                        emails.emailFullyApproved(resu.firstName, resu.lastName, resu.email, result.orderCode, result2.customerName, result.poNo, result.poValue);
                                    }
                                })


                            })
                        }).catch(error => {
                            console.log(error)
                        })
                        const todaysDate = new Date();

                        let time = todaysDate.getHours() + ":" + todaysDate.getMinutes();
                        OrderApprovalModel.create({
                            orderId: orderId,
                            comment: approveComment,
                            userId: pendingUserId,
                            status: 'Fully Approved!!',
                            createdAt: todaysDate,
                            time: time,
                        }).then(result => {

                        }).catch(error => {
                            console.log(error);
                        })

                        return res.json({
                            status: 200,
                            message: 'Order is Ready to go. Its final Approved.'
                        });
                    }).catch(error => {
                        return res.json({
                            status: 203,
                            err: error,
                            message: 'Couldnnt assiged auth details to the order.'
                        });
                    })
                } else {
                    step = step + 1;
                    OrderModel.update({
                        status: 'Pending',
                        pendingAt: approverUserId,
                        step: step,
                    }, {
                        where: { id: orderId }
                    }).then(result => {



                        OrderModel.findOne({
                            where: { id: orderId }
                        }).then(result => {

                            CustomerModel.findOne({
                                where: { id: result.companyName },
                                raw: true,
                            }).then(result2 => {
                                console.log(result2, "customer name")

                                // OrderOemModel.findOne({
                                //     where: { id: productType},
                                //     raw: true,
                                // }).then(result4 => {
                                //     console.log(result4,"email step product type")

                                // ProductModel.findOne({
                                //     where: { id: result.productType },
                                //     raw: true,
                                // }).then(result1 => {

                                console.log(result.orderCode, "result.orderCoderesult.orderCode");

                                AmModel.findOne({
                                    where: { userTableId: result.amId }
                                }).then(resu => {

                                    UserModel.findOne({
                                        where: { id: approverUserId }
                                    }).then(res1 => {
                                        const approverName = res1.firstName + ' ' + res1.lastName;
                                        // console.log(approverName,"approverNameapproverNameapproverName");
                                        emails.emailgoestoNextstep(resu.firstName, resu.lastName, resu.email, result.orderCode, approverName, result2.customerName, result.poNo, result.poValue);
                                        emails.approverEmail(res1.firstName, res1.lastName, res1.email, result.orderCode);

                                    }).catch(error => {
                                        console.log(error)
                                    })

                                }).catch(error => {
                                    console.log(error)
                                })


                                BdmModel.findOne({
                                    where: { id: result.bdm }
                                }).then(resu => {
                                    UserModel.findOne({
                                        where: { id: approverUserId }
                                    }).then(res1 => {
                                        const approverName = res1.firstName + ' ' + res1.lastName;
                                        // console.log(approverName,"approverNameapproverNameapproverName");
                                        emails.emailgoestoNextstep(resu.firstName, resu.lastName, resu.email, result.orderCode, approverName, result2.customerName, result.poNo, result.poValue);


                                    }).catch(error => {
                                        console.log(error)
                                    })

                                })



                                //     UserModel.findOne({
                                //         where: { id: approverUserId }
                                //     }).then(resu => {


                                //        emails.approverEmail(resu.firstName, resu.lastName, resu.email,result.orderCode);


                                // }).catch(error => {
                                //     console.log(error)
                                // })




                                const datestring = new Date()
                                let time = datestring.getHours() + ":" + datestring.getMinutes();

                                OrderApprovalModel.create({
                                    orderId: orderId,
                                    comment: approveComment,
                                    userId: pendingUserId,
                                    status: 'Approved',
                                    createdAt: datestring,
                                    time: time

                                }).catch(error => {
                                    console.log(error);
                                })
                            })
                        }).catch(error => {
                            console.log(error)
                        })

                        return res.json({
                            status: 200,
                            message: 'Order is Approved.'
                        });
                    }).catch(error => {
                        return res.json({
                            status: 203,
                            err: error,
                            message: 'Couldnnt assiged auth details to the order.'
                        });
                    })
                }
            }).catch(error => res.json({
                status: 500,
                message: error
            }));
        }).catch(error => error)
    })
}



exports.markAsRejected = async (req, res) => {

    const orderId = req.query.orderid;
    const approveComment = req.query.approveComment;
    OrderModel.findOne({
        where: { id: orderId }
    }).then(result => {

        let pendingUserId = result.pendingAt;

        //Update order rejected userid data
        const todaysDate = new Date();
        let time = todaysDate.getHours() + ":" + todaysDate.getMinutes();
        OrderApprovalModel.create({
            orderId: orderId,
            comment: approveComment,
            userId: pendingUserId,
            status: 'Rejected',
            createdAt: todaysDate,
            time: time
        }).then(result => {



            //reject Email
            OrderModel.findOne({
                where: { id: orderId }
            }).then(result => {
                console.log(result, "result of order model")
                // CustomerModel.findOne({
                //     where: { id: result.companyName },
                //     raw: true,
                // }).then(result2 => {
                    // console.log(result2, "customer of order model")
                    UserModel.findOne({
                        where: { id: result.pendingAt }
                    }).then(res1 => {
                        const approverName = res1.firstName + ' ' + res1.lastName;

                        UserModel.findOne({
                            where: { id: result.amId }
                        }).then(resu => {


                            console.log(approverName, "approverNameapproverNameapproverName");
                            console.log(resu, "resuresuresuresuresuresuresuresu");
                            emails.rejectEmail(resu.firstName, resu.lastName, resu.email, result.orderCode, approverName,  result.poNo, result.poValue);
                        })

                    }).catch(error => {
                        console.log(error)
                    })
                    //end reject email
                    return res.json({
                        status: 200,
                        message: 'reject order is updated.'
                    });
           
            })
        }).catch(error => {
            console.log(error);
        })

        OrderModel.update({
            status: 'Rejected',
            pendingAt: pendingUserId
        }, {
            where: { id: orderId }
        // }).then(result1 => {
        //     return res.json({
        //         status: 200,
        //         message: 'Order is Rejected.'
        //     });
        }).catch(error => {
            console.log(error);
        })
    }).catch(error => {
        console.log(error);
    })

}

exports.downloadFile = async (req, res) => {
    const id = req.query.orderId;
    const document_name = req.query.document_name;
    res.download(`./uploads/orders/${id}/${document_name}`);
}

