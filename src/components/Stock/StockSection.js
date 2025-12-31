import React, { useState } from "react";
import StockForm from "./StockForm";
import StockTable from "./StockTable";
import Modal from "../Shared/Modal";

export default function StockSection() {
  const [open, setOpen] = useState(false);
  const [editStock, setEditStock] = useState(null);

  // Open modal for adding stock
  const handleAdd = () => {
    setEditStock(null);
    setOpen(true);
  };

  // Open modal for editing stock
  const handleEdit = (stock) => {
    setEditStock(stock);
    setOpen(true);
  };

  // Close modal
  const handleClose = () => {
    setOpen(false);
    setEditStock(null);
  };

  return (
    <div className="card" style={{ padding: "20px" }}>
      <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
        <h2>Stock</h2>
        <button className="btn-primary" onClick={handleAdd}>
          + Add Stock
        </button>
      </div>

      {/* Stock table with total and remaining stock handled inside */}
      <StockTable onEdit={handleEdit} />

      {/* Modal for add/edit stock */}
      <Modal open={open} onClose={handleClose} title={editStock ? "Edit Stock" : "Add Stock"}>
        <StockForm editStock={editStock} onClose={handleClose} />
      </Modal>
    </div>
  );
}
