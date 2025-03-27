import React, { useState } from 'react';
import '../styles/Portfolio.css';

const Portfolio = () => {
  const [portfolioData, setPortfolioData] = useState({
    totalValue: 85432.67,
    dailyChange: 1.35,
    assets: [
      { 
        symbol: 'AAPL', 
        name: 'Apple Inc.', 
        price: 178.72, 
        quantity: 15, 
        value: 2680.80, 
        changePercent: 1.25,
        allocation: 12,
        color: '#0088FE'
      },
      { 
        symbol: 'GOOGL', 
        name: 'Alphabet Inc.', 
        price: 142.17, 
        quantity: 10, 
        value: 1421.70, 
        changePercent: 0.87,
        allocation: 8,
        color: '#00C49F'
      },
      { 
        symbol: 'MSFT', 
        name: 'Microsoft Corp.', 
        price: 413.56, 
        quantity: 25, 
        value: 10339.00, 
        changePercent: 0.63,
        allocation: 28,
        color: '#FFBB28'
      },
      { 
        symbol: 'AMZN', 
        name: 'Amazon.com Inc.', 
        price: 180.85, 
        quantity: 18, 
        value: 3255.30, 
        changePercent: 1.42,
        allocation: 14,
        color: '#FF8042'
      },
      { 
        symbol: 'BTC', 
        name: 'Bitcoin', 
        price: 61245.30, 
        quantity: 0.7, 
        value: 42871.71, 
        changePercent: 2.15,
        allocation: 38,
        color: '#9146FF'
      }
    ],
    transactions: [
      { id: 1, date: '2025-03-15', type: 'Cumpărare', symbol: 'AAPL', quantity: 5, price: 175.32, total: 876.60 },
      { id: 2, date: '2025-03-10', type: 'Vânzare', symbol: 'MSFT', quantity: 2, price: 410.25, total: 820.50 },
      { id: 3, date: '2025-03-05', type: 'Cumpărare', symbol: 'BTC', quantity: 0.2, price: 59320.45, total: 11864.09 },
      { id: 4, date: '2025-03-01', type: 'Cumpărare', symbol: 'AMZN', quantity: 3, price: 178.65, total: 535.95 },
      { id: 5, date: '2025-02-25', type: 'Vânzare', symbol: 'GOOGL', quantity: 2, price: 140.35, total: 280.70 },
    ]
  });

  const [activeFilter, setActiveFilter] = useState('all');

  return (
    <div>
      <div className="container">
        <h1>Portofoliul meu</h1>
        
        <div className="portfolio-summary">
          <div className="flex-between">
            <div>
              <p className="text-secondary">Valoare totală</p>
              <h2 className="portfolio-total">${portfolioData.totalValue.toLocaleString()}</h2>
            </div>
            <div className="text-right">
              <p className="text-secondary">Schimbare zilnică</p>
              <p className={`portfolio-change ${portfolioData.dailyChange >= 0 ? 'text-success' : 'text-danger'}`}>
                {portfolioData.dailyChange >= 0 ? '+' : ''}{portfolioData.dailyChange}%
              </p>
            </div>
          </div>
        </div>
        
        <div className="grid-container">
          <div>
            <div className="card">
              <div className="card-header">
                <h3>Active</h3>
                <button className="btn btn-primary">
                  Adaugă active
                </button>
              </div>
              
              <div className="card-body table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>Simbol</th>
                      <th>Nume</th>
                      <th className="text-right">Preț</th>
                      <th className="text-right">Cantitate</th>
                      <th className="text-right">Valoare</th>
                      <th className="text-right">Schimbare</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolioData.assets.map((asset, index) => (
                      <tr key={index}>
                        <td>
                          <div className="flex-center">
                            <div className="asset-icon" style={{ backgroundColor: asset.color }}>
                              {asset.symbol.charAt(0)}
                            </div>
                            {asset.symbol}
                          </div>
                        </td>
                        <td>{asset.name}</td>
                        <td className="text-right">${asset.price.toLocaleString()}</td>
                        <td className="text-right">{asset.quantity}</td>
                        <td className="text-right">${asset.value.toLocaleString()}</td>
                        <td className={`text-right ${asset.changePercent >= 0 ? 'text-success' : 'text-danger'}`}>
                          {asset.changePercent >= 0 ? '+' : ''}{asset.changePercent}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="card">
              <div className="card-header">
                <h3>Tranzacții recente</h3>
                <div className="filter-buttons">
                  <button 
                    className={`btn-filter ${activeFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('all')}
                  >
                    Toate
                  </button>
                  <button 
                    className={`btn-filter ${activeFilter === 'buy' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('buy')}
                  >
                    Cumpărări
                  </button>
                  <button 
                    className={`btn-filter ${activeFilter === 'sell' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('sell')}
                  >
                    Vânzări
                  </button>
                </div>
              </div>
              
              <div className="card-body table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Tip</th>
                      <th>Simbol</th>
                      <th className="text-right">Cantitate</th>
                      <th className="text-right">Preț</th>
                      <th className="text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolioData.transactions
                      .filter(transaction => {
                        if (activeFilter === 'all') return true;
                        if (activeFilter === 'buy') return transaction.type === 'Cumpărare';
                        if (activeFilter === 'sell') return transaction.type === 'Vânzare';
                        return true;
                      })
                      .map((transaction) => (
                        <tr key={transaction.id}>
                          <td>{transaction.date}</td>
                          <td className={transaction.type === 'Cumpărare' ? 'text-success' : 'text-danger'}>
                            {transaction.type}
                          </td>
                          <td>{transaction.symbol}</td>
                          <td className="text-right">{transaction.quantity}</td>
                          <td className="text-right">${transaction.price}</td>
                          <td className="text-right">${transaction.total.toLocaleString()}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          <div>
            <div className="card">
              <div className="card-header">
                <h3>Alocarea activelor</h3>
              </div>
              <div className="card-body">
                <div className="pie-chart-container">
                  <div className="pie-chart"
                       style={{ 
                         background: `conic-gradient(
                           ${portfolioData.assets.map((asset, index, array) => {
                             const startPercent = array.slice(0, index).reduce((sum, a) => sum + a.allocation, 0);
                             return `${asset.color} ${startPercent}% ${startPercent + asset.allocation}%`;
                           }).join(', ')}
                         )`
                       }}>
                  </div>
                </div>
                <div className="legend">
                  {portfolioData.assets.map((asset, index) => (
                    <div key={index} className="legend-item">
                      <div className="flex-center">
                        <div className="color-indicator" style={{ backgroundColor: asset.color }}></div>
                        <span>{asset.symbol}</span>
                      </div>
                      <span>{asset.allocation}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="card-header">
                <h3>Performanță</h3>
              </div>
              <div className="card-body">
                <div className="progress-container">
                  <div className="progress-label">
                    <span>Astăzi</span>
                    <span className="text-success">+1.35%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill success" style={{ width: '60%' }}></div>
                  </div>
                </div>
                <div className="progress-container">
                  <div className="progress-label">
                    <span>Săptămâna aceasta</span>
                    <span className="text-success">+3.72%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill success" style={{ width: '78%' }}></div>
                  </div>
                </div>
                <div className="progress-container">
                  <div className="progress-label">
                    <span>Luna aceasta</span>
                    <span className="text-success">+8.45%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill success" style={{ width: '85%' }}></div>
                  </div>
                </div>
                <div className="progress-container">
                  <div className="progress-label">
                    <span>Anual</span>
                    <span className="text-danger">-2.15%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill danger" style={{ width: '35%' }}></div>
                  </div>
                </div>
                <div className="progress-container">
                  <div className="progress-label">
                    <span>Total</span>
                    <span className="text-success">+24.67%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill success" style={{ width: '92%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;