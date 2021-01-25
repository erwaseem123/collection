require("dotenv").config();
require('rootpath')();
var compression = require('compression');
const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const app = express();
const bodyParser = require('body-parser');
const http = require('http');
const path = require('path');
const multipart = require('connect-multiparty');
const rateLimit = require("express-rate-limit");
var session = require('express-session');
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: 'uwotm8'
}))
var logger = require('morgan');
const publicPath = path.join(__dirname, '/websport');
const limiter = rateLimit({
  windowMs: 1000, // 1 seconds
  max: 25, // limit each IP to 10 requests per windowMs
  message: "Too many accounts created from this IP, please try again after one minute"
});
app.use(compression());
app.use(logger('dev'));
app.get('/*', (req, res) => res.sendFile(path.join(__dirname)));
app.use(express.static(__dirname));
app.use(fileUpload({
  limits: { fileSize: 1000 * 1024 * 1024 },
  useTempFiles: true,
  tempFileDir: '/tmp/'
  // debug: true,
}));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use("/", require("./node/v1/index"));
const port = process.env.APP_PORT || 3000;
app.listen(port, () => {
  console.log(`Worker started ${port}`);
});
module.exports = app;