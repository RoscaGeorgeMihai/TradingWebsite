import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from '../styles/CommoditiesDetails.module.css';

const CommodityDetail = ({ commoditySymbol = "GOLD" }) => {
  // State for commodity data and active tab
  const [activeTab, setActiveTab] = useState('overview');
  const [activeTimeFilter, setActiveTimeFilter] = useState('3m');
  const [commodityData, setCommodityData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simulating commodity data loading
  useEffect(() => {
    // Here would be a real API call to fetch commodity data
    setTimeout(() => {
      const commoditiesData = {
        "GOLD": {
          symbol: 'GOLD',
          name: 'Gold',
          currentPrice: 2315.75,
          priceChange: 32.54,
          isPositive: true,
          color: '#D4AF37',
          unit: 'per oz',
          historicalData: generateMockHistoricalData(),
          news: [
            {
              id: 1,
              title: 'Gold prices surge as global uncertainties rise',
              source: 'CommodityNews',
              date: 'April 6, 2025',
              snippet: 'Gold hit new highs this month as investors seek safe havens amid economic uncertainty and inflation concerns.',
              url: '#'
            },
            {
              id: 2,
              title: 'Central banks continue gold reserves buildup',
              source: 'MetalMarkets',
              date: 'April 3, 2025',
              snippet: 'Several central banks have increased their gold reserves in Q1 2025, continuing the trend from previous years.',
              url: '#'
            },
            {
              id: 3,
              title: 'Gold mining output expected to increase in 2025',
              source: 'MiningDaily',
              date: 'March 29, 2025',
              snippet: 'Major gold producers are projecting increased output for 2025 as new mining projects come online.',
              url: '#'
            },
            {
              id: 4,
              title: 'Jewelry demand for gold reaches five-year high',
              source: 'PreciousMetalsWeekly',
              date: 'March 25, 2025',
              snippet: 'Global jewelry fabrication demand for gold has reached its highest level since 2020, driven by strong consumer spending.',
              url: '#'
            }
          ],
          financials: {
            marketCap: 'N/A',
            volume24h: 186.4, // in billions USD
            openInterest: 695.8, // in millions oz
            annualProduction: 3584, // in tonnes
            historical: [
              { year: 2022, q1: 1825, q2: 1785, q3: 1712, q4: 1798 },
              { year: 2023, q1: 1868, q2: 1925, q3: 1966, q4: 2048 },
              { year: 2024, q1: 2156, q2: 2234, q3: 2265, q4: 2275 },
              { year: 2025, q1: 2315, estimated: true }
            ]
          },
          fundamentals: {
            majorProducers: ['China', 'Australia', 'Russia', 'United States', 'Canada'],
            majorConsumers: ['China', 'India', 'United States', 'Germany', 'Turkey'],
            aboveGroundStocks: '205,000 tonnes',
            annualMiningSupply: '3,500 tonnes',
            recycledSupply: '1,200 tonnes',
            industryUsage: '18%',
            investmentDemand: '31%',
            jewelryDemand: '49%',
            centralBankDemand: '12%'
          }
        },
        "OIL": {
          symbol: 'OIL',
          name: 'Crude Oil (WTI)',
          currentPrice: 78.42,
          priceChange: -1.36,
          isPositive: false,
          color: '#264040',
          unit: 'per barrel',
          historicalData: generateMockHistoricalData('OIL'),
          news: [
            {
              id: 1,
              title: 'Oil prices decline as inventory levels build',
              source: 'EnergyNews',
              date: 'April 5, 2025',
              snippet: 'Crude oil prices fell as U.S. stockpiles increased beyond analyst expectations.',
              url: '#'
            },
            {
              id: 2,
              title: 'OPEC+ considers production adjustments',
              source: 'OilMarkets',
              date: 'April 2, 2025',
              snippet: 'OPEC+ members are discussing potential production cuts to stabilize prices.',
              url: '#'
            }
          ],
          financials: {
            marketCap: 'N/A',
            volume24h: 95.8, // in billions USD
            openInterest: 1.82, // in billions barrels
            annualProduction: 80.4, // in millions of barrels per day
            historical: [
              { year: 2022, q1: 95.85, q2: 110.25, q3: 87.65, q4: 79.45 },
              { year: 2023, q1: 76.45, q2: 82.15, q3: 86.75, q4: 74.25 },
              { year: 2024, q1: 77.85, q2: 79.65, q3: 81.25, q4: 79.85 },
              { year: 2025, q1: 78.42, estimated: true }
            ]
          },
          fundamentals: {
            majorProducers: ['United States', 'Saudi Arabia', 'Russia', 'Canada', 'Iraq'],
            majorConsumers: ['United States', 'China', 'India', 'Japan', 'Russia'],
            globalReserves: '1.7 trillion barrels',
            annualSupply: '80.4 million b/d',
            transportationUsage: '58%',
            industrialUsage: '16%',
            residentialUsage: '12%',
            electricityGeneration: '14%'
          }
        },
        "SILVER": {
          symbol: 'SILVER',
          name: 'Silver',
          currentPrice: 28.65,
          priceChange: 0.85,
          isPositive: true,
          color: '#C0C0C0',
          unit: 'per oz',
          historicalData: generateMockHistoricalData('SILVER')
        },
        "CORN": {
          symbol: 'CORN',
          name: 'Corn',
          currentPrice: 5.28,
          priceChange: 0.14,
          isPositive: true,
          color: '#FFDD00',
          unit: 'per bushel',
          historicalData: generateMockHistoricalData('CORN')
        },
        "NG": {
          symbol: 'NG',
          name: 'Natural Gas',
          currentPrice: 2.45,
          priceChange: -0.11,
          isPositive: false,
          color: '#71A6D2',
          unit: 'per MMBtu',
          historicalData: generateMockHistoricalData('NG')
        }
        // Data for other commodities would go here
      };

      setCommodityData(commoditiesData[commoditySymbol]);
      setIsLoading(false);
    }, 800);
  }, [commoditySymbol]);

  // Function to generate historical data for the chart
  function generateMockHistoricalData(symbol = 'GOLD') {
    const data = [];
    const today = new Date();
    
    // Set base price and volatility based on commodity
    let basePrice = 2200; // Default for gold
    let volatility = 0.02; // Default volatility
    
    switch(symbol) {
      case 'OIL':
        basePrice = 80;
        volatility = 0.03;
        break;
      case 'SILVER':
        basePrice = 27;
        volatility = 0.025;
        break;
      case 'CORN':
        basePrice = 5.2;
        volatility = 0.015;
        break;
      case 'NG':
        basePrice = 2.5;
        volatility = 0.04;
        break;
      default:
        // Use defaults for gold
    }
    
    // Generate data for the last 180 days
    for (let i = 180; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      
      // Add random variation to price
      const randomVolatility = (Math.random() * volatility * 2) - volatility; // Between -volatility and +volatility
      basePrice = basePrice * (1 + randomVolatility);
      
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
    { id: 'fundamentals', name: 'Fundamentals' },
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
  const priceChangePercent = (commodityData.priceChange / (commodityData.currentPrice - commodityData.priceChange) * 100).toFixed(2);

  return (
    <div className={styles.container}>
      {/* Header with commodity information */}
      <div className={styles.commodityHeader}>
        <div className={styles.commodityTitle}>
          <div className={styles.commoditySymbol} style={{ backgroundColor: commodityData.color }}>
            {commodityData.symbol.charAt(0)}
          </div>
          <div className={styles.commodityName}>
            <h1>{commodityData.symbol}</h1>
            <p>{commodityData.name}</p>
          </div>
        </div>
        <div className={styles.commodityPrice}>
          <p className={styles.currentPrice}>
            ${commodityData.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <span className={styles.unit}>{commodityData.unit}</span>
          </p>
          <p className={`${styles.priceChange} ${commodityData.isPositive ? styles.positive : styles.negative}`}>
            {commodityData.isPositive ? '+' : '-'}${Math.abs(commodityData.priceChange).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({Math.abs(priceChangePercent)}%)
          </p>
          <button 
            className={styles.btnTrade}
            onClick={() => alert('Trading functionality will be implemented soon!')}
          >
            Trade Now
          </button>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className={styles.commodityTabs}>
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
              </div>

              {/* Right side with summary and news */}
              <div className={styles.sidebarContainer}>
                <div className={styles.card}>
                  <h2>Market Summary</h2>
                  <div className={styles.summaryGrid}>
                    <div className={styles.summaryItem}>
                      <span className={styles.label}>Trading Volume (24h)</span>
                      <span className={styles.value}>${commodityData.financials.volume24h.toFixed(2)} B</span>
                    </div>
                    <div className={styles.summaryItem}>
                      <span className={styles.label}>Open Interest</span>
                      <span className={styles.value}>{commodityData.financials.openInterest.toFixed(1)} M</span>
                    </div>
                    <div className={styles.summaryItem}>
                      <span className={styles.label}>Annual Production</span>
                      <span className={styles.value}>{commodityData.financials.annualProduction.toLocaleString()} t</span>
                    </div>
                    <div className={styles.summaryItem}>
                      <span className={styles.label}>52-Week High</span>
                      <span className={styles.value}>$2,412.35</span>
                    </div>
                    <div className={styles.summaryItem}>
                      <span className={styles.label}>52-Week Low</span>
                      <span className={styles.value}>$1,980.45</span>
                    </div>
                    <div className={styles.summaryItem}>
                      <span className={styles.label}>YTD Change</span>
                      <span className={styles.value} style={{color: 'var(--positive)'}}>+12.4%</span>
                    </div>
                    <div className={styles.summaryItem}>
                      <span className={styles.label}>Contracts Expiry</span>
                      <span className={styles.value}>Jun 28, 2025</span>
                    </div>
                    <div className={styles.summaryItem}>
                      <span className={styles.label}>Last Updated</span>
                      <span className={styles.value}>Just now</span>
                    </div>
                  </div>
                </div>
                
                <div className={styles.card}>
                  <h2>Recent News</h2>
                  <div className={`${styles.newsList} ${styles.preview}`}>
                    {commodityData.news && commodityData.news.slice(0, 2).map(article => (
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
              <div className={styles.fullChartContainer}>
                {/* Chart component would go here */}
                <div className={styles.placeholderChart}>Full detailed chart for {activeTimeFilter} interval</div>
              </div>
              <div className={styles.chartSummary}>
                <div className={styles.statsGrid}>
                  <div className={styles.summaryItem}>
                    <span className={styles.label}>Open</span>
                    <span className={styles.value}>$2,298.45</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span className={styles.label}>High</span>
                    <span className={styles.value}>$2,327.60</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span className={styles.label}>Low</span>
                    <span className={styles.value}>$2,295.10</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span className={styles.label}>Close</span>
                    <span className={styles.value}>${commodityData.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span className={styles.label}>Volume</span>
                    <span className={styles.value}>328.5K contracts</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'news' && (
          <div className={styles.newsSection}>
            <div className={styles.card}>
              <h2>News about {commodityData.name}</h2>
              <div className={`${styles.newsList} ${styles.full}`}>
                {commodityData.news && commodityData.news.map(article => (
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

        {activeTab === 'fundamentals' && (
          <div className={styles.fundamentalsSection}>
            <div className={styles.twoColumnLayout}>
              <div className={styles.card}>
                <h2>Supply & Demand</h2>
                <div className={styles.fundamentalsGrid}>
                  {commodityData.fundamentals && (
                    <>
                      <div className={styles.summaryItem}>
                        <span className={styles.label}>Annual Mining Supply</span>
                        <span className={styles.value}>{commodityData.fundamentals.annualMiningSupply}</span>
                      </div>
                      <div className={styles.summaryItem}>
                        <span className={styles.label}>Recycled Supply</span>
                        <span className={styles.value}>{commodityData.fundamentals.recycledSupply}</span>
                      </div>
                      <div className={styles.summaryItem}>
                        <span className={styles.label}>Jewelry Demand</span>
                        <span className={styles.value}>{commodityData.fundamentals.jewelryDemand}</span>
                      </div>
                      <div className={styles.summaryItem}>
                        <span className={styles.label}>Investment Demand</span>
                        <span className={styles.value}>{commodityData.fundamentals.investmentDemand}</span>
                      </div>
                      <div className={styles.summaryItem}>
                        <span className={styles.label}>Industry Usage</span>
                        <span className={styles.value}>{commodityData.fundamentals.industryUsage}</span>
                      </div>
                      <div className={styles.summaryItem}>
                        <span className={styles.label}>Central Bank Demand</span>
                        <span className={styles.value}>{commodityData.fundamentals.centralBankDemand}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              <div className={styles.card}>
                <h2>Global Production & Reserves</h2>
                <div className={styles.chartContainer}>
                  {/* Producer pie chart would go here */}
                  <div className={styles.placeholderChart}>Top Producers Chart</div>
                </div>
                <div className={styles.producersList}>
                  <h3>Top Producers</h3>
                  <ul className={styles.topList}>
                    {commodityData.fundamentals && commodityData.fundamentals.majorProducers && 
                     commodityData.fundamentals.majorProducers.map((producer, index) => (
                      <li key={index} className={styles.topItem}>
                        <span className={styles.rank}>{index + 1}</span>
                        <span className={styles.name}>{producer}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            
            <div className={styles.card}>
              <h2>Consumption by Region</h2>
              <div className={styles.consumptionChartContainer}>
                {/* Consumption chart would go here */}
                <div className={styles.placeholderChart}>Global Consumption Map</div>
              </div>
              <div className={styles.consumptionDetails}>
                <div className={styles.topConsumers}>
                  <h3>Top Consumers</h3>
                  <ul className={styles.topList}>
                    {commodityData.fundamentals && commodityData.fundamentals.majorConsumers &&
                     commodityData.fundamentals.majorConsumers.map((consumer, index) => (
                      <li key={index} className={styles.topItem}>
                        <span className={styles.rank}>{index + 1}</span>
                        <span className={styles.name}>{consumer}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={styles.otherStats}>
                  {commodityData.fundamentals && (
                    <>
                      <div className={styles.summaryItem}>
                        <span className={styles.label}>Above Ground Stocks</span>
                        <span className={styles.value}>{commodityData.fundamentals.aboveGroundStocks}</span>
                      </div>
                      <div className={styles.summaryItem}>
                        <span className={styles.label}>Reserve to Production Ratio</span>
                        <span className={styles.value}>~120 years</span>
                      </div>
                    </>
                  )}
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
                  <div className={styles.gaugeLabel}>Bullish vs Bearish</div>
                  <div className={styles.gaugeValue}>65</div>
                  <div className={styles.gaugeMeter}>
                    <div className={styles.meterBar}>
                      <div className={styles.meterProgress} style={{
                        width: '65%', 
                        background: 'linear-gradient(to right, var(--commodity-color), var(--commodity-color))'
                      }}></div>
                    </div>
                    <div className={styles.meterLabels}>
                      <span>Bearish</span>
                      <span>Bullish</span>
                    </div>
                  </div>
                </div>
                <div className={styles.sentimentStats}>
                  <div className={styles.summaryItem}>
                    <span className={styles.label}>Analyst Sentiment</span>
                    <span className={styles.value}>Bullish (65%)</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span className={styles.label}>Hedge Fund Positioning</span>
                    <span className={styles.value}>Net Long</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span className={styles.label}>Put/Call Ratio</span>
                    <span className={styles.value}>0.87</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className={styles.card}>
              <h2>Price Targets</h2>
              <div className={styles.priceTargets}>
                <div className={styles.priceRange}>
                  <div className={styles.rangeContainer}>
                    <div className={styles.currentMarker} style={{left: '55%'}}></div>
                    <div className={styles.rangeBar} style={{
                      background: 'var(--commodity-color)'
                    }}></div>
                    <div className={styles.lowPrice}>$2,100</div>
                    <div className={styles.highPrice}>$2,500</div>
                  </div>
                  <div className={styles.currentPriceIndicator}>
                    <div className={styles.label}>Current Price</div>
                    <div className={styles.value}>${commodityData.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  </div>
                </div>
                <div className={styles.targetSummary}>
                  <div className={styles.targetItem}>
                    <div className={styles.label}>Average Target (1 year)</div>
                    <div className={styles.value}>$2,400</div>
                  </div>
                  <div className={styles.targetItem}>
                    <div className={styles.label}>Maximum Target</div>
                    <div className={styles.value}>$2,500</div>
                  </div>
                  <div className={styles.targetItem}>
                    <div className={styles.label}>Minimum Target</div>
                    <div className={styles.value}>$2,100</div>
                  </div>
                  <div className={styles.targetItem}>
                    <div className={styles.label}>Potential Growth</div>
                    <div className={styles.value} style={{ color: 'var(--commodity-color)' }}>+3.6%</div>
                  </div>
                </div>
                <div className={styles.technicalIndicators}>
                  <h3>Technical Indicators</h3>
                  <div className={styles.indicatorsSummary}>
                    <div className={styles.indicatorItem}>
                      <span className={styles.label}>RSI (14)</span>
                      <span className={styles.value}>58.7</span>
                      <span className={styles.signal} style={{ 
                        backgroundColor: 'rgba(212, 175, 55, 0.1)',
                        color: 'var(--commodity-color)'
                      }}>Neutral</span>
                    </div>
                    <div className={styles.indicatorItem}>
                      <span className={styles.label}>MACD</span>
                      <span className={styles.value}>+13.24</span>
                      <span className={styles.signal} style={{ 
                        backgroundColor: 'rgba(212, 175, 55, 0.2)',
                        color: 'var(--commodity-color)'
                      }}>Buy</span>
                    </div>
                    <div className={styles.indicatorItem}>
                      <span className={styles.label}>MA (50/200)</span>
                      <span className={styles.value}>2284/2186</span>
                      <span className={styles.signal} style={{ 
                        backgroundColor: 'rgba(212, 175, 55, 0.2)',
                        color: 'var(--commodity-color)'
                      }}>Buy</span>
                    </div>
                    <div className={styles.indicatorItem}>
                      <span className={styles.label}>Bollinger Bands</span>
                      <span className={styles.value}>2275-2345</span>
                      <span className={styles.signal} style={{ 
                        backgroundColor: 'rgba(212, 175, 55, 0.1)',
                        color: 'var(--commodity-color)'
                      }}>Neutral</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className={styles.card}>
              <h2>Correlation with Other Assets</h2>
              <div className={styles.correlationChart}>
                {/* Correlation chart would go here */}
                <div className={styles.placeholderChart}>Correlation with major assets</div>
              </div>
              <div className={styles.correlationGrid}>
                <div className={styles.correlationItem}>
                  <span className={styles.label}>USD Index</span>
                  <span className={styles.value}>-0.68</span>
                  <span className={styles.description}>Strong negative</span>
                </div>
                <div className={styles.correlationItem}>
                  <span className={styles.label}>S&P 500</span>
                  <span className={styles.value}>0.21</span>
                  <span className={styles.description}>Weak positive</span>
                </div>
                <div className={styles.correlationItem}>
                  <span className={styles.label}>Bonds (10Y)</span>
                  <span className={styles.value}>-0.32</span>
                  <span className={styles.description}>Moderate negative</span>
                </div>
                <div className={styles.correlationItem}>
                  <span className={styles.label}>Silver</span>
                  <span className={styles.value}>0.84</span>
                  <span className={styles.description}>Strong positive</span>
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
CommodityDetail.propTypes = {
  commoditySymbol: PropTypes.string
};

// Default properties
CommodityDetail.defaultProps = {
  commoditySymbol: "GOLD"
};

export default CommodityDetail;