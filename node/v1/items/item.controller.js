const express = require('express');
const router = express.Router();
const item_service = require('./item.service');
const validator = require('validator');
var empty = require('is-empty');
const isset = require('isset');
var json2csv = require('json2csv').parse;
const path = require('path');
var filesystem = require('fs');
const db = require('../_helpers/db');
const joi = require('@hapi/joi');
const helper = require("../config/helper");
const directCategory = db.Category;

module.exports = {
	getAll,
	export_to_csv,
	getById,
	getCurrent,
	_delete,
	count_records,
	find_by_item_id,
	update_partial
};

async function count_records(req, res, next) {
	var total = 0;
	try {
		total = await item_service.count({
			'customer_id': await helper.get_auth_id(req, res)
		});
	} catch (err) {
		helper.log({ message: err });
		error_bucket = err;
	}
	return res.json({ 'total': total });
}

async function getById(req, res, next) {
	if (req.params.id == 0) {
		return res.status(200).json(await helper.error("Please try again", {}));
	}
	var auth_id = await helper.get_auth_id(req, res);
	var results = await item_service.getById(req.params.id);
	if (!results) {
		return res.status(200).json(await helper.error("Please try again", {}));
	}
	return res.status(200).json(await helper.success("Item Details", results));
}

async function getAll(req, res, next) {
	var auth_id = await helper.get_auth_id(req, res);
	var results = await item_service.getAll({ 'customer_id': auth_id });
	if (!results) {
		return res.status(200).json(await helper.error("Please try again", {}));
	}
	return res.status(200).json(await helper.success("List of Items", results));
}

async function find_by_item_id(req, res, next) {
	if (req.params.id == 0) {
		return res.status(200).json(await helper.error("Please try again", {}));
	}
	var auth_id = await helper.get_auth_id(req, res);
	var results = await item_service.get_record_by_param(req.params.id);
	if (!results) {
		return res.status(200).json(await helper.error("Please try again", {}));
	}
	return res.status(200).json(await helper.success("Item Detail", results));
}

async function getCurrent(req, res, next) {
	var auth_id = await helper.get_auth_id(req, res);
	var results = await item_service.getById(req.params.sub);
	if (!results) {
		return res.status(200).json(await helper.error("Please try again", {}));
	}
	return res.status(200).json(await helper.success("Detail", results));
}

async function export_to_csv(req, res, next) {

	let customer_id = await helper.get_auth_id(req, res);
	csv_path = path.join('' + './uploads/csv/' + '' + customer_id + '.csv');
	filesystem.unlink(csv_path, function (err) { });
	var results = await item_service.getAll({ 'customer_id': customer_id })

	const fields = ["item_type", "item_id", "item_name", "item_display_name", "item_description", "item_status", "item_is_public", "item_url", "item_date_acquired", "item_date_used", "item_size", "item_weight", "item_locality", "item_condition", "item_variety", "item_rating", "item_vintage", "item_image", "item_price", "item_current_value", "item_collection_id.collection_name"];
	const opts = { fields };
	const csv = json2csv(results, opts);
	filesystem.writeFile(csv_path, csv, function (err) {
		if (err) {
			return res.json(err).status(500);
		}
		else {
			res.json({
				'success': true,
				'csv_url': "" + csv_path + ""
			});
		}
	});

}

