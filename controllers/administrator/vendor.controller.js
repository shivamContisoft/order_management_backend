const dotEnv = require('dotenv');

const VendorModel = require('../../models/administrator/vendor.model');
const AddOnVendorModel = require('../../models/administrator/vendor_add_on.model');

dotEnv.config();

exports.createVendor = async (req, res) => {

    const vendorData = req.body.data;
    const todaysDate = new Date();

    if (Object.keys(vendorData).length <= 0)
        return res.json({ status: 201, message: 'No data provided to create vendor.' });

    let { vendorName, contact, email, entity, address, location, country, state,city, pincode, contactPersonName1, contactPersonContact1, contactPersonEmail1, contactPersonName2, contactPersonContact2, contactPersonEmail2, panNo, gstNo, bankName, accountNo, ifscNo, branchName, addOnVendor } = vendorData;

    VendorModel.findOne({
        where:{ vendorName: vendorName,isDeleted:0}
    }).then(result => {
     
        if (result) {
             return res.json({ status: 202, message: 'This vendorName is already exist in the system!! ' 
            });

        } else {

    VendorModel.create({
        vendorName,
        contact, 
        email,
        entity,
        address,
        location,
        country, 
        state, 
        city,
        pincode, 
        contactPersonName1, 
        contactPersonContact1, 
        contactPersonEmail1, 
        contactPersonName2, 
        contactPersonContact2, 
        contactPersonEmail2, 
        panNo, 
        gstNo, 
        bankName, 
        accountNo, 
        ifscNo, 
        branchName,
        createdAt: todaysDate,
        updatedAt: todaysDate
    }).then(result => {
        let vendorId = result.id
       
        //Insert order add on vendor data
        if(addOnVendor < 0){
            addOnVendor.forEach(element => {
                AddOnVendorModel.create({
                    vendorId: vendorId,
                    contactPersonName: element.contactPersonName,
                    contactPersonContact: element.contactPersonContact,
                    contactPersonEmail: element.contactPersonEmail
                })
            });
        }
       
        return res.json({ 
            status: 200, 
            message: 'Vendor created successfully.' 
        });
    }).catch(error => {
        return res.json({ status: 202, err: error, message: 'Couldnt assiged auth details to the vendor.' });
    }) 
    
}


}).catch(error => {
    return error;
})

}
exports.createBulkVendor = async (req, res) => {


        const vendorData = req.body.data;
      
        const todaysDate = new Date();

        
        for (let index = 0; index < vendorData.length; index++) {

            VendorModel.count({ 
                where: { vendorName: vendorData[index]['Vendor Name'] } 
            }).then(count =>{
       
                if(count > 0){
                    VendorModel.findOne({
                        where:{ vendorName: vendorData[index]['Vendor Name'] }

                    }).then(result =>{
                       
                    }).catch(error => {
                        console.log(error);
                        return res.json({ status: 203, err: error, message: 'Couldnt assiged Bulk details to the customer.' });
                    })
                    
                
                }else {


            const vendorResult =  VendorModel.create({
                vendorName: vendorData[index]['Vendor Name'] ,
                address :  vendorData[index]['Address'],
                country : vendorData[index]['Country'],
                state : vendorData[index]['State'],
                city : vendorData[index]['City'],
                pincode : vendorData[index]['Pincode'],
                contactPersonName1 : vendorData[index]['Contact Person Name'], 
                contactPersonContact1 : vendorData[index]['Contact Person Contact'], 
                contactPersonEmail1 : vendorData[index]['Contact Person Email'],
                contactPersonName2 : vendorData[index]['Contact Person Name_1'],
                contactPersonContact2 : vendorData[index]['Contact Person Contact_1'],
                contactPersonEmail2 : vendorData[index]['Contact Person Email_1'],
                panNo : vendorData[index]['PAN No'],
                gstNo : vendorData[index]['GST No'],
                bankName : vendorData[index]['Bank Name'],
                accountNo : vendorData[index]['Account No'], 
                ifscNo : vendorData[index]['IFSC No'],
                branchName : vendorData[index]['Branch Name'],

                createdAt: todaysDate,
                updatedAt: todaysDate
            }).then(result => {
        
            }).catch(error => {
                return res.json({ status: 202, err: error, message: 'Couldnt assiged auth details to the oem.' });
            })
            if ((index + 1) == vendorData.length) {
                return res.json({
                    status: 200,
                    message: "Vendor Created successfuly.",
                });
        } 
        }
    }).catch(error => {
    console.log(error);
    return res.json({ status: 203, err: error, message: 'Couldnt assiged Bulk details to the customer.' });
    })
        }
    
}
exports.getVendors = async (req, res) => {

    let offset = 'offset' in req.query ? (parseInt(req.query.offset) > 0 ? parseInt(req.query.offset) : 1) : 1;
    let limit = 'limit' in req.query ? (parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 9999) : 9999;
    offset = (offset - 1) * limit;

    const vendors = await VendorModel.findAndCountAll({order: [['vendorName', 'ASC']],
        where: { isDeleted: 0 },
     offset: offset, limit: limit }
     ).then(vendors => vendors).catch(error => error);

    if (vendors)
        return res.json({ status: 200, message: 'Vendors data is in vendors node.', data: vendors });
    else
        return res.json({ status: 201, message: vendors });

}

exports.updateVendor = async (req, res) => {

    const vendorData = req.body.data;
    const todaysDate = new Date();

    if (Object.keys(vendorData).length <= 0)
        return res.json({ status: 201, message: 'No data provided to create vendor.' });

    let {id, vendorName, address, country, state,city, pincode, contactPersonName1, contactPersonContact1, contactPersonEmail1, contactPersonName2, contactPersonContact2, contactPersonEmail2, panNo, gstNo, bankName, accountNo, ifscNo, branchName } = vendorData;

    const vendorResult = await VendorModel.update({
        vendorName,
        address,
        country, 
        state, 
        city,
        pincode, 
        contactPersonName1, 
        contactPersonContact1, 
        contactPersonEmail1, 
        contactPersonName2, 
        contactPersonContact2, 
        contactPersonEmail2, 
        panNo, 
        gstNo, 
        bankName, 
        accountNo, 
        ifscNo, 
        branchName,
        createdAt: todaysDate,
        updatedAt: todaysDate
    }, { where: { id } }).then(result => {
        return result;
    }).catch(error => {
        return error;
    })

    if (vendorResult)
        return res.json({ status: 200, message: 'Vendor updated successfully.' });
    else
        return res.json({ status: 202, message: vendorResult })

}

exports.removeVendor = async (req, res) => {

    const vendor_id = req.query.id;
    const created_at = new Date();
    const isDeleted = 1;

    VendorModel.findOne({ where: { id: vendor_id } }).then(result => {

        VendorModel.update({
            isDeleted: isDeleted,
        }, { where: { id: vendor_id } }).then(result => {
            return res.json({
                status: 200,
                message: 'Vendor removed successfully!'
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