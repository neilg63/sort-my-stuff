const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/sortMyStuff.db');

const Category = {

	listNestWithItems(userId, callback) {
		db.serialize(() => {
			db.all("select * from categories ORDER BY weight", (err,data) => {
				if (data) {
					db.all("select * from items ORDER BY weight", (err2,items) => {
						if (items) {
							callback(Category.nestCategories(data,items));
						}
					});
				}
			});
		});
	},

	nestCategories(data,items) {
		let categories = [], category;
		if (data instanceof Array) {
			let allCats = data.map(row => { 
				return {
					id: row.id,
					name: row.name,
					children: [],
					weight: row.weight,
					parent_id: row.parent_id,
					items: []	
				}
			});
			Category.buildNested(allCats, categories, 0, items, 0);
		}
		return categories;
	},

	buildNested(allCats, categories, parentLevel, items, depth) {
		categories = categories.sort((a,b) => (a.weight > b.weight));
		let cat;
		for (let i = 0; i < allCats.length; i++) {
			cat = allCats[i];
			cat.items = items.filter(item => item.category_id == cat.id);
			if (cat.parent_id == parentLevel) {
				cat.children = allCats.filter(row => row.parent_id == cat.id);
				cat.depth = depth;
				if (parentLevel < 1) {
					categories.push(cat);
				}
				Category.buildNested(allCats,cat.children,cat.id, items, depth + 1);
			}
		}
	},

	updatePosition(data, callback) {
		db.serialize(() => {
			if (data.id) {
				db.all(`select * from categories WHERE parent_id = ${data.parent}`, (err,results) => {
					if (results instanceof Array) {
						let row, newWeight;
						for (let i = 0; i < results.length; i++) {
							row = results[i];
							if (row.weight < data.index) {
								newWeight = i;
							} else {
								newWeight = i + 1;
							}
							db.run(`update categories SET weight = ${newWeight} WHERE id = ${row.id}`);	
						}		
					}
				});
				db.run(`update categories SET weight = ${data.index}, parent_id = ${data.parent} WHERE id = ${data.id}`);	
				callback(data);
			}
		});
	},

	create(params,callback) {
		db.serialize(() => {
			if (params.name) {
				db.get(`select MAX(id) + 1 AS nextId from categories`, (err,row) => {
					if (row.nextId) {
						db.get(`select MAX(weight) AS max from categories WHERE parent_id = ${params.parent}`, (err2, row2) => {
							let nextWeight = row2.max !== null? row2.max + 1 : 0;
							params.id = row.nextId;
							params.weight = nextWeight;
							db.run(`INSERT INTO categories VALUES (${params.id},'${params.name}',${params.weight},${params.parent})`);
							callback(params);
						});						
					}
				});
			}
		});
	},

	edit(id, data, callback) {
		db.serialize(() => {
			if (id > 0) {
				console.log(data)
				db.run(`UPDATE categories SET name = '${data.name}' WHERE id = ${id}`);
				callback({
					id: id,
					name: data.name
				});
			}
		});
	},

	delete(id, callback) {
		db.serialize(() => {
			if (id > 0) {
				db.run(`DELETE FROM categories WHERE id = ${id}`);
				callback({
					id: id,
					deleted: true
				});
			}
		});
	}

}

module.exports = Category;