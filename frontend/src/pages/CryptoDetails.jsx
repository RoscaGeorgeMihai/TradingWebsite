import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from '../styles/CryptoDetails.module.css';

const CryptoDetail = ({ cryptoSymbol = "BTC" }) => {
  // State for cryptocurrency data and active tab
  const [activeTab, setActiveTab] = useState('overview');
  const [activeTimeFilter, setActiveTimeFilter] = useState('3m');
  const [cryptoData, setCryptoData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simulating cryptocurrency data loading
  useEffect(() => {
    // Here would be a real API call to fetch cryptocurrency data
    setTimeout(() => {
      const cryptosData = {
        "BTC": {
          symbol: 'BTC',
          name: 'Bitcoin',
          currentPrice: 63872.45,
          priceChange: 1245.32,
          isPositive: true,
          color: '#F7931A',
          historicalData: generateMockHistoricalData(),
          news: [
            {
              id: 1,
              title: 'Bitcoin reaches new all-time high',
              source: 'CryptoNews',
              date: 'April 6, 2025',
              snippet: 'Bitcoin surpassed $65,000, setting a new historic record amid growing institutional interest.',
              url: '#'
            },
            {
              id: 2,
              title: 'Protocol update proposed for Bitcoin',
              source: 'BlockchainReport',
              date: 'April 4, 2025',
              snippet: 'Bitcoin developer community debates a new improvement proposal that could increase transaction efficiency.',
              url: '#'
            },
            {
              id: 3,
              title: 'Bitcoin adoption grows in Latin America',
              source: 'CryptoDaily',
              date: 'March 30, 2025',
              snippet: 'Latin American countries continue to adopt Bitcoin as a payment method, with new favorable regulations in several countries in the region.',
              url: '#'
            },
            {
              id: 4,
              title: 'Bitcoin miners turning to green energy',
              source: 'EcoBlockchain',
              date: 'March 27, 2025',
              snippet: 'A growing number of Bitcoin mining companies announce switching to renewable energy sources for their operations.',
              url: '#'
            }
          ],
          financials: {
            marketCap: 1.24, // in trillions
            volume24h: 45.6, // in billions
            circulatingSupply: 19.67, // in millions
            maxSupply: 21, // in millions
            historical: [
              { year: 2022, q1: 38427, q2: 29789, q3: 19426, q4: 16547 },
              { year: 2023, q1: 28354, q2: 30129, q3: 27183, q4: 42853 },
              { year: 2024, q1: 52347, q2: 57914, q3: 58723, q4: 61284 },
              { year: 2025, q1: 63872, estimated: true }
            ]
          },
          network: {
            hashRate: '458 EH/s',
            difficulty: '72.35 T',
            blockTime: '9.64 min',
            blockReward: 3.125,
            lastHalving: 'April 2024',
            nextHalving: 'March 2028 (est.)'
          }
        }
        // Data for other cryptocurrencies would go here (ETH, XRP, etc.)
      };

      setCryptoData(cryptosData[cryptoSymbol]);
      setIsLoading(false);
    }, 800);
  }, [cryptoSymbol]);

  // Function to generate historical data for the chart
  function generateMockHistoricalData() {
    const data = [];
    const today = new Date();
    let basePrice = 60000;
    
    // Generate data for the last 180 days
    for (let i = 180; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      
      // Add random variation to price
      const volatility = Math.random() * 0.04 - 0.02; // Cryptocurrency volatility is higher
      basePrice = basePrice * (1 + volatility);
      
      data.push({
        date: date.toISOString().split('T')[0],
        price: parseFloat(basePrice.toFixed(2))
      });
    }
    
    return data;
  }
  
  // Tabs for sections
  const tabs = [
    { id: 'overview', name: 'Overview' },
    { id: 'chart', name: 'Chart' },
    { id: 'news', name: 'News' },
    { id: 'network', name: 'Network Data' },
    { id: 'analysis', name: 'Analysis' }
  ];

  // Time filters for chart
  const timeFilters = [
    { id: '1d', name: '1D' },
    { id: '1w', name: '1W' },
    { id: '1m', name: '1M' },
    { id: '3m', name: '3M' },
    { id: '6m', name: '6M' },
    { id: '1y', name: '1Y' },
    { id: '5y', name: '5Y' }
  ];

  if (isLoading) {
    return <div className={styles.loadingContainer}>Loading data...</div>;
  }

  // Calculate percentage change
  const priceChangePercent = (cryptoData.priceChange / (cryptoData.currentPrice - cryptoData.priceChange) * 100).toFixed(2);

  return (
    <div className={styles.container}>
      {/* Header with cryptocurrency information */}
      <div className={styles.stockHeader}>
        <div className={styles.stockTitle}>
          <div className={styles.stockSymbol} style={{ backgroundColor: cryptoData.color }}>
            {cryptoData.symbol.charAt(0)}
          </div>
          <div className={styles.stockName}>
            <h1>{cryptoData.symbol}</h1>
            <p>{cryptoData.name}</p>
          </div>
        </div>
        <div className={styles.stockPrice}>
          <p className={styles.currentPrice}>${cryptoData.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className={`${styles.priceChange} ${cryptoData.isPositive ? styles.positive : styles.negative}`}>
            {cryptoData.isPositive ? '+' : '-'}${Math.abs(cryptoData.priceChange).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({Math.abs(priceChangePercent)}%)
          </p>
          <button 
            className={styles.btnInvest}
            onClick={() => alert('Trading functionality will be implemented soon!')}
          >
            Invest Now
          </button>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className={styles.stockTabs}>
        {tabs.map(tab => (
          <div 
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.name}
          </div>
        ))}
      </div>

      {/* Content based on active tab */}
      <div className={styles.tabContent}>
        {activeTab === 'overview' && (
          <div className={styles.overviewSection}>
            {/* Layout with large chart */}
            <div className={styles.overviewLayout}>
              {/* Left side with price chart */}
              <div className={`${styles.largeChartContainer} ${styles.card}`}>
                <h2>Price Evolution</h2>
                <div className={styles.chartToolbar}>
                  <div className={styles.timeFilters}>
                    {timeFilters.map(filter => (
                      <button 
                        key={filter.id}
                        className={`${styles.filterBtn} ${activeTimeFilter === filter.id ? styles.active : ''}`}
                        onClick={() => setActiveTimeFilter(filter.id)}
                      >
                        {filter.name}
                      </button>
                    ))}
                  </div>
                  <div className={styles.chartTools}>
                    <button className={styles.btnIcon}>
                      <i className={styles.iconIndicator}></i>
                    </button>
                    <button className={styles.btnIcon}>
                      <i className={styles.iconFullscreen}></i>
                    </button>
                  </div>
                </div>
                <div className={styles.chartContainer}>
                  {/* Chart component would go here */}
                  <div className={styles.placeholderChart}>Chart for {activeTimeFilter} interval</div>
                </div>
              </div>

              {/* Right side with summary and news */}
              <div className={styles.sidebarContainer}>
                <div className={styles.card}>
                  <h2>Summary</h2>
                  <div className={styles.summaryGrid}>
                    <div className={styles.summaryItem}>
                      <span className={styles.label}>Market Cap</span>
                      <span className={styles.value}>${cryptoData.financials.marketCap.toFixed(2)} T</span>
                    </div>
                    <div className={styles.summaryItem}>
                      <span className={styles.label}>Volume (24h)</span>
                      <span className={styles.value}>${cryptoData.financials.volume24h.toFixed(2)} B</span>
                    </div>
                    <div className={styles.summaryItem}>
                      <span className={styles.label}>Circulating Supply</span>
                      <span className={styles.value}>{cryptoData.financials.circulatingSupply.toFixed(2)} M</span>
                    </div>
                    <div className={styles.summaryItem}>
                      <span className={styles.label}>Max Supply</span>
                      <span className={styles.value}>{cryptoData.financials.maxSupply} M</span>
                    </div>
                    <div className={styles.summaryItem}>
                      <span className={styles.label}>All-Time High</span>
                      <span className={styles.value}>$69,042</span>
                    </div>
                    <div className={styles.summaryItem}>
                      <span className={styles.label}>52-Week Low</span>
                      <span className={styles.value}>$27,845</span>
                    </div>
                    <div className={styles.summaryItem}>
                      <span className={styles.label}>Dominance</span>
                      <span className={styles.value}>51.3%</span>
                    </div>
                    <div className={styles.summaryItem}>
                      <span className={styles.label}>Rank</span>
                      <span className={styles.value}>#1</span>
                    </div>
                  </div>
                </div>
                
                <div className={styles.card}>
                  <h2>Recent News</h2>
                  <div className={`${styles.newsList} ${styles.preview}`}>
                    {cryptoData.news.slice(0, 4).map(article => (
                      <div key={article.id} className={styles.newsItem}>
                        <h3>{article.title}</h3>
                        <p className={styles.newsMeta}>{article.source} • {article.date}</p>
                        <p className={styles.newsSnippet}>{article.snippet.substring(0, 100)}...</p>
                      </div>
                    ))}
                  </div>
                  <div className={styles.buttonContainer}>
                    <button 
                      className={styles.btnOutline} 
                      onClick={() => setActiveTab('news')}
                    >
                      All News
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'chart' && (
          <div className={styles.chartSection}>
            <div className={styles.card}>
              <div className={styles.chartToolbar}>
                <div className={styles.timeFilters}>
                  {timeFilters.map(filter => (
                    <button 
                      key={filter.id}
                      className={`${styles.filterBtn} ${activeTimeFilter === filter.id ? styles.active : ''}`}
                      onClick={() => setActiveTimeFilter(filter.id)}
                    >
                      {filter.name}
                    </button>
                  ))}
                </div>
                <div className={styles.chartTools}>
                  <button className={styles.btnIcon} title="Indicators">
                    <i className={styles.iconIndicator}></i>
                  </button>
                  <button className={styles.btnIcon} title="Fullscreen">
                    <i className={styles.iconFullscreen}></i>
                  </button>
                </div>
              </div>
              <div className={styles.chartContainer}>
                {/* Chart component would go here */}
                <div className={styles.placeholderChart}>Chart for {activeTimeFilter} interval</div>
              </div>
              <div className={styles.buttonContainer}>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'news' && (
          <div className={styles.newsSection}>
            <div className={styles.card}>
              <h2>News about {cryptoData.name}</h2>
              <div className={`${styles.newsList} ${styles.full}`}>
                {cryptoData.news.map(article => (
                  <div key={article.id} className={styles.newsItem}>
                    <h3>{article.title}</h3>
                    <p className={styles.newsMeta}>{article.source} • {article.date}</p>
                    <p className={styles.newsSnippet}>{article.snippet}</p>
                    <a href={article.url} className={styles.newsLink}>Read more</a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'network' && (
          <div className={styles.networkSection}>
            <div className={styles.card}>
              <h2>Network Data</h2>
              <div className={styles.networkGrid}>
                <div className={styles.summaryItem}>
                  <span className={styles.label}>Hash Rate</span>
                  <span className={styles.value}>{cryptoData.network.hashRate}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.label}>Difficulty</span>
                  <span className={styles.value}>{cryptoData.network.difficulty}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.label}>Average Block Time</span>
                  <span className={styles.value}>{cryptoData.network.blockTime}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.label}>Block Reward</span>
                  <span className={styles.value}>{cryptoData.network.blockReward} BTC</span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.label}>Last Halving</span>
                  <span className={styles.value}>{cryptoData.network.lastHalving}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.label}>Next Halving</span>
                  <span className={styles.value}>{cryptoData.network.nextHalving}</span>
                </div>
              </div>
            </div>
            
            <div className={styles.card}>
              <h2>Address Distribution</h2>
              <div className={styles.distributionChart}>
                {/* Address distribution chart would go here */}
                <div className={styles.placeholderChart}>Distribution of addresses by balance</div>
              </div>
              <div className={styles.distributionGrid}>
                <div className={styles.summaryItem}>
                  <span className={styles.label}>Active Addresses (24h)</span>
                  <span className={styles.value}>1.24M</span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.label}>Unique Addresses</span>
                  <span className={styles.value}>48.7M</span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.label}>Whales Hold</span>
                  <span className={styles.value}>41.3%</span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.label}>Transactions/day</span>
                  <span className={styles.value}>345.2K</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className={styles.analysisSection}>
            <div className={styles.card}>
              <h2>Market Sentiment</h2>
              <div className={styles.sentimentContainer}>
                <div className={styles.sentimentGauge}>
                  <div className={styles.gaugeLabel}>Fear & Greed</div>
                  <div className={styles.gaugeValue}>78</div>
                  <div className={styles.gaugeMeter}>
                    <div className={styles.meterBar}>
                      <div className={styles.meterProgress} style={{
                        width: '78%', 
                        background: 'linear-gradient(to right, var(--secondary-color), var(--secondary-color))'
                      }}></div>
                    </div>
                    <div className={styles.meterLabels}>
                      <span>Extreme Fear</span>
                      <span>Extreme Greed</span>
                    </div>
                  </div>
                </div>
                <div className={styles.sentimentStats}>
                  <div className={styles.summaryItem}>
                    <span className={styles.label}>Social Sentiment</span>
                    <span className={styles.value}>Positive (72%)</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span className={styles.label}>Social Media Mentions (24h)</span>
                    <span className={styles.value}>158.7K</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span className={styles.label}>Google Searches</span>
                    <span className={styles.value}>+14% weekly</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className={styles.card}>
              <h2>Price Predictions</h2>
              <div className={styles.priceTargets}>
                <div className={styles.priceRange}>
                  <div className={styles.rangeContainer}>
                    <div className={styles.currentMarker} style={{left: '45%'}}></div>
                    <div className={styles.rangeBar} style={{
                      background: 'var(--secondary-color)'
                    }}></div>
                    <div className={styles.lowPrice}>$45,000</div>
                    <div className={styles.highPrice}>$85,000</div>
                  </div>
                  <div className={styles.currentPriceIndicator}>
                    <div className={styles.label}>Current Price</div>
                    <div className={styles.value}>${cryptoData.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  </div>
                </div>
                <div className={styles.targetSummary}>
                  <div className={styles.targetItem}>
                    <div className={styles.label}>Average Target (1 year)</div>
                    <div className={styles.value}>$72,500</div>
                  </div>
                  <div className={styles.targetItem}>
                    <div className={styles.label}>Maximum Target</div>
                    <div className={styles.value}>$85,000</div>
                  </div>
                  <div className={styles.targetItem}>
                    <div className={styles.label}>Minimum Target</div>
                    <div className={styles.value}>$45,000</div>
                  </div>
                  <div className={styles.targetItem}>
                    <div className={styles.label}>Potential Growth</div>
                    <div className={styles.value} style={{ color: 'var(--secondary-color)' }}>+13.5%</div>
                  </div>
                </div>
                <div className={styles.technicalIndicators}>
                  <h3>Technical Indicators</h3>
                  <div className={styles.indicatorsSummary}>
                    <div className={styles.indicatorItem}>
                      <span className={styles.label}>RSI (14)</span>
                      <span className={styles.value}>62.4</span>
                      <span className={styles.signal} style={{ 
                        backgroundColor: 'rgba(13, 202, 240, 0.1)',
                        color: 'var(--secondary-color)'
                      }}>Neutral</span>
                    </div>
                    <div className={styles.indicatorItem}>
                      <span className={styles.label}>MACD</span>
                      <span className={styles.value}>+245.3</span>
                      <span className={styles.signal} style={{ 
                        backgroundColor: 'rgba(13, 202, 240, 0.2)',
                        color: 'var(--secondary-color)'
                      }}>Buy</span>
                    </div>
                    <div className={styles.indicatorItem}>
                      <span className={styles.label}>MA (50/200)</span>
                      <span className={styles.value}>61.2K/58.7K</span>
                      <span className={styles.signal} style={{ 
                        backgroundColor: 'rgba(13, 202, 240, 0.2)',
                        color: 'var(--secondary-color)'
                      }}>Buy</span>
                    </div>
                    <div className={styles.indicatorItem}>
                      <span className={styles.label}>Bollinger Bands</span>
                      <span className={styles.value}>62.5K-65.2K</span>
                      <span className={styles.signal} style={{ 
                        backgroundColor: 'rgba(13, 202, 240, 0.1)',
                        color: 'var(--secondary-color)'
                      }}>Neutral</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// PropTypes for property validation
CryptoDetail.propTypes = {
  cryptoSymbol: PropTypes.string
};

// Default properties
CryptoDetail.defaultProps = {
  cryptoSymbol: "BTC"
};

export default CryptoDetail;