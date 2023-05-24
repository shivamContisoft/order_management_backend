const dotEnv = require('dotenv');

const OemModel = require('../../models/administrator/oem.model');

dotEnv.config();

exports.createOem = async (req, res) => {

    const oemData = req.body.data;
    const todaysDate = new Date();

    if (Object.keys(oemData).length <= 0)
        return res.json({ status: 201, message: 'No data provided to create oem.' });

    let { oemName, description } = oemData;

    const oemResult = await OemModel.create({
        oemName,
        description,
        createdAt: todaysDate,
        updatedAt: todaysDate
    }).then(result => {
        return result;
    }).catch(error => {
        return error;
    })

    if ('id' in oemResult)
        return res.json({ status: 200, message: 'Oem created successfully.' });
    else
        return res.json({ status: 202, err: oemResult, message: 'Couldnt assiged auth details to the oem.' });

}

exports.createBulkOem = async (req, res) => {

    const oemData = req.body.data;
  
    const todaysDate = new Date();

    for (let index = 0; index < oemData.length; index++) {

        OemModel.count({ 
            where: { oemName: oemData[index]['OEM Name'] } 
        }).then(count =>{
           
            if(count > 0){
                OemModel.findOne({
                    where:{ oemName: oemData[index]['OEM Name'] }

                }).then(result =>{
                   
                }).catch(error => {
                    console.log(error);
                    return res.json({ status: 203, err: error, message: 'Couldnt assiged Bulk details to the customer.' });
                })
                
               
            }else {
            

        const oemResult = OemModel.create({
                    oemName: oemData[index]['OEM Name'] ,
                    description: oemData[index]['Description'],
                    createdAt: todaysDate,
                    updatedAt: todaysDate
                }).then(result => {
            
                }).catch(error => {
                    return res.json({ status: 202, err: error, message: 'Couldnt assiged auth details to the oem.' });
                })
                if ((index + 1) == oemData.length) {
                    return res.json({
                        status: 200,
                        message: "OEM Created successfuly.",
                    });
            }
        }
     }).catch(error => {
        console.log(error);
        return res.json({ status: 203, err: error, message: 'Couldnt assiged Bulk details to the customer.' });
    })
     
    }


}

exports.getOem = async (req, res) => {

    let offset = 'offset' in req.query ? (parseInt(req.query.offset) > 0 ? parseInt(req.query.offset) : 1) : 1;
    let limit = 'limit' in req.query ? (parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 9999) : 9999;
    offset = (offset - 1) * limit;

    const oems = await OemModel.findAndCountAll({ order: [['oemName', 'ASC']], where: { isDeleted: 0 }, offset: offset, limit: limit }).then(oems => oems).catch(error => error);

    if (oems)
        return res.json({ status: 200, message: 'Oems data is in oems node.', data: oems });
    else
        return res.json({ status: 201, message: oems });
}

exports.updateOem = async (req, res) => {

    const oemData = req.body.data;
    const todaysDate = new Date();

    if (Object.keys(oemData).length <= 0)
        return res.json({ status: 201, message: 'No data provided to create oem.' });

    let {id, oemName, description } = oemData;

    const oemResult = await OemModel.update({
        oemName,
        description,
        createdAt: todaysDate,
        updatedAt: todaysDate
    }, { where: { id } }).then(result => {
        return result;
    }).catch(error => {
        return error;
    })

    if (oemResult)
        return res.json({ status: 200, message: 'Oem updated successfully.' });
    else
        return res.json({ status: 202, message: oemResult })

}

exports.removeOem = async (req, res) => {

    const oem_id = req.query.id;
    const created_at = new Date();
    const isDeleted = 1;

    OemModel.findOne({ where: { id: oem_id } }).then(result => {

        OemModel.update({
            isDeleted: isDeleted,
        }, { where: { id: oem_id } }).then(result => {
            return res.json({
                status: 200,
                message: 'Oem removed successfully!'
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