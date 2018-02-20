const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/sortMyStuff.db');
const _ = require('lodash');

const User = {

	get(callback) {
		db.serialize(() => {
			db.all("select u.id, u.name, u.email, u.role_id, r.name FROM users u JOIN roles r ON u.role_id = r.id", (err,row) => {
				if (!err) {
					callback(data);
				}
			})
		});
	},

	authenticate(email,password, callback) {
		db.serialize(() => {
			let sql = "select u.id, u.name, u.email, u.role_id AS roleId, r.name AS roleName FROM users u JOIN roles r ON u.role_id = r.id WHERE u.email = '"+email+"' AND u.pass = '"+password+"'";
			let data = {
				valid: false,
				message:"",
				id: 0,
				name: "",
				roleId: 0,
				roleName: "",
				password: "",
			};
			db.get(sql, (err,row) => {
				if (!err) {	
					if (_.isObject(row)) {
						if (row.id) {
							data.valid = true;
							data.message = "success";
							data.id = row.id;
							data.name = row.name;
							data.email = row.email;
							data.roleId = row.roleId;
							data.roleName = row.roleName;
						}
					} 
					if (!data.valid) {
						data.message = "Incorrect email or password";
					}
					callback(data);
				} else {
					data.message = "System error";
					callback(data)
				}
			})
		});
	},

	register(user, callback) {
		db.serialize(() => {
			let sql = "select COUNT(id) AS num FROM users WHERE email LIKE '"+user.email+"'";
			let data = {
				valid: false,
				message:"",
				id: 0,
				name: "",
				roleId: 0,
				roleName: "",
				password: "",
			};
			let accountExists = false;
			db.get(sql, (err,row) => {
				if (!err) {	
					if (_.isObject(row)) {
						if (row.num > 0) {
							accountExists = true;
						}
					}
					if (!accountExists) {
						if (user.email.length > 5 && user.password.length > 5 && user.name.length > 1) {
							data.roleId = 3;
							data.name = user.name;
							data.email = user.email;
							data.password = user.password;
							data.valid = true;
						}
					}
					if (!data.valid) {
						if (accountExists) {
							data.message = "An account already exists with this email address";
						} else {
							data.message = "Incorrect name, email or password format";
						}
					}
					if (data.valid) {
						db.get(`SELECT MAX(id) + 1 AS nextId FROM users`, (e2, r2) => {
							if (r2.nextId) {
								data.id = r2.nextId;
								// password should be encrypted in production app
								db.run(`INSERT INTO users VALUES (${data.id}, '${data.name}', '${data.email}', '${data.password}',${data.roleId})`);
								// do not reveal password
								data.password = "";
								callback(data);
							}
						})
					} else {
						callback(data);
					}
				} else {
					data.message = "System error";
					callback(data)
				}
			})
		});
	}
}

module.exports = User;