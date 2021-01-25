const express = require('express');
const router = express.Router();
const userService = require('./user.service');
const validator = require('validator');
var empty = require('is-empty');
const isset = require('isset');
const db = require('../_helpers/db');
const joi = require('@hapi/joi');
const helper = require("../config/helper");
const { sign } = require("jsonwebtoken");
const { hashSync, genSaltSync, compareSync } = require("bcrypt");
const email = require("../config/email");

module.exports = {
    authenticate,
    register,
    getById,
    update_profile,
    password,
    resend_verification_email,
    verifyemail,
    validate_verified_account,
    forgot,
    reset
}

async function authenticate(req, res, next) {

    var results = {};
    const body = req.body;
    var response = {};

    var error_bucket = {};
    const schema = joi.object({ abortEarly: true }).keys({
        "email": joi.string().email().required().label("please try again"),
        "password": joi.string().min(6).max(20).required().label("please try again")
    });

    try {
        await schema.validateAsync({
            "email": body.email,
            "password": body.password
        });
    }
    catch (err) {
        helper.log({ message: err });
        error_bucket = err;
    }

    if (!empty(error_bucket)) {
        return res.status(200).json(await helper.error(error_bucket.details[0].context.label, {}));
    }

    var results = await userService.authenticate(req.body.email);
    if (!results) {
        return res.status(200).json(await helper.error("Password, Invalid Username or password", {}));
    }

    let hash = results.password.replace(/^\$2y(.+)$/i, "$2a$1");
    var result = await compareSync(body.password, hash);
    if (result) {
        const jsontoken = await sign({ result: results }, process.env.JWT_KEY, {
            expiresIn: process.env.SESSION_TIMEOUT
        });
        //remove critical keys
        results.token = jsontoken;
        results.password = '';
        return res.status(200).json(await helper.success("Login successfully.", {
            _id: results._id,
            email: results.email,
            password: '',
            name: results.name,
            profile_picture: results.profile_picture,
            is_verify: results.is_verify,
            token: results.token
        }));
    } else {
        return res.status(200).json(await helper.error("Password, Invalid Username or password", {}));
    }
}

async function register(req, res) {
    const body = req.body;
    var error_bucket = {};
    const schema = joi.object({ abortEarly: true }).keys({
        "email": joi.string().required().email().label("Please enter a valid email"),
        "password": joi.string().min(6).max(20).required().label("Password length must be 6 to 20 characters."),
        "confirm_password": joi.string().valid(joi.ref('password')).required().label("Confirm Password must be same as password."),
    });
    try {
        await schema.validateAsync({
            "email": body.email,
            "password": body.password,
            "confirm_password": body.confirm_password
        });
    }
    catch (err) {
        helper.log({ message: err });
        error_bucket = err;
    }
    if (!empty(error_bucket)) {
        return res.status(200).json(await helper.error(error_bucket.details[0].context.label, {}));
    }
    if (body.email == body.password || body.password.includes('123456') || body.password.includes('abc')) {
        return res.status(200).json(await helper.error("Please try with a strong password", {}));
    }
    var token = await helper.get_random_string();
    try {
        const results = await userService.get_user_by_email(body.email);
        if (results) {
            return res.status(200).json(await helper.error("Email already taken. Please try with other email", {}));
        }
        const inserted_id = await userService.add_user({
            'email': body.email,
            'password': hashSync(body.password, genSaltSync(10)),
            'token': token,
            'is_verify': 0
        });
    } catch (err) {
        helper.log({ message: err });
        return res.status(200).json(await helper.error("Please try again", {}));
    }

    try {
        var email_data = {
            to: body.email,
            reset_url: await helper.get_url("auth/email/verify/" + token)
        };
        email.send_email("registration", {
            to: body.email,
            subject: "Registration Email",
            name: "",
            href_reset_password: await helper.get_front_url("auth/email/verify/" + token)
        });
    } catch (err) {

    }
    return res.status(200).json(await helper.success("Account has been created.", {}));
}

async function getById(req, res, next) {
    var auth_id = await helper.get_auth_id(req, res);
    try {
        var auth_user = await userService.getById(auth_id);
        auth_user.password = '';
        if (!auth_user) {
            return res.status(200).json(await helper.error("Account not found.", {}));
        }
    } catch (err) {
        helper.log({ message: err });
        return res.status(200).json(await helper.error("Something went wrong.", {}));
    }
    var public_path = await helper.get_image(auth_user.profile_picture);
    var data = {
        'public_path': await helper.get_image(auth_user.profile_picture),
        'name': auth_user.name,
        'email': auth_user.email,
        'profile_picture': auth_user.profile_picture
    };
    return res.status(200).json(await helper.success("User Details.", data));
}

