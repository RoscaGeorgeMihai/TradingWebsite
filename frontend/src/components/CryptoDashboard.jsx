import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import '../styles/CryptoDashboard.css';

const CryptoDashboard = ({ cryptocurrencies, news }) => {
  const [visible, setVisible] = useState(false);
  const [visibleCryptos, setVisibleCryptos] = useState([]);
  const [visibleNews, setVisibleNews] = useState([]);

  // Set visibility after component mounts
  useEffect(() => {
    if (!cryptocurrencies || !news || cryptocurrencies.length === 0 || news.length === 0) {
      return;
    }
  
    setVisible(true);
  
    // Afișare treptată a criptomonedelor
    let index = 0;
    const cryptoInterval = setInterval(() => {
      if (index < cryptocurrencies.length) {
        setVisibleCryptos(prev => [...prev, cryptocurrencies[index]?.id]);
        index++;
      } else {
        clearInterval(cryptoInterval);
      }
    }, 300);
  
    // Afișare simultană a știrilor
    setVisibleNews(news.map(item => item.id)); // Adaugă toate ID-urile știrilor simultan
  
    return () => {
      clearInterval(cryptoInterval);
    };
  }, [cryptocurrencies, news]);
  

  return (
    <div className={`crypto-dashboard ${visible ? 'visible' : ''}`}>
      {/* Secțiunea de monede populare */}
      <div className="crypto-section">
        <div className="flex justify-between mb-4">
          <div className="flex space-x-4">
            <button className="tab-button active">Popular</button>
            <button className="tab-button inactive">New Listing</button>
          </div>
          <button className="view-all-button">View All 350+ Coins &gt;</button>
        </div>

        <div className="crypto-list">
          {cryptocurrencies.map((crypto) => (
            <div 
              key={crypto.id} 
              className={`crypto-item ${visibleCryptos.includes(crypto.id) ? 'visible' : ''}`}
            >
              <div className="flex items-center">
                <div className="crypto-icon" style={{ backgroundColor: crypto.iconColorHex }}>
                  <span className="text-white font-bold">{crypto.iconSymbol}</span>
                </div>
                <div>
                  <span className="crypto-name">{crypto.symbol}</span>
                  <span className="crypto-fullname">{crypto.name}</span>
                </div>
              </div>
              <div className="flex items-center">
                <div className="crypto-price">{crypto.price}</div>
                <div className={crypto.isPositive ? 'price-up' : 'price-down'}>
                  {crypto.change}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Secțiunea de știri */}
      <div className="news-section">
        <div className="flex justify-between mb-4">
          <h2 className="news-title">News</h2>
          <button className="view-all-button">View All News &gt;</button>
        </div>

        <div className="news-list">
          {news.map((item) => (
            <div 
              key={item.id} 
              className={`news-item ${visibleNews.includes(item.id) ? 'visible' : ''}`}
            >
              <p>{item.title}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

CryptoDashboard.propTypes = {
  cryptocurrencies: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      symbol: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      price: PropTypes.string.isRequired,
      change: PropTypes.string.isRequired,
      isPositive: PropTypes.bool.isRequired,
      iconSymbol: PropTypes.string.isRequired,
      iconColorHex: PropTypes.string.isRequired,
    })
  ).isRequired,
  news: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      title: PropTypes.string.isRequired,
    })
  ).isRequired,
};

CryptoDashboard.defaultProps = {
  cryptocurrencies: [],
  news: []
};

export default CryptoDashboard;