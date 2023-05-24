const dotEnv = require('dotenv');
const http = require('http');
const https = require('https');
const app = require('./app');


// Configuring .env variables to process.env
dotEnv.config();

// Non-SSL Server
const httpServer = http.createServer(app);
httpServer.listen(process.env.NSSL_PORT, () => {
    console.log(`Non-SSL server started listening on ${process.env.NSSL_PORT}`);
});

// const httpsServer = https.createServer(app);
// httpsServer.listen(process.env.NSSL_PORT, () => {
//     console.log(`SSL server started listening on ${process.env.NSSL_PORT}`);
// });

// SSL applied server
// var privateKey  = fs.readFileSync('sslcert/server.key', 'utf8');
// var certificate = fs.readFileSync('sslcert/server.crt', 'utf8');
// var credentials = {key: privateKey, cert: certificate};
// const httpsServer = https.createServer(app);
// httpsServer.listen(process.env.SSL_PORT, () => {
//     console.log(`SSL Server started listening on ${process.env.SSL_PORT}`);
// });