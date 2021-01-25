const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require('path');
const validator = require("validator");
var format_number = require("format-number");
var empty = require("is-empty");
const isset = require('isset');
var qs = require("querystring");
var http = require("https");
var moment = require("moment-timezone");
var uniqid = require("uniqid");
var FCM = require("fcm-node");
const user = require("../users/user.service");
const { compareSync } = require("bcrypt");


const winston = require('winston');
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.prettyPrint()
  ),
  transports: [
    new winston.transports.File({ filename: 'log/winston/error.log', level: 'error', maxsize: '10000000' })
  ]
});

module.exports = {
  success,
  error,
  get_decoded_request,
  log,
  get_random_string,
  get_url,
  get_front_url,
  get_auth_id,
  get_image,
  upload_file,
  validate_mime_type
}


function get_pagination(body) {
  let page = 1;
  let limit = parseInt(process.env.RECORD_PER_PAGE);
  let offset = limit;
  if (isset(body.page)) {
    page = (parseInt(body.page)) ? parseInt(body.page) : 1;
  }

  return {
    'page': page,
    'limit': limit,
    'offset': (page == 1 || page == 0) ? 0 : limit * (page - 1),
  };
}

async function format_json(json_values) {
  var players = [];
  for (var key in json_values) {
    if (!json_values.hasOwnProperty(key)) continue;
    var obj = json_values[key];
    for (var prop in obj) {
      if (!obj.hasOwnProperty(prop)) continue;
    }
  }
}

function get_date(timestamp = null) {
  if (timestamp) {
    return moment(timestamp).tz("Asia/Calcutta");
  } else {
    return moment().tz("Asia/Calcutta");
  }
}

function get_image_dir() {
  return process.env.IMAGE_DIRECTORY;
}

function get_image_folder() {
  return process.env.UPLOAD_DIRECTORY;
}

function get_unique_image_name(str) {
  var name = str.replace(/[^a-zA-Z. ]/g, "").toLowerCase();
  var parts = name.split(".");
  if (parts[1] === "undefined") {
    var new_name = string ? string : "";
  } else {
    var new_name = parts.slice(0, -1).join("") + "." + parts.slice(-1);
  }
  return moment() + "_" + uniqid() + "_" + new_name;
}

async function validate_mime_type(file) {
  const allowed_mime_type = ["image/jpeg", "image/jpg", "image/png"];
  // if (allowed_mime_type.indexOf(file.mimetype.toLowerCase()) < 0) {
  //     return false;
  // }

  if (file.mimetype.toLowerCase().indexOf("image/") < 0) {
    return false;
  }

  return true;
}

async function upload_file(file, folder_name) {
  var file_name = get_unique_image_name(file.name);
  var folder_name_full = get_image_folder() + "/" + folder_name;
  var folder_path = get_image_dir() + "/" + folder_name_full;
  if (!fs.existsSync(folder_path)) {
    fs.mkdirSync(folder_path);
  }
  console.log(folder_path);
  await file.mv(folder_path + "/" + file_name);
  return folder_name_full + '/' + file_name;
}

function log(err) {
  logger.log({ "level": "error", "message": err });
}

async function get_auth_user(req, res) {
  if (req.headers && req.headers.authorization) {
    var authorization = req.headers.authorization.split(" ")[1];
    try {
      var decoded = jwt.verify(authorization, process.env.JWT_KEY);
      var auth = decoded.result;
    } catch (e) {
      return false;
    }
    return auth;
  }
  return false;
}

async function get_auth_id(req, res) {
  if (req.headers && req.headers.authorization) {
    var authorization = req.headers.authorization.split(" ")[1];
    try {
      var decoded = jwt.verify(authorization, process.env.JWT_KEY);
      var auth = decoded.result.id;
    } catch (e) {
      return false;
    }
    return auth;
  }
  return false;
}

function logout(req, res) {
  if (req.headers && req.headers.authorization) {
    var authorization = req.headers.authorization.split(" ")[1];
    try {
      return true;
    } catch (e) {
      return true;
    }
    return true;
  }
  return false;
}

async function get_random_string() {
  var chars = "abcdefghijklmnopqrstuvwxyz1234567890";
  var string = "";
  for (var i = 0; i < 60; i++) {
    string += chars[Math.floor(Math.random() * chars.length)];
  }
  var date_time = await get_otp();
  return string + date_time;
}

async function get_otp() {
  return Math.floor(100000 + Math.random() * 900000);
}

function get_url(path) {
  return process.env.PUBLIC_URL + "/" + path;
}

function get_front_url(path) {
  return process.env.FRONT_URL + "/" + path;
}

async function get_image(path) {
  if (path) {
    return process.env.IMAGE_PATH + '/' + path;
  } else {
    return process.env.IMAGE_PATH + '/assets/images/guest.JPG';
  }
}
function file_exists(file_path) {
  try {
    var absolute_file_path = get_image_dir() + "/" + file_path;
    if (fs.existsSync(absolute_file_path)) {
      return get_url(get_upload_folder() + "/" + file_path);
    }
    return false;
  } catch (err) {
    return false;
  }
}

function get_format(value) {
  var myFormat = format_number({ prefix: "", suffix: "", round: 2 });
  return myFormat(value, { noSeparator: true });
}

async function notify_android(notify_data) {
  var serverKey = process.env.FCM_KEY;
  var fcm = new FCM(serverKey);
  var match_data = {};
  var data_to_send = {
    body: notify_data.body,
    title: notify_data.title,
    matchData: match_data,
    type: 3,
    sound: "mySound",
    badge_count: 1
  };

  var message = {
    to: notify_data.device,
    notification: {
      title: notify_data.title,
      body: notify_data.body
    },
    data: data_to_send
  };

  fcm.send(message, function (err, response) {
    if (err) {
      log(err);
    } else {
      log("Successfully sent with response: ", response);
    }
  });
}



async function success(message, data, key = 'normal') {
  let resposne_data = {
    success: true,
    message: message,
    data: data
  };
  return resposne_data;
}

async function error(message, data, key = 'normal') {
  let resposne_data = {
    success: false,
    message: message,
    data: data
  };
  return resposne_data;
}

async function get_decoded_request(req, key) {
  let body = {};
  if (parseInt(process.env.IS_ENCODED)) {
    var error_bucket = {};
    if (typeof req.body.data == "undefined") {
      error_bucket.data = "Please enter a valid amount.";
    } else if (validator.isEmpty("" + req.body.data)) {
      error_bucket.data = "Please enter a valid amount.";
    }
    if (!empty(error_bucket)) {
      return false;
    }
    body = await decode_string(req.body.data, key);
    if (!body) {
      return false;
    }
  } else {
    body = req.body;
  }
  return body;
}