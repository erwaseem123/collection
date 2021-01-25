const mongoose = require('mongoose');

const schema = new mongoose.Schema({
	product_id:  { type: mongoose.Schema.ObjectId, require: true, ref: "Product"},
    customer_id: { type: mongoose.Schema.ObjectId, require: true, ref: "User"},
    createdDate: { type: Date, default: Date.now }
});

schema.set('toJSON', { virtuals: true });
module.exports = mongoose.model('Wishlist', schema);