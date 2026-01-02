const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { v4: uuid } = require("uuid");
const Database = require("better-sqlite3");


const dbPath = path.join(app.getPath("userData"), "database.sqlite");
       // dev
const db = new Database(dbPath);

// Example: create table if not exists
db.prepare(
  `CREATE TABLE IF NOT EXISTS stocks (
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
  )`
).run();

db.prepare(
  `CREATE TABLE IF NOT EXISTS bills (
    id TEXT PRIMARY KEY,
    billNumber TEXT,
    billDate TEXT,
    grandTotal REAL
  )`
).run();

db.prepare(
  `CREATE TABLE IF NOT EXISTS bill_items (
    id TEXT PRIMARY KEY,
    billId TEXT,
    stockId TEXT,
    product TEXT,
    quantity INTEGER,
    amount REAL,
    total REAL
  )`
).run();

// ---------------- WINDOW ----------------
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  
    mainWindow.loadFile(path.join(__dirname, "build", "index.html"));
  mainWindow.maximize();

  mainWindow.on("blur", () => mainWindow.focus());
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// ---------------- IPC ----------------

// Get all stocks
ipcMain.handle("get-stocks", () => {
  return db.prepare("SELECT * FROM stocks ORDER BY date DESC").all();
});

// Add stock
ipcMain.handle("add-stock", (_, stock) => {
  const id = uuid();
  const quantity = Number(stock.quantity);
  const amount = Number(stock.amount);
  const total = quantity * amount;

  db.prepare(
    `INSERT INTO stocks
     (id, product, type, place, unit, quantity, remaining, amount, total, date)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    stock.product,
    stock.type,
    stock.place,
    stock.unit,
    quantity,
    quantity,
    amount,
    total,
    stock.date || ""
  );

  return { ...stock, id, quantity, remaining: quantity, total };
});

// Add bill
ipcMain.handle("add-bill", (_, bill) => {
  const billId = uuid();

  const insertBill = db.prepare(
    `INSERT INTO bills (id, billNumber, billDate, grandTotal)
     VALUES (?, ?, ?, ?)`
  );
  const insertItem = db.prepare(
    `INSERT INTO bill_items (id, billId, stockId, product, quantity, amount, total)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  );
  const updateStock = db.prepare(
    `UPDATE stocks SET remaining = remaining - ? WHERE id=?`
  );

  const transaction = db.transaction(() => {
    insertBill.run(billId, bill.billNumber, bill.billDate, bill.grandTotal);

    bill.items.forEach((item) => {
      let qtyLeft = Number(item.quantity);

      const stocks = db
        .prepare(
          `SELECT * FROM stocks
           WHERE product=? AND type=? AND place=? AND remaining>0
           ORDER BY date ASC`
        )
        .all(item.product, item.type, item.place);

      const available = stocks.reduce((a, s) => a + s.remaining, 0);
      if (qtyLeft > available) throw new Error("Insufficient stock");

      stocks.forEach((s) => {
        if (qtyLeft <= 0) return;
        const deduct = Math.min(qtyLeft, s.remaining);
        insertItem.run(uuid(), billId, s.id, s.product, deduct, s.amount, deduct * s.amount);
        updateStock.run(deduct, s.id);
        qtyLeft -= deduct;
      });
    });
  });

  transaction(); // execute transaction

  return { ...bill, id: billId };
});

// Get bills
ipcMain.handle("get-bills", () => {
  const bills = db.prepare("SELECT * FROM bills ORDER BY billDate DESC").all();
  return bills.map((bill) => {
    const items = db
      .prepare(
        `SELECT bi.*, s.type, s.place, s.unit, s.quantity AS totalStock, s.date AS stockDate
         FROM bill_items bi
         LEFT JOIN stocks s ON bi.stockId = s.id
         WHERE bi.billId=?`
      )
      .all(bill.id);
    return { ...bill, items };
  });
});
// Update stock
ipcMain.handle("update-stock", (_, id, stock) => {
  const quantity = Number(stock.quantity);
  const amount = Number(stock.amount);
  const total = quantity * amount;

  db.prepare(
    `UPDATE stocks
     SET product=?, type=?, place=?, unit=?, quantity=?, amount=?, total=?, date=?
     WHERE id=?`
  ).run(
    stock.product,
    stock.type,
    stock.place,
    stock.unit,
    quantity,
    amount,
    total,
    stock.date || "",
    id
  );

  return { ...stock, id, quantity, total };
});
