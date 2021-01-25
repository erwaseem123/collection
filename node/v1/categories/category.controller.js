const express = require('express');
const router = express.Router();
const db = require('../_helpers/db');
const categoryService = require('./category.service');
const validator = require('validator');
var empty = require('is-empty');
const isset = require('isset');
const joi = require('@hapi/joi');
const helper = require("../config/helper");
const directCategory = db.Category;

module.exports = {
    save,
    getAll,
    getById,
    getCurrent,
    update,
    _delete,
    count_records,
    get_with_default
}

async function count_records(req, res, next) {
    var total = 0;
    try {
        total = await categoryService.count({
            'customer_id': await helper.get_auth_id(req, res)
        });
    } catch (err) {
        helper.log({ message: err });
        error_bucket = err;
    }
    return res.json({ 'total': total });
}

function getCurrent(req, res, next) {
    categoryService.getById(req.params.sub)
        .then(user => user ? res.json(user) : res.sendStatus(404))
        .catch(err => next(err));
}

async function get_with_default(req, res, next) {
    filter = {};
    filter.customer_id = await helper.get_auth_id(req, res);
    if (typeof req.body.collection_status != 'undefined') {
        filter.collection_status = req.body.collection_status;
    }
    var obj_category = await categoryService.get_with_default(filter);
    if (!obj_category) {
        return res.status(200).json(await helper.error("Please try again", {}));
    }
    return res.status(200).json(await helper.success("Default Collection", obj_category));
}


async function getById(req, res, next) {

    const body = req.body;
    var error_bucket = {};
    const schema = joi.object({ abortEarly: true }).keys({
        "id": joi.string().required().label("Please enter a collection")
    });
    try {
        await schema.validateAsync({
            "id": req.params.id
        });
    }
    catch (err) {
        helper.log({ message: err });
        error_bucket = err;
    }
    if (!empty(error_bucket)) {
        return res.status(200).json(await helper.error(error_bucket.details[0].context.label, {}));
    }

    var obj_category = await categoryService.getById(req.params.id);
    if (!obj_category) {
        return res.status(200).json(await helper.error("Please try again", {}));
    }
    return res.status(200).json(await helper.success("Collection Detail", obj_category));

}

async function getAll(req, res, next) {
    var auth_id = await helper.get_auth_id(req, res);
    var filter = {};
    filter.customer_id = auth_id;
    if (typeof req.body.collection_status != 'undefined') {
        filter.collection_status = req.body.collection_status;
    }
    var results = await categoryService.getAll(filter);
    if (!results) {
        return res.status(200).json(await helper.error("Please try again", {}));
    }
    return res.status(200).json(await helper.success("List of Categories", results));
}

async function save(req, res, next) {
    const body = req.body;
    var error_bucket = {};
    const schema = joi.object({ abortEarly: true }).keys({
        "collection_name": joi.string().required().label("Please enter a valid collection name"),
        "collection_status": joi.valid('0', '1').required().label("Please select a status."),
    });
    try {
        await schema.validateAsync({
            "collection_name": body.collection_name,
            "collection_status": body.collection_status
        });
    }
    catch (err) {
        helper.log({ message: err });
        error_bucket = err;
    }
    if (!empty(error_bucket)) {
        return res.status(200).json(await helper.error(error_bucket.details[0].context.label, {}));
    }

    req.body.customer_id = await helper.get_auth_id(req, res);
    var object_cat = await categoryService.create(req.body);
    if (!object_cat) {
        return res.status(200).json(await helper.error("Please try again", {}));
    }
    return res.status(200).json(await helper.success("Collection has been added", {}));
}

async function update(req, res, next) {

    const body = req.body;
    var error_bucket = {};
    const schema = joi.object({ abortEarly: true }).keys({
        "collection_name": joi.string().required().label("Please enter a valid collection name"),
        "collection_status": joi.valid('0', '1').required().label("Please select a status."),
        "id": joi.string().required().label("Please select a collection."),
    });
    try {
        await schema.validateAsync({
            "collection_name": body.collection_name,
            "collection_status": body.collection_status,
            "id": req.params.id
        });
    }
    catch (err) {
        helper.log({ message: err });
        error_bucket = err;
    }
    if (!empty(error_bucket)) {
        return res.status(200).json(await helper.error(error_bucket.details[0].context.label, {}));
    }

    let customer_id = await helper.get_auth_id(req, res);

    var object_cat = await categoryService.update({ '_id': req.params.id, 'customer_id': customer_id }, {
        'collection_name': body.collection_name,
        'collection_status': body.collection_status
    });
    if (!object_cat) {
        return res.status(200).json(await helper.error("Please try again", {}));
    }
    return res.status(200).json(await helper.success("Collection has been updated", {}));

}

async function _delete(req, res, next) {
    const body = req.body;
    var error_bucket = {};
    const schema = joi.object({ abortEarly: true }).keys({
        "id": joi.string().required().label("Please enter a collection")
    });
    try {
        await schema.validateAsync({
            "id": req.params.id
        });
    }
    catch (err) {
        helper.log({ message: err });
        error_bucket = err;
    }
    if (!empty(error_bucket)) {
        return res.status(200).json(await helper.error(error_bucket.details[0].context.label, {}));
    }

    var object_cat = await categoryService.delete({ _id: req.params.id, customer_id: await helper.get_auth_id(req, res) });
    if (!object_cat) {
        return res.status(200).json(await helper.error("Please try again", {}));
    }
    return res.status(200).json(await helper.success("Collection deleted successfully.", {}));
}