async function update_partial(req, res, next) {

	const body = req.body;
	var error_bucket = {};
	const schema = joi.object({ abortEarly: true }).keys({
		"step": joi.valid('step1', 'step2', 'step3', 'step4').required().label("Please refersh and try again."),
	});
	try {
		await schema.validateAsync({
			"step": req.params.step
		});
	}
	catch (err) {
		helper.log({ message: err });
		error_bucket = err;
	}
	if (!empty(error_bucket)) {
		return res.status(200).json(await helper.error(error_bucket.details[0].context.label, {}));
	}

	var rules = {};
	var data = {};
	if (req.params.step == 'step1') {
		rules = {
			item_type: joi.valid('general', 'gem_and_mineral', 'wine', 'souvenirs_and_coins').required().label("Please select a valid item type."),
			item_name: joi.string().required().label("Please enter a valid item name"),
			item_display_name: joi.string().required().label("Please enter a valid item display name"),
			item_description: joi.string().required().label("Please enter a valid item description"),
			item_id: joi.string().required().label("Please enter a valid item id")
		};
		data = {
			'item_type': body.item_type,
			'item_id': body.item_id,
			'item_name': body.item_name,
			'item_display_name': body.item_display_name,
			'item_description': body.item_description,
		};
	} else if (req.params.step == 'step2') {
		rules = {
			item_status: joi.valid('0', '1').required().label("Please select a status"),
			item_collection_id: joi.string().required().label("Please select a valid collection"),
			item_is_public: joi.valid('0', '1').required().label("Please select item is public or not"),
			item_url: joi.string().uri().required().label("Please enter a valid url"),
			item_date_acquired: joi.date().required().label("Please choose valid acquired date"),
			item_date_used: joi.string().allow(null).allow('').required().label("Please choose valid used date"),
			item_size: joi.string().allow(null).allow('').required().label("Please enter the size"),
			item_weight: joi.string().allow(null).allow('').required().label("Please enter the weight"),
			item_locality: joi.string().allow(null).allow('').required().label("Please enter the lcoality"),
			item_condition: joi.string().allow(null).allow('').required().label("Please enter the item condition"),
			item_variety: joi.string().allow(null).allow('').required().label("Please enter the item variety"),
			item_vintage: joi.string().allow(null).allow('').required().label("Please choose vintage type"),
			item_rating: joi.string().allow(null).allow('').required().label("Please enter the item rating"),
		}
		data = {
			'item_status': body.item_status,
			'item_collection_id': body.item_collection_id,
			'item_is_public': body.item_is_public,
			'item_url': body.item_url,
			'item_date_acquired': body.item_date_acquired,
			'item_date_used': body.item_date_used,
			'item_size': body.item_size,
			'item_weight': body.item_weight,
			'item_locality': body.item_locality,
			'item_condition': body.item_condition,
			'item_variety': body.item_variety,
			'item_vintage': body.item_vintage,
			'item_rating': body.item_rating
		}
	} else if (req.params.step == 'step3') {
		rules = {
			item_price: joi.number().greater(0).required().label("Price must be greater than 0"),
			item_current_value: joi.number().allow(null).allow('').greater(-1).required().label("Current price must be greater than 0")
		};
		data = {
			'item_price': body.item_price,
			'item_current_value': body.item_current_value
		};
	} else if (req.params.step == 'step4') {
		rules = {
			item_image: joi.string().allow(null).allow('').required().label("Please select an image.")
		};
		data = {
			'item_image': body.item_image
		};
	} else {
		return res.status(200).json(await helper.error("Please try again", {}));
	}

	const schema_item = joi.object({ abortEarly: true }).keys(rules);
	try {
		await schema_item.validateAsync(data);
	}
	catch (err) {
		helper.log({ message: err });
		error_bucket = err;
	}
	if (!empty(error_bucket)) {
		return res.status(200).json(await helper.error(error_bucket.details[0].context.label, {}));
	}

	var auth_id = await helper.get_auth_id(req, res);
	if (req.params.id == 0 && req.params.step != 'step1') {
		return res.status(200).json(await helper.error("Please refersh & try again.", {}));
	}

	if (req.params.step == 'step1' && req.params.id == 0) {
		let is_unique_item_id = await item_service.count({ item_id: data.item_id });
		if (is_unique_item_id) {
			return res.status(200).json(await helper.error("Item id already exist", {}));
		}
		data.customer_id = auth_id;
		var obj_item = await item_service.add_item(data);
		if (!obj_item) {
			return res.status(200).json(await helper.error("", {}));
		}
		return res.status(200).json(await helper.success("Item updated Successfully", obj_item));
	}

	var obj_item = await item_service.get_item({ _id: req.params.id, customer_id: auth_id });
	if (!obj_item) {
		return res.status(200).json(await helper.error("Item not exist. Please referesh and try again", {}));
	}

	let is_unique_item_id = await item_service.countWithNotIn({ item_id: data.item_id, id: req.params.id });
	if (is_unique_item_id) {
		return res.status(200).json(await helper.error("Item id already exist", {}));
	}

	let is_item_updated = await item_service.update(req.params.id, data);
	if (is_item_updated.ok == 0) {
		return res.status(200).json(await helper.error("Please referesh and try again", {}));
	}
	return res.status(200).json(await helper.success("Item updated Successfully", obj_item));
}


async function _delete(req, res, next) {
	const body = req.body;
	var error_bucket = {};
	const schema = joi.object({ abortEarly: true }).keys({
		"id": joi.string().required().label("Please enter a collection")
	});
	try {
		await schema.validateAsync({
			"id": req.params.id
		});
	}
	catch (err) {
		helper.log({ message: err });
		error_bucket = err;
	}
	if (!empty(error_bucket)) {
		return res.status(200).json(await helper.error(error_bucket.details[0].context.label, {}));
	}

	var object_cat = await item_service.delete_item({ _id: req.params.id, customer_id: await helper.get_auth_id(req, res) });
	if (!object_cat) {
		return res.status(200).json(await helper.error("Please try again", {}));
	}
	return res.status(200).json(await helper.success("Item deleted successfully.", {}));
}