import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/Stocks.module.css';

const Stocks = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Categories for stock markets/sectors
  const categories = [
    { id: 'all', name: 'All Stocks' },
    { id: 'us', name: 'US Market' },
    { id: 'europe', name: 'European Market' },
    { id: 'asia', name: 'Asian Market' },
    { id: 'tech', name: 'Technology' },
    { id: 'health', name: 'Healthcare' },
    { id: 'energy', name: 'Energy' },
    { id: 'finance', name: 'Finance' },
    { id: 'consumer', name: 'Consumer' }
  ];

  // Popular stocks data with additional information
  const stocksData = [
    { 
      symbol: 'AAPL', 
      name: 'Apple Inc.', 
      color: '#0066cc', 
      price: '178.72', 
      change: '+1.25%', 
      isPositive: true,
      category: 'tech',
      marketCap: '$2.8T',
      volume: '$5.7B',
      pe: '29.3',
      ranking: 'popular'
    },
    { 
      symbol: 'GOOGL', 
      name: 'Alphabet Inc.', 
      color: '#4285f4', 
      price: '142.17', 
      change: '+0.87%', 
      isPositive: true,
      category: 'tech',
      marketCap: '$1.8T',
      volume: '$3.2B',
      pe: '24.7',
      ranking: 'popular'
    },
    { 
      symbol: 'MSFT', 
      name: 'Microsoft Corp.', 
      color: '#0077b5', 
      price: '413.56', 
      change: '+0.63%', 
      isPositive: true,
      category: 'tech',
      marketCap: '$3.1T',
      volume: '$4.9B',
      pe: '35.6',
      ranking: 'popular'
    },
    { 
      symbol: 'AMZN', 
      name: 'Amazon.com Inc.', 
      color: '#ff9900', 
      price: '180.85', 
      change: '+1.42%', 
      isPositive: true,
      category: 'consumer',
      marketCap: '$1.9T',
      volume: '$4.3B',
      pe: '72.4',
      ranking: 'popular'
    },
    { 
      symbol: 'NFLX', 
      name: 'Netflix Inc.', 
      color: '#e50914', 
      price: '687.25', 
      change: '-0.32%', 
      isPositive: false,
      category: 'tech',
      marketCap: '$301B',
      volume: '$2.1B',
      pe: '48.2',
      ranking: 'popular'
    },
    { 
      symbol: 'TSLA', 
      name: 'Tesla Inc.', 
      color: '#005e7c', 
      price: '254.33', 
      change: '+2.78%', 
      isPositive: true,
      category: 'consumer',
      marketCap: '$807B',
      volume: '$8.2B',
      pe: '68.3',
      ranking: 'popular'
    },
    // Top Gainers
    { 
      symbol: 'NVDA', 
      name: 'NVIDIA Corp.', 
      color: '#800080', 
      price: '118.77', 
      change: '+4.35%', 
      isPositive: true,
      category: 'tech',
      marketCap: '$2.9T',
      volume: '$12.7B',
      pe: '94.6',
      ranking: 'gainer'
    },
    { 
      symbol: 'PYPL', 
      name: 'PayPal Holdings', 
      color: '#007dff', 
      price: '64.22', 
      change: '+3.87%', 
      isPositive: true,
      category: 'finance',
      marketCap: '$68.3B',
      volume: '$1.9B',
      pe: '17.4',
      ranking: 'gainer'
    },
    { 
      symbol: 'SQ', 
      name: 'Block Inc.', 
      color: '#2b9348', 
      price: '76.84', 
      change: '+3.52%', 
      isPositive: true,
      category: 'finance',
      marketCap: '$47.1B',
      volume: '$1.3B',
      pe: '62.8',
      ranking: 'gainer'
    },
    { 
      symbol: 'AMD', 
      name: 'Advanced Micro Dev.', 
      color: '#0d47a1', 
      price: '156.79', 
      change: '+3.24%', 
      isPositive: true,
      category: 'tech',
      marketCap: '$253B',
      volume: '$5.8B',
      pe: '46.2',
      ranking: 'gainer'
    },
    { 
      symbol: 'SHOP', 
      name: 'Shopify Inc.', 
      color: '#087e8b', 
      price: '78.35', 
      change: '+2.98%', 
      isPositive: true,
      category: 'tech',
      marketCap: '$101B',
      volume: '$1.6B',
      pe: '91.3',
      ranking: 'gainer'
    },
    { 
      symbol: 'UBER', 
      name: 'Uber Technologies', 
      color: '#5d4c46', 
      price: '72.14', 
      change: '+2.82%', 
      isPositive: true,
      category: 'tech',
      marketCap: '$149B',
      volume: '$2.4B',
      pe: '69.5',
      ranking: 'gainer'
    },
    // Top Losers
    { 
      symbol: 'ZM', 
      name: 'Zoom Video Comm.', 
      color: '#6a0dad', 
      price: '63.45', 
      change: '-4.28%', 
      isPositive: false,
      category: 'tech',
      marketCap: '$19.2B',
      volume: '$1.1B',
      pe: '32.7',
      ranking: 'loser'
    },
    { 
      symbol: 'PLTR', 
      name: 'Palantir Tech.', 
      color: '#1aa3ff', 
      price: '22.87', 
      change: '-3.94%', 
      isPositive: false,
      category: 'tech',
      marketCap: '$50.3B',
      volume: '$2.3B',
      pe: '153.4',
      ranking: 'loser'
    },
    { 
      symbol: 'ROKU', 
      name: 'Roku Inc.', 
      color: '#3d405b', 
      price: '65.22', 
      change: '-3.65%', 
      isPositive: false,
      category: 'tech',
      marketCap: '$9.4B',
      volume: '$1.7B',
      pe: 'N/A',
      ranking: 'loser'
    },
    { 
      symbol: 'DOCU', 
      name: 'DocuSign Inc.', 
      color: '#dd1c1a', 
      price: '53.72', 
      change: '-3.38%', 
      isPositive: false,
      category: 'tech',
      marketCap: '$11B',
      volume: '$943M',
      pe: '46.8',
      ranking: 'loser'
    },
    { 
      symbol: 'CRSR', 
      name: 'Corsair Gaming', 
      color: '#1e8253', 
      price: '10.76', 
      change: '-3.26%', 
      isPositive: false,
      category: 'consumer',
      marketCap: '$1.1B',
      volume: '$210M',
      pe: '18.5',
      ranking: 'loser'
    },
    { 
      symbol: 'PINS', 
      name: 'Pinterest Inc.', 
      color: '#d62828', 
      price: '31.43', 
      change: '-2.89%', 
      isPositive: false,
      category: 'tech',
      marketCap: '$21.4B',
      volume: '$1.2B',
      pe: '77.1',
      ranking: 'loser'
    }
  ];

  // Filter stocks based on active category and search term
  const filteredStocks = stocksData.filter(stock => {
    const matchesSearch = stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         stock.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || stock.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Separate stocks by ranking
  const popularStocks = filteredStocks.filter(stock => stock.ranking === 'popular');
  const topGainers = filteredStocks.filter(stock => stock.ranking === 'gainer');
  const topLosers = filteredStocks.filter(stock => stock.ranking === 'loser');

  // Get featured stock (first popular stock or first in filtered list)
  const featuredStock = popularStocks.length > 0 ? popularStocks[0] : 
                       filteredStocks.length > 0 ? filteredStocks[0] : null;

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Stock Market</h1>
        <p className={styles.pageSubtitle}>Track real-time prices and trends across global stock markets</p>
      </div>
      
      {/* Search and filters section */}
      <div className={styles.searchContainer}>
        <input 
          type="text" 
          className={styles.searchInput} 
          placeholder="Search stocks..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className={styles.searchButton}>
          <span className={styles.searchIcon}>🔍</span>
        </button>
      </div>
      
      {/* Category filters */}
      <div className={styles.filtersContainer}>
        <div className={styles.categoryFilters}>
          {categories.map(category => (
            <button 
              key={category.id}
              className={`${styles.filterBtn} ${activeCategory === category.id ? styles.active : ''}`}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* Featured stock - only show if there are filtered stocks */}
      {featuredStock && (
        <div className={styles.featuredStock}>
          <div className={styles.featuredContent}>
            <div className={styles.featuredHeader}>
              <div 
                className={styles.stockIcon} 
                style={{ backgroundColor: featuredStock.color }}
              >
                {featuredStock.symbol[0]}
              </div>
              <div className={styles.stockInfo}>
                <h2>{featuredStock.name} <span className={styles.symbolLabel}>({featuredStock.symbol})</span></h2>
                <div className={styles.stockMeta}>
                  <span>Market Cap: {featuredStock.marketCap}</span>
                  <span>Volume: {featuredStock.volume}</span>
                  <span>P/E: {featuredStock.pe}</span>
                </div>
              </div>
            </div>
            <div className={styles.priceInfo}>
              <div className={styles.currentPrice}>
                ${featuredStock.price}
              </div>
              <div className={`${styles.priceChange} ${featuredStock.isPositive ? styles.positive : styles.negative}`}>
                {featuredStock.change}
              </div>
            </div>
            <div className={styles.stockDescription}>
              <p>
                {featuredStock.name} is a leading {featuredStock.category === 'tech' ? 'technology' : 
                  featuredStock.category === 'consumer' ? 'consumer goods' : 
                  featuredStock.category === 'finance' ? 'financial services' : 
                  featuredStock.category === 'health' ? 'healthcare' : 
                  featuredStock.category === 'energy' ? 'energy' : 'global'} company 
                with a market capitalization of {featuredStock.marketCap}.
              </p>
            </div>
            <div className={styles.tradingButtons}>
              <Link to={`/stocks/${featuredStock.symbol}`} className={styles.buyButton}>
                Buy {featuredStock.symbol}
              </Link>
              <Link to={`/stocks/${featuredStock.symbol}`} className={styles.sellButton}>
                Sell {featuredStock.symbol}
              </Link>
            </div>
          </div>
        </div>
      )}
      
      {/* Stock sections - only show if there are filtered stocks in each category */}
      <div className={styles.stockSections}>
        {popularStocks.length > 0 && (
          <div className={styles.stockSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Popular Stocks</h2>
              <Link to="/stocks/popular" className={styles.viewAllLink}>View All</Link>
            </div>
            <div className={styles.stocksGrid}>
              {popularStocks.map((stock) => (
                <Link 
                  to={`/stocks/${stock.symbol}`}
                  key={stock.symbol} 
                  className={styles.stockCard}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div className={styles.stockHeader}>
                    <div 
                      className={styles.stockIcon} 
                      style={{ backgroundColor: stock.color }}
                    >
                      {stock.symbol[0]}
                    </div>
                    <div className={styles.stockDetails}>
                      <div className={styles.stockName}>{stock.name}</div>
                      <div className={styles.stockSymbol}>{stock.symbol}</div>
                    </div>
                    <div className={styles.stockPriceInfo}>
                      <div className={styles.stockPrice}>${stock.price}</div>
                      <div className={`${styles.stockPriceChange} ${stock.isPositive ? styles.positive : styles.negative}`}>
                        {stock.change}
                      </div>
                    </div>
                  </div>
                  <div className={styles.stockFooter}>
                    <div className={styles.stockStats}>
                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>Market Cap</span>
                        <span className={styles.statValue}>{stock.marketCap}</span>
                      </div>
                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>P/E</span>
                        <span className={styles.statValue}>{stock.pe}</span>
                      </div>
                    </div>
                    <div className={styles.viewDetailsTag}>
                      View Details
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
        
        {topGainers.length > 0 && (
          <div className={styles.stockSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Top Gainers</h2>
              <Link to="/stocks/gainers" className={styles.viewAllLink}>View All</Link>
            </div>
            <div className={styles.stocksGrid}>
              {topGainers.map((stock) => (
                <Link 
                  to={`/stocks/${stock.symbol}`}
                  key={stock.symbol} 
                  className={styles.stockCard}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div className={styles.stockHeader}>
                    <div 
                      className={styles.stockIcon} 
                      style={{ backgroundColor: stock.color }}
                    >
                      {stock.symbol[0]}
                    </div>
                    <div className={styles.stockDetails}>
                      <div className={styles.stockName}>{stock.name}</div>
                      <div className={styles.stockSymbol}>{stock.symbol}</div>
                    </div>
                    <div className={styles.stockPriceInfo}>
                      <div className={styles.stockPrice}>${stock.price}</div>
                      <div className={`${styles.stockPriceChange} ${stock.isPositive ? styles.positive : styles.negative}`}>
                        {stock.change}
                      </div>
                    </div>
                  </div>
                  <div className={styles.stockFooter}>
                    <div className={styles.stockStats}>
                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>Market Cap</span>
                        <span className={styles.statValue}>{stock.marketCap}</span>
                      </div>
                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>P/E</span>
                        <span className={styles.statValue}>{stock.pe}</span>
                      </div>
                    </div>
                    <div className={styles.viewDetailsTag}>
                      View Details
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
        
        {topLosers.length > 0 && (
          <div className={styles.stockSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Top Losers</h2>
              <Link to="/stocks/losers" className={styles.viewAllLink}>View All</Link>
            </div>
            <div className={styles.stocksGrid}>
              {topLosers.map((stock) => (
                <Link 
                  to={`/stocks/${stock.symbol}`}
                  key={stock.symbol} 
                  className={styles.stockCard}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div className={styles.stockHeader}>
                    <div 
                      className={styles.stockIcon} 
                      style={{ backgroundColor: stock.color }}
                    >
                      {stock.symbol[0]}
                    </div>
                    <div className={styles.stockDetails}>
                      <div className={styles.stockName}>{stock.name}</div>
                      <div className={styles.stockSymbol}>{stock.symbol}</div>
                    </div>
                    <div className={styles.stockPriceInfo}>
                      <div className={styles.stockPrice}>${stock.price}</div>
                      <div className={`${styles.stockPriceChange} ${stock.isPositive ? styles.positive : styles.negative}`}>
                        {stock.change}
                      </div>
                    </div>
                  </div>
                  <div className={styles.stockFooter}>
                    <div className={styles.stockStats}>
                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>Market Cap</span>
                        <span className={styles.statValue}>{stock.marketCap}</span>
                      </div>
                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>P/E</span>
                        <span className={styles.statValue}>{stock.pe}</span>
                      </div>
                    </div>
                    <div className={styles.viewDetailsTag}>
                      View Details
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Show message if no stocks match filter */}
      {filteredStocks.length === 0 && (
        <div className={styles.noResults}>
          <p>No stocks found matching your criteria. Try adjusting your search or filters.</p>
        </div>
      )}
      
      {/* Market overview section */}
      <div className={styles.newsletterContainer}>
        <div className={styles.newsletterContent}>
          <h2>Stay Ahead of the Market</h2>
          <p>Subscribe to our newsletter for daily stock insights, market analysis, and trading opportunities.</p>
          <div className={styles.subscribeForm}>
            <input type="email" placeholder="Your email address" className={styles.emailInput} />
            <button className={styles.subscribeBtn}>Subscribe</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stocks;