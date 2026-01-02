import React, { useContext, useEffect, useState, useRef } from "react";
import { StockContext } from "../../context/StockContext.js";

/* ===========================
   REUSABLE DROPDOWN INPUT
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
    <div ref={ref} style={{ position: "relative", flex: "1 1 150px" }}>
      <label>{label}</label>
      <input
        value={value}
        required
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
   MAIN STOCK FORM
=========================== */
export default function StockForm({ editStock, onClose }) {
  const { stocks, addStock, updateStock } = useContext(StockContext);

  const [d, setD] = useState({
    product: "",
    type: "",
    place: "",
    unit: "",
    quantity: "",
    amount: "",
    year: "",
    month: "",
    day: ""
  });

  useEffect(() => {
    if (editStock) {
      const [year, month, day] = editStock.date
        ? editStock.date.split("-")
        : ["", "", ""];
      setD({ ...editStock, year, month, day });
    }
  }, [editStock]);

  const handleChange = (field, value) =>
    setD(prev => ({ ...prev, [field]: value }));

  /* ---------- FULL DATA LISTS ---------- */
  const products = [...new Set(stocks.map(s => s.product))];
  const types = [...new Set(stocks.map(s => s.type))];
  const places = [...new Set(stocks.map(s => s.place))];
  const units = [...new Set(stocks.map(s => s.unit))];

  /* ---------- DATE OPTIONS ---------- */
  const years = Array.from({ length: 11 }, (_, i) => 2080 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const submit = e => {
    e.preventDefault();

    if (
      !d.product || !d.type || !d.place || !d.unit ||
      !d.quantity || !d.amount || !d.year || !d.month || !d.day
    ) {
      alert("Please fill all required fields");
      return;
    }

    const date = `${d.year}-${String(d.month).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`;

    const payload = {
      ...d,
      quantity: Number(d.quantity),
      amount: Number(d.amount),
      total: Number(d.quantity) * Number(d.amount),
      date
    };

    editStock ? updateStock(editStock.id, payload) : addStock(payload);
    onClose();
  };

  return (
    <form onSubmit={submit}>
      {/* ROW 1 */}
      <div className="row" style={{ gap: "10px", flexWrap: "wrap" }}>
        <TextDropdown
          label="Product"
          value={d.product}
          options={products}
          onChange={v => handleChange("product", v)}
        />
        <TextDropdown
          label="Type"
          value={d.type}
          options={types}
          onChange={v => handleChange("type", v)}
        />
        <TextDropdown
          label="Place"
          value={d.place}
          options={places}
          onChange={v => handleChange("place", v)}
        />
        <TextDropdown
          label="Unit"
          value={d.unit}
          options={units}
          onChange={v => handleChange("unit", v)}
        />
      </div>

      {/* ROW 2 */}
      <div className="row" style={{ gap: "10px", marginTop: "10px", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 100px" }}>
          <label>Quantity</label>
          <input
            type="number"
            required
            value={d.quantity}
            onChange={e => handleChange("quantity", e.target.value)}
          />
        </div>

        <div style={{ flex: "1 1 100px" }}>
          <label>Amount</label>
          <input
            type="number"
            required
            value={d.amount}
            onChange={e => handleChange("amount", e.target.value)}
          />
        </div>

        <div style={{ flex: "1 1 260px" }}>
          <label>Date</label>
          <div style={{ display: "flex", gap: "5px" }}>
            <select required value={d.year} onChange={e => handleChange("year", e.target.value)}>
              <option value="">Year</option>
              {years.map(y => <option key={y}>{y}</option>)}
            </select>
            <select required value={d.month} onChange={e => handleChange("month", e.target.value)}>
              <option value="">Month</option>
              {months.map(m => <option key={m}>{m}</option>)}
            </select>
            <select required value={d.day} onChange={e => handleChange("day", e.target.value)}>
              <option value="">Day</option>
              {days.map(dy => <option key={dy}>{dy}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* SUBMIT */}
      <div style={{ marginTop: "15px" }}>
        <button className="btn-primary" type="submit">
          {editStock ? "Update Stock" : "Save Stock"}
        </button>
      </div>
    </form>
  );
}
