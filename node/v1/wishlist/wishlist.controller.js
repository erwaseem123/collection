const express = require('express');
const router = express.Router();
const wishlist_service = require('./wishlist.service');
const validator = require('validator');
var empty  = require('is-empty');
const isset = require('isset');
const db = require('../_helpers/db');


// routes
router.post('/save', save);
router.post('/', getAll);
router.post('/count', count_records);
router.delete('/:id', _delete);
module.exports = router;

function count_records(req, res, next){
    mydata = {};
    mydata.customer_id = db.userid(req);
    return wishlist_service.count(mydata).then(data => res.json({'total' : data})).catch(err => next(err));
}

function save(req, res, next) {
    if(validate_form(req,res)){
        return;
    }
    req.body.customer_id = db.userid(req);
    data = {};
    data.customer_id = req.body.customer_id.toString();
    data.product_id  = req.body.product_id.toString();
    wishlist_service.create(data).then(() => res.json({
        "success": true,
        "code"   : 'database',
        "message":'Item has been added to wishlist.', 
    })).catch(err => next(err));
}

function getAll(req, res, next) {
    data = {};
    data.customer_id = db.userid(req);
    wishlist_service.getAll(data)
        .then(users => res.json(users))
        .catch(err => next(err));
}


function _delete(req, res, next) {
    wishlist_service.delete(req.params.id)
        .then(() => res.json({
            "success": true,
            "message":'Item removed successfully.', 
        }))
        .catch(err => next(err));
}

function validate_form(req,res){
    var response = {};
    var error_bucket = {};

    if(typeof req.body.product_id == 'undefined'){
        error_bucket.warning = "You can't leave this field blank.";
    }else if(validator.isEmpty(''+req.body.product_id)){
        error_bucket.warning = "You can't leave this field blank.";
    }else if(!validator.isMongoId(''+req.body.product_id)){
        error_bucket.warning = "Please referesh and try again.";
    }

    if(!empty(error_bucket)){
        response.status = false;
        response.code   = 'validation';
        response.errors = error_bucket;
        return res.json(response);
    }
}