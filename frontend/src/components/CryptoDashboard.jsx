import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import styles from '../styles/CryptoDashboard.module.css';

const CryptoDashboard = ({ cryptocurrencies, newListings, news }) => {
  const [visible, setVisible] = useState(false);
  const [visibleCryptos, setVisibleCryptos] = useState([]);
  const [visibleNews, setVisibleNews] = useState([]);
  const [activeTab, setActiveTab] = useState('popular'); // 'popular' sau 'newListing'
  
  // Selectează lista de criptomonede care va fi afișată bazată pe tab-ul activ
  const displayedCryptos = activeTab === 'popular' ? cryptocurrencies : newListings;

  useEffect(() => {
    if (!cryptocurrencies || !news || cryptocurrencies.length === 0 || news.length === 0) {
      return;
    }
    
    setVisible(true);
    // Resetăm lista de criptomonede vizibile când se schimbă tab-ul
    setVisibleCryptos([]);
    
    const timeoutIds = [];
    
    // Animație pentru afișarea progresivă a criptomonedelor
    displayedCryptos.forEach((crypto, index) => {
      const timeoutId = setTimeout(() => {
        setVisibleCryptos(prev => [...prev, crypto.id]);
      }, index * 300);
      
      timeoutIds.push(timeoutId);
    });
    
    setVisibleNews(news.map(item => item.id));
     
    return () => {
      timeoutIds.forEach(id => clearTimeout(id));
    };
  }, [cryptocurrencies, news, displayedCryptos, activeTab]);

  // Funcție pentru schimbarea tab-ului
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
    
  return (
    <div className={`${styles.cryptoDashboard} ${visible ? styles.visible : ''}`}>
      <div className={styles.cryptoSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.tabContainer}>
            <button 
              className={`${styles.tabButton} ${activeTab === 'popular' ? styles.active : styles.inactive}`}
              onClick={() => handleTabChange('popular')}
            >
              Popular
            </button>
            <button 
              className={`${styles.tabButton} ${activeTab === 'newListing' ? styles.active : styles.inactive}`}
              onClick={() => handleTabChange('newListing')}
            >
              New Listing
            </button>
          </div>
          <Link to="/crypto" className={styles.viewAllButton}>View All 350+ Coins &gt;</Link>
        </div>
        
        <div className={styles.cryptoList}>
          {displayedCryptos.map((crypto) => (
            <div
              key={crypto.id}
              className={`${styles.cryptoItem} ${visibleCryptos.includes(crypto.id) ? styles.visible : ''}`}
            >
              <div className={styles.cryptoInfo}>
                <div className={styles.cryptoIcon} style={{ backgroundColor: crypto.iconColorHex }}>
                  <span className={styles.iconSymbol}>{crypto.iconSymbol}</span>
                </div>
                <div>
                  <span className={styles.cryptoName}>{crypto.symbol}</span>
                  <span className={styles.cryptoFullname}>{crypto.name}</span>
                </div>
              </div>
              <div className={styles.priceContainer}>
                <div className={styles.cryptoPrice}>{crypto.price}</div>
                <div className={crypto.isPositive ? styles.priceUp : styles.priceDown}>
                  {crypto.change}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className={styles.newsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.newsTitle}>News</h2>
          <Link to="/news" className={styles.viewAllButton}>View All News &gt;</Link>
        </div>
        
        <div className={styles.newsList}>
          {news.map((item) => (
            <div
              key={item.id}
              className={`${styles.newsItem} ${visibleNews.includes(item.id) ? styles.visible : ''}`}
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
  newListings: PropTypes.arrayOf(
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
  ),
  news: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      title: PropTypes.string.isRequired,
    })
  ).isRequired,
};

CryptoDashboard.defaultProps = {
  cryptocurrencies: [],
  newListings: [],
  news: []
};

export default CryptoDashboard;