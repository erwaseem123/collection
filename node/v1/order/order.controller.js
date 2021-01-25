const express = require('express');
const router = express.Router();
const order_service = require('./order.service');
const item_service = require('../items/item.service');
const validator = require('validator');
var empty = require('is-empty');
const isset = require('isset');
const db = require('../_helpers/db');
const helper = require('../config/helper');
const joi = require('@hapi/joi');

// routes
router.post('/buy', buy);
router.post('/', getAll);
router.delete('/:id', _delete);
router.post('/count', count_records);
module.exports = router;

function count_records(req, res, next) {
    mydata = {};
    mydata.customer_id = db.userid(req);
    return order_service.count(mydata).then(data => res.json({ 'total': data })).catch(err => next(err));
}

async function buy(req, res, next) {

    const body = req.body;
    var error_bucket = {};
    const schema = joi.object({ abortEarly: true }).keys({
        "product_id": joi.string().required().label("Please select a product")
    });
    try {
        await schema.validateAsync({
            "product_id": body.product_id
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
    var order = await order_service.create(req.body);
    if (order.ok == 0) {
        return res.status(200).json(await helper.error("You already bought this item.", {}));
    }
    return res.status(200).json(await helper.success("Item has been added.", {}));
}

function getAll(req, res, next) {
    req.body.id = db.userid(req);
    order_service.getAll(req.body)
        .then(users => res.json(users))
        .catch(err => next(err));
}


function _delete(req, res, next) {
    order_service.delete(req.params.id)
        .then(() => res.json({
            "success": true,
            "message": 'Item deleted successfully.',
        }))
        .catch(err => next(err));
}