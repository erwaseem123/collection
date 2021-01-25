const config = require('../config.json');
const db = require('../_helpers/db');
const validator = require('validator');
const Product = db.Product;

module.exports = {
    getById,
    get_record_by_param,
    get_filter_items
};

async function getById(id) {
    return await Product.findById(id).select('-hash');
}

async function get_filter_items(data) {
    filter = {
        item_status: 1,
        item_is_public: 1,
    };
    if (data.item_type) {
        filter.item_type = validator.escape(data.item_type);
    }
    product = Product.find(filter).populate({ path: 'customer_id', match: { is_verify: 1 } }).where({ item_image: { $ne: '' } }).sort({ 'createdDate': -1 });
    if (data.limit) {
        product.limit(data.limit);
    }

    return await product.select('-hash');
}

async function get_record_by_param(id) {
    /*
    var data = {item_id:id,item_status:1,item_is_public:1};
    */
    var data = { item_id: id };
    result = await Product.findOne(data).select('-hash');
    if (!result) {
        throw {
            "success": false,
            "code": 'database',
            "errors": { item_id: "Item id is not unique." }
        };
    }
    return result;
}