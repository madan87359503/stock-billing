import React,{useContext,useState} from "react";
import { BillingContext } from "../../context/BillingContext.js";
import { exportExcel } from "../Shared/ExportExcel";

export default function BillingList(){
  const { bills } = useContext(BillingContext);
  const [f,setF]=useState("");

  const filtered=bills.filter(b=>
    b.billNumber.includes(f)||b.productName.toLowerCase().includes(f.toLowerCase())
  );

  return (
    <>
      <div className="row">
        <input placeholder="Filter bills..." value={f} onChange={e=>setF(e.target.value)}/>
        <button className="btn-dark" onClick={()=>exportExcel(filtered,"Bills_Filtered")}>Export</button>
      </div>
      <table>
        <thead><tr><th>Bill</th><th>Product</th><th>Qty</th><th>Total</th></tr></thead>
        <tbody>
          {filtered.map(b=>(
            <tr key={b.id}>
              <td>{b.billNumber}</td>
              <td>{b.productName}</td>
              <td>{b.quantity}</td>
              <td>{b.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
