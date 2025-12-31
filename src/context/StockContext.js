import React, { createContext, useState, useEffect } from "react";

export const StockContext = createContext();

export const StockProvider = ({ children }) => {
  const [stocks, setStocks] = useState([]);

  // Load stocks from DB
  useEffect(() => {
    const fetchStocks = async () => {
      const data = await window.api.getStocks();
      setStocks(data);
    };
    fetchStocks();
  }, []);

  const addStock = async (stock) => {
    const saved = await window.api.addStock(stock);
    setStocks(prev => [...prev, saved]);
  };

  const updateStock = async (id, stock) => {
    await window.api.updateStock(id, stock);
    setStocks(prev => prev.map(s => (s.id === id ? { ...s, ...stock } : s)));
  };

  return (
    <StockContext.Provider value={{ stocks, setStocks, addStock, updateStock }}>
      {children}
    </StockContext.Provider>
  );
};
