const express = require('express');
const router = express.Router();
const validator = require('validator');
var empty = require('is-empty');
const isset = require('isset');
const db = require('../_helpers/db');
const email = require('../config/email');
const helper = require('../config/helper');
const joi = require('@hapi/joi');

// routes
router.post('/post_contact', post_contact);
module.exports = router;

async function post_contact(req, res, next) {

    const body = req.body;
    var error_bucket = {};
    const schema = joi.object({ abortEarly: true }).keys({
        "name": joi.string().required().label("Please enter a valid name"),
        "email": joi.string().email().required().label("Please enter a valid email"),
        "message": joi.string().required().label("Please enter the message."),
    });
    try {
        await schema.validateAsync({
            "name": body.name,
            "email": body.email,
            "message": body.message,
        });
    }
    catch (err) {
        helper.log({ message: err });
        error_bucket = err;
    }
    if (!empty(error_bucket)) {
        return res.status(200).json(await helper.error(error_bucket.details[0].context.label, {}));
    }

    try {
        var email_data = {
            to: body.email
        };
        email.send_email("contact", {
            to: body.email,
            subject: "Contact Us Request",
            name: body.name,
            email: body.email,
            message: body.message,
        });
    } catch (err) {

    }
    return res.status(200).json(await helper.success('Query sent successfully.', {}));

}