async function update_profile(req, res, next) {
    var response = {};
    const body = req.body;
    var error_bucket = {};
    const schema = joi.object({ abortEarly: true }).keys({
        "email": joi.string().required().email().label("Please enter a valid email"),
        "name": joi.string().required().label("Please enter a name"),
        "item_image": joi.string().required().label("Please select an image"),
    });
    try {
        await schema.validateAsync({
            "email": body.email,
            "name": body.name,
            "item_image": body.name,
        });
    }
    catch (err) {
        helper.log({ message: err });
        error_bucket = err;
    }
    if (!empty(error_bucket)) {
        return res.status(200).json(await helper.error(error_bucket.details[0].context.label, {}));
    }

    var auth_id = await helper.get_auth_id(req, res);

    var auth_user = await userService.getById(auth_id);
    if (!auth_user) {
        return res.status(200).json(await helper.error("Please login and try again.", {}));
    }

    var update_user_data = {
        'email': body.email,
        'name': body.name,
        'profile_picture': body.item_image
    };

    if (auth_user.email != body.email) {
        update_user_data.is_verify = 0;
    }

    var total_record = await userService.is_unique_email(auth_id, body.email);
    if (total_record) {
        return res.status(200).json(await helper.error("Email address already taken.", {}));
    }

    var object_user = await userService.update(auth_id, update_user_data);
    if (!object_user) {
        return res.status(200).json(await helper.error("Please try again", {}));
    }
    return res.status(200).json(await helper.success("Profile has been updated", {}));
}

async function password(req, res, next) {
    const body = req.body;
    var error_bucket = {};
    const schema = joi.object({ abortEarly: true }).keys({
        "old_password": joi.string().min(1).max(40).required().label("Current password required."),
        "password": joi.string().min(6).max(20).required().label("Password length must be 6 to 20 characters."),
        "confirm_password": joi.string().valid(joi.ref('password')).required().label("Confirm Password must be same as password."),
    });
    try {
        await schema.validateAsync({
            "old_password": body.old_password,
            "password": body.password,
            "confirm_password": body.confirm_password
        });
    }
    catch (err) {
        helper.log({ message: err });
        error_bucket = err;
    }
    if (!empty(error_bucket)) {
        return res.status(200).json(await helper.error(error_bucket.details[0].context.label, {}));
    }
    if (body.email == body.password || body.password.includes('123456') || body.password.includes('abc')) {
        return res.status(200).json(await helper.error("Please try with a strong password", {}));
    }
    var auth_id = await helper.get_auth_id(req, res);
    var data = {
        password: hashSync(body.password, genSaltSync(10)),
    };

    var auth_user = await userService.getById(auth_id);

    if (!auth_user) {
        return res.status(200).json(await helper.error("Account not found.", {}));
    }

    if (!compareSync(body.old_password, auth_user.password)) {
        return res.status(200).json(await helper.error("Old password not matched.", {}));
    }
    try {
        var results = await userService.update_password(auth_id, data);
        if (!results) {
            return res.status(200).json(await helper.error("Something went wrong.", {}));
        }
    } catch (err) {
        helper.log({ message: err });
        return res.status(200).json(await helper.error("Something went wrong.", {}));
    }
    return res.status(200).json(await helper.success("Password Updated Successfully.", data));
}

async function resend_verification_email(req, res, next) {
    try {
        var auth_id = await helper.get_auth_id(req, res);
        var token = await helper.get_random_string();
        const results = await userService.resend_verification_email(auth_id, { 'token': token });
        if (!results) {
            return res.status(200).json(await helper.error("Please try again", {}));
        }
        var email_data = {
            to: results.email,
            reset_url: await helper.get_url("auth/email/verify/" + token)
        };
        email.send_email("registration", {
            to: results.email,
            subject: "Verify your account",
            name: "",
            href_reset_password: await helper.get_front_url("auth/email/verify/" + token)
        });
    } catch (err) {
        helper.log({ message: err });
        return res.status(200).json(await helper.error("Please try again", {}));
    }
    return res.status(200).json(await helper.success("Verification email sent successfully", {}));
}

