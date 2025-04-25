import React, { useState, useEffect, useCallback, useRef } from 'react'
import PropTypes from 'prop-types'
import styles from '../styles/StockDetails.module.css'
import marketstackApi from '../services/marketstackApi'
import StockChart from '../components/StockChart'
import ApiErrorBoundary from '../components/ApiErrorBoundary'
import { useParams, useNavigate } from 'react-router-dom'

const StockDetail = ({ stockSymbolProp }) => {
  const { symbol: symbolFromUrl } = useParams()
  const stockSymbol = stockSymbolProp || symbolFromUrl || 'AAPL'
  const [activeTab, setActiveTab] = useState('overview')
  const [activeTimeFilter, setActiveTimeFilter] = useState('3m')
  const [stockData, setStockData] = useState(null)
  const [historicalData, setHistoricalData] = useState([])
  const [marketData, setMarketData] = useState(null)
  const [companyInfo, setCompanyInfo] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [lastFetchTime, setLastFetchTime] = useState({ marketData: null })
  const [refreshStatus, setRefreshStatus] = useState('')
  const [cacheStats, setCacheStats] = useState(null)
  const stockDataRef = useRef(null)
  const [isCrypto, setIsCrypto] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const maxRetries = 3
  const navigate = useNavigate()

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

  useEffect(() => {
    setIsCrypto(stockSymbol.toUpperCase().includes('USD'))
  }, [stockSymbol])

  const processCompanyData = (apiResponse) => {
    console.log('Processing company data from API:', apiResponse);
    
    if (!apiResponse) {
      console.warn('No API response received');
      return null;
    }

    // Verificăm dacă răspunsul este un obiect valid
    if (typeof apiResponse === 'object' && apiResponse !== null) {
      console.log('Using API response directly');
      return apiResponse;
    }

    console.warn('No valid company data structure found in API response');
    return null;
  };

  useEffect(() => {
    const fetchCompanyInfo = async () => {
      try {
        const response = await marketstackApi.getTickerInfo(stockSymbol);
        console.log('Raw API response:', response);
        
        // Procesează datele pentru a le aduce la formatul așteptat
        const processedData = processCompanyData(response);
        console.log('Processed company data:', processedData);
        
        setCompanyInfo(processedData);
      } catch (error) {
        console.error('Error fetching company info:', error);
      }
    };

    if (stockSymbol) {
      fetchCompanyInfo();
    }
  }, [stockSymbol]);

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

  // Funcția pentru calcularea performanței exacte bazate pe perioade fixe de timp
  const calculateExactPerformances = useCallback((historicalData, currentPriceOverride = null) => {
    if (!historicalData || historicalData.length === 0) {
      console.warn('No historical data available for performance calculations');
      return;
    }

    console.log(`Calculating performances with ${historicalData.length} data points`);

    // Sortăm datele cronologic
    const sortedData = [...historicalData].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Obținem ultimul punct de date
    const lastDataPoint = sortedData[sortedData.length - 1];
    const currentPrice = currentPriceOverride !== null ? currentPriceOverride : (lastDataPoint.close || lastDataPoint.price);
    const currentDate = new Date(lastDataPoint.date);

    console.log('Current price used for performance calculations:', currentPrice);
    console.log('Current date used for performance calculations:', currentDate.toISOString());

    // Funcție îmbunătățită pentru a găsi cel mai apropiat punct de date pentru o dată țintă
    const findClosestDataPoint = (targetDate) => {
      let closestIndex = 0;
      let closestDiff = Infinity;
      let exactMatch = false;
      
      // Prima dată, încercăm să găsim o potrivire exactă pentru dată
      for (let i = 0; i < sortedData.length; i++) {
        const dataDate = new Date(sortedData[i].date);
        if (dataDate.toDateString() === targetDate.toDateString()) {
          console.log(`Found exact match for ${targetDate.toISOString()} at index ${i}`);
          exactMatch = true;
          closestIndex = i;
          break;
        }
      }

      // Dacă nu găsim o potrivire exactă, căutăm cel mai apropiat punct de date anterior
      if (!exactMatch) {
        for (let i = 0; i < sortedData.length; i++) {
          const dataDate = new Date(sortedData[i].date);
          const diff = targetDate.getTime() - dataDate.getTime();
          if (diff >= 0 && diff < closestDiff) {
            closestDiff = diff;
            closestIndex = i;
          }
        }

        // Dacă nu găsim un punct de date anterior, căutăm cel mai apropiat punct de date în general
        if (closestDiff === Infinity) {
          closestDiff = Infinity;
          for (let i = 0; i < sortedData.length; i++) {
            const dataDate = new Date(sortedData[i].date);
            const diff = Math.abs(dataDate.getTime() - targetDate.getTime());
        if (diff < closestDiff) {
              closestDiff = diff;
              closestIndex = i;
            }
          }
        }

        console.log(`Found closest data point for ${targetDate.toISOString()} at index ${closestIndex}, 
                    date: ${new Date(sortedData[closestIndex].date).toISOString()}, 
                    diff: ${closestDiff / (24 * 60 * 60 * 1000)} days`);
      }

      return sortedData[closestIndex];
    };

    // Definim intervalele de timp pentru care calculăm performanțele
    const timeRanges = [
      { name: 'day', days: 1, businessDays: true },
      { name: 'week', days: 7, businessDays: false },
      { name: 'month', days: 30, businessDays: false },
      { name: 'threeMonths', days: 90, businessDays: false },
      { name: 'sixMonths', days: 180, businessDays: false },
      { name: 'year', days: 365, businessDays: false },
      { name: 'fiveYears', days: 365 * 5, businessDays: false },
    ];

    const newPerformanceData = {};

    // Calculăm performanța pentru fiecare interval de timp
    timeRanges.forEach((range) => {
      const pastDate = new Date(currentDate);

      if (range.businessDays && range.days <= 5) {
        // Pentru intervale scurte cu zile lucrătoare, folosim o abordare simplificată
        // Găsim simplu punctul de date de acum range.days poziții în urmă în setul de date sortat
        const indexDiff = Math.min(range.days, sortedData.length - 1);
        if (sortedData.length > indexDiff) {
          const pastIndex = sortedData.length - 1 - indexDiff;
          const pastDataPoint = sortedData[pastIndex];
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

          console.log(`${range.name} performance: ${change.toFixed(2)} (${percentChange.toFixed(2)}%), 
                      from ${new Date(pastDataPoint.date).toISOString()} 
                      to ${currentDate.toISOString()}`);
          return;
        }
      }

      // Pentru intervale mai lungi, folosim calculul bazat pe data calendaristică
      if (range.businessDays) {
        // Pentru zile lucrătoare, trebuie să numărăm zilele de tranzacționare reale
        let daysToSubtract = range.days;
        let currentDateCopy = new Date(pastDate);

        while (daysToSubtract > 0) {
          currentDateCopy.setDate(currentDateCopy.getDate() - 1);
          const dayOfWeek = currentDateCopy.getDay();
          // Sărim peste weekend (0 = Duminică, 6 = Sâmbătă)
          if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            daysToSubtract--;
          }
        }
        pastDate.setTime(currentDateCopy.getTime());
      } else {
        // Pentru zile calendaristice, simplu scădem numărul de zile
        pastDate.setDate(currentDate.getDate() - range.days);
      }

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

      console.log(`${range.name} performance: ${change.toFixed(2)} (${percentChange.toFixed(2)}%), 
                  from ${new Date(pastDataPoint.date).toISOString()} 
                  to ${currentDate.toISOString()}`);
    });

    // Calculul performanței YTD (Year to Date)
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

    console.log(`YTD performance: ${ytdChange.toFixed(2)} (${ytdPercentChange.toFixed(2)}%), 
                from ${new Date(startOfYearDataPoint.date).toISOString()} 
                to ${currentDate.toISOString()}`);

    // Actualizăm starea cu noile date de performanță
    setPerformanceData(newPerformanceData);

    return newPerformanceData;
  }, []);

  // Funcția nouă pentru a calcula performanța strict pe baza datelor din grafic
  const calculatePerformanceFromChartData = useCallback((chartData, currentPrice = null) => {
    if (!chartData || chartData.length === 0) {
      console.warn('No chart data available for performance calculations');
      return {};
    }
  
    console.log(`Calculating chart-based performance with ${chartData.length} data points`);
  
    // Sortăm datele cronologic
    const sortedData = [...chartData].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  
    // Obținem primul și ultimul punct de date din grafic
    const firstDataPoint = sortedData[0];
    const lastDataPoint = sortedData[sortedData.length - 1];
    
    // Folosim prețul curent pentru ultimul punct dacă este furnizat
    const latestPrice = currentPrice !== null ? currentPrice : (lastDataPoint.price || lastDataPoint.close);
    const referencePrice = firstDataPoint.price || firstDataPoint.close;
    
    // Calculăm schimbarea pentru intervalul vizibil în grafic
    const change = latestPrice - referencePrice;
    const percentChange = referencePrice !== 0 ? (change / referencePrice) * 100 : 0;
  
    console.log(`Chart-based performance: ${change.toFixed(2)} (${percentChange.toFixed(2)}%), 
                from ${new Date(firstDataPoint.date).toISOString()} 
                to ${new Date(lastDataPoint.date).toISOString()}`);
  
    // Returnăm performanța bazată pe datele din grafic
    return {
      chartPerformance: {
        change: change,
        percentChange: percentChange,
        timeframe: null, // Nu mai folosim activeTimeFilter aici
        startDate: firstDataPoint.date,
        startPrice: referencePrice,
        endDate: lastDataPoint.date,
        endPrice: latestPrice
      }
    };
  }, []);
  // Funcție pentru calcule independente de performanță
  const calculatePerformancesIndependently = useCallback(async (currentPriceOverride = null) => {
    try {
      // Definim data curentă
      const today = new Date();
      
      console.log('Fetching historical data for chart-based performance calculations');
      setRefreshStatus('Fetching historical data for chart-based performance analysis...');
  
      // Obținem prețul curent
      let currentPrice = currentPriceOverride;
      if (currentPrice === null && stockDataRef.current) {
        currentPrice = stockDataRef.current.currentPrice;
      }
  
      // Pregătim un obiect pentru stocarea rezultatelor de performanță
      const newPerformanceData = {};
      
      // Pentru fiecare timeframe, vom obține datele și vom calcula performanța
      // similar cu modul în care se calculează pentru grafic
      const timeframes = [
        { id: '1d', name: 'day', days: 1 },
        { id: '1w', name: 'week', days: 7 },
        { id: '1m', name: 'month', days: 30 },
        { id: '3m', name: 'threeMonths', days: 90 },
        { id: '6m', name: 'sixMonths', days: 180 },
        { id: '1y', name: 'year', days: 365 },
        { id: '5y', name: 'fiveYears', days: 365 * 5 }
      ];
  
      // Pentru fiecare timeframe, vom face un calcul separat
      for (const timeframe of timeframes) {
        let fromDate = new Date();
        
        // Calculăm data de start în funcție de timeframe
        if (timeframe.id === '1d') {
          fromDate = new Date(today.getTime() - (24 * 60 * 60 * 1000));
        } else if (timeframe.id === '1w') {
          fromDate = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000));
        } else if (timeframe.id === '1m') {
          fromDate = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
        } else if (timeframe.id === '3m') {
          fromDate = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
        } else if (timeframe.id === '6m') {
          fromDate = new Date(today.getFullYear(), today.getMonth() - 6, today.getDate());
        } else if (timeframe.id === '1y') {
          fromDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
        } else if (timeframe.id === '5y') {
          const fiveYearsAgo = new Date(today);
          fiveYearsAgo.setFullYear(today.getFullYear() - 5);
          if (fiveYearsAgo.getMonth() !== today.getMonth()) {
            fiveYearsAgo.setDate(0);
          }
          fromDate = fiveYearsAgo;
        }
  
        const interval = getInterval(timeframe.id);
        const isIntraday = isIntradayFilter(timeframe.id);
  
        // Obținem datele pentru acest timeframe
        let historicalData = [];
        try {
          if (isIntraday) {
            historicalData = await marketstackApi.getIntradayData(stockSymbol, interval);
          } else if (isCrypto) {
        historicalData = await marketstackApi.getCryptoData(
          stockSymbol,
              fromDate,
          today,
          'daily'
            );
      } else {
            const fromDateStr = fromDate.toISOString().split('T')[0];
            const toDateStr = today.toISOString().split('T')[0];
  
            if (['3m', '6m', '1y', '5y'].includes(timeframe.id)) {
        historicalData = await marketstackApi.getEODData(
          stockSymbol, 
                fromDateStr,
                toDateStr
              );
            } else {
              historicalData = await marketstackApi.getIntradayData(
                stockSymbol,
                'daily'
              );
            }
          }
          
          // Filtrăm datele simulate
          historicalData = historicalData.filter(item => !item.isSimulated && item.apiSource === 'marketstack');
          
          // Formatăm datele pentru grafic în același format ca cele folosite în Overview
          const chartData = historicalData.map((item) => ({
            date: item.date,
            price: item.price || item.close || item.marketstack_last || item.last,
            open: item.open,
            high: item.high,
            low: item.low,
            volume: item.volume,
            apiSource: item.apiSource || 'unknown'
          }));
          
          // Calculăm performanța pentru acest timeframe folosind aceeași metodă ca în grafic
          const performance = calculatePerformanceFromChartData(chartData, currentPrice);
          
          if (performance && performance.chartPerformance) {
            // Salvăm rezultatul în noul obiect de performanță
            newPerformanceData[timeframe.name] = {
              change: performance.chartPerformance.change,
              percentChange: performance.chartPerformance.percentChange,
              currentDate: performance.chartPerformance.endDate,
              currentPrice: performance.chartPerformance.endPrice,
              pastDate: performance.chartPerformance.startDate,
              pastPrice: performance.chartPerformance.startPrice
            };
            
            console.log(`${timeframe.name} performance (chart-based): ${performance.chartPerformance.change.toFixed(2)} (${performance.chartPerformance.percentChange.toFixed(2)}%), 
                        from ${new Date(performance.chartPerformance.startDate).toISOString()} 
                        to ${new Date(performance.chartPerformance.endDate).toISOString()}`);
          }
        } catch (error) {
          console.error(`Error calculating performance for ${timeframe.name}:`, error);
        }
      }
      
      // Calculăm și performanța YTD (Year to Date)
      try {
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        const fromDateStr = startOfYear.toISOString().split('T')[0];
        const toDateStr = today.toISOString().split('T')[0];
        
        let ytdData = [];
        if (isCrypto) {
          ytdData = await marketstackApi.getCryptoData(
            stockSymbol,
            startOfYear,
            today,
            'daily'
          );
        } else {
          ytdData = await marketstackApi.getEODData(
            stockSymbol,
            fromDateStr,
            toDateStr
          );
        }
        
        // Filtrăm datele simulate
        ytdData = ytdData.filter(item => !item.isSimulated && item.apiSource === 'marketstack');
        
        // Formatăm datele pentru grafic
        const chartData = ytdData.map((item) => ({
          date: item.date,
          price: item.price || item.close || item.marketstack_last || item.last,
          open: item.open,
          high: item.high,
          low: item.low,
          volume: item.volume,
          apiSource: item.apiSource || 'unknown'
        }));
        
        // Calculăm performanța YTD
        const performance = calculatePerformanceFromChartData(chartData, currentPrice);
        
        if (performance && performance.chartPerformance) {
          newPerformanceData.ytd = {
            change: performance.chartPerformance.change,
            percentChange: performance.chartPerformance.percentChange,
            currentDate: performance.chartPerformance.endDate,
            currentPrice: performance.chartPerformance.endPrice,
            pastDate: performance.chartPerformance.startDate,
            pastPrice: performance.chartPerformance.startPrice
          };
          
          console.log(`YTD performance (chart-based): ${performance.chartPerformance.change.toFixed(2)} (${performance.chartPerformance.percentChange.toFixed(2)}%), 
                      from ${new Date(performance.chartPerformance.startDate).toISOString()} 
                      to ${new Date(performance.chartPerformance.endDate).toISOString()}`);
        }
      } catch (error) {
        console.error('Error calculating YTD performance:', error);
      }
      
      // Actualizăm starea cu noile date de performanță
      if (Object.keys(newPerformanceData).length > 0) {
        setPerformanceData(newPerformanceData);
      }
      
      setRefreshStatus('Performance data updated successfully using chart-based calculations');
      setTimeout(() => setRefreshStatus(''), 3000);
      
      return [];
    } catch (error) {
      console.error('Error calculating performance data:', error);
      setRefreshStatus('Error updating performance data');
      setTimeout(() => setRefreshStatus(''), 3000);
      return [];
    }
  }, [stockSymbol, calculatePerformanceFromChartData, isCrypto, getInterval, isIntradayFilter]);

  // Înlocuim vechea funcție cu cea nouă pentru compatibilitate
  const calculateAllPerformances = useCallback(async (currentPriceOverride = null) => {
    // Înlocuim această funcție cu noua funcție independentă
    return calculatePerformancesIndependently(currentPriceOverride);
  }, [calculatePerformancesIndependently]);

  // Verifică și afișează informațiile companiei pentru debugging
  useEffect(() => {
    if (companyInfo) {
      console.log('Company Info în componenta StockDetail:', companyInfo);
    }
  }, [companyInfo]);

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
          case '1d': 
            fromDate = new Date(today.getTime() - (24 * 60 * 60 * 1000))
            break
          case '1w': 
            fromDate = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000))
            break
          case '1m': 
            fromDate = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())
            break
          case '3m': 
            fromDate = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate())
            break
          case '6m': 
            fromDate = new Date(today.getFullYear(), today.getMonth() - 6, today.getDate())
            break
          case '1y': 
            fromDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate())
            break
          case '5y': 
            const fiveYearsAgo = new Date(today)
            fiveYearsAgo.setFullYear(today.getFullYear() - 5)
            if (fiveYearsAgo.getMonth() !== today.getMonth()) {
              fiveYearsAgo.setDate(0)
            }
            fromDate = fiveYearsAgo
            break
          default: 
            fromDate = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate())
        }

        const interval = getInterval(activeTimeFilter)
        const isIntraday = isIntradayFilter(activeTimeFilter)

        let historical = []
        try {
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
            const fromDateStr = fromDate.toISOString().split('T')[0]
            const toDateStr = today.toISOString().split('T')[0]
            
            if (['3m', '6m', '1y', '5y'].includes(activeTimeFilter)) {
              historical = await marketstackApi.getEODData(
                stockSymbol,
                fromDateStr,
                toDateStr
              )
            } else {
              historical = await marketstackApi.getIntradayData(
                stockSymbol, 
                'daily'
              )
            }
            
            if (!historical || historical.length === 0 || historical.every(item => item.isSimulated)) {
              if (retryCount < maxRetries) {
                setRetryCount(prev => prev + 1)
                await new Promise(resolve => setTimeout(resolve, 2000))
                historical = await marketstackApi.getIntradayData(
                  stockSymbol, 
                  'daily'
                )
              }
            }
          }
        } catch (error) {
          console.error('Error fetching historical data:', error)
          // Do not fallback to simulated data
          historical = []
        }

        // Filter out simulated data
        historical = historical.filter(item => !item.isSimulated && item.apiSource === 'marketstack')

        const chartData = historical.map((item) => ({
          date: item.date,
          price: item.price || item.close || item.marketstack_last || item.last,
          open: item.open,
          high: item.high,
          low: item.low,
          volume: item.volume,
          apiSource: item.apiSource || 'unknown'
        }))

        const quote = await marketstackApi.getStockQuote(stockSymbol)
        
        // Filter out simulated quote data
        if (quote.isSimulated || quote.apiSource !== 'marketstack') {
          throw new Error('Only real API data is allowed')
        }

        const cacheStatsData = marketstackApi.getCacheStats()
        setCacheStats(cacheStatsData)

        const lastPrice = quote.price
        
        if (chartData.length > 0) {
          chartData[chartData.length - 1].price = lastPrice
        }

        // For Overview tab, calculate percentage based on the active chart timeframe
        let referencePrice
        if (chartData.length > 0) {
          // Always use the first price in the chart data as reference
          referencePrice = chartData[0].price
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
        try {
          if (activeTimeFilter !== '1y' && activeTimeFilter !== '5y') {
            if (isCrypto) {
              yearlyData = await marketstackApi.getCryptoData(
                stockSymbol,
                oneYearAgo,
                today,
                'daily'
              )
            } else {
              const oneYearAgoStr = oneYearAgo.toISOString().split('T')[0]
              const todayStr = today.toISOString().split('T')[0]
              
              yearlyData = await marketstackApi.getIntradayData(
                stockSymbol, 
                'daily'
              )
            }
          }
        } catch (error) {
          console.error('Error fetching yearly data:', error)
          yearlyData = []
        }

        // Filter out simulated yearly data
        yearlyData = yearlyData.filter(item => !item.isSimulated && item.apiSource === 'marketstack')

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

        // Calculate 1-day performance using the same logic as in calculateExactPerformances
        const sortedHistorical = [...historical].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        const lastDataPoint = sortedHistorical[sortedHistorical.length - 1];
        const currentDate = new Date(lastDataPoint.date);
        const pastDate = new Date(currentDate);
        pastDate.setDate(currentDate.getDate() - 1);

        // Find the closest previous trading day
        let closestIndex = 0;
        let closestDiff = Infinity;

        for (let i = 0; i < sortedHistorical.length; i++) {
          const dataDate = new Date(sortedHistorical[i].date);
          const diff = pastDate.getTime() - dataDate.getTime();
          if (diff >= 0 && diff < closestDiff) {
            closestDiff = diff;
            closestIndex = i;
          }
        }

        const pastDataPoint = sortedHistorical[closestIndex];
        const pastPrice = pastDataPoint.close || pastDataPoint.price;
        const oneDayChange = lastPrice - pastPrice;
        const oneDayChangePercent = pastPrice !== 0 ? (oneDayChange / pastPrice) * 100 : 0;

        // Save this calculation to use in both sections
        const dailyPerformance = {
          change: oneDayChange,
          percentChange: oneDayChangePercent,
          currentDate: lastDataPoint.date,
          currentPrice: lastPrice,
          pastDate: pastDataPoint.date,
          pastPrice: pastPrice
        };

        // Update market data with the consistent daily performance values
        setMarketData({
          open: quote.open,
          high: quote.high,
          low: quote.low,
          volume: quote.volume,
          high52Week: high52Week,
          low52Week: low52Week,
          avgVolume: avgVolume,
          prevClose: quote.price - quote.change,
          currentPrice: lastPrice,
          change: dailyPerformance.change,          // Use the consistent daily performance
          changePercent: dailyPerformance.percentChange,  // Use the consistent daily performance
          timestamp: quote.timestamp,
          apiSource: quote.apiSource
        });

        // Now, add this data to the performanceData as well to ensure consistency
        // This ensures that both sections use the same data
        const newPerformanceData = {...performanceData};
        newPerformanceData.day = dailyPerformance;

        // Update performance data immediately for the "Daily Trading Information" section
        setPerformanceData(newPerformanceData);

        setStockData({
          symbol: stockSymbol,
          name: companyInfo?.name || stockSymbol,
          currentPrice: lastPrice,
          priceChange: activeTab === 'market-data' ? dailyPerformance.change : priceChange,
          changePercent: activeTab === 'market-data' ? dailyPerformance.percentChange : changePercent,
          isPositive: activeTab === 'market-data' ? dailyPerformance.change >= 0 : isPositive,
          color: generateColorFromSymbol(stockSymbol),
          historicalData: chartData,
          company: {
            Name: companyInfo?.name || stockSymbol,
            Exchange: companyInfo?.exchange_code || 'N/A',
            Country: companyInfo?.address?.stateOrCountry || 'N/A',
            Description: companyInfo?.about || 'N/A',
            Sector: companyInfo?.sector || 'N/A',
            Industry: companyInfo?.industry || 'N/A',
            Website: companyInfo?.website || 'N/A',
          },
          apiSource: chartData.length > 0 ? chartData[0].apiSource : 'unknown'
        })

        setHistoricalData(chartData)
        setLastFetchTime((prev) => ({ ...prev, marketData: new Date() }))
        
        // Dacă suntem în tab-ul Market Data, actualizăm performanța independentă
        // Altfel, doar actualizăm datele pentru grafic fără a afecta tab-ul Market Data
        if (activeTab === 'market-data' && isRefresh) {
          // Folosim un setTimeout pentru a întrerupe bucla de rerenderizare
          setTimeout(() => {
            calculatePerformancesIndependently(lastPrice)
              .then(() => {
                setRefreshStatus('Performance data updated successfully')
                setTimeout(() => setRefreshStatus(''), 3000)
              })
              .catch(err => {
                console.error('Error updating performance data:', err)
                setRefreshStatus('Error updating performance data')
                setTimeout(() => setRefreshStatus(''), 3000)
              })
          }, 0);
        } else {
          // Pentru tab-ul Overview, calculăm performanța bazată pe datele din grafic
          const chartPerformance = calculatePerformanceFromChartData(chartData, lastPrice);
          
          // Actualizăm stockData
          setStockData(prevData => {
            if (!prevData) return null;
            return {
              ...prevData,
              priceChange: chartPerformance.chartPerformance?.change || priceChange,
              changePercent: chartPerformance.chartPerformance?.percentChange || changePercent,
              isPositive: (chartPerformance.chartPerformance?.change || priceChange) >= 0,
              chartPerformance: chartPerformance.chartPerformance
            };
          });
        }
        setRetryCount(0)
      } catch (err) {
        console.error('Error fetching stock data:', err)
        setError('Could not load stock data. Please try again later.')
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
        setRefreshStatus('')
      }
    },
    [stockSymbol, activeTimeFilter, calculatePerformanceFromChartData, isCrypto, maxRetries, 
     retryCount, companyInfo, activeTab]  // Eliminăm performanceData din dependențe
  )

  useEffect(() => {
    stockDataRef.current = stockData
  }, [stockData])

  const handleTabChange = (tabId) => {
    if (tabId === activeTab) return
    setActiveTab(tabId)

    if (tabId === 'market-data') {
      console.log('Fetching full market data for detailed performance analysis')
      setIsRefreshing(true)
      setRefreshStatus('Fetching complete market data for accurate performance analysis...')

      // Folosim setTimeout pentru a întrerupe bucla
      setTimeout(() => {
        calculatePerformancesIndependently()
          .then(() => {
            setRefreshStatus('Performance data updated successfully')
            setTimeout(() => setRefreshStatus(''), 3000)
          })
          .catch(err => {
            console.error('Error updating performance data:', err)
            setRefreshStatus('Error updating performance data')
          setTimeout(() => setRefreshStatus(''), 3000)
          })
          .finally(() => {
          setIsRefreshing(false)
          })
      }, 0);
    } else if (tabId === 'cache-info') {
      const stats = marketstackApi.getCacheStats()
      setCacheStats(stats)
    } else if (tabId === 'overview') {
      // Când ne întoarcem la overview, reîmprospătăm datele folosind timeframe-ul selectat
      fetchAllData()
    }
  }

  const handleTimeFilterChange = (filter) => {
    if (filter === activeTimeFilter) return
    setActiveTimeFilter(filter)
    setRefreshStatus(`Loading data for ${filter} timeframe...`)
    fetchAllData()
  }

  useEffect(() => {
  // Folosim setTimeout pentru a preveni reîncărcarea imediată
  const timer = setTimeout(() => {
    fetchAllData()
  }, 100);
  
  return () => clearTimeout(timer);
}, [fetchAllData])

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
    
    if (symbol.toUpperCase().includes('USD')) {
      return '#ff9900'
    }
    
    return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`
  }

  const tabs = [
    { id: 'overview', name: 'Overview' },
    { id: 'fundamentals', name: 'Company Info' },
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

  const handleBuyClick = () => {
    navigate(`/buy/${stockSymbol}`);
  };

  const handleSellClick = () => {
    navigate(`/sell/${stockSymbol}`);
  };

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

  const hasCompanyInfo = companyInfo && Object.keys(companyInfo).length > 0
  const hasMarketData = marketData && !marketData.isSimulated && marketData.apiSource === 'marketstack'

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
              <p>{hasCompanyInfo ? companyInfo.name : stockData.symbol}</p>
              {isCrypto && (
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
              {activeTab === 'overview' && activeTimeFilter && (
                <span className={styles.timeframeLabel}> ({activeTimeFilter})</span>
              )}
            </p>
            <p className={styles.lastUpdated}>
              Last updated: {marketData && marketData.timestamp ? new Date(marketData.timestamp).toLocaleString() : 'N/A'}
            </p>
            <div className={styles.tradingButtonsHeader}>
              <button className={styles.buyButtonHeader} onClick={handleBuyClick}>Buy</button>
              <button className={styles.sellButtonHeader} onClick={handleSellClick}>Sell</button>
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

                {hasMarketData && (
                  <div className={styles.sidebarContainer}>
                    <div className={styles.card}>
                      <h2>Key Statistics</h2>
                      <div className={styles.summaryGrid}>
                        {marketData.open && (
                          <div className={styles.summaryItem}>
                            <span className={styles.label}>Open</span>
                            <span className={styles.value}>${marketData.open.toFixed(2)}</span>
                          </div>
                        )}
                        {marketData.prevClose && (
                          <div className={styles.summaryItem}>
                            <span className={styles.label}>Previous Close</span>
                            <span className={styles.value}>${marketData.prevClose.toFixed(2)}</span>
                          </div>
                        )}
                        {marketData.high && (
                          <div className={styles.summaryItem}>
                            <span className={styles.label}>Day High</span>
                            <span className={styles.value}>${marketData.high.toFixed(2)}</span>
                          </div>
                        )}
                        {marketData.low && (
                          <div className={styles.summaryItem}>
                            <span className={styles.label}>Day Low</span>
                            <span className={styles.value}>${marketData.low.toFixed(2)}</span>
                          </div>
                        )}
                        {marketData.high52Week > 0 && (
                          <div className={styles.summaryItem}>
                            <span className={styles.label}>Highest Price</span>
                            <span className={styles.value}>${marketData.high52Week.toFixed(2)}</span>
                          </div>
                        )}
                        {marketData.low52Week < Number.MAX_VALUE && (
                          <div className={styles.summaryItem}>
                            <span className={styles.label}>Lowest Price</span>
                            <span className={styles.value}>${marketData.low52Week.toFixed(2)}</span>
                          </div>
                        )}
                        {marketData.volume > 0 && (
                          <div className={styles.summaryItem}>
                            <span className={styles.label}>Volume</span>
                            <span className={styles.value}>{formatVolume(marketData.volume)}</span>
                          </div>
                        )}
                        {marketData.avgVolume > 0 && (
                          <div className={styles.summaryItem}>
                            <span className={styles.label}>Avg Volume</span>
                            <span className={styles.value}>{formatVolume(marketData.avgVolume)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}{activeTab === 'fundamentals' && hasCompanyInfo && (
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
                        {companyInfo.name && (
                          <tr>
                            <td>Name:</td>
                            <td><strong>{companyInfo.name}</strong></td>
                          </tr>
                        )}
                        {companyInfo.item_type && (
                          <tr>
                            <td>Type:</td>
                            <td>{companyInfo.item_type}</td>
                          </tr>
                        )}
                        {companyInfo.sector && (
                          <tr>
                            <td>Sector:</td>
                            <td>{companyInfo.sector}</td>
                          </tr>
                        )}
                        {companyInfo.industry && (
                          <tr>
                            <td>Industry:</td>
                            <td>{companyInfo.industry}</td>
                          </tr>
                        )}
                        {companyInfo.exchange_code && (
                          <tr>
                            <td>Exchange:</td>
                            <td>{companyInfo.exchange_code}</td>
                          </tr>
                        )}
                        {companyInfo.full_time_employees && (
                          <tr>
                            <td>Employees:</td>
                            <td>{companyInfo.full_time_employees}</td>
                          </tr>
                        )}
                        {companyInfo.ipo_date && (
                          <tr>
                            <td>IPO Date:</td>
                            <td>{companyInfo.ipo_date}</td>
                          </tr>
                        )}
                        {companyInfo.date_founded && (
                          <tr>
                            <td>Founded:</td>
                            <td>{companyInfo.date_founded}</td>
                          </tr>
                        )}
                        {companyInfo.incorporation && (
                          <tr>
                            <td>Incorporation:</td>
                            <td>{companyInfo.incorporation}</td>
                          </tr>
                        )}
                        {companyInfo.end_fiscal && (
                          <tr>
                            <td>Fiscal Year End:</td>
                            <td>{companyInfo.end_fiscal}</td>
                          </tr>
                        )}
                        {companyInfo.phone && (
                          <tr>
                            <td>Phone:</td>
                            <td>{companyInfo.phone}</td>
                          </tr>
                        )}
                        {companyInfo.website && (
                          <tr>
                            <td>Website:</td>
                            <td>
                              <a
                                href={companyInfo.website}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {companyInfo.website}
                              </a>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {companyInfo.address && (
                    <div className={styles.companyAddress}>
                      <h3>Address</h3>
                      <div>
                        {companyInfo.address.street1 && <p>{companyInfo.address.street1}</p>}
                        {companyInfo.address.street2 && <p>{companyInfo.address.street2}</p>}
                        {(companyInfo.address.city || companyInfo.address.stateOrCountry || companyInfo.address.postal_code) && (
                          <p>
                            {companyInfo.address.city && `${companyInfo.address.city}, `}
                            {companyInfo.address.stateOrCountry && `${companyInfo.address.stateOrCountry} `}
                            {companyInfo.address.postal_code && companyInfo.address.postal_code}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {companyInfo.about && (
                    <div className={styles.companyDescription}>
                      <h3>About {companyInfo.name}</h3>
                      <p>{companyInfo.about}</p>
                    </div>
                  )}

                  {companyInfo.key_executives && companyInfo.key_executives.length > 0 && (
                    <div className={styles.companyExecutives}>
                      <h3>Key Executives</h3>
                      <div className={styles.executivesGrid}>
                        {companyInfo.key_executives.map((executive, index) => (
                          <div key={index} className={styles.executiveCard}>
                            <h4>{executive.name}</h4>
                            {executive.function && <p><strong>Position:</strong> {executive.function}</p>}
                            {executive.salary && <p><strong>Salary:</strong> {executive.salary}</p>}
                            {executive.birth_year && <p><strong>Birth Year:</strong> {executive.birth_year}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {companyInfo.stock_exchanges && companyInfo.stock_exchanges.length > 0 && (
                    <div className={styles.stockExchanges}>
                      <h3>Stock Exchanges</h3>
                      <div className={styles.exchangesGrid}>
                        {companyInfo.stock_exchanges.map((exchange, index) => (
                          <div key={index} className={styles.exchangeCard}>
                            <h4>{exchange.exchange_name}</h4>
                            {exchange.exchange_mic && <p><strong>MIC:</strong> {exchange.exchange_mic}</p>}
                            {exchange.acronym1 && <p><strong>Acronym:</strong> {exchange.acronym1}</p>}
                            {(exchange.city || exchange.country) && (
                              <p><strong>Location:</strong> {exchange.city}{exchange.country ? `, ${exchange.country}` : ''}</p>
                            )}
                            {exchange.website && (
                              <a href={exchange.website} target="_blank" rel="noopener noreferrer">
                                Visit Website
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Financial Information section - Only display if we have actual financial data */}
              {companyInfo.financials && Object.keys(companyInfo.financials).length > 0 && (
                <div className={styles.card}>
                  <h2>Financial Information</h2>
                  <div className={styles.financialInfo}>
                    <table className={styles.infoTable}>
                      <tbody>
                        {companyInfo.financials.market_cap && (
                          <tr>
                            <td>Market Cap</td>
                            <td>{formatNumber(companyInfo.financials.market_cap)}</td>
                          </tr>
                        )}
                        {companyInfo.financials.pe_ratio && (
                          <tr>
                            <td>P/E Ratio</td>
                            <td>{companyInfo.financials.pe_ratio}</td>
                          </tr>
                        )}
                        {companyInfo.financials.dividend_yield && (
                          <tr>
                            <td>Dividend Yield</td>
                            <td>{`${companyInfo.financials.dividend_yield.toFixed(2)}%`}</td>
                          </tr>
                        )}
                        {companyInfo.financials.eps && (
                          <tr>
                            <td>EPS (Earnings Per Share)</td>
                            <td>{`${companyInfo.financials.eps.toFixed(2)}`}</td>
                          </tr>
                        )}
                        {companyInfo.financials.revenue && (
                          <tr>
                            <td>Revenue</td>
                            <td>{formatNumber(companyInfo.financials.revenue)}</td>
                          </tr>
                        )}
                        {companyInfo.financials.profit_margin && (
                          <tr>
                            <td>Profit Margin</td>
                            <td>{`${(companyInfo.financials.profit_margin * 100).toFixed(2)}%`}</td>
                          </tr>
                        )}
                        {companyInfo.financials.roe && (
                          <tr>
                            <td>ROE (Return on Equity)</td>
                            <td>{`${(companyInfo.financials.roe * 100).toFixed(2)}%`}</td>
                          </tr>
                        )}
                        {companyInfo.financials.debt_to_equity && (
                          <tr>
                            <td>Debt to Equity</td>
                            <td>{companyInfo.financials.debt_to_equity.toFixed(2)}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'market-data' && hasMarketData && (
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
                        {marketData.open && (
                          <tr>
                            <td>Open</td>
                            <td>${marketData.open.toFixed(2)}</td>
                          </tr>
                        )}
                        {marketData.high && (
                          <tr>
                            <td>High</td>
                            <td>${marketData.high.toFixed(2)}</td>
                          </tr>
                        )}
                        {marketData.low && (
                          <tr>
                            <td>Low</td>
                            <td>${marketData.low.toFixed(2)}</td>
                          </tr>
                        )}
                        {marketData.prevClose && (
                          <tr>
                            <td>Previous Close</td>
                            <td>${marketData.prevClose.toFixed(2)}</td>
                          </tr>
                        )}
                        {marketData.currentPrice && (
                          <tr>
                            <td>Current</td>
                            <td>${marketData.currentPrice.toFixed(2)}</td>
                          </tr>
                        )}
                        {marketData.change && (
                          <tr>
                            <td>Change</td>
                            <td className={marketData.change >= 0 ? styles.positive : styles.negative}>
                              {marketData.change >= 0 ? '+' : ''}
                              {marketData.change.toFixed(2)} (
                              {Math.abs(marketData.changePercent).toFixed(2)}%)
                            </td>
                          </tr>
                        )}
                        {marketData.timestamp && (
                          <tr>
                            <td>Last Updated</td>
                            <td>{new Date(marketData.timestamp).toLocaleString()}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {marketData.volume > 0 && (
                  <div className={styles.card}>
                    <h2>Volume Information</h2>
                    <div className={styles.infoTable}>
                      <table className={styles.fullWidthTable}>
                        <tbody>
                          <tr>
                            <td>Today&apos;s Volume</td>
                            <td>{formatVolume(marketData.volume)}</td>
                          </tr>
                          {marketData.avgVolume > 0 && (
                            <tr>
                              <td>Average Volume (30 days)</td>
                              <td>{formatVolume(marketData.avgVolume)}</td>
                            </tr>
                          )}
                          {marketData.volume > 0 && marketData.avgVolume > 0 && (
                            <tr>
                              <td>Relative Volume</td>
                              <td>
                                {(marketData.volume / marketData.avgVolume).toFixed(2)}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {marketData.high52Week > 0 && marketData.low52Week < Number.MAX_VALUE && (
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
              )}

              {/* Performance data from calculations based on actual API data */}
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
                        {performanceData.day.pastDate && (
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
                        )}

                        {performanceData.week.pastDate && (
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
                        )}

                        {performanceData.month.pastDate && (
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
                        )}

                        {performanceData.threeMonths.pastDate && (
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
                        )}

                        {performanceData.sixMonths.pastDate && (
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
                        )}

                        {performanceData.year.pastDate && (
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
                        )}

                        {performanceData.fiveYears.pastDate && (
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
                        )}

                        {performanceData.ytd.pastDate && (
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
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
          
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
                    The MarketStack API provides real-time and historical stock market data.
                    This view displays only the actual data received from the API.
                  </p>
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