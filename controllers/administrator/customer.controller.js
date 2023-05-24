const dotEnv = require('dotenv');

const CustomerModel = require('../../models/administrator/customer.model');
const EntityModel = require('../../models/administrator/entity.model');

dotEnv.config();

exports.createCustomer = async (req, res) => {

    const customerData = req.body.data;

    const todaysDate = new Date();

    if (Object.keys(customerData).length <= 0)
        return res.json({ status: 201, message: 'No data provided to create customer.' });

    let { customerName, contact, email, entity, address, location, country, state,city, pincode, accountManager,PaymentTerm,contactPersonName1, contactPersonContact1, contactPersonEmail1, contactPersonName2, contactPersonContact2, contactPersonEmail2 } = customerData;
    console.log(customerName);

    CustomerModel.findOne({
        where:{ customerName: customerName, isDeleted:0}
    }).then(result => {
      console.log(result,"result");
        if (result) {
             return res.json({ status: 202, message: 'This user is already exist in the system!! ' 
            });

        } else {

          
    CustomerModel.create({
        
        customerName,
        contact, 
        email,
        entity,
        address,
        location,
        country, 
        state, 
        city,
        pincode, 
        PaymentTerm,
        accountManager,
        contactPersonName1, 
        contactPersonContact1, 
        contactPersonEmail1, 
        contactPersonName2, 
        contactPersonContact2, 
        contactPersonEmail2, 
        createdAt: todaysDate,
        updatedAt: todaysDate
    }).then(result => {
        return res.json({ status: 200, message: 'Customer created successfully.' });
    }).catch(error => {
        return res.json({ status: 202, err: customerResult, message: 'Couldnt assiged auth details to the customer.' });
    })

    // if (result){
       
    // }
    // else
    //     return res.json({ status: 202, err: customerResult, message: 'Couldnt assiged auth details to the customer.' });
    }
    }).catch(error => {
        return error;
    })
}
exports.createBulkCustomer = async (req, res) => {

    const customerData = req.body.data;
    const todaysDate = new Date();
   
    let entity;

    
    for (let index = 0; index < customerData.length; index++) {
        CustomerModel.count({ 
            where: { customerName: customerData[index]['Company Name'] } 
        }).then(count =>{
       
            if(count > 0){
                CustomerModel.findOne({
                    where:{ customerName: customerData[index]['Company Name'] }

                }).then(result =>{
                   
                }).catch(error => {
                    console.log(error);
                    return res.json({ status: 203, err: error, message: 'Couldnt assiged Bulk details to the customer.' });
                })
                
            
            }else {
              
        EntityModel.count({ 
            where: { entityName: customerData[index]['Entity'] } 
        }).then(async(count) =>{
          
            if(count > 0){
                const entityResult= await EntityModel.findOne({
                    where:{ entityName: customerData[index]['Entity'] }

                }).then(async(result) =>{
                  
                    entity=result.id;
               


                }).catch(error => {
                    console.log(error);
                    return res.json({ status: 203, err: error, message: 'Couldnt assiged Bulk details to the customer.' });
                })
                
               
            }else {
               const entityResult = await EntityModel.create({
                    entityName: customerData[index]['Entity'] 

                }).then(async(result) =>{
                    
                    entity=result.id;
                
                }).catch(error => {
                    console.log(error);
                    return res.json({ status: 203, err: error, message: 'Couldnt assiged Bulk details to the customer.' });
                })

                
            }
         
          const cust= await CustomerModel.create({
                entity: entity,
                customerName: customerData[index]['Company Name'] ,
                address :  customerData[index]['Address'],
                country : customerData[index]['Country'],
                state : customerData[index]['State'],
                city : customerData[index]['City'],
                pincode : customerData[index]['Pincode'],
                PaymentTerm : customerData[index]['Payment Term'],
                contactPersonName1 : customerData[index]['Contact Person Name'], 
                contactPersonContact1 : customerData[index]['Contact Person Contact'], 
                contactPersonEmail1 : customerData[index]['Contact Person Email'],
                contactPersonName2 : customerData[index]['Contact Person Name_1'],
                contactPersonContact2 : customerData[index]['Contact Person Contact_1'],
                contactPersonEmail2 : customerData[index]['Contact Person Email-_1'],
                createdAt: todaysDate,
                updatedAt: todaysDate
            }).then(result => {
                   
            }).catch(error => {
                console.log(error);
                return res.json({ status: 202, err: error, message: 'Couldnt assiged Bulk details to the customer.' });
            })
            if ((index + 1) == customerData.length) {
                return res.json({
                    status: 200,
                    message: "customer Created successfuly.",
                });
            } 
        }).catch(error => {
            console.log(error);
            return res.json({ status: 203, err: error, message: 'Couldnt assiged Bulk details to the customer.' });
        })
    }
}).catch(error => {
console.log(error);
return res.json({ status: 203, err: error, message: 'Couldnt assiged Bulk details to the customer.' });
})
    }
    
}

