import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styles from '../styles/CryptoDashboard.module.css';

const CryptoDashboard = ({ cryptocurrencies, news }) => {
  const [visible, setVisible] = useState(false);
  const [visibleCryptos, setVisibleCryptos] = useState([]);
  const [visibleNews, setVisibleNews] = useState([]);

  useEffect(() => {
    if (!cryptocurrencies || !news || cryptocurrencies.length === 0 || news.length === 0) {
      return;
    }
    
    setVisible(true);
    
    let index = 0;
    const cryptoInterval = setInterval(() => {
      if (index < cryptocurrencies.length) {
        setVisibleCryptos(prev => [...prev, cryptocurrencies[index]?.id]);
        index++;
      } else {
        clearInterval(cryptoInterval);
      }
    }, 300);
    
    setVisibleNews(news.map(item => item.id));
     
    return () => {
      clearInterval(cryptoInterval);
    };
  }, [cryptocurrencies, news]);
    
  return (
    <div className={`${styles.cryptoDashboard} ${visible ? styles.visible : ''}`}>
      <div className={styles.cryptoSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.tabContainer}>
            <button className={`${styles.tabButton} ${styles.active}`}>Popular</button>
            <button className={`${styles.tabButton} ${styles.inactive}`}>New Listing</button>
          </div>
          <button className={styles.viewAllButton}>View All 350+ Coins &gt;</button>
        </div>
        
        <div className={styles.cryptoList}>
          {cryptocurrencies.map((crypto) => (
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
          <button className={styles.viewAllButton}>View All News &gt;</button>
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