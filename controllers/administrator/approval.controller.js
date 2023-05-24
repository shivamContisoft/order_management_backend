const dotEnv = require('dotenv');

const ApprovalModel = require('../../models/administrator/approval.model');
const Product = require('../../models/administrator/product.model');
const ProductModel = require('../../models/administrator/product.model');

dotEnv.config();

exports.createApproval = async (req, res) => {

    const approvalData = req.body.data;
    const todaysDate = new Date();
    let counter = 1;

    let { productType, department, userId, userName, departmentFMS, userIdFMS, addFlowList } = approvalData;
    
    let approvalDetails = await ApprovalModel.findOne({
        where: {
            productType
        }
    }).then(result => {
        return result
    }).catch(error => {
        console.log(error);
    })
    // if (approvalDetails) {
    //     return res.json({
    //         status: 202,
    //         message: 'Already Exists'
    //     })
    // }

    addFlowList.forEach(element => {
        console.log(addFlowList, "addFlowList")
        ApprovalModel.create({
            productType,
            productName: element.productName,
            departmentId: element.departmentId,
            departmentName: element.departmentName,
            userId: element.userId,
            userName: element.userName,
            stageOrder: element.stageOrder,
            createdAt: todaysDate,
            updatedAt: todaysDate
        }).then(result => {

            if (addFlowList.length == counter) {
                return res.json({
                    status: 200,
                    message: 'Approval created successfully.'
                })
            } else {
                counter++;
            }
        }).catch(error => {
            return res.json({
                status: 203,
                err: error,
                message: 'Couldnnt assiged auth details to the approval.'
            });
        })
    });
}

exports.getApprovals = async (req, res) => {

    let offset = 'offset' in req.query ? (parseInt(req.query.offset) > 0 ? parseInt(req.query.offset) : 1) : 1;
    let limit = 'limit' in req.query ? (parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 9999) : 9999;
    offset = (offset - 1) * limit;

    ApprovalModel.findAll({ group: 'productType', where: { isDeleted: 0 } },
        {
            include: [
                {
                    model: ProductModel, attributes: ['productName'], required: false
                }

                // include: [

                //     {
                //         model: OrderOemModel,
                //         attributes: ['id', 'orderId', 'productType','productDescription'],
                //         required: false,
                //         include: [
                //             {
                //                 model:ProductModel, attributes: [ 'id','productName' ],
                //                  required: false
                //             }
                //         ]
                //     },
            ]
        }).then(approvals => {
            res.json({ status: 200, message: 'Approval data is in approvals node.', data: approvals });
        }).catch(error => {
            return res.json({ status: 201, message: 'Somthing went wrong !!', err: error });
        });

}


exports.getProducts = async (req, res) => {

    ProductModel.findAll({ where: { isDeleted: 0 } },
        {
            // include: [
            //     {
            //         model: ProductModel, attributes: ['productName'], required: false
            //     }
            // ]
        }).then(Products => {
            res.json({ status: 200, message: 'Products data is in approvals node.', data: Products });
        }).catch(error => {
            return res.json({ status: 201, message: 'Somthing went wrong !!', err: error });
        });

}
exports.updateApproval = async (req, res) => {

    // const approvalData = req.body.data;
    // const todaysDate = new Date();

    // if (Object.keys(approvalData).length <= 0)
    //     return res.json({ status: 201, message: 'No data provided to create approval.' });

    // let {id, productName, department, userId  } = approvalData;

    // const approvalResult = await ApprovalModel.update({
    //     productName,
    //      department, 
    // userId,
    //     createdAt: todaysDate,
    //     updatedAt: todaysDate
    // }, { where: { id } }).then(result => {
    //     return result;
    // }).catch(error => {
    //     return error;
    // })

    // if (approvalResult)
    //     return res.json({ status: 200, message: 'Approval updated successfully.' });
    // else
    //     return res.json({ status: 202, message: approvalResult })

}



// exports.removeApproval = async (req, res) => {

//     const productType = req.query.id;
//     console.log(productType,"productType")
//     const created_at = new Date();
//     const isDeleted = 1;

//     ApprovalModel.findAll({ where: { productType: productType } }).then(result => {


//         ApprovalModel.update({
//             isDeleted: isDeleted,
//         }, { where: { productType: productType } }).then(result => {
//             return res.json({
//                 status: 200,
//                 message: 'Approval removed successfully!'
//             });    
//         }).catch(error => {
//             return res.json({
//                 status: 500,
//                 message: error
//             });
//         });
//     }).catch(error => {
//         return res.json({
//             status: 500,
//             message: error
//         });
//     });
// }




exports.removeApproval = async (req, res) => {

    const productType = req.query.id;
    console.log(productType, "productType")
    const created_at = new Date();

    ApprovalModel.findAll({ where: { productType: productType } }).then(result => {

        ApprovalModel.destroy({ where: { productType: productType } }).then(result => {
            return res.json({
                status: 200,
                message: 'Approval removed successfully!'
            });
        }).catch(error => {
            return res.json({
                status: 500,
                message: error
            });
        });
    }).catch(error => {
        return res.json({
            status: 500,
            message: error
        });
    });
}




// exports.checkApprovalflow =  async (req, res) => {

//     let offset = 'offset' in req.query ? (parseInt(req.query.offset) > 0 ? parseInt(req.query.offset) : 1) : 1;
//     let limit = 'limit' in req.query ? (parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 9999) : 9999;
//     offset = (offset - 1) * limit;

//     ApprovalModel.findAll({ group: 'productType', where: { isDeleted: 0 } },
//         {
//             include: [
//                 {
//                     model: ProductModel, attributes: ['productName'], required: false
//                 }

//                 // include: [

//                 //     {
//                 //         model: OrderOemModel,
//                 //         attributes: ['id', 'orderId', 'productType','productDescription'],
//                 //         required: false,
//                 //         include: [
//                 //             {
//                 //                 model:ProductModel, attributes: [ 'id','productName' ],
//                 //                  required: false
//                 //             }
//                 //         ]
//                 //     },
//             ]
//         }).then(approvals => {
//             res.json({ status: 200, message: 'Approval data is in approvals node.', data: approvals });
//         }).catch(error => {
//             return res.json({ status: 201, message: 'Somthing went wrong !!', err: error });
//         });


// }
























exports.getApprovalByProduct = async (req, res) => {
    const productid = req.query.id;
    const created_at = new Date();

    let offset = 'offset' in req.query ? (parseInt(req.query.offset) > 0 ? parseInt(req.query.offset) : 1) : 1;

    let limit = 'limit' in req.query ? (parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 9999) : 9999;
    offset = (offset - 1) * limit;


    const approvalData = await ApprovalModel.findAndCountAll({ where: { productType: productid }, offset: offset, limit: limit }).then(approvalData => approvalData).catch(error => error);

    if (approvalData)
        return res.json({ status: 200, message: 'Approval data is in approval node.', data: approvalData });
    else
        return res.json({ status: 201, message: approvalData });
}