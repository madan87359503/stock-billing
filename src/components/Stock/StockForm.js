import React, { useContext, useEffect, useState } from "react";
import { StockContext } from "../../context/StockContext.js";

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
      const [year, month, day] = editStock.date ? editStock.date.split("-") : ["", "", ""];
      setD({ ...editStock, year, month, day });
    }
  }, [editStock]);

  // Dropdown suggestions based on history
  const products = [...new Set(stocks.map(s => s.product))];
  const types = [...new Set(stocks.filter(s => s.product === d.product).map(s => s.type))];
  const places = [...new Set(stocks.filter(s => s.product === d.product && s.type === d.type).map(s => s.place))];
  const units = [...new Set(stocks.filter(s => s.product === d.product && s.type === d.type && s.place === d.place).map(s => s.unit))];

  // Generate Nepali date dropdown options
  const years = Array.from({ length: 11 }, (_, i) => 2080 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 32 }, (_, i) => i + 1);

  const submit = e => {
    e.preventDefault();

    // Validate all fields
    if (
      !d.product.trim() ||
      !d.type.trim() ||
      !d.place.trim() ||
      !d.unit.trim() ||
      !d.quantity ||
      !d.amount ||
      !d.year ||
      !d.month ||
      !d.day
    ) {
      alert("Please fill all required fields");
      return;
    }

    const dateStr = `${d.year}-${d.month.padStart?.(2, "0") || ("0" + d.month)}-${d.day.padStart?.(2, "0") || ("0" + d.day)}`;

    const payload = {
      ...d,
      quantity: Number(d.quantity),
      amount: Number(d.amount),
      total: Number(d.quantity) * Number(d.amount),
      date: dateStr
    };

    editStock ? updateStock(editStock.id, payload) : addStock(payload);
    onClose();
  };

  const handleChange = (field, value) => setD(prev => ({ ...prev, [field]: value }));

  return (
    <form onSubmit={submit}>
      {/* Row 1: Product, Type, Place, Unit */}
      <div className="row" style={{ gap: "10px", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 150px" }}>
          <label>Product</label>
          <input
            list="products"
            required
            value={d.product}
            onChange={e => handleChange("product", e.target.value)}
          />
          <datalist id="products">{products.map(p => <option key={p} value={p} />)}</datalist>
        </div>

        <div style={{ flex: "1 1 150px" }}>
          <label>Type</label>
          <input
            list="types"
            required
            value={d.type}
            onChange={e => handleChange("type", e.target.value)}
          />
          <datalist id="types">{types.map(t => <option key={t} value={t} />)}</datalist>
        </div>

        <div style={{ flex: "1 1 150px" }}>
          <label>Place</label>
          <input
            list="places"
            required
            value={d.place}
            onChange={e => handleChange("place", e.target.value)}
          />
          <datalist id="places">{places.map(p => <option key={p} value={p} />)}</datalist>
        </div>

        <div style={{ flex: "1 1 100px" }}>
          <label>Unit</label>
          <input
            list="units"
            required
            value={d.unit}
            onChange={e => handleChange("unit", e.target.value)}
          />
          <datalist id="units">{units.map(u => <option key={u} value={u} />)}</datalist>
        </div>
      </div>

      {/* Row 2: Quantity, Amount, Date */}
      <div className="row" style={{ gap: "10px", flexWrap: "wrap", marginTop: "10px" }}>
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

        <div style={{ flex: "1 1 250px" }}>
          <label>Date</label>
          <div style={{ display: "flex", gap: "5px" }}>
            <select required value={d.year} onChange={e => handleChange("year", e.target.value)}>
              <option value="">Year</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <select required value={d.month} onChange={e => handleChange("month", e.target.value)}>
              <option value="">Month</option>
              {months.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select required value={d.day} onChange={e => handleChange("day", e.target.value)}>
              <option value="">Day</option>
              {days.map(dy => <option key={dy} value={dy}>{dy}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div style={{ marginTop: "15px" }}>
        <button className="btn-primary" type="submit">
          {editStock ? "Update Stock" : "Save Stock"}
        </button>
      </div>
    </form>
  );
}
