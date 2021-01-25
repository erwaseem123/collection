const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    image_url: { type: String, required: true },
    customer_id: { type: String, required: false },
    file_type: { type: String, required: false },
    createdDate: { type: Date, default: Date.now }
});

schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('images', schema);