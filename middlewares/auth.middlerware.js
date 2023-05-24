let jwtWebToken = require('jsonwebtoken');
const dotEnv = require('dotenv');

dotEnv.config()

let verifyToken = (req, res, next) => {
    let jwtToken = req.headers['x-access-token'] || req.headers['authorization'] || req.headers['Authorization']; // Express headers are auto converted to lowercase
    
    if (!jwtToken)
        return res.status(403).json({ status: 403, message: 'Auth token is not provided' });

    if (jwtToken.startsWith('Bearer '))
        jwtToken = jwtToken.slice(7, jwtToken.length);

    jwtWebToken.verify(jwtToken, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                status: 401,
                message: 'Token is not valid'
            });
        } else {
            req.userDetails = decoded;
            next();
        }
    });
};

module.exports = {
    verifyToken: verifyToken
};