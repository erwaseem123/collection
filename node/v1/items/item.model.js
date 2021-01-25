 const mongoose = require('mongoose');


const schema = new mongoose.Schema({
    item_type: { type: String, required: false, default:"general" },
	item_id: { type: String, unique: true, required: true, default:"" },
    item_name: { type: String, required: true, default:"" },
    item_display_name: { type: String, required: true, default:"" },
    item_description: { type: String, required: false, default:"" },
    item_status: { type: Number, required: false, default:0 },
    item_collection_id: { type: mongoose.Schema.ObjectId, ref: 'Category' },
    item_is_public: { type: Number, default:0 },
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
    customer_id: { type: mongoose.Schema.ObjectId, required: true, ref: 'User' },
    createdDate: { type: Date, default: Date.now },
    updatedDate: { type: Date, default: "" },
});


schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Product', schema);