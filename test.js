const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/sortMyStuff.db');


const User = {

	get(callback) {
		db.serialize(() => {
			db.each("select id, name, email, role_id from users", (err,row) => {
				if (!err) {
					callback(row);
				}
			})
		})
	},

	authenticate(email,password, callback) {
		db.serialize(() => {
			let sql = "select u.id, u.name, u.email, u.role_id, r.name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.email = '"+email+"' AND u.pass = '"+password+"'";
			console.log(sql)
			db.get(sql, (err,row) => {
				if (!err) {
					row.valid = true;
					callback(row);
				} else {
					callback({valid: false})
				}
			})
		});
	}

}


const Category = {

	listNestWithItems(callback) {
		db.serialize(() => {
			let categories = [];
			db.all("select * from categories", (err,data) => {
				if (data) {
					db.all("select * from items", (err2,items) => {
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
			Category.buildNested(allCats, categories, 0, items);
		}
		return categories;
	},

	buildNested(allCats, categories, parentLevel, items) {
		categories = categories.sort((a,b) => (a.weight > b.weight));
		let cat;
		for (let i = 0; i < allCats.length; i++) {
			cat = allCats[i];
			cat.items = items.filter(item => item.category_id == cat.id);
			if (cat.parent_id == parentLevel) {
				cat.children = allCats.filter(row => row.parent_id == cat.id);
				if (parentLevel < 1) {
					categories.push(cat);
				}
				Category.buildNested(allCats,cat.children,cat.id, items);
			}
		}
	}
}

User.get(console.log);

User.authenticate('admin@sortmystuff.com','secret-123CAPS', console.log);

Category.listNestWithItems((data) => {
	console.log(data[4].children[0].children[0].items)
})
