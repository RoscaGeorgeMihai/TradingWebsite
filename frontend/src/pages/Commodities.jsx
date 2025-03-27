import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from "../styles/Commodities.module.css";

const Commodities = () => {
  const [activeTab, setActiveTab] = useState('All Stocks');

  const tabs = [
    "All Commodities",
    "Agriculture",
    "Base Metals",
    "Energy",
    "Precious Metals"
  ];

  const popularCommodities = [
    { symbol: 'AAPL', name: 'Apple Inc.', color: '#0066cc', price: '178.72', change: '+1.25%', isPositive: true },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', color: '#4285f4', price: '142.17', change: '+0.87%', isPositive: true },
    { symbol: 'MSFT', name: 'Microsoft Corp.', color: '#0077b5', price: '413.56', change: '+0.63%', isPositive: true },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', color: '#ff9900', price: '180.85', change: '+1.42%', isPositive: true },
    { symbol: 'NFLX', name: 'Netflix Inc.', color: '#e50914', price: '687.25', change: '-0.32%', isPositive: false },
    { symbol: 'TSLA', name: 'Tesla Inc.', color: '#005e7c', price: '254.33', change: '+2.78%', isPositive: true },
  ];

  const renderStocksSection = (title, commodities) => (
    <div className={styles["market-card"]}>
      <div className={styles["market-header"]}>
        <div className={styles["market-name"]}>{title}</div>
        <a href="#" className={styles["view-all"]}>View All &gt;</a>
      </div>
      <div className={styles["stocks-list"]}>
        {commodities.map((commodity) => (
          <Link
            to={`/commodities/${commodity.symbol}`}
            className={styles["stock-item"]}
            key={commodity.symbol}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div className={styles["stock-info"]}>
              <div
                className={styles["stock-icon"]}
                style={{ backgroundColor: commodity.color }}
              >
                {commodity.symbol[0]}
              </div>
              <div className={styles["stock-details"]}>
                <div className={styles["stock-symbol"]}>{commodity.symbol}</div>
                <div className={styles["stock-name"]}>{commodity.name}</div>
              </div>
            </div>
            <div className={styles["stock-price"]}>
              <div className={styles["price-value"]}>${commodity.price}</div>
              <div className={`${styles["price-change"]} ${commodity.isPositive ? styles.positive : styles.negative}`}>
                {commodity.change}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles["page-header"]}>
        <h1 className={styles["page-title"]}>Commodities</h1>
        <div className={styles["search-filter"]}>
          <input
            type="text"
            className={styles["search-box"]}
            placeholder="Search commodities..."
          />
          <button className={styles["filter-button"]}>Search</button>
        </div>
      </div>

      <div className={styles.tabs}>
        {tabs.map((tabLabel, index) => (
          <button
            key={index}
            className={`${styles.tab} ${activeTab === tabLabel ? styles.active : ''}`}
            onClick={() => setActiveTab(tabLabel)}
          >
            {tabLabel}
          </button>
        ))}
      </div>
      <div className={styles["stocks-grid"]}>
        {renderStocksSection('Popular Commodities', popularCommodities)}
      </div>
    </div>
  );
};

export default Commodities;