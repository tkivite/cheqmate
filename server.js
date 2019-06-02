'use strict';
require('dotenv').config({
  path: './setup.env'
});
const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');
const passport = require('passport');
const cookieParser = require('cookie-parser');


const app = express();
let routes = require('./server/routes');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(logger('dev'));
app.use(passport.initialize());
require('./configs/passport')(passport);
// Set up routes
routes.init(app);

var serverless = require('serverless-http');
module.exports.handler = serverless(app);