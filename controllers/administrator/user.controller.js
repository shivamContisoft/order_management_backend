const passGenerator = require('generate-password');
const bcrypt = require('bcryptjs');
const dotEnv = require('dotenv');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const UserModel = require('../../models/administrator/user.model');
const AuthModel = require('../../models/auth/auth.model');

const emails = require('../../common/email.common');

dotEnv.config();

exports.createUser = async (req, res) => {

    const userData = req.body.data;
    const todaysDate = new Date();

    if (Object.keys(userData).length <= 0)
        return res.json({ status: 201, message: 'No data provided to create user.' });

    let { firstName, lastName, designation, email, contact, department } = userData;

    UserModel.findOne({
        where: { email: email, isDeleted: 0 }
    }).then(result => {

        if (result) {
            return res.json({
                status: 202, message: 'This user is already exist in the system!! '
            });

        } else {
            // const userResult = 
            UserModel.create({
                firstName,
                lastName,
                designation,
                email,
                contact,
                department,
                createdAt: todaysDate,
                updatedAt: todaysDate
            }).then(result1 => {


                let password = passGenerator.generate({ length: parseInt(process.env.length), numbers: process.env.numbers });
                let hashPassword = bcrypt.hashSync(password, parseInt(process.env.rounds));

                // const authResult =
                AuthModel.create({
                    userId: result1.id,
                    userName: result1.email,
                    password: hashPassword,
                    accountType: result1.department,
                    createdAt: todaysDate,
                    updatedAt: todaysDate
                }).then(resu => {
                    console.log(resu.userName, "email");
                    emails.emailForNewAccount(resu.userName, password);
                    return res.json({
                        status: 200,
                        message: 'User created successfully.'
                    })
                }).catch(error => {
                    return res.json({ status: 203, data: error, message: 'Couldnnt assiged auth details to the user.' });
                });

            }).catch(error => {
                return error;
            })

        }


    }).catch(error => {
        return error;
    })


}

exports.getUsers = async (req, res) => {

    let offset = 'offset' in req.query ? (parseInt(req.query.offset) > 0 ? parseInt(req.query.offset) : 1) : 1;
    let limit = 'limit' in req.query ? (parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 9999) : 9999;
    offset = (offset - 1) * limit;

    const users = await UserModel.findAndCountAll({
        order: [['id', 'DESC']],
        where: {
            isDeleted: 0, department: { [Op.not]: 0 }
        }, offset: offset, limit: limit
    }).then(users => users).catch(error => error);

    if (users)
        return res.json({ status: 200, message: 'Users data is in users node.', data: users });
    else
        return res.json({ status: 201, message: users });
}

exports.updateUser = async (req, res) => {

    const userData = req.body.data;
    const todaysDate = new Date();

    if (Object.keys(userData).length <= 0)
        return res.json({ status: 201, message: 'No data provided to update user.' });

    let { id, firstName, lastName, designation, email, contact, department } = userData;

    const userResult = await UserModel.update({
        firstName,
        lastName,
        designation,
        email,
        contact,
        department,
        updatedAt: todaysDate
    }, { where: { id } }).then(result => {
        console.log(result,"result000000000")
        AuthModel.update({
            userName: email,
            accountType:department,
            updatedAt: todaysDate
        }, { where: { userId: id } }).then(resu => {



        })
        return result;
    }).catch(error => {
        return error;
    })

    if (userResult)
        return res.json({ status: 200, message: 'User updated successfuly.' });
    else
        return res.json({ status: 202, message: userResult })
}

exports.removeUser = async (req, res) => {

    const user_id = req.query.id;
    const created_at = new Date();

    const authRe = await AuthModel.destroy({ where: { userId: user_id } }).then(resu => {
        console.log(resu, "result2")
        console.log("auth data deleted successfully");
        return resu;
    }).catch(error => console.log(error))
    const userRes = await UserModel.destroy({ where :{ id: user_id}}).then(resul=> { 
        console.log(resul,"resul");
        console.log("user data removed successfull!");
        return resul;
    }).catch(error => {
        console.log(error, "Error")
        return res.json({
            status: 500,
            message: error
        })
    })
    return res.json({ status: 200, message: "Record has been deleted successfully" })
       


}

exports.updatePassword = async (req, res) => {
    const userData = req.body;

    if (Object.keys(userData).length <= 0)
        return res.json({ status: 201, message: 'No userId provided' });

    const userName = userData.data.userName;
    const password = userData.data.password;

    const todaysDate = new Date();

    const authResult = await AuthModel.findOne({ where: { userName: userName } }).then(user => user).catch(error => error);

    if (authResult) {

        let hashPassword = bcrypt.hashSync(password, parseInt(process.env.rounds));

        const authResult = await AuthModel.update({ password: hashPassword, updatedAt: todaysDate }, { where: { userName: userName } }).then(result => result).catch(error => error);
        if (authResult)
            return res.json({ status: 200, message: 'Password change done' })
        else
            return res.json({ status: 203, message: authResult })
    } else
        return res.json({ status: 202, message: 'Invalid userId passed' });
}

exports.resetPassword = async (req, res) => {
    const userData = req.body;
    const todaysDate = new Date();

    if (Object.keys(userData).length <= 0)
        return res.json({ status: 201, message: 'No userName provided' });

    const authResult = await AuthModel.findOne({ where: { userName: userData.userName } }).then(user => user).catch(error => error);

    if (authResult) {
        let password = passGenerator.generate({ length: parseInt(process.env.length), numbers: process.env.numbers });
        let hashPassword = bcrypt.hashSync(password, parseInt(process.env.rounds));
        const authResult = await AuthModel.update({ password: hashPassword, updatedAt: todaysDate }, { where: { userName: userData.userName } }).then(result => result).catch(error => error);
        if (authResult) {
            emails.sendResetPasswordEmail(password, userData.userName);
            return res.json({ status: 200, message: 'Password reset done' })
        }
        else
            return res.json({ status: 203, message: authResult })
    } else
        return res.json({ status: 202, message: 'Invalid userName passed' });
}

exports.getUserByDepartment = async (req, res) => {
    const departmentId = req.query.departmentId;
    const created_at = new Date();

    UserModel.findAll({
        where: { department: departmentId }
    }).then(result => {
        if (result.length == 0) {
            res.json({
                status: 200,
                message: "User according to department id data Not Found"
            })
        } else {

            return res.json({
                status: 200,
                message: 'User according to department id is in user node.',
                data: result
            });

        }

    }).catch(error => {
        return res.json({ status: 201, message: error });
    });

}

