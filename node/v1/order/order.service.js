const config = require('../config.json');
const db = require('../_helpers/db');
const Order = db.Order;
const Product = db.Product;
const User = db.User;

module.exports = {
    getAll,
    create,
    delete: _delete,
    count,
};

async function count(data) {
    return await Order.find().count(data);
}

async function getAll(userParam) {
    return await Order.find({ customer_id: userParam.id }).select('-hash');
}

async function create(data) {
    const user = await Product.findById(data.product_id);
    // copy userParam properties to user
    Object.assign(user, {
        customer_id: data.customer_id
    });
    return await user.save();
}

async function _delete(id) {
    await Order.findByIdAndRemove(id);
}
