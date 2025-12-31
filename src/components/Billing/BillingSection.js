import React,{useState} from "react";
import BillingForm from "./BillingForm";
import BillingTable from "./BillingTable";
import Modal from "../Shared/Modal";

export default function BillingSection(){
  const [open,setOpen]=useState(false);
  return (
    <div className="card">
      <div className="row" style={{justifyContent:"space-between"}}>
        <h2>Billing</h2>
        <button className="btn-primary" onClick={()=>setOpen(true)}>+ Add Bill</button>
      </div>
      <BillingTable/>
      <Modal open={open} onClose={()=>setOpen(false)} title="Create Invoice">
        <BillingForm onClose={()=>setOpen(false)}/>
      </Modal>
    </div>
  );
}
