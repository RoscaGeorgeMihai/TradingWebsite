import React, { useState, useEffect, useCallback, useRef } from 'react'
import PropTypes from 'prop-types'
import styles from '../styles/StockDetails.module.css'
import marketstackApi from '../services/marketstackApi'
import StockChart from '../components/StockChart'
import ApiErrorBoundary from '../components/ApiErrorBoundary'
import { useParams } from 'react-router-dom'

const StockDetail = ({ stockSymbolProp }) => {
  const { symbol: symbolFromUrl } = useParams()
  const stockSymbol = stockSymbolProp || symbolFromUrl || 'AAPL'
  const [activeTab, setActiveTab] = useState('overview')
  const [activeTimeFilter, setActiveTimeFilter] = useState('3m')
  const [stockData, setStockData] = useState(null)
  const [historicalData, setHistoricalData] = useState([])
  const [marketData, setMarketData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [lastFetchTime, setLastFetchTime] = useState({ marketData: null })
  const [refreshStatus, setRefreshStatus] = useState('')
  const [cacheStats, setCacheStats] = useState(null)
  const stockDataRef = useRef(null)
  const isInitialMount = useRef(true)
  const [isCrypto, setIsCrypto] = useState(false)

  const [performanceData, setPerformanceData] = useState({
    day: { change: 0, percentChange: 0 },
    week: { change: 0, percentChange: 0 },
    month: { change: 0, percentChange: 0 },
    threeMonths: { change: 0, percentChange: 0 },
    sixMonths: { change: 0, percentChange: 0 },
    year: { change: 0, percentChange: 0 },
    fiveYears: { change: 0, percentChange: 0 },
    ytd: { change: 0, percentChange: 0 },
  })

  // Determine if symbol is crypto by checking if it includes "USD"
  useEffect(() => {
    setIsCrypto(stockSymbol.toUpperCase().includes('USD'))
  }, [stockSymbol])

  const getInterval = (timeFilter) => {
    switch (timeFilter) {
      case '1d': return '15min'
      case '1w': return '1hour'
      default: return 'daily'
    }
  }

  const isIntradayFilter = (timeFilter) => {
    return ['1d', '1w'].includes(timeFilter)
  }

  const calculateExactPerformances = useCallback((historicalData, currentPriceOverride = null) => {
    if (!historicalData || historicalData.length === 0) return

    const sortedData = [...historicalData].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    const lastDataPoint = sortedData[sortedData.length - 1]
    const currentPrice = currentPriceOverride !== null ? currentPriceOverride : (lastDataPoint.close || lastDataPoint.price)
    const currentDate = new Date(lastDataPoint.date)

    const findClosestDataPoint = (targetDate) => {
      let closestIndex = 0
      let closestDiff = Infinity
      
      for (let i = 0; i < sortedData.length; i++) {
        const dataDate = new Date(sortedData[i].date)
        const diff = Math.abs(dataDate.getTime() - targetDate.getTime())
        if (diff < closestDiff) {
          closestDiff = diff
          closestIndex = i
        }
      }
      return sortedData[closestIndex]
    }

    const timeRanges = [
      { name: 'day', days: 1 },
      { name: 'week', days: 7 },
      { name: 'month', days: 30 },
      { name: 'threeMonths', days: 90 },
      { name: 'sixMonths', days: 180 },
      { name: 'year', days: 365 },
      { name: 'fiveYears', days: 365 * 5 },
    ]

    const newPerformanceData = {}

    timeRanges.forEach((range) => {
      const pastDate = new Date(currentDate)
      pastDate.setDate(currentDate.getDate() - range.days)
      const pastDataPoint = findClosestDataPoint(pastDate)
      const pastPrice = pastDataPoint.close || pastDataPoint.price
      const change = currentPrice - pastPrice
      const percentChange = pastPrice !== 0 ? (change / pastPrice) * 100 : 0

      newPerformanceData[range.name] = {
        change,
        percentChange,
        currentDate: lastDataPoint.date,
        currentPrice: currentPrice,
        pastDate: pastDataPoint.date,
        pastPrice: pastPrice
      }
    })

    const startOfYear = new Date(currentDate.getFullYear(), 0, 1)
    const startOfYearDataPoint = findClosestDataPoint(startOfYear)
    const startOfYearPrice = startOfYearDataPoint.close || startOfYearDataPoint.price
    const ytdChange = currentPrice - startOfYearPrice
    const ytdPercentChange = startOfYearPrice !== 0 ? (ytdChange / startOfYearPrice) * 100 : 0

    newPerformanceData.ytd = {
      change: ytdChange,
      percentChange: ytdPercentChange,
      currentDate: lastDataPoint.date,
      currentPrice: currentPrice,
      pastDate: startOfYearDataPoint.date,
      pastPrice: startOfYearPrice
    }

    setPerformanceData(newPerformanceData)
  }, [])

  const calculateAllPerformances = useCallback(async (currentPriceOverride = null) => {
    try {
      const today = new Date()
      const oldestDate = new Date(today)
      oldestDate.setFullYear(today.getFullYear() - 5)

      let historicalData
      if (isCrypto) {
        historicalData = await marketstackApi.getCryptoData(
          stockSymbol,
          oldestDate,
          today,
          'daily'
        )
      } else {
        // Use the marketstackApi's historical data functionality
        const fromDate = oldestDate.toISOString().split('T')[0]
        const toDate = today.toISOString().split('T')[0]
        historicalData = await marketstackApi.generateSimulatedHistoricalData(
          stockSymbol, 
          fromDate, 
          toDate
        )
      }

      let currentPrice = currentPriceOverride
      if (currentPrice === null && stockDataRef.current) {
        currentPrice = stockDataRef.current.currentPrice
      }

      const sortedData = [...historicalData].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      )

      if (sortedData.length > 0 && currentPrice !== null) {
        sortedData[sortedData.length - 1] = {
          ...sortedData[sortedData.length - 1],
          close: currentPrice,
          price: currentPrice
        }
      }

      calculateExactPerformances(sortedData, currentPrice)
    } catch (error) {
      console.error('Error calculating performance data:', error)
    }
  }, [stockSymbol, calculateExactPerformances, isCrypto])

  const fetchAllData = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setIsRefreshing(true)
        setRefreshStatus('Refreshing market data...')
      } else {
        setIsLoading(true)
      }
      setError(null)

      try {
        const today = new Date()
        let fromDate = new Date()

        switch (activeTimeFilter) {
          case '1d': fromDate.setDate(today.getDate() - 1); break
          case '1w': fromDate.setDate(today.getDate() - 7); break
          case '1m': fromDate.setMonth(today.getMonth() - 1); break
          case '3m': fromDate.setMonth(today.getMonth() - 3); break
          case '6m': fromDate.setMonth(today.getMonth() - 6); break
          case '1y': fromDate.setFullYear(today.getFullYear() - 1); break
          case '5y': fromDate.setFullYear(today.getFullYear() - 5); break
          default: fromDate.setMonth(today.getMonth() - 3)
        }

        const interval = getInterval(activeTimeFilter)
        const isIntraday = isIntradayFilter(activeTimeFilter)

        let historical
        if (isIntraday) {
          historical = await marketstackApi.getIntradayData(stockSymbol, interval)
        } else if (isCrypto) {
          historical = await marketstackApi.getCryptoData(
            stockSymbol,
            fromDate,
            today,
            'daily'
          )
        } else {
          // For normal stocks, use the simulated historical data
          const fromDateStr = fromDate.toISOString().split('T')[0]
          const toDateStr = today.toISOString().split('T')[0]
          historical = await marketstackApi.generateSimulatedHistoricalData(
            stockSymbol, 
            fromDateStr, 
            toDateStr
          )
        }

        const chartData = historical.map((item) => ({
          date: item.date,
          price: item.close || item.price,
          open: item.open,
          high: item.high,
          low: item.low,
          volume: item.volume,
        }))

        // Get current stock quote
        const quote = await marketstackApi.getStockQuote(stockSymbol)
        
        // Get cache stats to show API efficiency
        const cacheStatsData = marketstackApi.getCacheStats()
        setCacheStats(cacheStatsData)

        const lastPrice = quote.price
        
        if (chartData.length > 0) {
          chartData[chartData.length - 1].price = lastPrice
        }

        let referencePrice
        if (activeTimeFilter === '1d' && chartData.length > 0) {
          referencePrice = chartData[0].price
        } else if (chartData.length > 1) {
          referencePrice = chartData[chartData.length - 2].price
        } else if (quote.open) {
          referencePrice = quote.open
        } else {
          referencePrice = lastPrice - quote.change
        }

        const priceChange = lastPrice - referencePrice
        const isPositive = priceChange >= 0
        const changePercent = referencePrice !== 0 ? (priceChange / referencePrice) * 100 : 0

        const oneYearAgo = new Date()
        oneYearAgo.setFullYear(today.getFullYear() - 1)

        let yearlyData = historical
        if (activeTimeFilter !== '1y' && activeTimeFilter !== '5y') {
          if (isCrypto) {
            yearlyData = await marketstackApi.getCryptoData(
              stockSymbol,
              oneYearAgo,
              today,
              'daily'
            )
          } else {
            // Get simulated yearly data
            const oneYearAgoStr = oneYearAgo.toISOString().split('T')[0]
            const todayStr = today.toISOString().split('T')[0]
            yearlyData = await marketstackApi.generateSimulatedHistoricalData(
              stockSymbol, 
              oneYearAgoStr, 
              todayStr
            )
          }
        }

        let high52Week = 0
        let low52Week = Number.MAX_VALUE

        yearlyData.forEach((item) => {
          const price = item.close || item.price
          if (price > high52Week) high52Week = price
          if (price < low52Week) low52Week = price
        })

        let totalVolume = 0
        const recentData = yearlyData.slice(-30)
        recentData.forEach((item) => {
          totalVolume += item.volume || 0
        })

        const avgVolume = recentData.length > 0 ? totalVolume / recentData.length : 0

        // Create marketData object with all available information
        setMarketData({
          open: quote.open || (chartData.length > 0 ? chartData[0].open : 0),
          high: quote.high || (chartData.length > 0 ? Math.max(...chartData.map((d) => d.high)) : 0),
          low: quote.low || (chartData.length > 0 ? Math.min(...chartData.map((d) => d.low)) : 0),
          volume: quote.volume || (chartData.length > 0 ? chartData[chartData.length - 1].volume : 0),
          high52Week: high52Week,
          low52Week: low52Week,
          avgVolume: avgVolume,
          prevClose: quote.price - quote.change,
          currentPrice: lastPrice,
          change: quote.change,
          changePercent: quote.changePercent,
          timestamp: quote.timestamp,
          isSimulated: quote.isSimulated,
        })

        // Create company info - Since the marketstackApi doesn't have company profiles,
        // we'll create a basic one based on the symbol
        const companyProfile = {
          name: isCrypto ? 
            `${stockSymbol.replace('USD', '')} / USD` : 
            `${stockSymbol} Inc.`,
          exchange_acronym: isCrypto ? 'CRYPTO' : 'EXCH',
          stock_exchange: isCrypto ? 'Cryptocurrency Market' : 'Stock Exchange',
          exchange_country: 'US',
          description: isCrypto ? 
            `${stockSymbol.replace('USD', '')} cryptocurrency trading against USD` : 
            `${stockSymbol} is a publicly traded company.`,
          sector: isCrypto ? 'Cryptocurrency' : 'Technology',
          industry: isCrypto ? 'Digital Currency' : 'Various',
          website: `https://example.com/${stockSymbol.toLowerCase()}`
        }

        setStockData({
          symbol: stockSymbol,
          name: companyProfile.name,
          currentPrice: lastPrice,
          priceChange: priceChange,
          changePercent: changePercent,
          isPositive: isPositive,
          color: generateColorFromSymbol(stockSymbol),
          historicalData: chartData,
          company: {
            Name: companyProfile.name,
            Exchange: companyProfile.exchange_acronym,
            Country: companyProfile.exchange_country,
            Description: companyProfile.description,
            Sector: companyProfile.sector,
            Industry: companyProfile.industry,
            Website: companyProfile.website,
          },
          isSimulated: quote.isSimulated,
          isCrypto: isCrypto,
        })

        setHistoricalData(chartData)
        setLastFetchTime((prev) => ({ ...prev, marketData: new Date() }))
        await calculateAllPerformances(lastPrice)
      } catch (err) {
        console.error('Error fetching stock data:', err)
        setError('Could not load stock data. Please try again later.')
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
        setRefreshStatus('')
      }
    },
    [stockSymbol, activeTimeFilter, calculateAllPerformances, isCrypto]
  )

  useEffect(() => {
    stockDataRef.current = stockData
  }, [stockData])

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      fetchAllData()
    }
  }, [fetchAllData])

  const handleTabChange = (tabId) => {
    if (tabId === activeTab) return
    setActiveTab(tabId)

    if (tabId === 'market-data') {
      console.log('Fetching full 5-year market data for detailed performance analysis')
      setIsRefreshing(true)
      setRefreshStatus('Fetching complete market data for accurate performance analysis...')

      const fetchFullMarketData = async () => {
        try {
          const today = new Date()
          const fiveYearsAgo = new Date()
          fiveYearsAgo.setFullYear(today.getFullYear() - 5)

          let historical
          const quote = await marketstackApi.getStockQuote(stockSymbol)
          
          if (isCrypto) {
            historical = await marketstackApi.getCryptoData(
              stockSymbol,
              fiveYearsAgo,
              today,
              'daily'
            )
          } else {
            // Use simulated data for normal stocks
            const fiveYearsAgoStr = fiveYearsAgo.toISOString().split('T')[0]
            const todayStr = today.toISOString().split('T')[0]
            historical = await marketstackApi.generateSimulatedHistoricalData(
              stockSymbol, 
              fiveYearsAgoStr, 
              todayStr
            )
          }

          const currentPrice = quote.price
          const sortedData = [...historical].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
          )

          const formattedData = sortedData.map((item) => ({
            date: item.date,
            price: item.close || item.price,
            open: item.open,
            high: item.high,
            low: item.low,
            volume: item.volume,
          }))

          if (formattedData.length > 0) {
            formattedData[formattedData.length - 1].price = currentPrice
          }

          setHistoricalData(formattedData)
          setMarketData((prevData) => prevData ? { ...prevData, currentPrice: currentPrice } : null)

          setStockData((prevData) => {
            if (!prevData) return null
            const referencePrice = prevData.currentPrice - prevData.priceChange
            const priceChange = currentPrice - referencePrice
            const changePercent = referencePrice !== 0 ? (priceChange / referencePrice) * 100 : 0
            
            return {
              ...prevData,
              currentPrice: currentPrice,
              priceChange: priceChange,
              changePercent: changePercent,
              isPositive: priceChange >= 0,
              historicalData: formattedData,
            }
          })

          if (sortedData.length > 0) {
            sortedData[sortedData.length - 1] = {
              ...sortedData[sortedData.length - 1],
              close: currentPrice,
              price: currentPrice
            }
          }

          calculateExactPerformances(sortedData, currentPrice)
          setLastFetchTime((prev) => ({ ...prev, marketData: new Date() }))
          setRefreshStatus('Market data updated with complete dataset')
          setTimeout(() => setRefreshStatus(''), 3000)
        } catch (err) {
          console.error('Error fetching full market data:', err)
          setRefreshStatus('Error updating market data')
          setTimeout(() => setRefreshStatus(''), 3000)
        } finally {
          setIsRefreshing(false)
        }
      }

      fetchFullMarketData()
    } else if (tabId === 'cache-info') {
      // Fetch the latest cache stats
      const stats = marketstackApi.getCacheStats()
      setCacheStats(stats)
    }
  }

  const handleTimeFilterChange = (filter) => {
    if (filter === activeTimeFilter) return
    setActiveTimeFilter(filter)
  }

  useEffect(() => {
    if (!isInitialMount.current) {
      fetchAllData()
    }
  }, [activeTimeFilter, fetchAllData])

  const handleClearCache = () => {
    marketstackApi.clearCache()
    setCacheStats(marketstackApi.getCacheStats())
    setRefreshStatus('Cache cleared successfully')
    setTimeout(() => setRefreshStatus(''), 3000)
  }

  const generateColorFromSymbol = (symbol) => {
    const colorMap = {
      AAPL: '#1976d2',
      MSFT: '#107c41',
      AMZN: '#ff9900',
      GOOGL: '#4285f4',
      META: '#1877f2',
      TSLA: '#e82127',
      NVDA: '#76b900',
      BTCUSD: '#f7931a',
      ETHUSD: '#627eea',
    }
    
    if (colorMap[symbol]) {
      return colorMap[symbol]
    }
    
    // If it's a crypto symbol not in the map
    if (symbol.toUpperCase().includes('USD')) {
      return '#ff9900' // Default color for crypto
    }
    
    // Otherwise generate a random color
    return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`
  }

  const tabs = [
    { id: 'overview', name: 'Overview' },
    { id: 'chart', name: 'Chart' },
    { id: 'fundamentals', name: 'Fundamentals' },
    { id: 'market-data', name: 'Market Data' },
  ]

  const timeFilters = [
    { id: '1d', name: '1D' },
    { id: '1w', name: '1W' },
    { id: '1m', name: '1M' },
    { id: '3m', name: '3M' },
    { id: '6m', name: '6M' },
    { id: '1y', name: '1Y' },
    { id: '5y', name: '5Y' },
  ]

  const formatNumber = (num) => {
    if (typeof num !== 'number' || isNaN(num)) return 'N/A'
    if (num >= 1000000000) return `$${(num / 1000000000).toFixed(2)}B`
    if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`
    if (num >= 1000) return `$${(num / 1000).toFixed(2)}K`
    return `$${num.toFixed(2)}`
  }

  const formatVolume = (volume) => {
    if (typeof volume !== 'number' || isNaN(volume)) return 'N/A'
    if (volume >= 1000000000) return `${(volume / 1000000000).toFixed(2)}B`
    if (volume >= 1000000) return `${(volume / 1000000).toFixed(2)}M`
    if (volume >= 1000) return `${(volume / 1000).toFixed(2)}K`
    return volume.toString()
  }

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading data for {stockSymbol}...</p>
      </div>
    )
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
    )
  }

  if (!stockData) {
    return (
      <div className={styles.errorContainer}>
        <p>No data available. Please try again.</p>
      </div>
    )
  }

  return (
    <ApiErrorBoundary>
      <div className={styles.container}>
        <div className={styles.stockHeader}>
          <div className={styles.stockTitle}>
            <div className={styles.stockSymbol} style={{ backgroundColor: stockData.color }}>
              {stockData.symbol.charAt(0)}
            </div>
            <div className={styles.stockName}>
              <h1>{stockData.symbol}</h1>
              <p>{stockData.name}</p>
              {stockData.isSimulated && (
                <span className={styles.simulatedBadge}>Simulated Data</span>
              )}
              {stockData.isCrypto && (
                <span className={styles.cryptoBadge}>Crypto</span>
              )}
            </div>
          </div>
          <div className={styles.stockPrice}>
            <p className={styles.currentPrice}>${stockData.currentPrice.toFixed(2)}</p>
            <p className={`${styles.priceChange} ${stockData.isPositive ? styles.positive : styles.negative}`}>
              {stockData.isPositive ? '+' : ''}
              {stockData.priceChange.toFixed(2)} (
              {Math.abs(stockData.changePercent).toFixed(2)}%)
            </p>
            <p className={styles.lastUpdated}>
              Last updated: {marketData && marketData.timestamp ? new Date(marketData.timestamp).toLocaleString() : 'N/A'}
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
                      <StockChart
                        data={historicalData}
                        color={stockData.color}
                        isIntraday={isIntradayFilter(activeTimeFilter)}
                      />
                    ) : (
                      <div className={styles.noData}>No data available</div>
                    )}
                  </div>
                </div>

                <div className={styles.sidebarContainer}>
                  <div className={styles.card}>
                    <h2>Company Info</h2>
                    <div className={styles.summaryGrid}>
                      <div className={styles.summaryItem}>
                        <span className={styles.label}>Exchange</span>
                        <span className={styles.value}>{stockData.company.Exchange}</span>
                      </div>
                      <div className={styles.summaryItem}>
                        <span className={styles.label}>Country</span>
                        <span className={styles.value}>{stockData.company.Country}</span>
                      </div>
                      <div className={styles.summaryItem}>
                        <span className={styles.label}>Sector</span>
                        <span className={styles.value}>{stockData.company.Sector}</span>
                      </div>
                      <div className={styles.summaryItem}>
                        <span className={styles.label}>Industry</span>
                        <span className={styles.value}>{stockData.company.Industry}</span>
                      </div>
                      {stockData.company.Website !== 'N/A' && (
                        <div className={styles.summaryItem}>
                          <span className={styles.label}>Website</span>
                          <a
                            href={stockData.company.Website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.value}
                          >
                            {stockData.company.Website}
                          </a>
                        </div>
                      )}
                      {stockData.company.Description && (
                        <div className={`${styles.summaryItem} ${styles.fullWidth}`}>
                          <span className={styles.label}>About</span>
                          <p className={styles.description}>{stockData.company.Description}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {marketData && (
                    <div className={styles.card}>
                      <h2>Key Statistics</h2>
                      <div className={styles.summaryGrid}>
                        <div className={styles.summaryItem}>
                          <span className={styles.label}>Open</span>
                          <span className={styles.value}>${marketData.open.toFixed(2)}</span>
                        </div>
                        <div className={styles.summaryItem}>
                          <span className={styles.label}>Previous Close</span>
                          <span className={styles.value}>${marketData.prevClose.toFixed(2)}</span>
                        </div>
                        <div className={styles.summaryItem}>
                          <span className={styles.label}>Day High</span>
                          <span className={styles.value}>${marketData.high.toFixed(2)}</span>
                        </div>
                        <div className={styles.summaryItem}>
                          <span className={styles.label}>Day Low</span>
                          <span className={styles.value}>${marketData.low.toFixed(2)}</span>
                        </div>
                        <div className={styles.summaryItem}>
                          <span className={styles.label}>52-Week High</span>
                          <span className={styles.value}>${marketData.high52Week.toFixed(2)}</span>
                        </div>
                        <div className={styles.summaryItem}>
                          <span className={styles.label}>52-Week Low</span>
                          <span className={styles.value}>${marketData.low52Week.toFixed(2)}</span>
                        </div>
                        <div className={styles.summaryItem}>
                          <span className={styles.label}>Volume</span>
                          <span className={styles.value}>{formatVolume(marketData.volume)}</span>
                        </div>
                        <div className={styles.summaryItem}>
                          <span className={styles.label}>Avg Volume</span>
                          <span className={styles.value}>{formatVolume(marketData.avgVolume)}</span>
                        </div>
                        {stockData.isSimulated && (
                          <div className={`${styles.summaryItem} ${styles.fullWidth}`}>
                            <span className={styles.label}>Data Source</span>
                            <span className={styles.value}>
                              <i>Using simulated data</i>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
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
                    <StockChart
                      data={historicalData}
                      color={stockData.color}
                      isIntraday={isIntradayFilter(activeTimeFilter)}
                    />
                  ) : (
                    <div className={styles.noData}>No data available</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'fundamentals' && (
            <div className={styles.fundamentalsSection}>
              <div className={styles.card}>
                <h2>Company Profile</h2>
                <div className={styles.companyProfile}>
                  <div className={styles.profileInfo}>
                    <table className={styles.infoTable}>
                      <tbody>
                        <tr>
                          <td>Symbol:</td>
                          <td><strong>{stockData.symbol}</strong></td>
                        </tr>
                        <tr>
                          <td>Name:</td>
                          <td><strong>{stockData.name}</strong></td>
                        </tr>
                        <tr>
                          <td>Exchange:</td>
                          <td>{stockData.company.Exchange}</td>
                        </tr>
                        <tr>
                          <td>Country:</td>
                          <td>{stockData.company.Country}</td>
                        </tr>
                        <tr>
                          <td>Sector:</td>
                          <td>{stockData.company.Sector}</td>
                        </tr>
                        <tr>
                          <td>Industry:</td>
                          <td>{stockData.company.Industry}</td>
                        </tr>
                        {stockData.company.Website !== 'N/A' && (
                          <tr>
                            <td>Website:</td>
                            <td>
                              <a
                                href={stockData.company.Website}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {stockData.company.Website}
                              </a>
                            </td>
                          </tr>
                        )}
                        {stockData.isSimulated && (
                          <tr>
                            <td>Data Source:</td>
                            <td><i>Simulated data</i></td>
                          </tr>
                        )}
                        {stockData.isCrypto && (
                          <tr>
                            <td>Asset Type:</td>
                            <td>Cryptocurrency</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className={styles.companyDescription}>
                    <h3>About {stockData.name}</h3>
                    <p>{stockData.company.Description}</p>
                    
                    {stockData.isSimulated && (
                      <div className={styles.simulationNotice}>
                        <p><strong>Note:</strong> The data shown for this symbol is simulated. 
                        Real market data would be available with a valid API subscription.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'market-data' && marketData && (
            <div className={styles.marketDataSection}>
              {refreshStatus && (
                <div className={styles.refreshStatus}>
                  <p>{refreshStatus}</p>
                  {isRefreshing && <div className={styles.miniSpinner}></div>}
                </div>
              )}
              <div className={styles.cardRow}>
                <div className={styles.card}>
                  <h2>Daily Trading Information</h2>
                  <div className={styles.infoTable}>
                    <table className={styles.fullWidthTable}>
                      <tbody>
                        <tr>
                          <td>Open</td>
                          <td>${marketData.open.toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td>High</td>
                          <td>${marketData.high.toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td>Low</td>
                          <td>${marketData.low.toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td>Previous Close</td>
                          <td>${marketData.prevClose.toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td>Current</td>
                          <td>${stockData.currentPrice.toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td>Change</td>
                          <td className={stockData.isPositive ? styles.positive : styles.negative}>
                            {stockData.isPositive ? '+' : ''}
                            {stockData.priceChange.toFixed(2)} (
                            {Math.abs(stockData.changePercent).toFixed(2)}%)
                          </td>
                        </tr>
                        <tr>
                          <td>Last Updated</td>
                          <td>{marketData.timestamp ? new Date(marketData.timestamp).toLocaleString() : 'N/A'}</td>
                        </tr>
                        {stockData.isSimulated && (
                          <tr>
                            <td>Data Source</td>
                            <td><i>Simulated data</i></td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className={styles.card}>
                  <h2>Volume Information</h2>
                  <div className={styles.infoTable}>
                    <table className={styles.fullWidthTable}>
                      <tbody>
                        <tr>
                          <td>Today&apos;s Volume</td>
                          <td>{formatVolume(marketData.volume)}</td>
                        </tr>
                        <tr>
                          <td>Average Volume (30 days)</td>
                          <td>{formatVolume(marketData.avgVolume)}</td>
                        </tr>
                        <tr>
                          <td>Relative Volume</td>
                          <td>
                            {marketData.avgVolume > 0
                              ? (marketData.volume / marketData.avgVolume).toFixed(2)
                              : 'N/A'}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className={styles.cardRow}>
                <div className={styles.card}>
                  <h2>52-Week Range</h2>
                  <div className={styles.rangeContainer}>
                    <div className={styles.rangeBars}>
                      <div className={styles.rangeBar}>
                        <div className={styles.rangeBarInner}>
                          <div
                            className={styles.rangeBarFill}
                            style={{
                              width: `${((stockData.currentPrice - marketData.low52Week) / (marketData.high52Week - marketData.low52Week)) * 100 || 0}%`,
                            }}
                          ></div>
                          <div
                            className={styles.rangeBarMarker}
                            style={{
                              left: `${((stockData.currentPrice - marketData.low52Week) / (marketData.high52Week - marketData.low52Week)) * 100 || 0}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className={styles.rangeLabels}>
                      <div className={styles.rangeLow}>${marketData.low52Week.toFixed(2)}</div>
                      <div className={styles.rangeValue}>${stockData.currentPrice.toFixed(2)}</div>
                      <div className={styles.rangeHigh}>${marketData.high52Week.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.card}>
                <h2>Historical Performance</h2>
                <div className={styles.performanceGrid}>
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
                          <td>5 Years</td>
                          <td className={performanceData.fiveYears.change >= 0 ? styles.positive : styles.negative}>
                            {performanceData.fiveYears.change >= 0 ? '+' : ''}$
                            {Math.abs(performanceData.fiveYears.change).toFixed(2)}
                          </td>
                          <td className={performanceData.fiveYears.change >= 0 ? styles.positive : styles.negative}>
                            {performanceData.fiveYears.change >= 0 ? '+' : ''}
                            {Math.abs(performanceData.fiveYears.percentChange).toFixed(2)}%
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
          )}
          
          {/* New tab for API Cache Information */}
          {activeTab === 'cache-info' && (
            <div className={styles.cacheInfoSection}>
              <div className={styles.card}>
                <h2>API Cache Information</h2>
                <p>MarketStack API utilizes caching to reduce API calls and improve performance.</p>
                
                {cacheStats && (
                  <div className={styles.cacheStats}>
                    <div className={styles.infoTable}>
                      <table className={styles.fullWidthTable}>
                        <tbody>
                          <tr>
                            <td>Total Items in Cache</td>
                            <td>{cacheStats.size}</td>
                          </tr>
                          <tr>
                            <td>Stock Quote Cache Duration</td>
                            <td>{cacheStats.durations.quote / (60 * 1000)} minutes</td>
                          </tr>
                          <tr>
                            <td>Historical Data Cache Duration</td>
                            <td>{cacheStats.durations.historical / (24 * 60 * 60 * 1000)} days</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    
                    <div className={styles.cacheList}>
                      <h3>Cached Items</h3>
                      <div className={styles.cacheEntries}>
                        {cacheStats.keys.map((key, index) => (
                          <div key={index} className={styles.cacheEntry}>
                            {key}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className={styles.cacheActions}>
                      <button className={styles.btnClear} onClick={handleClearCache}>
                        Clear Cache
                      </button>
                      <button className={styles.btnRefresh} onClick={() => fetchAllData(true)}>
                        Refresh Data
                      </button>
                    </div>
                  </div>
                )}
                
                <div className={styles.simulationInfo}>
                  <h3>About The Data</h3>
                  <p>
                    The MarketStack API provides real-time and historical stock market data. When the
                    API cannot provide data (due to limitations, access permissions, or connectivity issues),
                    the system automatically generates simulated data based on the stock symbol.
                  </p>
                  
                  <div className={styles.dataSourceInfo}>
                    <p>
                      <strong>Current Data Source:</strong>{' '}
                      {stockData.isSimulated ? 'Simulated data (fallback)' : 'API data'}
                    </p>
                    <p>
                      <strong>Data Type:</strong>{' '}
                      {stockData.isCrypto ? 'Cryptocurrency' : 'Stock Market'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={styles.tradingActions}>
          <button className={styles.setAlertButton}>Set Price Alert</button>
          <button className={styles.refreshButton} onClick={() => fetchAllData(true)}>
            Refresh Data
          </button>
        </div>

        <div className={styles.newsSection}>
          <h2>Recent News</h2>
          <div className={styles.newsPlaceholder}>
            <p>News data would be available with premium API access.</p>
          </div>
        </div>
      </div>
    </ApiErrorBoundary>
  )
}

StockDetail.propTypes = {
  stockSymbolProp: PropTypes.string,
}

StockDetail.defaultProps = {
  stockSymbolProp: '',
}

export default StockDetail