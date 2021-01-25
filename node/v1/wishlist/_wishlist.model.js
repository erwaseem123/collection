const mongoose = require('mongoose');

const schema = new mongoose.Schema({
	product_id:  { type: String, require: true},
    customer_id: { type: String, require:true},
    createdDate: { type: Date, default: Date.now }
});

schema.set('toJSON', { virtuals: true });
module.exports = mongoose.model('Wishlist', schema);