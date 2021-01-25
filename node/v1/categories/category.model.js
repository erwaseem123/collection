const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    collection_name: { type: String, required: true },
    collection_status: { type: String, required: true, default:"0" },
    global_collection: { type: String, default:"0" },
    customer_id: { type: mongoose.Schema.ObjectId, required: true, ref: 'User' },
    createdDate: { type: Date, default: Date.now }
});

schema.set('toJSON', { virtuals: true });
module.exports = mongoose.model('Category', schema);