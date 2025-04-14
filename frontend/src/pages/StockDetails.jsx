import React, { useState, useEffect, useCallback, useRef } from 'react'
import PropTypes from 'prop-types'
import styles from '../styles/StockDetails.module.css'
import tiingoApi from '../services/tiingoApi'
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
  const stockDataRef = useRef(null)
  const isInitialMount = useRef(true)

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

  const getTiingoInterval = (timeFilter) => {
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

      const historicalData = await tiingoApi.getHistoricalData(
        stockSymbol,
        oldestDate,
        today,
        'daily',
      )

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
  }, [stockSymbol, calculateExactPerformances])

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

        const interval = getTiingoInterval(activeTimeFilter)
        const isIntraday = isIntradayFilter(activeTimeFilter)

        let historical
        if (isIntraday) {
          historical = await tiingoApi.getIntradayData(stockSymbol, interval)
          if (activeTimeFilter === '1w' && historical.length < 40) {
            historical = await tiingoApi.getIntradayData(stockSymbol, '1hour')
          }
        } else {
          historical = await tiingoApi.getHistoricalData(
            stockSymbol,
            fromDate,
            today,
            interval,
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

        const [quote, companyProfile] = await Promise.all([
          tiingoApi.getStockQuote(stockSymbol),
          tiingoApi.getCompanyProfile(stockSymbol),
        ])

        const lastPrice = quote.tngoLast || quote.last || quote.price || 
                         (chartData.length > 0 ? chartData[chartData.length - 1].price : 0)

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
          yearlyData = await tiingoApi.getHistoricalData(
            stockSymbol,
            oneYearAgo,
            today,
            'daily',
          )
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

        setMarketData({
          open: quote.open || (chartData.length > 0 ? chartData[0].open : 0),
          high: quote.high || (chartData.length > 0 ? Math.max(...chartData.map((d) => d.high)) : 0),
          low: quote.low || (chartData.length > 0 ? Math.min(...chartData.map((d) => d.low)) : 0),
          volume: quote.volume || (chartData.length > 0 ? chartData[chartData.length - 1].volume : 0),
          high52Week: high52Week,
          low52Week: low52Week,
          avgVolume: avgVolume,
          prevClose: quote.prevClose || referencePrice,
          currentPrice: lastPrice,
        })

        setStockData({
          symbol: stockSymbol,
          name: companyProfile.name || stockSymbol,
          currentPrice: lastPrice,
          priceChange: priceChange,
          changePercent: changePercent,
          isPositive: isPositive,
          color: generateColorFromSymbol(stockSymbol),
          historicalData: chartData,
          company: {
            Name: companyProfile.name,
            Exchange: companyProfile.exchange_acronym || companyProfile.stock_exchange || 'N/A',
            Country: companyProfile.exchange_country || 'US',
            Description: companyProfile.description || 'No description available',
            Sector: companyProfile.sector || 'N/A',
            Industry: companyProfile.industry || 'N/A',
            Website: companyProfile.website || 'N/A',
          },
        })

        setHistoricalData(chartData)
        setLastFetchTime((prev) => ({ ...prev, marketData: new Date() }))
        await calculateAllPerformances(lastPrice)
      } catch (err) {
        console.error('Error fetching stock data:', err)
        if (err.response?.data?.error?.code === 'validation_error') {
          setError('Invalid time interval selected. Please try a different time range.')
        } else {
          setError('Could not load stock data. Please try again later.')
        }
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
        setRefreshStatus('')
      }
    },
    [stockSymbol, activeTimeFilter, calculateAllPerformances]
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

          const quote = await tiingoApi.getStockQuote(stockSymbol)
          const historical = await tiingoApi.getHistoricalData(
            stockSymbol,
            fiveYearsAgo,
            today,
            'daily',
          )

          const currentPrice = quote.tngoLast || quote.last || quote.price
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

  const generateColorFromSymbol = (symbol) => {
    const colorMap = {
      AAPL: '#1976d2',
      MSFT: '#107c41',
      AMZN: '#ff9900',
      GOOGL: '#4285f4',
      META: '#1877f2',
      TSLA: '#e82127',
      NVDA: '#76b900',
    }
    return colorMap[symbol] || `#${Math.floor(Math.random() * 16777215).toString(16)}`
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
    if (num >= 1000000000) return `$${(num / 1000000000).toFixed(2)}B`
    if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`
    if (num >= 1000) return `$${(num / 1000).toFixed(2)}K`
    return `$${num.toFixed(2)}`
  }

  const formatVolume = (volume) => {
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
            </div>
          </div>
          <div className={styles.stockPrice}>
            <p className={styles.currentPrice}>${stockData.currentPrice.toFixed(2)}</p>
            <p className={`${styles.priceChange} ${stockData.isPositive ? styles.positive : styles.negative}`}>
              {stockData.isPositive ? '+' : ''}
              {stockData.priceChange.toFixed(2)} (
              {Math.abs(stockData.changePercent).toFixed(2)}%)
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
                      </tbody>
                    </table>
                  </div>
                  <div className={styles.companyDescription}>
                    <h3>About {stockData.name}</h3>
                    <p>{stockData.company.Description}</p>
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
        </div>

        <div className={styles.tradingActions}>
          <button className={styles.setAlertButton}>Set Price Alert</button>
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