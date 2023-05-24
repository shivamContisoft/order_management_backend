const MainModule = require('../../models/module/main-module.model');
const SubModule = require('../../models/module/sub-module.model');
const AccessMainModule = require('../../models/module/access-main-module.model');
const AccessSubModule = require('../../models/module/access-sub-module.model');

exports.getMainModules = async (req, res) => {

    let whereClause = [];
    if ('accountType' in req.query && req.query.accountType) whereClause.push({accountType: req.query.accountType})

    MainModule.hasMany(SubModule, { foreignKey: 'parentModule' });
    const modules = await MainModule.findAll({ include: [{ model: SubModule, attributes: ['id', 'orderId', 'moduleName', 'moduleUrl', 'moduleIcon'] }], where: whereClause }).then(modules => modules).catch(error => error);
    return res.status(200).json({ status: 200, data: modules });
}

exports.getSubModules = async (req, res) => {

    if (!('parentModule' in req.query)) return res.status(200).json({ status: 201, message: 'Parent module id is not provided' })
    const parentModule = req.query.parentModule;
    const modules = await SubModule.findAll({ where: { parentModule } }).then(modules => modules).catch(error => error);
    return res.status(200).json({ status: 200, data: modules });
}

exports.getUserModules = async (req, res) => {
    if (!('userId' in req.query) || !('accountType' in req.query)) return res.status(200).json({ status: 201, message: 'No userId / accountType provided to load modules' });
    const accountId = req.query.userId;
    const accountType = req.query.accountType;
    AccessMainModule.belongsTo(MainModule, { foreignKey: 'moduleId' });
    const modules = await AccessMainModule.findAll({ include: [{ model: MainModule, attributes: ['moduleName', 'moduleUrl', 'moduleIcon', 'orderId'] }], where: { accountId, accountType }, raw: true }).then(modules => modules).catch(error => error);

    for (let index = 0; index < modules.length; index++) {
        const module = modules[index];
        AccessSubModule.belongsTo(SubModule, { foreignKey: 'subModuleId' })
        const subModules = await AccessSubModule.findAll({ include: [{ model: SubModule, attributes: ['moduleName', 'moduleIcon', 'moduleUrl', 'orderId'] }], where: { accountId, accountType, moduleId: module.moduleId } }).then(result => result).catch(error => error);
        modules[index]['subModules'] = subModules;
    }

    return res.status(200).json({ status: 200, data: modules });
}

exports.allocateUserModule = async (req, res) => {

    const moduleData = req.body.data;
    const accountId = moduleData.accountId;
    const accountType = moduleData.accountType;
    const selectedAccess = moduleData.selectedAccess;
    const createdAt = new Date();

    await AccessMainModule.destroy({where: {accountId, accountType}}).then().catch(error => console.log(error));
    
    for (let index = 0; index < selectedAccess.length; index++) {
        const moduleId = selectedAccess[index].toString().includes('-') ? parseInt(selectedAccess[index].split('-')[0]) : selectedAccess[index];
        await AccessMainModule.create({moduleId, accountId, accountType, createdAt}).then().catch(error => console.log(error))
    }
    
    return res.json({status: 200, message: 'modules are updated'});

}