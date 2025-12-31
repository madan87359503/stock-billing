import React, { useContext, useState } from "react";
import { BillingContext } from "../../context/BillingContext";
import { StockContext } from "../../context/StockContext.js";
import { exportExcel } from "../Shared/ExportExcel";

export default function BillingTable() {
  const { bills } = useContext(BillingContext);
  const { stocks } = useContext(StockContext);
  const [f, setF] = useState({ billNo: "", fromYear: "", fromMonth: "", fromDay: "", toYear: "", toMonth: "", toDay: "" });

  const years = Array.from({ length: 11 }, (_, i) => 2080 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 32 }, (_, i) => i + 1);

  const toDateString = (y, m, d) => (!y || !m || !d) ? "" : `${y}-${m.toString().padStart(2,"0")}-${d.toString().padStart(2,"0")}`;

  const filteredBills = bills.filter(b => {
    const fromDate = toDateString(f.fromYear, f.fromMonth, f.fromDay);
    const toDate = toDateString(f.toYear, f.toMonth, f.toDay);
    const dateOk = (!fromDate || b.billDate >= fromDate) && (!toDate || b.billDate <= toDate);
    return dateOk && (!f.billNo || b.billNumber.includes(f.billNo));
  });

  // Flatten items with stock info
  const allItems = filteredBills.flatMap(b =>
    b.items.map(item => {
      const stock = stocks.find(s => s.id === item.stockId) || {};
      return {
        billNumber: b.billNumber,
        billDate: b.billDate,
        product: item.product,
        type: item.type,
        place: item.place,
        unit: item.unit,
        quantity: item.quantity,
        total: item.total,
        stockQuantity: stock.quantity ?? 0,
        remaining: stock.remaining ?? 0,
        stockDate: stock.date ?? ""
      };
    })
  );

  return (
    <>
      <div className="row" style={{ gap:"10px", marginBottom:"15px", alignItems:"center" }}>
        <input placeholder="Bill No" value={f.billNo} onChange={e => setF({...f, billNo: e.target.value})} />
      {/* From Date */}
        <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
          <select value={f.fromYear} onChange={e => setF({ ...f, fromYear: e.target.value })}>
            <option value="">Year</option>{years.map(y => <option key={y}>{y}</option>)}
          </select>
          <select value={f.fromMonth} onChange={e => setF({ ...f, fromMonth: e.target.value })}>
            <option value="">Month</option>{months.map(m => <option key={m}>{m}</option>)}
          </select>
          <select value={f.fromDay} onChange={e => setF({ ...f, fromDay: e.target.value })}>
            <option value="">Day</option>{days.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>

        {/* To Date */}
        <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
          <select value={f.toYear} onChange={e => setF({ ...f, toYear: e.target.value })}>
            <option value="">Year</option>{years.map(y => <option key={y}>{y}</option>)}
          </select>
          <select value={f.toMonth} onChange={e => setF({ ...f, toMonth: e.target.value })}>
            <option value="">Month</option>{months.map(m => <option key={m}>{m}</option>)}
          </select>
          <select value={f.toDay} onChange={e => setF({ ...f, toDay: e.target.value })}>
            <option value="">Day</option>{days.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>
        {/* ... same selects for fromYear, fromMonth, fromDay, toYear, toMonth, toDay */}
        <button className="btn-dark" onClick={() => exportExcel(allItems, "Billing_Report")}>Export</button>
      </div>

      <table style={{ width:"100%", borderCollapse:"collapse" }}>
        <thead>
          <tr>
            <th>Bill No</th>
            <th>Bill Date</th>
            <th>Product</th>
            <th>Type</th>
            <th>Place</th>
            <th>Unit</th>
            <th>Qty</th>
            <th>Total</th>
            <th>Stock Qty</th>
            <th>Remaining</th>
            <th>Stock Date</th>
          </tr>
        </thead>
        <tbody>
          {allItems.length === 0 ? (
            <tr><td colSpan="11" style={{ textAlign:"center" }}>No records found</td></tr>
          ) : (
            allItems.map((i, idx) => (
              <tr key={idx}>
                <td>{i.billNumber}</td>
                <td>{i.billDate}</td>
                <td>{i.product}</td>
                <td>{i.type}</td>
                <td>{i.place}</td>
                <td>{i.unit}</td>
                <td>{i.quantity}</td>
                <td>{i.total}</td>
                <td>{i.stockQuantity}</td>
                <td>{i.remaining}</td>
                <td>{i.stockDate}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </>
  );
}
