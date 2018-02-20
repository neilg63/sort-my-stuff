const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/sortMyStuff.db');

db.serialize(() => {

  db.run("CREATE TABLE if not exists roles (id INTEGER NOT NULL PRIMARY KEY, name TEXT NOT NULL)");
  let stmt = db.prepare("INSERT INTO roles VALUES (?, ?)");
  stmt.run(1,"administrator");
  stmt.run(2,"editor");
  stmt.run(3,"viewer");
  stmt.finalize();

  db.run("CREATE TABLE if not exists users (id INTEGER NOT NULL PRIMARY KEY, name TEXT NOT NULL, email TEXT, pass TEXT, role_id INTEGER)");
  stmt = db.prepare("INSERT INTO users VALUES (?, ? , ?, ?, ?)");
  stmt.run(1,"admin","admin@sortmystuff.com","secret-123CAPS",1);
  stmt.run(2,"Sandy","sandy@sortmystuff.com","secret-456CAPS",2);
  stmt.run(3,"Mark","mark@sortmystuff.com","secret-789CAPS",2);
  stmt.run(4,"Kirsty","kirsty@sortmystuff.com","secret-789CAPS",3);
  stmt.finalize();


  db.run("CREATE TABLE if not exists categories (id INTEGER NOT NULL PRIMARY KEY, name TEXT, weight INTEGER NOT NULL, parent_id INTEGER)");
  
  stmt = db.prepare("INSERT INTO categories VALUES (?, ?, ?,?)");
  stmt.run(1,"Electronics",0, 0);
  stmt.run(2,"Furniture",1, 0);
  stmt.run(3,"Clothes",2, 0);
  stmt.run(4,"Sports",3, 0);
  stmt.run(5,"Vehicles",4, 0);
  
  stmt.finalize();

  db.run("CREATE TABLE if not exists items (id INTEGER NOT NULL PRIMARY KEY, name TEXT, weight INTEGER NOT NULL, category_id INTEGER, user_id INTEGER NOT NULL)");

});

db.close();