exports.getCustomers = async (req, res) => {

    let offset = 'offset' in req.query ? (parseInt(req.query.offset) > 0 ? parseInt(req.query.offset) : 1) : 1;
    let limit = 'limit' in req.query ? (parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 9999) : 9999;
    offset = (offset - 1) * limit;
    

    CustomerModel.belongsTo(EntityModel, { foreignKey: 'entity' })

    const customers = await CustomerModel.findAndCountAll({
        include: [
            {
                model: EntityModel, attributes: ['id', 'entityName'], required: false
            },
        
        
        ],order: [['customerName', 'ASC']], where: { isDeleted: 0 }, offset: offset, limit: limit }).then(customers => customers).catch(error => error);

    if (customers)
        return res.json({ status: 200, message: 'Customers data is in customers node.', data: customers });
    else
        return res.json({ status: 201, message: customers });

}

exports.updateCustomer = async (req, res) => {

    const customerData = req.body.data;
    const todaysDate = new Date();

    if (Object.keys(customerData).length <= 0)
        return res.json({ status: 201, message: 'No data provided to create customer.' });

    let {id, customerName, address, country, PaymentTerm,state, accountManager,pincode,city, contactPersonName1, contactPersonContact1, contactPersonEmail1, contactPersonName2, contactPersonContact2, contactPersonEmail2 } = customerData;

    const customerResult = await CustomerModel.update({
        customerName,
        address,
        country, 
        state, 
        city,
        pincode, 
        PaymentTerm,
        accountManager,
        contactPersonName1, 
        contactPersonContact1, 
        contactPersonEmail1, 
        contactPersonName2, 
        contactPersonContact2, 
        contactPersonEmail2, 
        createdAt: todaysDate,
        updatedAt: todaysDate
    }, { where: { id } }).then(result => {
        return result;
    }).catch(error => {
        return error;
    })

    if (customerResult)
        return res.json({ status: 200, message: 'Customer updated successfully.' });
    else
        return res.json({ status: 202, message: customerResult })

}

exports.removeCustomer = async (req, res) => {

    const customer_id = req.query.id;
    const created_at = new Date();
    const isDeleted = 1;

    CustomerModel.findOne({ where: { id: customer_id } }).then(result => {

        CustomerModel.update({
            isDeleted: isDeleted,
        }, { where: { id: customer_id } }).then(result => {
            return res.json({
                status: 200,
                message: 'Customer removed successfully!'
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




exports.getCustomersByEntity = async (req, res) => {
    const entityId = req.query.entityId;
    
    CustomerModel.findAndCountAll({ where: { entity : entityId } }).then(result => {
        if(result.count == 0 ){
            return res.json({
                status: 200,
                message: 'Customers Not Found !'
            }); 
        }else{
            return res.json({
                status: 200,
                message: 'Customers Found successfully!',
                data: result
            }); 
        }
        
    }).catch(error => {
        return res.json({
            status: 500,
            message: error
        });
    });
}


