const db = require('../_helpers/db');
const Image = db.Image;

module.exports = {
    upload,
    getAll
};

async function upload(filter) {
    const user = new Image(filter);
    return await user.save();
}

async function getAll(filter) {
    return await Image.find(filter).lean().sort({ 'createdDate': -1 }).select('-hash');
}