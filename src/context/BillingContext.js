import React, { createContext, useState, useEffect, useContext } from "react";
import { StockContext } from "./StockContext.js";

export const BillingContext = createContext();

export const BillingProvider = ({ children }) => {
  const { stocks, updateStock } = useContext(StockContext);
  const [bills, setBills] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const data = await window.api.getBills();
        setBills(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchBills();
  }, []);

  const addBill = async (bill) => {
    try {
      const updatedStocks = [...stocks];

      for (let item of bill.items) {
        let qtyToDeduct = Number(item.quantity);

        // LIFO deduction from remaining stock
        const matchingStocks = updatedStocks
          .filter(s => s.product === item.product && s.type === item.type && s.place === item.place && s.unit === item.unit && s.remaining > 0)
          .sort((a, b) => new Date(b.date) - new Date(a.date)); // latest first

        for (let stock of matchingStocks) {
          const available = stock.remaining;
          if (available >= qtyToDeduct) {
            stock.remaining -= qtyToDeduct;
            qtyToDeduct = 0;
            break;
          } else {
            qtyToDeduct -= available;
            stock.remaining = 0;
          }
        }

        if (qtyToDeduct > 0) {
          setError(`Insufficient stock for ${item.product} (${item.type}) at ${item.place}. Missing quantity: ${qtyToDeduct}`);
          throw new Error("Insufficient stock");
        }
      }

      // Save bill in DB
      const saved = await window.api.addBill(bill);
      setBills(prev => [...prev, saved]);

      // Update stocks in DB
      for (let stock of updatedStocks) {
        await updateStock(stock.id, stock);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <BillingContext.Provider value={{ bills, addBill, error, setError }}>
      {children}
    </BillingContext.Provider>
  );
};
