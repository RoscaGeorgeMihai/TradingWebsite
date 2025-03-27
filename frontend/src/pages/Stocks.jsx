import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Stocks.css';

const Stocks = () => {
  const [activeTab, setActiveTab] = useState();

  const tabs = [
    'All Stocks',
    'US Market',
    'European Market',
    'Asian Market',
    'Technology',
    'Healthcare',
    'Energy',
    'Finance',
    'Consumer',
  ];

  const popularStocks = [
    { symbol: 'AAPL', name: 'Apple Inc.', color: '#0066cc', price: '178.72', change: '+1.25%', isPositive: true },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', color: '#4285f4', price: '142.17', change: '+0.87%', isPositive: true },
    { symbol: 'MSFT', name: 'Microsoft Corp.', color: '#0077b5', price: '413.56', change: '+0.63%', isPositive: true },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', color: '#ff9900', price: '180.85', change: '+1.42%', isPositive: true },
    { symbol: 'NFLX', name: 'Netflix Inc.', color: '#e50914', price: '687.25', change: '-0.32%', isPositive: false },
    { symbol: 'TSLA', name: 'Tesla Inc.', color: '#005e7c', price: '254.33', change: '+2.78%', isPositive: true },
  ];

  const topGainers = [
    { symbol: 'NVDA', name: 'NVIDIA Corp.', color: '#800080', price: '118.77', change: '+4.35%', isPositive: true },
    { symbol: 'PYPL', name: 'PayPal Holdings', color: '#007dff', price: '64.22', change: '+3.87%', isPositive: true },
    { symbol: 'SQ', name: 'Block Inc.', color: '#2b9348', price: '76.84', change: '+3.52%', isPositive: true },
    { symbol: 'AMD', name: 'Advanced Micro Dev.', color: '#0d47a1', price: '156.79', change: '+3.24%', isPositive: true },
    { symbol: 'SHOP', name: 'Shopify Inc.', color: '#087e8b', price: '78.35', change: '+2.98%', isPositive: true },
    { symbol: 'UBER', name: 'Uber Technologies', color: '#5d4c46', price: '72.14', change: '+2.82%', isPositive: true },
  ];

  const topLosers = [
    { symbol: 'ZM', name: 'Zoom Video Comm.', color: '#6a0dad', price: '63.45', change: '-4.28%', isPositive: false },
    { symbol: 'PLTR', name: 'Palantir Tech.', color: '#1aa3ff', price: '22.87', change: '-3.94%', isPositive: false },
    { symbol: 'ROKU', name: 'Roku Inc.', color: '#3d405b', price: '65.22', change: '-3.65%', isPositive: false },
    { symbol: 'DOCU', name: 'DocuSign Inc.', color: '#dd1c1a', price: '53.72', change: '-3.38%', isPositive: false },
    { symbol: 'CRSR', name: 'Corsair Gaming', color: '#1e8253', price: '10.76', change: '-3.26%', isPositive: false },
    { symbol: 'PINS', name: 'Pinterest Inc.', color: '#d62828', price: '31.43', change: '-2.89%', isPositive: false },
  ];

  const renderStockSection = (title, stocks) => (
    <div className="market-card">
      <div className="market-header">
        <div className="market-name">{title}</div>
        <a href="#" className="view-all">View All &gt;</a>
      </div>
      <div className="stocks-list">
        {stocks.map((stock) => (
          <Link
            to={`/stocks/${stock.symbol}`}
            className="stock-item"
            key={stock.symbol}
          >
            <div className="stock-info">
              <div
                className="stock-icon"
                style={{ backgroundColor: stock.color }}
              >
                {stock.symbol[0]}
              </div>
              <div className="stock-details">
                <div className="stock-symbol">{stock.symbol}</div>
                <div className="stock-name">{stock.name}</div>
              </div>
            </div>
            <div className="stock-price">
              <div className="price-value">${stock.price}</div>
              <div className={`price-change ${stock.isPositive ? 'positive' : 'negative'}`}>
                {stock.change}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Stocks</h1>
        <div className="search-filter">
          <input
            type="text"
            className="search-box"
            placeholder="Search stocks..."
          />
          <button className="filter-button">Search</button>
        </div>
      </div>

      <div className="tabs">
        {tabs.map((tabLabel, index) => (
          <button
            key={index}
            className={`tab tab-animate ${activeTab === tabLabel ? 'active' : ''}`}
            onClick={() => setActiveTab(tabLabel)}
          >
            {tabLabel}
          </button>
        ))}
      </div>

      <div className="stocks-grid">
        {renderStockSection('Popular Stocks', popularStocks)}
        {renderStockSection('Top Gainers', topGainers)}
        {renderStockSection('Top Losers', topLosers)}
      </div>
    </div>
  );
};

export default Stocks;
