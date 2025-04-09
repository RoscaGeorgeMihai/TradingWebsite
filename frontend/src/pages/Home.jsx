import React from "react";
import styles from "../styles/Home.module.css";
import CryptoDashboard from "../components/CryptoDashboard.jsx";
import usersImage from "../assets/users.png";

const HomePage = () => {
  const cryptocurrencies = [
    { id: 'btc', symbol: 'BTC', name: 'Bitcoin', price: '$82,055.76', change: '-1.74%', isPositive: false, iconColorHex: '#f39c12', iconSymbol: '₿' },
    { id: 'eth', symbol: 'ETH', name: 'Ethereum', price: '$1,893.40', change: '+0.92%', isPositive: true, iconColorHex: '#3498db', iconSymbol: 'Ξ' },
    { id: 'bnb', symbol: 'BNB', name: 'BNB', price: '$580.37', change: '+0.47%', isPositive: true, iconColorHex: '#f1c40f', iconSymbol: 'B' },
    { id: 'xrp', symbol: 'XRP', name: 'XRP', price: '$2.30', change: '+2.55%', isPositive: true, iconColorHex: '#7f8c8d', iconSymbol: 'X' },
    { id: 'sol', symbol: 'SOL', name: 'Solana', price: '$124.84', change: '+0.43%', isPositive: true, iconColorHex: '#9b59b6', iconSymbol: 'S' }
  ];
  
  const newListings = [
    { id: 'sui', symbol: 'SUI', name: 'Sui Network', price: '$1.45', change: '+5.67%', isPositive: true, iconColorHex: '#27ae60', iconSymbol: 'S' },
    { id: 'dydx', symbol: 'DYDX', name: 'dYdX', price: '$3.89', change: '+12.3%', isPositive: true, iconColorHex: '#8e44ad', iconSymbol: 'D' },
    { id: 'arb', symbol: 'ARB', name: 'Arbitrum', price: '$1.17', change: '+8.25%', isPositive: true, iconColorHex: '#2980b9', iconSymbol: 'A' },
    { id: 'ton', symbol: 'TON', name: 'Toncoin', price: '$5.72', change: '+4.16%', isPositive: true, iconColorHex: '#16a085', iconSymbol: 'T' },
    { id: 'sei', symbol: 'SEI', name: 'Sei Network', price: '$0.87', change: '+15.21%', isPositive: true, iconColorHex: '#c0392b', iconSymbol: 'S' }
  ];
  
  const news = [
    { id: 1, title: 'Solana Governance Proposal Achieves Record Voting Participation' },
    { id: 2, title: 'Bitcoin Symbol Featured in Austin Drone Show' },
    { id: 3, title: 'Delaware Court Grants Temporary Relief in Bitcoin Mining Dispute' },
    { id: 4, title: 'Crypto News: Binance to Support Ronin (RONIN) Network Upgrade & Hard Fork on March 17, 2025' }
  ];

  return (
    <div className={styles.homepage}>
      <div className={styles.backgroundImage}></div>
      
      <div className={styles.container}>
        <div className={styles.infoSection}>
          <img src={usersImage} alt="Users" className={styles.usersImage}/>
          <h1 className={styles.usersText}>
            Over <span className={styles.accent}>2.5 Million</span> Users Trust Our Platform
          </h1>
        </div>
        
        <CryptoDashboard 
          cryptocurrencies={cryptocurrencies} 
          newListings={newListings} 
          news={news} 
        />
      </div>
    </div>
  );
};

export default HomePage;