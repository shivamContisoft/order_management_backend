const dotEnv = require('dotenv');

const LocationModel = require('../../models/administrator/location.model');

dotEnv.config();

exports.createLocation = async (req, res) => {

    const locationData = req.body.data;
    const todaysDate = new Date();

    if (Object.keys(locationData).length <= 0)
        return res.json({ status: 201, message: 'No data provided to create location.' });

    let { location } = locationData;

    const locationResult = await LocationModel.create({
        location,
        createdAt: todaysDate,
        updatedAt: todaysDate
    }).then(result => {
        return result;
    }).catch(error => {
        return error;
    })

    if ('id' in locationResult)
        return res.json({ status: 200, message: 'Location created successfully.' });
    else
        return res.json({ status: 202, err: locationResult, message: 'Couldnt assiged auth details to the location.' });

}

exports.getLocation = async (req, res) => {

    let offset = 'offset' in req.query ? (parseInt(req.query.offset) > 0 ? parseInt(req.query.offset) : 1) : 1;
    let limit = 'limit' in req.query ? (parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 9999) : 9999;
    offset = (offset - 1) * limit;

    const locations = await LocationModel.findAndCountAll({ where: { isDeleted: 0 }, offset: offset, limit: limit }).then(locations => locations).catch(error => error);

    if (locations)
        return res.json({ status: 200, message: 'Locations data is in locations node.', data: locations });
    else
        return res.json({ status: 201, message: locations });

}

exports.updateLocation = async (req, res) => {

    const locationData = req.body.data;
    const todaysDate = new Date();

    if (Object.keys(locationData).length <= 0)
        return res.json({ status: 201, message: 'No data provided to create location.' });

    let {id, location } = locationData;

    const locationResult = await LocationModel.update({
        location,
        createdAt: todaysDate,
        updatedAt: todaysDate
    }, { where: { id } }).then(result => {
        return result;
    }).catch(error => {
        return error;
    })

    if (locationResult)
        return res.json({ status: 200, message: 'Location updated successfully.' });
    else
        return res.json({ status: 202, message: locationResult })

}

exports.removeLocation = async (req, res) => {

    const location_id = req.query.id;
    const created_at = new Date();
    const isDeleted = 1;

    LocationModel.findOne({ where: { id: location_id } }).then(result => {

        LocationModel.update({
            isDeleted: isDeleted,
        }, { where: { id: location_id } }).then(result => {
            return res.json({
                status: 200,
                message: 'Location removed successfully!'
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