import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from '../styles/StockDetails.module.css';

const StockDetail = ({ stockSymbol = "AAPL" }) => {
  // State for stock data and active tab
  const [activeTab, setActiveTab] = useState('overview');
  const [activeTimeFilter, setActiveTimeFilter] = useState('3m');
  const [stockData, setStockData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading stock data
  useEffect(() => {
    // This would be a real API call to get stock data
    setTimeout(() => {
      const stocksData = {
        "AAPL": {
          symbol: 'AAPL',
          name: 'Apple Inc.',
          currentPrice: 178.72,
          priceChange: 1.25,
          isPositive: true,
          color: '#1976d2',
          historicalData: generateMockHistoricalData(),
          news: [
            {
              id: 1,
              title: 'Apple announces new iPhone 16 launch',
              source: 'TechNews',
              date: 'April 3, 2025',
              snippet: 'Apple announced today the launch of the new iPhone 16, which will feature advanced AI capabilities and improved battery life.',
              url: '#'
            },
            {
              id: 2,
              title: 'Mac sales increase by 15% in Q1 2025',
              source: 'Financial Report',
              date: 'April 1, 2025',
              snippet: 'Apple reports an impressive growth in Mac sales in the first quarter of 2025, exceeding analyst expectations.',
              url: '#'
            },
            {
              id: 3,
              title: 'Apple expands services in Eastern Europe',
              source: 'BusinessDaily',
              date: 'March 28, 2025',
              snippet: 'The tech giant is increasing its presence in Eastern Europe with new development centers and expanded services for users.',
              url: '#'
            },
            {
              id: 4,
              title: 'iOS 19.2 update brings new security features',
              source: 'TechInsider',
              date: 'March 25, 2025',
              snippet: 'The new system update brings significant improvements for user data protection and overall performance.',
              url: '#'
            }
          ],
          financials: {
            revenue: [
              { year: 2022, value: 394.33 },
              { year: 2023, value: 383.29 },
              { year: 2024, value: 391.42 },
              { year: 2025, value: 412.68, estimated: true }
            ],
            eps: [
              { year: 2022, value: 6.11 },
              { year: 2023, value: 5.89 },
              { year: 2024, value: 6.35 },
              { year: 2025, value: 6.78, estimated: true }
            ],
            peRatio: 26.36,
            dividendYield: 0.51,
            marketCap: 2.78 // in trillions
          }
        }
        // Data for other stocks would go here (MSFT, GOOGL, etc)
      };

      setStockData(stocksData[stockSymbol]);
      setIsLoading(false);
    }, 800);
  }, [stockSymbol]);

  // Function to generate historical data for the chart
  function generateMockHistoricalData() {
    const data = [];
    const today = new Date();
    let basePrice = 175;
    
    // Generate data for the last 180 days
    for (let i = 180; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      
      // Add random variation to price
      const randomChange = (Math.random() - 0.5) * 3;
      basePrice += randomChange;
      
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
    { id: 'financials', name: 'Financial Data' },
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

  return (
    <div className={styles.container}>
      {/* Header with stock information */}
      <div className={styles.stockHeader}>
        <div className={styles.stockTitle}>
          <div className={styles.stockSymbol} style={{ backgroundColor: stockData.color }}>
            {stockData.symbol.charAt(0)}
          </div>
          <div className={styles.stockName}>
            <h1>{stockData.symbol}</h1>
            <p>{stockData.name}</p>
          </div>
        </div>
        <div className={styles.stockPrice}>
          <p className={styles.currentPrice}>${stockData.currentPrice.toFixed(2)}</p>
          <p className={`${styles.priceChange} ${stockData.isPositive ? styles.positive : styles.negative}`}>
            {stockData.isPositive ? '+' : '-'}${Math.abs(stockData.priceChange).toFixed(2)} ({Math.abs(stockData.priceChange / (stockData.currentPrice - stockData.priceChange) * 100).toFixed(2)}%)
          </p>
          <button 
            className={styles.btnInvest}
            onClick={() => alert('Investment functionality will be implemented soon!')}
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
            {/* Modified layout with larger chart */}
            <div className={styles.overviewLayout}>
              {/* Left side with price chart */}
              <div className={`${styles.largeChartContainer} ${styles.card}`}>
                <h2>Price Chart</h2>
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
                      <span className={styles.value}>${stockData.financials.marketCap.toFixed(2)} T</span>
                    </div>
                    <div className={styles.summaryItem}>
                      <span className={styles.label}>P/E Ratio</span>
                      <span className={styles.value}>{stockData.financials.peRatio}</span>
                    </div>
                    <div className={styles.summaryItem}>
                      <span className={styles.label}>Dividend Yield</span>
                      <span className={styles.value}>{stockData.financials.dividendYield}%</span>
                    </div>
                    <div className={styles.summaryItem}>
                      <span className={styles.label}>52-Week High</span>
                      <span className={styles.value}>$207.35</span>
                    </div>
                    <div className={styles.summaryItem}>
                      <span className={styles.label}>52-Week Low</span>
                      <span className={styles.value}>$162.14</span>
                    </div>
                    <div className={styles.summaryItem}>
                      <span className={styles.label}>Avg. Volume</span>
                      <span className={styles.value}>56.2M</span>
                    </div>
                    <div className={styles.summaryItem}>
                      <span className={styles.label}>Beta</span>
                      <span className={styles.value}>1.32</span>
                    </div>
                    <div className={styles.summaryItem}>
                      <span className={styles.label}>Shares Outstanding</span>
                      <span className={styles.value}>15.6B</span>
                    </div>
                  </div>
                </div>
                
                <div className={styles.card}>
                  <h2>Recent News</h2>
                  <div className={`${styles.newsList} ${styles.preview}`}>
                    {stockData.news.slice(0, 4).map(article => (
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
          </div>
        )}

        {activeTab === 'news' && (
          <div className={styles.newsSection}>
            <div className={styles.card}>
              <h2>News about {stockData.name}</h2>
              <div className={`${styles.newsList} ${styles.full}`}>
                {stockData.news.map(article => (
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

        {activeTab === 'financials' && (
          <div className={styles.financialsSection}>
            <div className={styles.card}>
              <h2>Financial Data</h2>
              <div className={styles.financialsOverview}>
                <div className={styles.financialChart}>
                  {/* Financial chart would go here */}
                  <div className={styles.placeholderChart}>Annual Revenue Chart</div>
                </div>
                <div className={styles.financialTable}>
                  <h3>Annual Revenue (billions $)</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>Year</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stockData.financials.revenue.map(item => (
                        <tr key={item.year}>
                          <td>{item.year}{item.estimated ? ' (est.)' : ''}</td>
                          <td>${item.value.toFixed(2)}B</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            <div className={styles.card}>
              <h2>Earnings Per Share (EPS)</h2>
              <div className={styles.epsContainer}>
                <div className={styles.epsChart}>
                  {/* EPS chart would go here */}
                  <div className={styles.placeholderChart}>EPS Chart</div>
                </div>
                <div className={styles.epsTable}>
                  <table>
                    <thead>
                      <tr>
                        <th>Year</th>
                        <th>EPS ($)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stockData.financials.eps.map(item => (
                        <tr key={item.year}>
                          <td>{item.year}{item.estimated ? ' (est.)' : ''}</td>
                          <td>${item.value.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className={styles.analysisSection}>
            <div className={styles.card}>
              <h2>Analyst Recommendations</h2>
              <div className={styles.analystRecommendations}>
                <div className={styles.recommendationSummary}>
                  <div className={styles.recommendationScore}>
                    <div className={styles.score}>4.2</div>
                    <div className={styles.scoreLabel}>out of 5</div>
                  </div>
                  <div className={styles.recommendationText}>Buy</div>
                </div>
                <div className={styles.recommendationBreakdown}>
                  <div className={styles.recommendationBar}>
                    <div className={styles.label}>Strong Buy</div>
                    <div className={styles.barContainer}>
                      <div className={styles.bar} style={{width: '45%'}}></div>
                      <div className={styles.percentage}>45%</div>
                    </div>
                  </div>
                  <div className={styles.recommendationBar}>
                    <div className={styles.label}>Buy</div>
                    <div className={styles.barContainer}>
                      <div className={styles.bar} style={{width: '30%'}}></div>
                      <div className={styles.percentage}>30%</div>
                    </div>
                  </div>
                  <div className={styles.recommendationBar}>
                    <div className={styles.label}>Hold</div>
                    <div className={styles.barContainer}>
                      <div className={styles.bar} style={{width: '20%'}}></div>
                      <div className={styles.percentage}>20%</div>
                    </div>
                  </div>
                  <div className={styles.recommendationBar}>
                    <div className={styles.label}>Sell</div>
                    <div className={styles.barContainer}>
                      <div className={styles.bar} style={{width: '5%'}}></div>
                      <div className={styles.percentage}>5%</div>
                    </div>
                  </div>
                  <div className={styles.recommendationBar}>
                    <div className={styles.label}>Strong Sell</div>
                    <div className={styles.barContainer}>
                      <div className={styles.bar} style={{width: '0%'}}></div>
                      <div className={styles.percentage}>0%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className={styles.card}>
              <h2>Price Targets</h2>
              <div className={styles.priceTargets}>
                <div className={styles.priceRange}>
                  <div className={styles.rangeContainer}>
                    <div className={styles.currentMarker} style={{left: '35%'}}></div>
                    <div className={styles.rangeBar}></div>
                    <div className={styles.lowPrice}>$155</div>
                    <div className={styles.highPrice}>$230</div>
                  </div>
                  <div className={styles.currentPriceIndicator}>
                    <div className={styles.label}>Current Price</div>
                    <div className={styles.value}>${stockData.currentPrice.toFixed(2)}</div>
                  </div>
                </div>
                <div className={styles.targetSummary}>
                  <div className={styles.targetItem}>
                    <div className={styles.label}>Average Target</div>
                    <div className={styles.value}>$198.45</div>
                  </div>
                  <div className={styles.targetItem}>
                    <div className={styles.label}>High Target</div>
                    <div className={styles.value}>$230.00</div>
                  </div>
                  <div className={styles.targetItem}>
                    <div className={styles.label}>Low Target</div>
                    <div className={styles.value}>$155.00</div>
                  </div>
                  <div className={styles.targetItem}>
                    <div className={styles.label}>Potential Growth</div>
                    <div className={`${styles.value} ${styles.positive}`}>+11.04%</div>
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
StockDetail.propTypes = {
  stockSymbol: PropTypes.string
};

// Default props
StockDetail.defaultProps = {
  stockSymbol: "AAPL"
};

export default StockDetail;