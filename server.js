// Required libs
const http          = require("http");
const express       = require("express");
const bodyParser    = require('body-parser');
const cookieParser  = require('cookie-parser');
const request       = require('request');
const session       = require('express-session');
const path          = require('path');
const moment        = require('moment-timezone');

// Global reusable vars.
ENV                 = require('dotenv').config().parsed;
FS                  = require('fs');
STATIC_DIR          = (__dirname + "/static");
TwilioClient        = require('twilio')(ENV.TWILIO_ACCOUNT_SID, ENV.TWILIO_AUTH_TOKEN);

// HTTP server settings
const httpApp       = express();
const router        = express.Router();
httpApp.set('views', __dirname + "/app/views");
httpApp.set('view engine', 'pug');
httpApp.use(express.static(STATIC_DIR,{
  setHeaders: function(res, path) {
    res.setHeader('Access-Control-Allow-Headers', 'accept, authorization, content-type, x-requested-with');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Allow-Origin',  '*');
  }
}));
httpApp.use(bodyParser.json({limit: '50mb', parameterLimit: 10000}));
httpApp.use(bodyParser.urlencoded({limit: '50mb', parameterLimit: 10000, extended: true}));
httpApp.use(cookieParser());
httpApp.use(session({
  secret: 'demoapp',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));
httpApp.disable('x-powered-by');
httpApp.disable('content-length');
httpApp.disable('content-type');
httpApp.disable('etag');
httpApp.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Headers', 'accept, authorization, content-type, x-requested-with');
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader('Access-Control-Allow-Origin',  '*');
  next();
});
httpApp.use('/', router);

// Load models and controllers.
require("./app/controllers/index")(router);

// Start server.
const httpServer = http.createServer(httpApp).listen(ENV.PORT);
console.log("Listening on port:", ENV.PORT);
