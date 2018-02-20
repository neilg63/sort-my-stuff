const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/sortMyStuff.db');

const Item = {

	create(params,callback) {
		db.serialize(() => {
			if (params.name) {
				db.get(`select MAX(id) + 1 AS nextId from items`, (err,row) => {
					let nextId = 1;
					if (row) {
						if (row.nextId) {
							nextId = row.nextId;	
						}
					}
					db.get(`select MAX(weight) AS max from items WHERE category_id = ${params.parent}`, (err2, row2) => {
						let nextWeight = row2.max !== null? row2.max + 1 : 0;
						params.id = nextId;
						params.weight = nextWeight;
						let sql = `INSERT INTO items VALUES (${params.id},'${params.name}',${params.weight},${params.parent},${params.userId})`;
						db.run(sql);
						callback(params);
					});
				});
			}
		});
	},

	delete(id, callback) {
		db.serialize(() => {
			let params = {
				id: id,
				deleted: false
			}
			if (id > 0) {
				db.run(`DELETE FROM items WHERE id = ${id}`);	
				params.deleted = true;
			}
			callback(params);
		});
	}

}

module.exports = Item;