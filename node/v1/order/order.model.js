const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
	item_id: { type: String, required: true, default:"" },
    item_name: { type: String, required: true, default:"" },
    item_display_name: { type: String, required: true, default:"" },
    item_description: { type: String, required: false, default:"" },
    item_collection_id: { type: String, default:"" },
    item_url: { type: String, required: false, default:"" },
    item_date_acquired: { type: Date, required: false, default:"" },
    item_date_used: { type: Date, required: false, default:"" },
    item_size: { type: String, required: false, default:"" },
    item_weight: { type: String, required: false, default:"" },
    item_locality: { type: String, required: false, default:"" },
    item_condition: { type: String, required: false, default:"" },
    item_variety: { type: String, required: false, default:"" },
    item_rating: { type: String, required: false, default:'0' },
    item_vintage: { type: String, required: false, default:"" },
    item_image: { type: String, required: false, default:"" },
    item_price: { type: Number, required: false, default:'0' },
    item_current_value: { type: Number, required: false, default:'0' },

    buyer_name: { type: String, required: false, default:"" },
    buyer_email: { type: String, required: false, default:"" },
    buyer_id: { type: String, required: false, default:"" },

    seller_name: { type: String, required: false, default:"" },
    seller_email: { type: String, required: false, default:"" },
    seller_id: { type: String, required: false, default:"" },

    product_id: { type: String, required: true, default:"" },
    is_read: { type: Number, required: false, default:'0' },
    createdDate: { type: Date, default: Date.now }
});


schema.set('toJSON', { virtuals: true });
module.exports = mongoose.model('Order', schema);