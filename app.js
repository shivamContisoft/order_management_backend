const express = require('express');
const bodyParser = require('body-parser');

const app = express();

// Body Parser
app.use(bodyParser.json({ limit: '100mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));

//CORS Middleware
app.use(function(req, res, next) {
    //Enabling CORS
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Origin,Accept, Content-Type, Authorization, x-id, Content-Length, X-Requested-with');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

    next();
});

// Index route
app.get('/', (req, res) => {
    res.json({
        status: 200,
        message: "This is index page!"
    });
});

// api integration
app.use('/api', require('./routes/index.route'));

module.exports = app;