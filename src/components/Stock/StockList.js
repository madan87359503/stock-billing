import React, { useContext, useState } from "react";
import { StockContext } from "../../context/StockContext.js";

export default function StockList() {
  const { stocks } = useContext(StockContext);
  const [f, setF] = useState("");

  const filtered = stocks.filter(s =>
    s.product.toLowerCase().includes(f.toLowerCase()) ||
    s.type.toLowerCase().includes(f.toLowerCase()) ||
    s.place.toLowerCase().includes(f.toLowerCase())
  );

  return (
    <>
      <div className="row">
        <input placeholder="Filter stock..." value={f} onChange={e=>setF(e.target.value)}/>
        <button className="btn-dark" onClick={()=>exportExcel(filtered,"Stock_Filtered")}>Export</button>
      </div>
      <table>
        <thead><tr><th>Product</th><th>Type</th><th>Place</th><th>Qty</th></tr></thead>
        <tbody>
          {filtered.map(s=>(
            <tr key={s.id}>
              <td>{s.product}</td><td>{s.type}</td><td>{s.place}</td><td>{s.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
