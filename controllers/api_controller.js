const Category = require("../models/category");
const Item = require("../models/item");
const User = require("../models/user");
const axios = require("axios");

let refreshData = (res, data,type,action) => {
	let userId = data.userId? data.userId : 0;
	setTimeout(() => {
		Category.listNestWithItems(userId,(fullData) => {
			res.send({
				stuff: fullData,
				valid: true,
				newItem: data,
				type: type,
				action: action
			});
		});	
	},100);
}

module.exports = {

	index(req, res, next) {
		let userId = req.params.userId;
		Category.listNestWithItems(userId,data => {
			let out = {
				valid: false,
				stuff: []
			}
			if (data instanceof Array && data.length > 0) {
				out.valid = true;
				out.stuff = data;
			}
			res.send(out);
		});
	},

	login(req, res, next) {
		let user = req.body;
		if (user.email && user.password) {
			User.authenticate(user.email, user.password, (data) => {
				res.send(data);
			});
		}
	},

	createCategory(req, res, next) {
		Category.create(req.body, (data) => {
			if (data.id > 0) {
				refreshData(res, data,'category','created');
			}
			else {
				res.send(data);
			}
		});
	},

	editCategory(req, res, next) {
		Category.edit(req.params.id,req.body,(data) => {
			refreshData(res, data,'category','edited');
		});
	},

	moveCategory(req, res, next) {
		Category.updatePosition(req.body, (data) => {
			refreshData(res, dat,'category','moved')
		});
	},

	deleteCategory(req, res, next) {
		Category.delete(req.params.id,(data) => {
			refreshData(res, data,'category','deleted');
		});
	},

	listCategories(req, res, next) {

	},

	createItem(req, res, next) {
		Item.create(req.body, (data) => {
			if (data.id > 0) {
				refreshData(res, data,'item','created');
			}
			else {
				res.send(data);
			}
		});
	},

	register(req, res, next) {
		User.register(req.body, response => {
			res.send(response);
		});
	},

	editItem(req, res, next) {
		Item.edit(req.params.id,req.body,(data) => {
			refreshData(res, data,'item','edited');
		});
	},

	moveItem(req, res, next) {
		
	},

	deleteItem(req, res, next) {
		Item.delete(req.params.id, (data) => {
			if (data.id > 0) {
				refreshData(res, data,'item','deleted');
			}
			else {
				res.send(data);
			}
		});
	},

	listItems(req, res, next) {

	}
};