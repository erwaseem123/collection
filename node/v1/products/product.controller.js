const express = require('express');
const router = express.Router();
const item_service = require('./product.service');
const validator = require('validator');
var empty  = require('is-empty');
const isset = require('isset');

// routes
router.post('/', getAll);
router.post('/find/:id',find);
module.exports = router;

function find(req, res, next){
    item_service.get_record_by_param(req.params.id)
        .then(function(item){
        	data = {
        		'id' : item.id,
        		'item_display_name': item.item_display_name,
        		'item_description': validator.unescape(''+item.item_description),
        		'item_rating': item.item_rating,
        		'item_image': item.item_image,
        		'item_price': item.item_price,
        		'item_id': item.item_id,
        		'item_current_value': item.item_current_value,
        		'item_url': item.item_url,
        		'item_date_acquired': validator.toDate(''+item.item_date_acquired),
        		'item_date_used': validator.toDate(''+item.item_date_used),
        		'item_size': item.item_size,
        		'item_weight': item.item_weight,
        		'item_locality': item.item_locality,
        		'item_condition': item.item_condition,
        		'item_variety': item.item_variety,
        		'item_vintage': item.item_vintage,
        		'item_status': item.item_status,
        		'item_is_public': item.item_is_public,
        	};
        	res.json({
        		"success"	: true,
		        "code"  	: 'database',
		        "result"	: data, 
        	});
        }).catch(err => next(err));
}

function getAll(req, res, next) {
    item_service.get_filter_items(req.body)
        .then(function(data){
            let products = [];
            for (var name in data) {
               products.push(data[name]);
            }
            res.json(products);
        }).catch(err => next(err));
}