const config = require('../config.json');
const db = require('../_helpers/db');
const Category = db.Category;

module.exports = {
    getAll,
    getById,
    create,
    update,
    delete: _delete,
    count,
    get_with_default
};

async function count(data) {
    return await Category.find().countDocuments(data);
}

async function getAll(userParam) {
    return await Category.find(userParam).lean().select('-hash');
}

async function get_with_default(filter) {
    var condition = { $or: [filter, { global_collection: 1 }] };
    return await Category.find(condition).lean().select('-hash');
}

async function getById(id) {
    return await Category.findById(id).select('-hash');
}

async function create(data) {
    const user = new Category(data);
    return await user.save();
}

async function update(filter, data) {
    return await Category.update(filter, data);
}

async function _delete(filter) {
    return await Category.remove(filter);
}