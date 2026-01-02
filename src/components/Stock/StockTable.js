import React, { useContext, useState, useRef, useEffect } from "react";
import { StockContext } from "../../context/StockContext.js";
import { BillingContext } from "../../context/BillingContext.js";

/* ===========================
   REUSABLE SCROLLABLE DROPDOWN
=========================== */
function TextDropdown({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = e => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const filtered = options.filter(o =>
    o.toLowerCase().includes(value.toLowerCase())
  );

  return (
    <div ref={ref} style={{ position: "relative", width: "200px" }}>
      <label>{label}</label>
      <input
        value={value}
        onChange={e => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
      />

      {open && filtered.length > 0 && (
        <div className="dropdown">
          {filtered.map(o => (
            <div
              key={o}
              className="dropdown-item"
              onMouseDown={() => {
                onChange(o);
                setOpen(false);
              }}
            >
              {o}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ===========================
   MAIN STOCK TABLE
=========================== */
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

  /* ---------- Date helpers ---------- */
  const years = Array.from({ length: 11 }, (_, i) => 2080 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const toDateString = (y, m, d) => {
    if (!y || !m || !d) return "";
    return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  };

  /* ---------- MATCHING FILTER ---------- */
  const filtered = stocks.filter(s => {
    const from = toDateString(f.fromYear, f.fromMonth, f.fromDay);
    const to = toDateString(f.toYear, f.toMonth, f.toDay);
    const dateOk = (!from || s.date >= from) && (!to || s.date <= to);

    return (
      dateOk &&
      (!f.product || s.product.toLowerCase().includes(f.product.toLowerCase())) &&
      (!f.type || s.type.toLowerCase().includes(f.type.toLowerCase())) &&
      (!f.place || s.place.toLowerCase().includes(f.place.toLowerCase())) &&
      (!f.unit || s.unit.toLowerCase().includes(f.unit.toLowerCase()))
    );
  });

  /* ---------- Remaining stock ---------- */
  const getRemaining = s => {
    if (!bills.length) return s.quantity;
    const billed = bills
      .flatMap(b => b.items || [])
      .filter(i => i.stockId === s.id)
      .reduce((a, b) => a + Number(b.quantity), 0);
    return Math.max(0, Number(s.quantity) - billed);
  };

  /* ---------- FULL DATA LISTS ---------- */
  const products = [...new Set(stocks.map(s => s.product))];
  const types = [...new Set(stocks.map(s => s.type))];
  const places = [...new Set(stocks.map(s => s.place))];
  const units = [...new Set(stocks.map(s => s.unit))];

  return (
    <>
      {/* FILTER ROW */}
      <div className="row" style={{ gap: "10px", flexWrap: "wrap", marginBottom: "15px" }}>
        <TextDropdown
          label="Product"
          value={f.product}
          options={products}
          onChange={val => setF({ ...f, product: val })}
        />
        <TextDropdown
          label="Type"
          value={f.type}
          options={types}
          onChange={val => setF({ ...f, type: val })}
        />
        <TextDropdown
          label="Place"
          value={f.place}
          options={places}
          onChange={val => setF({ ...f, place: val })}
        />
        <TextDropdown
          label="Unit"
          value={f.unit}
          options={units}
          onChange={val => setF({ ...f, unit: val })}
        />
      </div>

      {/* DATE FILTER */}
      <div className="row" style={{ gap: "10px", marginBottom: "15px", flexWrap: "wrap" }}>
        {["From", "To"].map(label => (
          <div key={label}>
            <label>{label} Date</label>
            <div style={{ display: "flex", gap: "5px" }}>
              <select onChange={e => setF({ ...f, [`${label.toLowerCase()}Year`]: e.target.value })}>
                <option value="">Year</option>
                {years.map(y => <option key={y}>{y}</option>)}
              </select>
              <select onChange={e => setF({ ...f, [`${label.toLowerCase()}Month`]: e.target.value })}>
                <option value="">Month</option>
                {months.map(m => <option key={m}>{m}</option>)}
              </select>
              <select onChange={e => setF({ ...f, [`${label.toLowerCase()}Day`]: e.target.value })}>
                <option value="">Day</option>
                {days.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>
        ))}
      </div>

      {/* STOCK TABLE */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Date</th><th>Product</th><th>Type</th><th>Place</th>
            <th>Qty</th><th>Remaining</th><th>Unit</th>
            <th>Rate</th><th>Total</th><th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan="10" style={{ textAlign: "center" }}>No records found</td>
            </tr>
          ) : (
            filtered.map(s => (
              <tr key={s.id}>
                <td>{s.date}</td>
                <td>{s.product}</td>
                <td>{s.type}</td>
                <td>{s.place}</td>
                <td>{s.quantity}</td>
                <td>{getRemaining(s)}</td>
                <td>{s.unit}</td>
                <td>{s.amount}</td>
                <td>{s.quantity * s.amount}</td>
                <td>
                  <button className="btn-dark" onClick={() => onEdit(s)}>Edit</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </>
  );
}
