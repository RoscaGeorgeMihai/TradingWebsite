import React from "react";
import "../styles/Home.css";
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

  const news = [
    { id: 1, title: 'Solana Governance Proposal Achieves Record Voting Participation' },
    { id: 2, title: 'Bitcoin Symbol Featured in Austin Drone Show' },
    { id: 3, title: 'Delaware Court Grants Temporary Relief in Bitcoin Mining Dispute' },
    { id: 4, title: 'Crypto News: Binance to Support Ronin (RONIN) Network Upgrade & Hard Fork on March 17, 2025' }
  ];

  return (
    <div className="homepage">
      <div className="background-image"></div>

      <div className="container mx-auto flex items-center justify-between py-8">
        
        <div className="info-section">
          <img src={usersImage} alt="Users" className="users-image"/>
          <h1 className="users-text">Over 2.5 Million Users Trust Our Platform</h1>
        </div>

        <CryptoDashboard cryptocurrencies={cryptocurrencies} news={news} />
      </div>
    </div>
  );
};

export default HomePage;
