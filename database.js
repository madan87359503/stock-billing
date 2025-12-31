const Database = require('better-sqlite3');
const db = new Database('stock-billing.db');

// Create tables if they don't exist
db.prepare(`
  CREATE TABLE IF NOT EXISTS stock (
    id TEXT PRIMARY KEY,
    product TEXT,
    type TEXT,
    place TEXT,
    unit TEXT,
    quantity REAL,
    amount REAL,
    total REAL,
    date TEXT
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS bills (
    id TEXT PRIMARY KEY,
    billNumber TEXT,
    billDate TEXT,
    grandTotal REAL
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS bill_items (
    id TEXT PRIMARY KEY,
    billId TEXT,
    stockId TEXT,
    product TEXT,
    quantity REAL,
    amount REAL,
    total REAL
  )
`).run();

module.exports = db;
