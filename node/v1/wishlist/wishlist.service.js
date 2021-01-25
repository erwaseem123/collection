const config = require('../config.json');
const db = require('../_helpers/db');
const Wishlist = db.Wishlist;

module.exports = {
    getAll,
    create,
    delete: _delete,
    count,
};

async function count(data) {
    return await Wishlist.find().count(data);
}

async function getAll(data) {
    return await Wishlist.find(data).populate('customer_id').populate('product_id').select('-hash');
}

async function create(data) {
    if (await Wishlist.findOne(data)) {
        throw {
            "success": false,
            "errors": { warning: "You already added this item in wishlist." }
        };
    }
    const user = new Wishlist(data);
    // save user
    await user.save();
}

async function _delete(id) {
    await Wishlist.findByIdAndRemove(id);
}
