const bcrypt = require('bcryptjs');
const jwtWebToken = require('jsonwebtoken');
const dotEnv = require('dotenv');

const UserModel = require('../../models/administrator/user.model');
const AuthModel = require('../../models/auth/auth.model');
const AmModel = require('../../models/administrator/am.model');

dotEnv.config();

exports.authenticate = async (req, res) => {

    const credentials = req.body;

    if (Object.keys(credentials).length <= 0)
        return res.status(200).json({ status: 201, message: 'No credentials provided' });

    let { userName, password } = credentials;

    let authDetails = await AuthModel.findOne({ where: { userName }, raw: true}).then(result => result).catch(error => error);

    if (authDetails == null)
        return res.status(200).json({ status: 202, message: 'You have entered wrong userName' });
    if (!('password' in authDetails))
        return res.status(500).json({ status: 500, message: authDetails });

    let isAuthenticated = bcrypt.compareSync(password, authDetails.password)

    if (!isAuthenticated)
        return res.status(200).json({ status: 203, message: 'You have entered wrong password' })

    if (authDetails.accountType === 1 || authDetails.accountType === 2 || authDetails.accountType === 3 || authDetails.accountType === 4 || authDetails.accountType === 5 || authDetails.accountType === 6 || authDetails.accountType === 7 || authDetails.accountType === 8 || authDetails.accountType === 9 || authDetails.accountType === 10) {
    
        UserModel.hasOne(AuthModel, { foreignKey: 'userId' });
        var userDetails = await UserModel.findOne({include: [{ model: AuthModel, attributes: ['accountType'] }], where: { id: authDetails.userId } }).then(result => result).catch(error => error)

        var jwtToken = jwtWebToken.sign({ userDetails: userDetails }, process.env.SECRET_KEY, { expiresIn: "24h" });
    }
 
    return res.status(200).json({ status: 200, user: userDetails, token: jwtToken, message: 'User authenticated successfuly' })
}