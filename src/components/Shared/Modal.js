import React from "react";

export default function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div style={overlay}>
      <div style={modal}>
        <div style={header}>
          <h3>{title}</h3>
          <button onClick={onClose}>✖</button>
        </div>
        {children}
      </div>
    </div>
  );
}

const overlay = {
  position: "fixed",
  inset: 0,
  zIndex: 9999,
  background: "rgba(0,0,0,.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const modal = {
  background: "#fff",
  width: "90%",
  maxWidth: 900,
  padding: 15,
  borderRadius: 6
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};
