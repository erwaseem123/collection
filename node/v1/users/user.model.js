const mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;

const schema = new Schema({
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    name: { type: String, required: false , default: "" },
    profile_picture: { type: String, required: false, default: "" },
    is_verify: { type: Number, required: false, default: 0 },
    token: { type: String, required: false, default: "" },
    createdDate: { type: Date, default: Date.now }
});

schema.set('toJSON', { virtuals: true });
schema.plugin(mongoosePaginate);

module.exports = mongoose.model('User', schema);