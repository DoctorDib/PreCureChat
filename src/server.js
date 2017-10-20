'use strict';

// const app = require('./app');

const express = require('express');
const app = express();
const options = {
    key: fs.readFileSync('../SSL/privkey1.pem'),
    cert: fs.readFileSync('../SSL/fullchain1.pem'),
    ca: fs.readFileSync('../SSL/chain1.pem')
};
const https = require('https');
const Server = https.createServer(options, app);

Server.listen(8080, 'precure.ddns.net');