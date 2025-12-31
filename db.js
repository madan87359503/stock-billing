// db.js
const Database = require("better-sqlite3");
const path = require("path");

const { app } = require("electron");

const dbPath = path.join(app.getPath("userData"), "database.sqlite");

const db = new Database(dbPath);

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS stocks (
    id TEXT PRIMARY KEY,
    product TEXT,
    type TEXT,
    place TEXT,
    unit TEXT,
    quantity INTEGER,
    remaining INTEGER,
    amount REAL,
    total REAL,
    date TEXT
  );

  CREATE TABLE IF NOT EXISTS bills (
    id TEXT PRIMARY KEY,
    billNumber TEXT,
    billDate TEXT,
    grandTotal REAL
  );

  CREATE TABLE IF NOT EXISTS bill_items (
    id TEXT PRIMARY KEY,
    billId TEXT,
    stockId TEXT,
    product TEXT,
    quantity INTEGER,
    amount REAL,
    total REAL
  );
`);

module.exports = db;
