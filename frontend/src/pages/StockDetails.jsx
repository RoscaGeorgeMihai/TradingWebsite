import React from "react";
import { useParams, Link } from "react-router-dom";
import "../styles/Stocks.css"; 

const StockDetails = () => {
  const { symbol } = useParams();

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Stock Details</h1>
        <p style={{ fontSize: "18px", marginBottom: "20px" }}>
          You are viewing details for: <strong>{symbol}</strong>
        </p>
        <Link to="/" className="filter-button">
          ⬅ Back to Stocks
        </Link>
      </div>

      <div className="market-card" style={{ marginTop: "30px" }}>
        <h2>{symbol} – Placeholder info</h2>
        <p>This is where you would display live stock data for <strong>{symbol}</strong>.</p>
        <p>💡 You can integrate a real API here (e.g., Yahoo Finance, Finnhub, Alpha Vantage).</p>
      </div>
    </div>
  );
};

export default StockDetails;