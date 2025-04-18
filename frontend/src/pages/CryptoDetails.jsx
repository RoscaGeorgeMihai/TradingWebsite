import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import styles from '../styles/CryptoDetails.module.css';
import CryptoChart from '../components/CryptoChart';
import ApiErrorBoundary from '../components/ApiErrorBoundary';
import { useParams } from 'react-router-dom';
import marketstackApi from '../services/marketstackApi';

const CryptoDetail = ({ cryptoSymbolProp }) => {
  const { symbol: symbolFromUrl } = useParams();
  const cryptoSymbol = cryptoSymbolProp || symbolFromUrl || 'BTC';
  const apiSymbol = `${cryptoSymbol}USD`; // Simbol pentru API
  
  const [activeTab, setActiveTab] = useState('overview');
  const [activeTimeFilter, setActiveTimeFilter] = useState('3m');
  const [cryptoData, setCryptoData] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [marketData, setMarketData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState({ marketData: null });
  const [refreshStatus, setRefreshStatus] = useState('');
  const cryptoDataRef = useRef(null);
  const isInitialMount = useRef(true);

  const [performanceData, setPerformanceData] = useState({
    day: { change: 0, percentChange: 0 },
    week: { change: 0, percentChange: 0 },
    month: { change: 0, percentChange: 0 },
    threeMonths: { change: 0, percentChange: 0 },
    sixMonths: { change: 0, percentChange: 0 },
    year: { change: 0, percentChange: 0 },
    fiveYears: { change: 0, percentChange: 0 },
    ytd: { change: 0, percentChange: 0 },
  });

  // Această funcție determină intervalul pentru API în funcție de filtrul de timp
  const getApiInterval = (timeFilter) => {
    switch (timeFilter) {
      case '1d': return '15min';
      case '1w': return 'hourly';
      case '1m': return 'daily';
      case '3m': return 'daily';
      case '6m': return 'daily';
      case '1y': return 'daily';
      case '5y': return 'daily';
      default: return 'daily';
    }
  };

  const isIntradayFilter = (timeFilter) => {
    return ['1d', '1w'].includes(timeFilter);
  };

  const calculateExactPerformances = useCallback((historicalData, currentPriceOverride = null) => {
    if (!historicalData || historicalData.length === 0) return;

    const sortedData = [...historicalData].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const lastDataPoint = sortedData[sortedData.length - 1];
    const currentPrice = currentPriceOverride !== null ? currentPriceOverride : (lastDataPoint.close || lastDataPoint.price);
    const currentDate = new Date(lastDataPoint.date);

    const findClosestDataPoint = (targetDate) => {
      let closestIndex = 0;
      let closestDiff = Infinity;
      
      for (let i = 0; i < sortedData.length; i++) {
        const dataDate = new Date(sortedData[i].date);
        const diff = Math.abs(dataDate.getTime() - targetDate.getTime());
        if (diff < closestDiff) {
          closestDiff = diff;
          closestIndex = i;
        }
      }
      return sortedData[closestIndex];
    };

    const timeRanges = [
      { name: 'day', days: 1 },
      { name: 'week', days: 7 },
      { name: 'month', days: 30 },
      { name: 'threeMonths', days: 90 },
      { name: 'sixMonths', days: 180 },
      { name: 'year', days: 365 },
      { name: 'fiveYears', days: 365 * 5 },
    ];

    const newPerformanceData = {};

    timeRanges.forEach((range) => {
      const pastDate = new Date(currentDate);
      pastDate.setDate(currentDate.getDate() - range.days);
      const pastDataPoint = findClosestDataPoint(pastDate);
      const pastPrice = pastDataPoint.close || pastDataPoint.price;
      const change = currentPrice - pastPrice;
      const percentChange = pastPrice !== 0 ? (change / pastPrice) * 100 : 0;

      newPerformanceData[range.name] = {
        change,
        percentChange,
        currentDate: lastDataPoint.date,
        currentPrice: currentPrice,
        pastDate: pastDataPoint.date,
        pastPrice: pastPrice
      };
    });

    const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
    const startOfYearDataPoint = findClosestDataPoint(startOfYear);
    const startOfYearPrice = startOfYearDataPoint.close || startOfYearDataPoint.price;
    const ytdChange = currentPrice - startOfYearPrice;
    const ytdPercentChange = startOfYearPrice !== 0 ? (ytdChange / startOfYearPrice) * 100 : 0;

    newPerformanceData.ytd = {
      change: ytdChange,
      percentChange: ytdPercentChange,
      currentDate: lastDataPoint.date,
      currentPrice: currentPrice,
      pastDate: startOfYearDataPoint.date,
      pastPrice: startOfYearPrice
    };

    setPerformanceData(newPerformanceData);
  }, []);

  const calculateAllPerformances = useCallback(async (currentPriceOverride = null) => {
    try {
      const today = new Date();
      const oldestDate = new Date(today);
      oldestDate.setFullYear(today.getFullYear() - 5);

      // Obținem date istorice pentru 5 ani
      const historicalData = await marketstackApi.getCryptoData(
        apiSymbol.toLowerCase(),
        oldestDate,
        today,
        'daily'
      );

      let currentPrice = currentPriceOverride;
      if (currentPrice === null && cryptoDataRef.current) {
        currentPrice = cryptoDataRef.current.currentPrice;
      }

      const sortedData = [...historicalData].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );

      if (sortedData.length > 0 && currentPrice !== null) {
        sortedData[sortedData.length - 1] = {
          ...sortedData[sortedData.length - 1],
          close: currentPrice,
          price: currentPrice
        };
      }

      calculateExactPerformances(sortedData, currentPrice);
    } catch (error) {
      console.error('Error calculating performance data:', error);
    }
  }, [apiSymbol, calculateExactPerformances]);

  const fetchAllData = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setIsRefreshing(true);
        setRefreshStatus('Refreshing market data...');
      } else {
        setIsLoading(true);
      }
      setError(null);
  
      try {
        const today = new Date();
        let fromDate = new Date();
  
        switch (activeTimeFilter) {
          case '1d': fromDate.setDate(today.getDate() - 1); break;
          case '1w': fromDate.setDate(today.getDate() - 7); break;
          case '1m': fromDate.setMonth(today.getMonth() - 1); break;
          case '3m': fromDate.setMonth(today.getMonth() - 3); break;
          case '6m': fromDate.setMonth(today.getMonth() - 6); break;
          case '1y': fromDate.setFullYear(today.getFullYear() - 1); break;
          case '5y': fromDate.setFullYear(today.getFullYear() - 5); break;
          default: fromDate.setMonth(today.getMonth() - 3);
        }
  
        // Obținem intervalul pentru API
        const interval = getApiInterval(activeTimeFilter);
        
        // Obținem datele istorice
        const historical = await marketstackApi.getCryptoData(
          apiSymbol.toLowerCase(),
          fromDate,
          today,
          interval
        );
  
        const chartData = historical.map((item) => ({
          date: item.date,
          price: item.close || item.price,
          open: item.open,
          high: item.high,
          low: item.low,
          volume: item.volume,
        }));
  
        // Obținem cotația curentă
        const quote = await marketstackApi.getStockQuote(apiSymbol);
  
        // Extragem ultimul preț disponibil
        const lastPrice = quote.price || quote.last || 
                        (chartData.length > 0 ? chartData[chartData.length - 1].price : 0);
  
        if (chartData.length > 0) {
          chartData[chartData.length - 1].price = lastPrice;
        }
  
        let referencePrice;
        if (activeTimeFilter === '1d' && chartData.length > 0) {
          referencePrice = chartData[0].price;
        } else if (chartData.length > 1) {
          referencePrice = chartData[chartData.length - 2].price;
        } else if (quote.open) {
          referencePrice = quote.open;
        } else {
          referencePrice = lastPrice - quote.change;
        }
  
        const priceChange = lastPrice - referencePrice;
        const isPositive = priceChange >= 0;
        const changePercent = referencePrice !== 0 ? (priceChange / referencePrice) * 100 : 0;
  
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(today.getFullYear() - 1);
  
        // Obținem date anuale pentru calcule suplimentare
        let yearlyData = historical;
        if (activeTimeFilter !== '1y' && activeTimeFilter !== '5y') {
          yearlyData = await marketstackApi.getCryptoData(
            apiSymbol.toLowerCase(),
            oneYearAgo,
            today,
            'daily'
          );
        }

        let high52Week = 0;
        let low52Week = Number.MAX_VALUE;

        yearlyData.forEach((item) => {
          const price = item.close || item.price;
          if (price > high52Week) high52Week = price;
          if (price < low52Week) low52Week = price;
        });

        let totalVolume = 0;
        const recentData = yearlyData.slice(-30);
        recentData.forEach((item) => {
          totalVolume += item.volume || 0;
        });

        const avgVolume = recentData.length > 0 ? totalVolume / recentData.length : 0;

        // Setăm datele de piață disponibile din MarketStack
        setMarketData({
          open: quote.open || (chartData.length > 0 ? chartData[0].open : 0),
          high: quote.high || (chartData.length > 0 ? Math.max(...chartData.map((d) => d.high || 0)) : 0),
          low: quote.low || (chartData.length > 0 ? Math.min(...chartData.map((d) => d.low || 0)) : 0),
          volume: quote.volume || (chartData.length > 0 ? chartData[chartData.length - 1].volume : 0),
          high52Week: high52Week,
          low52Week: low52Week,
          avgVolume: avgVolume,
          prevClose: quote.prevClose || referencePrice,
          currentPrice: lastPrice
        });

        // Setăm datele pentru criptomonedă disponibile din MarketStack
        setCryptoData({
          symbol: cryptoSymbol,
          name: `${cryptoSymbol}`,
          currentPrice: lastPrice,
          priceChange: priceChange,
          changePercent: changePercent,
          isPositive: isPositive,
          color: generateColorFromSymbol(cryptoSymbol),
          historicalData: chartData
        });

        setHistoricalData(chartData);
        setLastFetchTime((prev) => ({ ...prev, marketData: new Date() }));
        await calculateAllPerformances(lastPrice);
      } catch (err) {
        console.error('Error fetching crypto data:', err);
        setError(`Could not load data for ${cryptoSymbol}. Please try again later.`);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
        setRefreshStatus('');
      }
    },
    [cryptoSymbol, apiSymbol, activeTimeFilter, calculateAllPerformances]
  );

  useEffect(() => {
    cryptoDataRef.current = cryptoData;
  }, [cryptoData]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      fetchAllData();
    }
  }, [fetchAllData]);

  const handleTabChange = (tabId) => {
    if (tabId === activeTab) return;
    setActiveTab(tabId);
  };

  const handleTimeFilterChange = (filter) => {
    if (filter === activeTimeFilter) return;
    setActiveTimeFilter(filter);
  };

  useEffect(() => {
    if (!isInitialMount.current) {
      fetchAllData();
    }
  }, [activeTimeFilter, fetchAllData]);

  const generateColorFromSymbol = (symbol) => {
    const colorMap = {
      BTC: '#F7931A',
      ETH: '#627EEA',
      XRP: '#00AAE4',
      LTC: '#B8B8B8',
      ADA: '#0D1E30',
      DOT: '#E6007A',
      SOL: '#14F195',
      DOGE: '#C2A633',
    };
    return colorMap[symbol] || `#${Math.floor(Math.random() * 16777215).toString(16)}`;
  };

  const tabs = [
    { id: 'overview', name: 'Overview' },
    { id: 'chart', name: 'Chart' }
  ];

  const timeFilters = [
    { id: '1d', name: '1D' },
    { id: '1w', name: '1W' },
    { id: '1m', name: '1M' },
    { id: '3m', name: '3M' },
    { id: '6m', name: '6M' },
    { id: '1y', name: '1Y' },
    { id: '5y', name: '5Y' },
  ];

  const formatNumber = (num) => {
    if (!num) return '$0';
    if (num >= 1000000000) return `$${(num / 1000000000).toFixed(2)}B`;
    if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  const formatVolume = (volume) => {
    if (!volume) return '0';
    if (volume >= 1000000000) return `${(volume / 1000000000).toFixed(2)}B`;
    if (volume >= 1000000) return `${(volume / 1000000).toFixed(2)}M`;
    if (volume >= 1000) return `${(volume / 1000).toFixed(2)}K`;
    return volume.toString();
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading data for {cryptoSymbol}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>Error loading data</h2>
        <p>{error}</p>
        <button className={styles.btnRetry} onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );
  }

  if (!cryptoData) {
    return (
      <div className={styles.errorContainer}>
        <p>No data available. Please try again.</p>
      </div>
    );
  }

  return (
    <ApiErrorBoundary>
      <div className={styles.container}>
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
            <p className={styles.currentPrice}>${cryptoData.currentPrice.toFixed(2)}</p>
            <p className={`${styles.priceChange} ${cryptoData.isPositive ? styles.positive : styles.negative}`}>
              {cryptoData.isPositive ? '+' : ''}
              {cryptoData.priceChange.toFixed(2)} (
              {Math.abs(cryptoData.changePercent).toFixed(2)}%)
            </p>
            <div className={styles.tradingButtonsHeader}>
              <button className={styles.buyButtonHeader}>Buy</button>
              <button className={styles.sellButtonHeader}>Sell</button>
            </div>
          </div>
        </div>

        <div className={styles.stockTabs}>
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
              onClick={() => handleTabChange(tab.id)}
            >
              {tab.name}
            </div>
          ))}
        </div>

        <div className={styles.tabContent}>
          {activeTab === 'overview' && (
            <div className={styles.overviewSection}>
              <div className={styles.overviewLayout}>
                <div className={`${styles.largeChartContainer} ${styles.card}`}>
                  <h2>Price Chart</h2>
                  <div className={styles.chartToolbar}>
                    <div className={styles.timeFilters}>
                      {timeFilters.map((filter) => (
                        <button
                          key={filter.id}
                          className={`${styles.filterBtn} ${activeTimeFilter === filter.id ? styles.active : ''}`}
                          onClick={() => handleTimeFilterChange(filter.id)}
                        >
                          {filter.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className={styles.chartContainer}>
                    {historicalData.length > 0 ? (
                      <CryptoChart
                        data={historicalData}
                        color={cryptoData.color}
                        isIntraday={isIntradayFilter(activeTimeFilter)}
                      />
                    ) : (
                      <div className={styles.noData}>No data available</div>
                    )}
                  </div>
                </div>

                <div className={styles.sidebarContainer}>
                  {marketData && (
                    <div className={styles.card}>
                      <h2>Market Stats</h2>
                      <div className={styles.summaryGrid}>
                        <div className={styles.summaryItem}>
                          <span className={styles.label}>Open</span>
                          <span className={styles.value}>${marketData.open.toFixed(2)}</span>
                        </div>
                        <div className={styles.summaryItem}>
                          <span className={styles.label}>High</span>
                          <span className={styles.value}>${marketData.high.toFixed(2)}</span>
                        </div>
                        <div className={styles.summaryItem}>
                          <span className={styles.label}>Low</span>
                          <span className={styles.value}>${marketData.low.toFixed(2)}</span>
                        </div>
                        <div className={styles.summaryItem}>
                          <span className={styles.label}>Volume</span>
                          <span className={styles.value}>{formatVolume(marketData.volume)}</span>
                        </div>
                        <div className={styles.summaryItem}>
                          <span className={styles.label}>Avg. Volume (30d)</span>
                          <span className={styles.value}>{formatVolume(marketData.avgVolume)}</span>
                        </div>
                        <div className={styles.summaryItem}>
                          <span className={styles.label}>Prev. Close</span>
                          <span className={styles.value}>${marketData.prevClose.toFixed(2)}</span>
                        </div>
                        <div className={styles.summaryItem}>
                          <span className={styles.label}>52-Week High</span>
                          <span className={styles.value}>${marketData.high52Week.toFixed(2)}</span>
                        </div>
                        <div className={styles.summaryItem}>
                          <span className={styles.label}>52-Week Low</span>
                          <span className={styles.value}>${marketData.low52Week.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className={styles.card}>
                    <h2>Performance</h2>
                    <div className={styles.performanceTable}>
                      <table>
                        <thead>
                          <tr>
                            <th>Period</th>
                            <th>Change</th>
                            <th>% Change</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>1 Day</td>
                            <td className={performanceData.day.change >= 0 ? styles.positive : styles.negative}>
                              {performanceData.day.change >= 0 ? '+' : ''}$
                              {Math.abs(performanceData.day.change).toFixed(2)}
                            </td>
                            <td className={performanceData.day.change >= 0 ? styles.positive : styles.negative}>
                              {performanceData.day.change >= 0 ? '+' : ''}
                              {Math.abs(performanceData.day.percentChange).toFixed(2)}%
                            </td>
                          </tr>

                          <tr>
                            <td>1 Week</td>
                            <td className={performanceData.week.change >= 0 ? styles.positive : styles.negative}>
                              {performanceData.week.change >= 0 ? '+' : ''}$
                              {Math.abs(performanceData.week.change).toFixed(2)}
                            </td>
                            <td className={performanceData.week.change >= 0 ? styles.positive : styles.negative}>
                              {performanceData.week.change >= 0 ? '+' : ''}
                              {Math.abs(performanceData.week.percentChange).toFixed(2)}%
                            </td>
                          </tr>

                          <tr>
                            <td>1 Month</td>
                            <td className={performanceData.month.change >= 0 ? styles.positive : styles.negative}>
                              {performanceData.month.change >= 0 ? '+' : ''}$
                              {Math.abs(performanceData.month.change).toFixed(2)}
                            </td>
                            <td className={performanceData.month.change >= 0 ? styles.positive : styles.negative}>
                              {performanceData.month.change >= 0 ? '+' : ''}
                              {Math.abs(performanceData.month.percentChange).toFixed(2)}%
                            </td>
                          </tr>

                          <tr>
                            <td>3 Months</td>
                            <td className={performanceData.threeMonths.change >= 0 ? styles.positive : styles.negative}>
                              {performanceData.threeMonths.change >= 0 ? '+' : ''}$
                              {Math.abs(performanceData.threeMonths.change).toFixed(2)}
                            </td>
                            <td className={performanceData.threeMonths.change >= 0 ? styles.positive : styles.negative}>
                              {performanceData.threeMonths.change >= 0 ? '+' : ''}
                              {Math.abs(performanceData.threeMonths.percentChange).toFixed(2)}%
                            </td>
                          </tr>

                          <tr>
                            <td>6 Months</td>
                            <td className={performanceData.sixMonths.change >= 0 ? styles.positive : styles.negative}>
                              {performanceData.sixMonths.change >= 0 ? '+' : ''}$
                              {Math.abs(performanceData.sixMonths.change).toFixed(2)}
                            </td>
                            <td className={performanceData.sixMonths.change >= 0 ? styles.positive : styles.negative}>
                              {performanceData.sixMonths.change >= 0 ? '+' : ''}
                              {Math.abs(performanceData.sixMonths.percentChange).toFixed(2)}%
                            </td>
                          </tr>

                          <tr>
                            <td>1 Year</td>
                            <td className={performanceData.year.change >= 0 ? styles.positive : styles.negative}>
                              {performanceData.year.change >= 0 ? '+' : ''}$
                              {Math.abs(performanceData.year.change).toFixed(2)}
                            </td>
                            <td className={performanceData.year.change >= 0 ? styles.positive : styles.negative}>
                              {performanceData.year.change >= 0 ? '+' : ''}
                              {Math.abs(performanceData.year.percentChange).toFixed(2)}%
                            </td>
                          </tr>

                          <tr>
                            <td>YTD</td>
                            <td className={performanceData.ytd.change >= 0 ? styles.positive : styles.negative}>
                              {performanceData.ytd.change >= 0 ? '+' : ''}$
                              {Math.abs(performanceData.ytd.change).toFixed(2)}
                            </td>
                            <td className={performanceData.ytd.change >= 0 ? styles.positive : styles.negative}>
                              {performanceData.ytd.change >= 0 ? '+' : ''}
                              {Math.abs(performanceData.ytd.percentChange).toFixed(2)}%
                            </td>
                          </tr>
                        </tbody>
                      </table>
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
                    {timeFilters.map((filter) => (
                      <button
                        key={filter.id}
                        className={`${styles.filterBtn} ${activeTimeFilter === filter.id ? styles.active : ''}`}
                        onClick={() => handleTimeFilterChange(filter.id)}
                      >
                        {filter.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div className={styles.chartContainer}>
                    {historicalData.length > 0 ? (
                      <CryptoChart
                        data={historicalData}
                        color={cryptoData.color}
                        isIntraday={isIntradayFilter(activeTimeFilter)}
                      />
                    ) : (
                      <div className={styles.noData}>No data available</div>
                    )}
                  </div>
              </div>
            </div>
          )}
        </div>

        <div className={styles.tradingActions}>
          <button className={styles.setAlertButton}>Set Price Alert</button>
        </div>
      </div>
    </ApiErrorBoundary>
  );
};

CryptoDetail.propTypes = {
  cryptoSymbolProp: PropTypes.string
};

export default CryptoDetail;