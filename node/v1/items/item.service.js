const config = require('../config.json');
const db = require('../_helpers/db');
const validator = require('validator');
const Product = db.Product;

module.exports = {
    getAll,
    getById,
    update,
    delete_item,
    count,
    get_record_by_param,
    get_item,
    add_item,
    countWithNotIn
};

async function count(data) {
    return await Product.where(data).countDocuments();
}

async function countWithNotIn(filter) {
    return await Product.find({ item_id: filter.item_id, _id: { $ne: filter.id } }).countDocuments();
}

async function getAll(filter) {
    return await Product.find({ customer_id: filter.customer_id }).populate({ path: 'item_collection_id' }).lean().select('-hash').sort({ 'createdDate': -1 });
}

async function getById(id) {
    var obj_item = await Product.findById(id).select('-hash');
    if (!obj_item) {
        return false;
    }
    return obj_item;
}

async function get_item(filter) {
    const obj_item = await Product.findOne(filter);
    if (!obj_item) {
        return false;
    }
    return obj_item;
}

async function get_record_by_param(id) {
    var data = { item_id: id, item_status: 1, item_is_public: 1 };
    return await Product.findOne(data).select('-hash');
}

async function update(id, data) {
    return await Product.findById(id).updateOne(data);
}

async function add_item(data) {
    return await new Product(data).save();
}

async function delete_item(filter) {
    return await Product.remove(filter);
}