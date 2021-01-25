const config = require('../config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
const db = require('../_helpers/db');
const User = db.User;
const Reset = db.Reset;

module.exports = {
    authenticate,
    getById,
    update,
    update_password,
    resend_verification_email,
    verifyemail,
    get_user_by_email,
    add_user,
    count_users,
    is_unique_email,
    add_reset_password,
    getResetByCode,
    getResetByEmail,
    updateResetPassword,
    updateUserByFilter,
    deleteReset
};

async function deleteReset(filter) {
    return await Reset.findOneAndDelete(filter);
}

async function add_reset_password(data) {
    const obj_reset = new Reset(data);
    return await obj_reset.save();
}

async function getResetByCode(code) {
    return await Reset.findOne({ 'code': code }).countDocuments();
}

async function getResetByEmail(email) {
    return await Reset.findOne({ 'email': email }).countDocuments();
}

async function updateResetPassword(email, code) {
    return await Reset.findOne({ 'email': email }).updateOne({ 'code': code });
}

async function count_users(filter) {
    return await User.find().countDocuments(filter);
}

async function authenticate(email) {
    return await User.findOne({ 'email': email });
}

async function getById(auth_id) {
    return await User.findById(auth_id);
}

async function get_user_by_email(email) {
    return await User.findOne({ 'email': email }).countDocuments();
}

async function is_unique_email(auth_id, email) {
    return await User.find({ 'email': email, _id: { $ne: auth_id } }).countDocuments();
}

async function add_user(data) {
    const user = new User(data);
    return await user.save();
}

async function resend_verification_email(user_id, data) {
    const object_user = await User.findById(user_id);
    // validate
    if (!object_user) {
        return false;
    }
    var userParam = {
        is_verify: 1,
        token: data.token
    };
    Object.assign(object_user, userParam);
    return await object_user.save();
}

async function verifyemail(verificationtoken) {
    var object_user = await User.findOne({ token: verificationtoken });
    if (!object_user) {
        return false;
    }
    data = {
        is_verify: 1,
        token: ''
    };
    // copy userParam properties to user
    Object.assign(object_user, data);
    return await object_user.save();
}

async function update(id, userParam) {
    const itr_user = await User.findById(id);
    // validate
    if (!itr_user) {
        return false;
    }
    Object.assign(itr_user, userParam);
    return await itr_user.save();
}

async function update_password(id, data) {
    const object_user = await User.findById(id);
    // validate
    if (!object_user) {
        return false
    }
    // copy userParam properties to user
    Object.assign(object_user, { 'password': data.password });
    return await object_user.save();
}


async function updateUserByFilter(filter, data) {
    const object_user = await User.findOne(filter);
    // validate
    if (!object_user) {
        return false
    }
    // copy userParam properties to user
    Object.assign(object_user, data);
    return await object_user.save();
}

