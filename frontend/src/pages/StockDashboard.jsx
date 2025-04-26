import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/StockDashboard.module.css';
import api from '../services/axios';

const FINNHUB_API_KEY = 'cvtcg9hr01qhup0vkq3gcvtcg9hr01qhup0vkq40';

const StockDashboard = () => {
  const [popularStocks, setPopularStocks] = useState([]);
  const [newStocks, setNewStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stockPrices, setStockPrices] = useState({});
  const [isVisible, setIsVisible] = useState(false);
  const [newsData, setNewsData] = useState([]);

  // Funcție separată pentru actualizarea prețurilor
  const updatePrices = async () => {
    try {
      // Verificăm dacă avem stocuri înainte de a face request-ul
      if (popularStocks.length === 0 && newStocks.length === 0) {
        console.log('No stocks available for price update');
        return;
      }

      const allSymbols = [...new Set([
        ...popularStocks.map(stock => stock.symbol),
        ...newStocks.map(stock => stock.symbol)
      ])];

      // Verificăm dacă avem simboluri înainte de a face request-ul
      if (allSymbols.length === 0) {
        console.log('No symbols available for price update');
        return;
      }

      console.log('Fetching prices for symbols:', allSymbols);

      const quotesResponse = await api.get('/marketstack/intraday/latest', {
        params: { symbols: allSymbols.join(',') }
      });

      if (quotesResponse.data && quotesResponse.data.data) {
        const quotesMap = {};
        quotesResponse.data.data.forEach(quote => {
          if (quote.symbol) {
            quotesMap[quote.symbol] = {
              price: quote.last || quote.close || 0,
              changePercent: quote.change_percent || 0
            };
          }
        });
        setStockPrices(quotesMap);
      }
    } catch (err) {
      console.error('Error updating prices:', err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch popular stocks
        const popularResponse = await api.get('/api/admin/stocks/popular');
        setPopularStocks(popularResponse.data);

        // Fetch all stocks and sort by creation date to get the newest ones
        const allStocksResponse = await api.get('/api/stocks');
        const sortedStocks = allStocksResponse.data.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setNewStocks(sortedStocks.slice(0, 5));

        // Fetch news
        const newsResponse = await fetch(
          `https://finnhub.io/api/v1/news?category=general&token=${FINNHUB_API_KEY}`
        );
        
        if (!newsResponse.ok) {
          throw new Error('Failed to fetch news');
        }

        const newsData = await newsResponse.json();
        
        // Transform Finnhub data to match our UI structure
        const transformedNews = newsData.map((item, index) => ({
          id: index,
          title: item.headline,
          date: new Date(item.datetime * 1000).toLocaleDateString(),
          source: item.source,
          image: item.image || '/api/placeholder/800/450',
          snippet: item.summary,
          url: item.url,
          relatedAssets: item.related || []
        }));

        setNewsData(transformedNews.slice(0, 4)); // Take only first 4 news items
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load stock data. Please try again later.');
      } finally {
        setLoading(false);
        setTimeout(() => setIsVisible(true), 100);
      }
    };

    fetchData();
  }, []);

  // Efect separat pentru actualizarea prețurilor
  useEffect(() => {
    // Actualizăm prețurile doar când avem stocuri
    if (popularStocks.length > 0 || newStocks.length > 0) {
      updatePrices();
      // Set up interval to refresh only prices every 30 seconds
      const interval = setInterval(updatePrices, 30000);
      return () => clearInterval(interval);
    }
  }, [popularStocks, newStocks]); // Rulează când se schimbă stocurile

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatChange = (change) => {
    const formattedChange = parseFloat(change).toFixed(2);
    return `${formattedChange}%`;
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading stock data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className={`${styles.cryptoDashboard} ${isVisible ? styles.visible : ''}`}>
      <div className={styles.cryptoSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.newsTitle}>Popular Stocks</h2>
          <Link to="/stocks" className={styles.viewAllButton}>
            View All
          </Link>
        </div>
        <div className={styles.cryptoList}>
          {popularStocks.map((stock, index) => {
            const priceData = stockPrices[stock.symbol] || {};
            return (
              <Link
                to={`/stocks/${stock.symbol}`}
                key={stock.symbol}
                className={`${styles.cryptoItem} ${isVisible ? styles.visible : ''}`}
                style={{ 
                  textDecoration: 'none', 
                  color: 'inherit',
                  transitionDelay: `${index * 100}ms`
                }}
              >
                <div className={styles.cryptoInfo}>
                  <div
                    className={styles.cryptoIcon}
                    style={{ backgroundColor: stock.color || '#0dcaf0' }}
                  >
                    <span className={styles.iconSymbol}>{stock.symbol[0]}</span>
                  </div>
                  <div>
                    <span className={styles.cryptoName}>{stock.name}</span>
                    <span className={styles.cryptoFullname}>{stock.symbol}</span>
                  </div>
                </div>
                <div className={styles.priceContainer}>
                  <div className={styles.cryptoPrice}>
                    {priceData.price ? formatPrice(priceData.price) : 'Loading...'}
                  </div>
                  <div className={priceData.changePercent >= 0 ? styles.priceUp : styles.priceDown}>
                    {priceData.changePercent ? formatChange(priceData.changePercent) : '0.00%'}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className={styles.cryptoSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.newsTitle}>New Listings</h2>
          <Link to="/stocks" className={styles.viewAllButton}>
            View All
          </Link>
        </div>
        <div className={styles.cryptoList}>
          {newStocks.map((stock, index) => {
            const priceData = stockPrices[stock.symbol] || {};
            return (
              <Link
                to={`/stocks/${stock.symbol}`}
                key={stock.symbol}
                className={`${styles.cryptoItem} ${isVisible ? styles.visible : ''}`}
                style={{ 
                  textDecoration: 'none', 
                  color: 'inherit',
                  transitionDelay: `${index * 100}ms`
                }}
              >
                <div className={styles.cryptoInfo}>
                  <div
                    className={styles.cryptoIcon}
                    style={{ backgroundColor: stock.color || '#0dcaf0' }}
                  >
                    <span className={styles.iconSymbol}>{stock.symbol[0]}</span>
                  </div>
                  <div>
                    <span className={styles.cryptoName}>{stock.name}</span>
                    <span className={styles.cryptoFullname}>{stock.symbol}</span>
                  </div>
                </div>
                <div className={styles.priceContainer}>
                  <div className={styles.cryptoPrice}>
                    {priceData.price ? formatPrice(priceData.price) : 'Loading...'}
                  </div>
                  <div className={priceData.changePercent >= 0 ? styles.priceUp : styles.priceDown}>
                    {priceData.changePercent ? formatChange(priceData.changePercent) : '0.00%'}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className={styles.newsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.newsTitle}>Latest News</h2>
          <Link to="/news" className={styles.viewAllButton}>
            View All
          </Link>
        </div>
        <div className={styles.newsList}>
          {newsData.map((news, index) => (
            <div 
              key={news.id} 
              className={`${styles.newsItem} ${isVisible ? styles.visible : ''}`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className={styles.newsContent}>
                <h3 className={styles.newsTitle}>{news.title}</h3>
                <p className={styles.newsMeta}>{news.source} • {news.date}</p>
                <p className={styles.newsSnippet}>{news.snippet}</p>
                <div className={styles.newsFooter}>
                  <div className={styles.relatedAssets}>
                    {news.relatedAssets.map(asset => (
                      <span key={asset} className={styles.assetTag}>{asset}</span>
                    ))}
                  </div>
                  <a href={news.url} className={styles.readMore}>Read more →</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StockDashboard; 