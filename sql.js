const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./db.sqlite');

db.serialize(() => {
  db.run(`DROP TABLE IF EXISTS Visits`);
  db.run(`CREATE TABLE IF NOT EXISTS Visits(
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    surname TEXT NOT NULL,
    phone_number INTEGER NOT NULL,
    SSN TEXT NOT NULL,
    day TEXT NOT NULL DEFAULT "",
    time TEXT NOT NULL DEFAULT ""
  );`);
});