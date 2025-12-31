const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  // STOCK
  getStocks: () => ipcRenderer.invoke("get-stocks"),
  addStock: (stock) => ipcRenderer.invoke("add-stock", stock),
  updateStock: (id, stock) => ipcRenderer.invoke("update-stock", id, stock),
  deleteStock: (id) => ipcRenderer.invoke("delete-stock", id),

  // BILLING
  addBill: (bill) => ipcRenderer.invoke("add-bill", bill),
  getBills: () => ipcRenderer.invoke("get-bills"),
});