async function verifyemail(req, res, next) {

    var results = {};
    const body = req.body;
    var response = {};

    var error_bucket = {};
    const schema = joi.object({ abortEarly: true }).keys({
        "token": joi.string().required().label("please try again")
    });

    try {
        await schema.validateAsync({
            "token": body.token
        });
    }
    catch (err) {
        helper.log({ message: err });
        error_bucket = err;
    }

    if (!empty(error_bucket)) {
        return res.status(200).json(await helper.error(error_bucket.details[0].context.label, {}));
    }

    var result = await userService.verifyemail(body.token);
    if (!result) {
        return res.status(200).json(await helper.error("Token Expired. Please resend token and try again", {}));

    }
    return res.status(200).json(await helper.success("Email verified Successfully.", {}));
}

async function validate_verified_account(req, res, next) {
    var auth_id = await helper.get_auth_id(req, res);
    var object_user = await userService.count_users({ _id: auth_id, is_verify: 1 });
    if (!object_user) {
        return res.status(200).json(await helper.error("", {}));
    }
    return res.status(200).json(await helper.success("", {}));
}


//forgot password functionality
async function forgot(req, res, next) {

    var response = {};
    const body = req.body;
    var error_bucket = {};
    const schema = joi.object({ abortEarly: true }).keys({
        "email": joi.string().required().email().label("Please enter a valid email")
    });
    try {
        await schema.validateAsync({
            "email": body.email
        });
    }
    catch (err) {
        helper.log({ message: err });
        error_bucket = err;
    }
    if (!empty(error_bucket)) {
        return res.status(200).json(await helper.error(error_bucket.details[0].context.label, {}));
    }

    var total_user_by_email = await userService.get_user_by_email(body.email);
    if (!total_user_by_email) {
        return res.status(200).json(await helper.error("Email address not found.", {}));
    }

    const is_exist_in_reset = await userService.getResetByEmail(body.email);
    var token = await helper.get_random_string();
    var itr_reset = {};
    if (is_exist_in_reset == 0) {
        itr_reset = await userService.add_reset_password({
            'email': body.email,
            'code': token
        });
    } else {
        itr_reset = await userService.updateResetPassword(body.email, token);
    }

    if (itr_reset.ok == 0) {
        return res.status(200).json(await helper.error("Please try again.", {}));
    }

    try {
        email.send_email("forgot", {
            to: body.email,
            subject: "Forgot Password Email",
            name: "",
            href_reset_password: await helper.get_front_url("auth/reset/" + token)
        });
    } catch (err) {

    }
    return res.status(200).json(await helper.success("Password reset email has been sent. Please follow the instruction", {}));
}

async function reset(req, res, next) {

    const body = req.body;
    var error_bucket = {};
    const schema = joi.object({ abortEarly: true }).keys({
        "email": joi.string().email().required().label("Please enter a valid email."),
        "password": joi.string().min(6).max(20).required().label("Password length must be 6 to 20 characters."),
        "confirm_password": joi.string().valid(joi.ref('password')).required().label("Confirm Password must be same."),
        "code": joi.string().required().label("Link expired. Please reset password again.")
    });
    try {
        await schema.validateAsync({
            "email": body.email,
            "password": body.password,
            "confirm_password": body.confirm_password,
            "code": body.code
        });
    }
    catch (err) {
        helper.log({ message: err });
        error_bucket = err;
    }
    if (!empty(error_bucket)) {
        return res.status(200).json(await helper.error(error_bucket.details[0].context.label, {}));
    }
    if (body.email == body.password || body.password.includes('123456') || body.password.includes('abc')) {
        return res.status(200).json(await helper.error("Please try with a strong password", {}));
    }

    var itr_reset = await userService.getResetByCode(body.code);
    if (!itr_reset) {
        return res.status(200).json(await helper.error("Password reset code expired. Please forgot password again.", {}));
    }

    const results = await userService.updateUserByFilter({ 'email': body.email }, {
        'password': hashSync(body.password, genSaltSync(10)),
    });

    if (results.ok == 0) {
        return res.status(200).json(await helper.error("Please try again.", {}));
    }
    await userService.deleteReset({ 'email': body.email, 'code': body.code });
    return res.status(200).json(await helper.success("Password has been updated successfully", {}));

}