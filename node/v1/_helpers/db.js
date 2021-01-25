const config = require('../config.json');
const mongoose = require('mongoose');
const path = require('path');
mongoose.connect(config.connectionString, { useNewUrlParser: true, useFindAndModify: true, useCreateIndex: true, useUnifiedTopology: true }).then(res => console.log("Databse ready to use."))
  .catch(err => console.log("Database connection error."));
mongoose.Promise = global.Promise;
module.exports = {
  User: require('../users/user.model'),
  Category: require('../categories/category.model'),
  Image: require('../filemanager/filemanager.model'),
  Product: require('../items/item.model'),
  Wishlist: require('../wishlist/wishlist.model'),
  Order: require('../order/order.model'),
  Reset: require('../reset/reset.model')
};