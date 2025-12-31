import React, { useContext, useState, useEffect } from "react";
import { StockContext } from "../../context/StockContext.js";
import { BillingContext } from "../../context/BillingContext";
import Modal from "../Shared/Modal";

export default function BillingForm({ onClose, editBill }) {
  const { stocks } = useContext(StockContext);
  const { addBill, updateBill, error, setError } = useContext(BillingContext);

  const [billNo, setBillNo] = useState("");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (editBill) {
      setBillNo(editBill.billNumber);
      const [y, m, d] = editBill.billDate.split("-");
      setYear(y);
      setMonth(Number(m));
      setDay(Number(d));
      setItems(editBill.items.map(i => ({ ...i, qty: i.quantity })));
    }
  }, [editBill]);

  const addRow = () => setItems([...items, { product: "", type: "", place: "", unit: "", qty: "" }]);

  const updateItem = (index, key, value) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [key]: value };
    if (key === "product") updated[index].type = updated[index].place = updated[index].unit = "";
    if (key === "type") updated[index].place = updated[index].unit = "";
    if (key === "place") updated[index].unit = "";
    setItems(updated);
  };

  const toDateString = () => {
    if (!year || !month || !day) return "";
    return `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
  };

  const submit = async (e) => {
    e.preventDefault();
    const billDate = toDateString();
    if (!billDate) return setError("Please select a date");

    try {
      const prepared = items.map(i => {
        const s = stocks.find(
          x => x.product === i.product && x.type === i.type && x.place === i.place && x.unit === i.unit
        );
        if (!s) throw new Error(`Stock not found: ${i.product} (${i.type}) at ${i.place}`);
        return {
          stockId: s.id,
          product: i.product,
          type: i.type,
          place: i.place,
          unit: i.unit,
          quantity: Number(i.qty),
          amount: s.amount,
          total: Number(i.qty) * s.amount
        };
      });

      const billData = {
        billNumber: billNo,
        billDate,
        items: prepared,
        grandTotal: prepared.reduce((a, b) => a + b.total, 0)
      };

      if (editBill) await updateBill(editBill.id, billData);
      else await addBill(billData);

      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  const products = [...new Set(stocks.map(s => s.product))];
  const years = Array.from({ length: 11 }, (_, i) => 2080 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 32 }, (_, i) => i + 1);

  return (
    <form onSubmit={submit}>
      <div className="row" style={{ gap: "10px", marginBottom: "10px" }}>
        <input required placeholder="Bill No" value={billNo} onChange={e => setBillNo(e.target.value)} />
        <select required value={year} onChange={e => setYear(e.target.value)}>
          <option value="">Year</option>{years.map(y => <option key={y}>{y}</option>)}
        </select>
        <select required value={month} onChange={e => setMonth(e.target.value)}>
          <option value="">Month</option>{months.map(m => <option key={m}>{m}</option>)}
        </select>
        <select required value={day} onChange={e => setDay(e.target.value)}>
          <option value="">Day</option>{days.map(d => <option key={d}>{d}</option>)}
        </select>
        <button type="button" onClick={addRow}>+ Item</button>
      </div>

      <Modal open={!!error} onClose={() => setError(null)} title="Error">
        <p>{error}</p>
      </Modal>

      {items.map((r, i) => {
        const types = [...new Set(stocks.filter(s => s.product === r.product).map(s => s.type))];
        const places = [...new Set(stocks.filter(s => s.product === r.product && s.type === r.type).map(s => s.place))];
        const units = [...new Set(stocks.filter(s => s.product === r.product && s.type === r.type && s.place === r.place).map(s => s.unit))];

        return (
          <div className="row" key={i} style={{ gap: "10px", marginBottom: "5px" }}>
            <select required value={r.product} onChange={e => updateItem(i, "product", e.target.value)}>
              <option value="">Product</option>{products.map(p => <option key={p}>{p}</option>)}
            </select>
            <select required value={r.type} onChange={e => updateItem(i, "type", e.target.value)}>
              <option value="">Type</option>{types.map(t => <option key={t}>{t}</option>)}
            </select>
            <select required value={r.place} onChange={e => updateItem(i, "place", e.target.value)}>
              <option value="">Place</option>{places.map(p => <option key={p}>{p}</option>)}
            </select>
            <select required value={r.unit} onChange={e => updateItem(i, "unit", e.target.value)}>
              <option value="">Unit</option>{units.map(u => <option key={u}>{u}</option>)}
            </select>
            <input required type="number" placeholder="Qty" value={r.qty} onChange={e => updateItem(i, "qty", e.target.value)} />
            <button type="button" onClick={() => setItems(items.filter((_, x) => x !== i))}>✖</button>
          </div>
        );
      })}

      <button className="btn-primary">Save Bill</button>
    </form>
  );
}
