const express = require('express');
const router = express.Router();
const file_model = require('./filemanager.service');
const helper = require("../config/helper");
var empty = require("is-empty");
const isset = require("isset");

module.exports = {
  upload,
  getAll
};

async function getAll(req, res, next) {
  let customer_id = await helper.get_auth_id(req, res);
  var itr_image = await file_model.getAll({ 'customer_id': customer_id });
  if (!itr_image) {
    return res.status(200).json(await helper.error("Please try again", {}));
  }
  return res.status(200).json(await helper.success("List of Images", itr_image));
}

async function upload(req, res, next) {
  var response = {};
  const body = req.body;
  var error_bucket = {};

  const is_valid_file = await helper.validate_mime_type(req.files.photo);
  if (!is_valid_file) {
    error_bucket.image = "Only png and jpeg are allowed.";
  }

  if (!empty(error_bucket)) {
    var message = error_bucket[Object.keys(error_bucket)[0]]; //'Please check';
    return res.status(200).json(await helper.error(message, error_bucket));
  }

  let customer_id = await helper.get_auth_id(req, res);
  var image_name = await helper.upload_file(req.files.photo, customer_id);
  let itr_image = await file_model.upload({
    customer_id: customer_id,
    image_url: image_name,
    file_type: 'image'
  });
  if (!itr_image) {
    return res.status(200).json(await helper.error("Please try again", {}));
  }
  return res.status(200).json(await helper.success("Image successfully uploaded.", {
    'imagepath': await helper.get_image(image_name),
    'code': 'image',
  }));
}