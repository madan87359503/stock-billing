import React, { useContext, useState } from "react";
import { StockContext } from "../../context/StockContext.js";
import { BillingContext } from "../../context/BillingContext.js";

export default function StockTable({ onEdit }) {
  const { stocks: rawStocks } = useContext(StockContext);
  const { bills: rawBills } = useContext(BillingContext);

  const stocks = Array.isArray(rawStocks) ? rawStocks.filter(Boolean) : [];
  const bills = Array.isArray(rawBills) ? rawBills.filter(Boolean) : [];

  const [f, setF] = useState({
    product: "",
    type: "",
    place: "",
    unit: "",
    fromYear: "",
    fromMonth: "",
    fromDay: "",
    toYear: "",
    toMonth: "",
    toDay: ""
  });

  const years = Array.from({ length: 11 }, (_, i) => 2080 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 32 }, (_, i) => i + 1);

  const toDateString = (y, m, d) => {
    if (!y || !m || !d) return "";
    return `${y}-${m.toString().padStart(2, "0")}-${d.toString().padStart(2, "0")}`;
  };

  // Filter stocks by selected filters
  const filtered = stocks.filter(s => {
    const fromDateStr = toDateString(f.fromYear, f.fromMonth, f.fromDay);
    const toDateStr = toDateString(f.toYear, f.toMonth, f.toDay);
    const dateOk = (!fromDateStr || s.date >= fromDateStr) && (!toDateStr || s.date <= toDateStr);

    return dateOk &&
      (!f.product || s.product === f.product) &&
      (!f.type || s.type === f.type) &&
      (!f.place || s.place === f.place) &&
      (!f.unit || s.unit === f.unit);
  });

  // Total stock: just the original quantity of this stock record
  const getTotalStock = s => Number(s.quantity);

  // Remaining stock: quantity minus billed amount for this stock entry
const getRemaining = (s) => {
  if (!bills || bills.length === 0) return s.quantity; // if no bills yet
  const billedQty = bills.flatMap(b => b.items || [])
                         .filter(i => i.stockId === s.id)
                         .reduce((a, b) => a + Number(b.quantity), 0);
  return Math.max(0, Number(s.quantity) - billedQty); // do not go negative
};

  // Suggestion lists
  const products = [...new Set(stocks.map(s => s.product))];
  const types = [...new Set(stocks.filter(s => !f.product || s.product === f.product).map(s => s.type))];
  const places = [...new Set(stocks.filter(s => (!f.product || s.product === f.product) && (!f.type || s.type === f.type)).map(s => s.place))];
  const units = [...new Set(stocks.filter(s => (!f.product || s.product === f.product) && (!f.type || s.type === f.type) && (!f.place || s.place === f.place)).map(s => s.unit))];

  return (
    <>
      {/* FILTER ROW */}
      <div className="row" style={{ marginBottom: "15px", gap: "10px", flexWrap: "wrap" }}>
        <div>
          <label>Product</label>
          <input list="fp" value={f.product} onChange={e => setF({ ...f, product: e.target.value, type: "", place: "", unit: "" })} />
          <datalist id="fp">{products.map(p => <option key={p} value={p} />)}</datalist>
        </div>
        <div>
          <label>Type</label>
          <input list="ft" value={f.type} onChange={e => setF({ ...f, type: e.target.value, place: "", unit: "" })} />
          <datalist id="ft">{types.map(t => <option key={t} value={t} />)}</datalist>
        </div>
        <div>
          <label>Place</label>
          <input list="fpl" value={f.place} onChange={e => setF({ ...f, place: e.target.value, unit: "" })} />
          <datalist id="fpl">{places.map(p => <option key={p} value={p} />)}</datalist>
        </div>
        <div>
          <label>Unit</label>
          <input list="fu" value={f.unit} onChange={e => setF({ ...f, unit: e.target.value })} />
          <datalist id="fu">{units.map(u => <option key={u} value={u} />)}</datalist>
        </div>
      </div>

      {/* DATE FILTER + EXPORT */}
      <div className="row" style={{ marginBottom: "15px", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
        {["From", "To"].map(label => (
          <div key={label}>
            <label>{label} Date</label>
            <div style={{ display: "flex", gap: "5px" }}>
              <select value={f[`${label.toLowerCase()}Year`]} onChange={e => setF({ ...f, [`${label.toLowerCase()}Year`]: e.target.value })}>
                <option value="">Year</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <select value={f[`${label.toLowerCase()}Month`]} onChange={e => setF({ ...f, [`${label.toLowerCase()}Month`]: e.target.value })}>
                <option value="">Month</option>
                {months.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <select value={f[`${label.toLowerCase()}Day`]} onChange={e => setF({ ...f, [`${label.toLowerCase()}Day`]: e.target.value })}>
                <option value="">Day</option>
                {days.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
        ))}

       
      </div>

      {/* STOCK TABLE */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Product</th>
            <th>Type</th>
            <th>Place</th>
            <th>Qty</th>
            <th>Remaining</th>
            <th>Unit</th>
            <th>Rate</th>
            <th>Total</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan="11" style={{ textAlign: "center" }}>No records found</td>
            </tr>
          ) : (
            filtered.map(s => {
              // Split date for edit pre-fill
              const [year, month, day] = s.date ? s.date.split("-") : ["", "", ""];
              return (
                <tr key={s.id}>
                  <td>{s.date}</td>
                  <td>{s.product}</td>
                  <td>{s.type}</td>
                  <td>{s.place}</td>
                  <td>{s.quantity}</td>
                  <td>{s.remaining}</td> 
                  <td>{s.unit}</td>
                  <td>{s.amount}</td>
                  <td>{s.quantity*s.amount}</td>         
                  <td>
                    <button className="btn-dark" onClick={() => onEdit({ ...s, year, month, day })}>Edit</button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </>
  );
}
