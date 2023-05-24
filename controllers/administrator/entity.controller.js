const dotEnv = require('dotenv');

const EntityModel = require('../../models/administrator/entity.model');

dotEnv.config();

exports.getEntitys = async (req, res) => {

    let offset = 'offset' in req.query ? (parseInt(req.query.offset) > 0 ? parseInt(req.query.offset) : 1) : 1;
    let limit = 'limit' in req.query ? (parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 9999) : 9999;
    offset = (offset - 1) * limit;

    const entitys = await EntityModel.findAndCountAll(
        { offset: offset, limit: limit, order: [['entityName', 'ASC']] }).then(entitys => entitys).catch(error => error);

    if (entitys)
        return res.json({ status: 200, message: 'Entitys data is in entitys node.', data: entitys });
    else
        return res.json({ status: 201, message: entitys });

}

exports.createEntity = async (req, res) => {
    const entityData = req.body.data;
    const todaysDate = new Date();

    if (Object.keys(entityData).length <= 0)
        return res.json({ status: 201, message: 'No data provided to create Entity.' });

    let { entityName } = entityData;

    const entityResult = await EntityModel.create({
        entityName,
        createdAt: todaysDate,
        updatedAt: todaysDate
    }).then(result => {
        return result;
    }).catch(error => {
        return error;
    })

    if ('id' in entityResult)
        return res.json({ status: 200, message: 'Entity created successfully.' });
    else
        return res.json({ status: 202, err: entityResult, message: 'Couldnt assiged auth details to the Entity.' });

}

exports.removeEntity = async (req, res) => {

    const entityId = req.query.id;
    const created_at = new Date();

    EntityModel.findOne({ where: { id: entityId } }).then(result => {
        EntityModel.destroy({ where: { id: entityId } }).then(result => {

            console.log("Entity removed successfully!");
            return res.json({
                status: 200,
                message: 'Entity removed successfully!'
            });

        }).catch(error => {
            console.log("Error deleting Entity:", error);
            return res.json({
                status: 500,
                message: error
            });
        });

    }).catch(error => {
        console.log("Error finding Entity:", error);
        return res.json({
            status: 500,
            message: error
        })
    })

}