import React, { useState, useEffect } from 'react';
import styles from '../styles/News.module.css'; // Using a separate CSS module

const News = () => {
  // State for news data and filtering
  const [activeCategory, setActiveCategory] = useState('all');
  const [newsData, setNewsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [featuredNews, setFeaturedNews] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const newsPerPage = 6;

  // Categories for filtering
  const categories = [
    { id: 'all', name: 'All Markets' },
    { id: 'crypto', name: 'Cryptocurrency' },
    { id: 'stocks', name: 'Stocks' },
    { id: 'commodities', name: 'Commodities' },
    { id: 'forex', name: 'Forex' }
  ];

  // Time filters for recency
  const timeFilters = [
    { id: 'all', name: 'All Time' },
    { id: 'today', name: 'Today' },
    { id: 'week', name: 'This Week' },
    { id: 'month', name: 'This Month' }
  ];

  const [activeTimeFilter, setActiveTimeFilter] = useState('all');

  // Simulating news data loading
  useEffect(() => {
    setTimeout(() => {
      const mockNewsData = [
        // Crypto news
        {
          id: 1,
          title: 'Bitcoin Soars Past $100,000 in Historic Rally',
          date: 'April 7, 2025',
          source: 'CryptoInsider',
          category: 'crypto',
          image: '/api/placeholder/800/450',
          snippet: 'Bitcoin has reached a new all-time high, breaking $100,000 for the first time as institutional adoption continues to grow.',
          url: '#',
          featured: true,
          relatedAssets: ['BTC', 'ETH']
        },
        {
          id: 2,
          title: 'Ethereum 3.0 Launch Date Confirmed for June',
          date: 'April 6, 2025',
          source: 'BlockchainReporter',
          category: 'crypto',
          image: '/api/placeholder/800/450',
          snippet: 'Ethereum developers have confirmed that the highly anticipated 3.0 upgrade will launch in June, promising significant improvements in scalability and energy efficiency.',
          url: '#',
          featured: false,
          relatedAssets: ['ETH']
        },
        {
          id: 3,
          title: 'Major Bank Announces Crypto Custody Services for Institutional Clients',
          date: 'April 5, 2025',
          source: 'FinanceDaily',
          category: 'crypto',
          image: '/api/placeholder/800/450',
          snippet: 'One of the world\'s largest banks has announced it will begin offering cryptocurrency custody services to institutional clients, marking another milestone for mainstream crypto adoption.',
          url: '#',
          featured: false,
          relatedAssets: ['BTC', 'ETH', 'XRP']
        },
        
        // Stock news
        {
          id: 4,
          title: 'Tech Giant Exceeds Earnings Expectations by 30%',
          date: 'April 7, 2025',
          source: 'MarketWatch',
          category: 'stocks',
          image: '/api/placeholder/800/450',
          snippet: 'The leading tech company has reported quarterly earnings that surpassed Wall Street expectations by 30%, driven by strong growth in cloud services and AI solutions.',
          url: '#',
          featured: true,
          relatedAssets: ['TECH', 'AI']
        },
        {
          id: 5,
          title: 'Healthcare Stocks Rally Following New Medical Breakthrough',
          date: 'April 6, 2025',
          source: 'StockAnalyst',
          category: 'stocks',
          image: '/api/placeholder/800/450',
          snippet: 'Healthcare stocks are seeing significant gains after a major pharmaceutical company announced a breakthrough in cancer treatment technology.',
          url: '#',
          featured: false,
          relatedAssets: ['PHRM', 'MEDX']
        },
        {
          id: 6,
          title: 'Electric Vehicle Manufacturer Expands into Asian Markets',
          date: 'April 5, 2025',
          source: 'AutoIndustryNews',
          category: 'stocks',
          image: '/api/placeholder/800/450',
          snippet: 'A leading electric vehicle company has announced plans to expand manufacturing capabilities in Asian markets, potentially increasing global production by 40%.',
          url: '#',
          featured: false,
          relatedAssets: ['EV1', 'AUTO']
        },
        
        // Commodities news
        {
          id: 7,
          title: 'Gold Prices Surge as Global Uncertainties Rise',
          date: 'April 7, 2025',
          source: 'CommodityNews',
          category: 'commodities',
          image: '/api/placeholder/800/450',
          snippet: 'Gold hit new highs this month as investors seek safe havens amid economic uncertainty and inflation concerns.',
          url: '#',
          featured: true,
          relatedAssets: ['GOLD', 'SILVER']
        },
        {
          id: 8,
          title: 'Oil Prices Decline as Inventory Levels Build',
          date: 'April 6, 2025',
          source: 'EnergyNews',
          category: 'commodities',
          image: '/api/placeholder/800/450',
          snippet: 'Crude oil prices fell as U.S. stockpiles increased beyond analyst expectations.',
          url: '#',
          featured: false,
          relatedAssets: ['OIL', 'NG']
        },
        {
          id: 9,
          title: 'Agricultural Commodities Face Pressure from Changing Climate Patterns',
          date: 'April 5, 2025',
          source: 'AgricultureDaily',
          category: 'commodities',
          image: '/api/placeholder/800/450',
          snippet: 'Corn and wheat futures are experiencing volatility as farmers deal with unpredictable weather patterns across major growing regions.',
          url: '#',
          featured: false,
          relatedAssets: ['CORN', 'WHEAT']
        },
        
        // Forex news
        {
          id: 10,
          title: 'Dollar Strengthens Against Major Currencies Following Fed Announcement',
          date: 'April 7, 2025',
          source: 'ForexTrader',
          category: 'forex',
          image: '/api/placeholder/800/450',
          snippet: 'The U.S. dollar gained strength against major currencies after the Federal Reserve signaled potential interest rate adjustments.',
          url: '#',
          featured: true,
          relatedAssets: ['USD', 'EUR']
        },
        {
          id: 11,
          title: 'Euro Weakens Amid European Economic Growth Concerns',
          date: 'April 6, 2025',
          source: 'EuropeanFinance',
          category: 'forex',
          image: '/api/placeholder/800/450',
          snippet: 'The euro has declined against multiple currencies as recent economic data from the eurozone raises concerns about growth prospects.',
          url: '#',
          featured: false,
          relatedAssets: ['EUR', 'GBP']
        },
        {
          id: 12,
          title: 'Japanese Yen Shows Resilience Despite Economic Headwinds',
          date: 'April 5, 2025',
          source: 'AsianMarkets',
          category: 'forex',
          image: '/api/placeholder/800/450',
          snippet: 'The Japanese yen has maintained stability against major trading partners despite ongoing economic challenges in the region.',
          url: '#',
          featured: false,
          relatedAssets: ['JPY', 'USD']
        }
      ];

      // Set featured news
      const featured = mockNewsData.filter(item => item.featured);
      setFeaturedNews(featured[0]);

      // Set all news
      setNewsData(mockNewsData);
      setIsLoading(false);
    }, 800);
  }, []);

  // Filter news based on active category and search query
  const filteredNews = newsData.filter(news => {
    const matchesCategory = activeCategory === 'all' || news.category === activeCategory;
    const matchesSearch = news.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          news.snippet.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Pagination
  const indexOfLastNews = currentPage * newsPerPage;
  const indexOfFirstNews = indexOfLastNews - newsPerPage;
  const currentNews = filteredNews.slice(indexOfFirstNews, indexOfLastNews);
  const totalPages = Math.ceil(filteredNews.length / newsPerPage);

  // Page change handler
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return <div className={styles.loadingContainer}>Loading latest news...</div>;
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <h1>Market News</h1>
        <p>Stay up to date with the latest developments across all financial markets</p>
      </div>

      {/* Search bar */}
      <div className={styles.searchContainer}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search news..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
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
        <div className={styles.timeFilters}>
          {timeFilters.map(filter => (
            <button 
              key={filter.id}
              className={`${styles.filterBtn} ${styles.timeFilter} ${activeTimeFilter === filter.id ? styles.active : ''}`}
              onClick={() => setActiveTimeFilter(filter.id)}
            >
              {filter.name}
            </button>
          ))}
        </div>
      </div>

      {/* Featured news section - shown only on "all" category */}
      {activeCategory === 'all' && featuredNews && (
        <div className={styles.featuredNews}>
          <div className={styles.featuredContent}>
            <span className={styles.featuredLabel}>Featured Story</span>
            <h2>{featuredNews.title}</h2>
            <p className={styles.newsMeta}>{featuredNews.source} • {featuredNews.date}</p>
            <p className={styles.newsSnippet}>{featuredNews.snippet}</p>
            <div className={styles.relatedAssets}>
              {featuredNews.relatedAssets.map(asset => (
                <span key={asset} className={styles.assetTag}>{asset}</span>
              ))}
            </div>
            <a href={featuredNews.url} className={styles.readMoreBtn}>Read Full Story</a>
          </div>
          <div className={styles.featuredImage}>
            <img src={featuredNews.image} alt={featuredNews.title} />
          </div>
        </div>
      )}

      {/* News grid */}
      <div className={styles.newsGrid}>
        {currentNews.length > 0 ? (
          currentNews.map(news => (
            <div key={news.id} className={styles.newsCard}>
              <div className={styles.newsImageContainer}>
                <img src={news.image} alt={news.title} className={styles.newsImage} />
                <span className={styles.categoryBadge}>{categories.find(cat => cat.id === news.category).name}</span>
              </div>
              <div className={styles.newsContent}>
                <h3>{news.title}</h3>
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
          ))
        ) : (
          <div className={styles.noResults}>
            <p>No news found matching your criteria. Try adjusting your filters.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredNews.length > newsPerPage && (
        <div className={styles.pagination}>
          <button 
            className={`${styles.pageBtn} ${currentPage === 1 ? styles.disabled : ''}`}
            onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
            <button
              key={number}
              className={`${styles.pageBtn} ${currentPage === number ? styles.activePage : ''}`}
              onClick={() => handlePageChange(number)}
            >
              {number}
            </button>
          ))}
          
          <button
            className={`${styles.pageBtn} ${currentPage === totalPages ? styles.disabled : ''}`}
            onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      {/* Newsletter subscription */}
      <div className={styles.newsletterContainer}>
        <div className={styles.newsletterContent}>
          <h2>Stay Ahead of the Market</h2>
          <p>Subscribe to our newsletter and receive daily market updates directly to your inbox.</p>
          <div className={styles.subscribeForm}>
            <input type="email" placeholder="Your email address" className={styles.emailInput} />
            <button className={styles.subscribeBtn}>Subscribe</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default News;