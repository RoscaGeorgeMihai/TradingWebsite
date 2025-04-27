import axios from 'axios';

const API_KEY = 'API_KEY';
const BASE_URL = '/marketstack';

const CACHE_DURATIONS = {
  quote: 5 * 60 * 1000,
  historical: 30 * 24 * 60 * 60 * 1000
};

const cache = new Map();
const pendingRequests = new Map();

const STOCK_BASICS = {
  AAPL: { name: 'Apple Inc.', sector: 'Technology', industry: 'Consumer Electronics', basePrice: 175 },
  MSFT: { name: 'Microsoft Corporation', sector: 'Technology', industry: 'Software', basePrice: 330 },
  GOOGL: { name: 'Alphabet Inc.', sector: 'Technology', industry: 'Internet Content & Information', basePrice: 140 },
  AMZN: { name: 'Amazon.com Inc.', sector: 'Consumer Cyclical', industry: 'Internet Retail', basePrice: 145 },
};

const marketstackClient = axios.create({
  baseURL: BASE_URL,
  params: {
    access_key: API_KEY
  }
});

const apiRequest = async (url, params, retries = 3, delay = 1000) => {
  let lastError;
  
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await marketstackClient.get(url, { params });
      
      if (response.data) {
        return response.data;
      }
      
      if (attempt < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
      }
    } catch (error) {
      lastError = error;
      
      if (attempt < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
      }
    }
  }
  
  throw lastError || new Error(`Failed to get valid data after ${retries} attempts`);
};

const getNumericValueFromFields = (dataObject, fieldNames, defaultValue = 0) => {
  if (!dataObject) return defaultValue;
  
  for (const field of fieldNames) {
    if (dataObject[field] !== undefined && dataObject[field] !== null) {
      const value = parseFloat(dataObject[field]);
      if (!isNaN(value)) {
        return value;
      }
    }
  }
  
  return defaultValue;
};

const generateFallbackData = (symbol) => {
  const stockPreset = STOCK_BASICS[symbol] || null;
  
  const getNumericValue = (str) => {
    let val = 0;
    for (let i = 0; i < str.length; i++) {
      val += str.charCodeAt(i);
    }
    return val;
  };

  const seed = getNumericValue(symbol);
  const basePrice = stockPreset ? stockPreset.basePrice : (seed % 100) + 50;
  const currentDate = new Date();
  
  const seedRandom = () => {
    const x = Math.sin(seed * 9999) * 10000;
    return x - Math.floor(x);
  };
  
  const volatility = 0.02;
  const changePercent = (seedRandom() * 2 - 1) * volatility * 100;
  const change = (basePrice * changePercent / 100);
  
  const dayVolatility = basePrice * volatility * 0.5;
  const open = basePrice - change / 2 + (seedRandom() - 0.5) * dayVolatility;
  const high = Math.max(basePrice, open) + seedRandom() * dayVolatility;
  const low = Math.min(basePrice, open) - seedRandom() * dayVolatility;
  
  const volumeBase = 500000;
  const volumeMultiplier = basePrice > 200 ? 0.5 : (basePrice > 100 ? 1 : 2);
  const volume = Math.floor((volumeBase + (seed % 500000)) * volumeMultiplier);
  
  const price = parseFloat(basePrice.toFixed(2));
  
  return {
    symbol: symbol,
    price: price,
    marketstack_last: price,
    change: parseFloat(change.toFixed(2)),
    changePercent: parseFloat(changePercent.toFixed(2)),
    high: parseFloat(high.toFixed(2)),
    low: parseFloat(low.toFixed(2)),
    open: parseFloat(open.toFixed(2)),
    volume: volume,
    timestamp: currentDate.toISOString(),
    isSimulated: true,
    apiSource: 'fallback'
  };
};

const generateSimulatedHistoricalData = (symbol, fromDate, toDate, interval = 'daily') => {
  const data = [];
  
  const stockPreset = STOCK_BASICS[symbol] || null;
  
  const getNumericValue = (str) => {
    let val = 0;
    for (let i = 0; i < str.length; i++) {
      val += str.charCodeAt(i);
    }
    return val;
  };

  const seed = getNumericValue(symbol);
  
  const basePrice = stockPreset ? stockPreset.basePrice : (seed % 100) + 50;
  
  const volatility = basePrice * 0.015;
  
  const start = new Date(fromDate);
  const end = new Date(toDate);
  
  let step = 24 * 60 * 60 * 1000;
  
  if (interval === '15min' || interval === '15mins') {
    step = 15 * 60 * 1000;
  } else if (interval === '1hour' || interval === 'hourly') {
    step = 60 * 60 * 1000;
  }
  
  const totalSteps = Math.ceil((end - start) / step);
  const maxSteps = interval === 'daily' ? 500 : 1000;
  const actualSteps = Math.min(totalSteps, maxSteps);
  
  const effectiveStep = totalSteps > maxSteps ? (end - start) / maxSteps : step;
  
  const overallTrend = ((seed % 10) - 5) / 10;
  
  const getTrendAtStep = (step, totalSteps) => {
    const baseFreq = 2 * Math.PI / (totalSteps || 100);
    const secondaryFreq = 6 * Math.PI / (totalSteps || 100);
    
    return (
      overallTrend + 
      Math.sin(step * baseFreq + seed) * 0.3 + 
      Math.sin(step * secondaryFreq + seed * 2) * 0.05
    );
  };
  
  const seedRandom = (stepSeed) => {
    const x = Math.sin(seed + stepSeed * 9999) * 10000;
    return x - Math.floor(x);
  };
  
  let lastPrice = basePrice;
  
  for (let i = 0; i < actualSteps; i++) {
    const currentDate = new Date(start.getTime() + i * effectiveStep);
    
    const trend = getTrendAtStep(i, actualSteps);
    
    const randomComponent = (seedRandom(i) * 2 - 1) * volatility;
    
    const trendComponent = trend * volatility * 0.5;
    
    const totalChange = randomComponent + trendComponent;
    
    lastPrice += totalChange;
    lastPrice = Math.max(lastPrice, 0.01);
    
    const dailyVolatility = volatility * seedRandom(i + 1000);
    
    let open, high, low, close;
    
    if (seedRandom(i) > 0.5) {
      open = lastPrice - dailyVolatility * seedRandom(i + 2000);
      close = lastPrice;
      high = Math.max(open, close) + dailyVolatility * seedRandom(i + 3000);
      low = Math.min(open, close) - dailyVolatility * 0.5 * seedRandom(i + 4000);
    } else {
      open = lastPrice + dailyVolatility * seedRandom(i + 2000);
      close = lastPrice;
      high = open + dailyVolatility * seedRandom(i + 3000);
      low = close - dailyVolatility * seedRandom(i + 4000);
    }
    
    high = Math.max(high, Math.max(open, close));
    low = Math.min(low, Math.min(open, close));
    
    const priceMove = Math.abs(close - open);
    const movePercentage = priceMove / ((open + close) / 2);
    
    const volumeBase = 500000;
    const volumeVariation = movePercentage * 5;
    const volume = Math.floor((volumeBase + seedRandom(i + 5000) * volumeBase) * (1 + volumeVariation));
    
    data.push({
      date: currentDate.toISOString(),
      symbol: symbol,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      last: parseFloat(close.toFixed(2)),
      marketstack_last: parseFloat(close.toFixed(2)),
      volume: volume,
      price: parseFloat(close.toFixed(2)),
      isSimulated: true,
      apiSource: 'fallback'
    });
  }
  
  return data;
};

const formatHistoricalData = (data, symbol) => {
  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }
  
  const formatted = data.map(item => {
    const formattedItem = {
      date: item.date,
      symbol: symbol,
      open: typeof item.open === 'number' ? item.open : parseFloat(item.open) || 0,
      high: typeof item.high === 'number' ? item.high : parseFloat(item.high) || 0,
      low: typeof item.low === 'number' ? item.low : parseFloat(item.low) || 0,
      close: typeof item.close === 'number' ? item.close : parseFloat(item.close) || 0,
      last: item.last || item.close || 0,
      marketstack_last: item.marketstack_last || item.last || item.close || 0,
      volume: typeof item.volume === 'number' ? item.volume : parseInt(item.volume) || 0,
      price: item.marketstack_last || item.last || item.close || 0,
      isSimulated: item.isSimulated || false,
      apiSource: item.apiSource || 'marketstack'
    };
    
    return formattedItem;
  });
  
  const sortedData = formatted.sort((a, b) => new Date(a.date) - new Date(b.date));
  return sortedData;
};

const saveCacheToLocalStorage = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const serializedCache = Array.from(cache.entries()).reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {});
      localStorage.setItem('marketstackApiCache', JSON.stringify(serializedCache));
    } catch (e) {
      console.log('Error while trying to save cache to local storage', e);
    }
  }
};

const loadCacheFromLocalStorage = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const storedCache = localStorage.getItem('marketstackApiCache');
      if (storedCache) {
        const parsedCache = JSON.parse(storedCache);
        Object.entries(parsedCache).forEach(([key, value]) => {
          cache.set(key, value);
        });
      }
    } catch (e) {
      console.log('Error while trying to load cache from local storage', e);
    }
  }
};

loadCacheFromLocalStorage();

if (typeof window !== 'undefined') {
  setInterval(saveCacheToLocalStorage, 5 * 60 * 1000);
  window.addEventListener('beforeunload', saveCacheToLocalStorage);
}

const getStockQuote = async (symbol) => {
  try {
    const cacheKey = `quote-${symbol}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData && cachedData.timestamp > Date.now() - CACHE_DURATIONS.quote) {
      return cachedData.data;
    }
    
    for (const [batchKey, requestPromise] of pendingRequests.entries()) {
      if (batchKey.startsWith('quotes-') && batchKey.includes(symbol)) {
        try {
          const resultMap = await requestPromise;
          
          if (resultMap[symbol]) {
            cache.set(cacheKey, {
              timestamp: Date.now(),
              data: resultMap[symbol]
            });
            return resultMap[symbol];
          }
        } catch (error) {
          console.warn(`Error resolving pending request for ${symbol}`, error);
        }
      }
    }
    
    const batchKey = `quotes-${symbol}`;
    if (!pendingRequests.has(batchKey)) {
      const requestPromise = async () => {
        try {
          const apiResponse = await apiRequest('/intraday', {
            symbols: symbol,
            interval: '15min',
            limit: 10
          });
          
          if (apiResponse.data && apiResponse.data.length > 0) {
            const sortedData = apiResponse.data.sort((a, b) => {
              return new Date(b.date) - new Date(a.date);
            });
            
            const latestData = sortedData[0];
            const previousData = sortedData.length > 1 ? sortedData[1] : latestData;
            
            const lastPrice = getNumericValueFromFields(latestData, ['marketstack_last', 'last', 'close'], 0);
            const prevPrice = getNumericValueFromFields(previousData, ['marketstack_last', 'last', 'close'], 0);
            
            const quoteResult = {
              symbol: symbol,
              price: lastPrice,
              marketstack_last: lastPrice,
              change: lastPrice - prevPrice,
              changePercent: prevPrice !== 0 
                ? ((lastPrice - prevPrice) / prevPrice) * 100 
                : 0,
              high: getNumericValueFromFields(latestData, ['high'], lastPrice),
              low: getNumericValueFromFields(latestData, ['low'], lastPrice),
              open: getNumericValueFromFields(latestData, ['open'], lastPrice),
              volume: getNumericValueFromFields(latestData, ['volume'], 0),
              timestamp: latestData.date,
              isSimulated: false,
              apiSource: 'marketstack'
            };
            
            return quoteResult;
          }
          
          throw new Error(`No valid data for ${symbol}`);
        } catch (error) {
          console.warn(`API error for ${symbol}, using simulated data`, error);
          return generateFallbackData(symbol);
        }
      };
      
      pendingRequests.set(batchKey, requestPromise());
      
      try {
        const result = await pendingRequests.get(batchKey);
        
        cache.set(cacheKey, {
          timestamp: Date.now(),
          data: result
        });
        
        return result;
      } finally {
        pendingRequests.delete(batchKey);
      }
    } else {
      try {
        const result = await pendingRequests.get(batchKey);
        return result || generateFallbackData(symbol);
      } catch (error) {
        console.warn(`Error with pending request for ${symbol}`, error);
        return generateFallbackData(symbol);
      }
    }
  } catch (error) {
    console.warn(`Unexpected error getting quote for ${symbol}, using fallback`, error);
    return generateFallbackData(symbol);
  }
};

const getMultipleStockQuotes = async (symbols) => {
  try {
    if (symbols.length === 0) return {};
    
    const batchKey = `quotes-${symbols.sort().join('-')}`;
    
    const cachedData = cache.get(batchKey);
    if (cachedData && cachedData.timestamp > Date.now() - CACHE_DURATIONS.quote) {
      return cachedData.data;
    }
    
    const quotesMap = {};
    
    try {
      const response = await apiRequest('/intraday', {
        symbols: symbols.join(','),
        interval: '15min',
        limit: 2 * symbols.length
      });
      
      if (response.data && response.data.length > 0) {
        const symbolData = {};
        response.data.forEach(item => {
          if (!symbolData[item.symbol]) {
            symbolData[item.symbol] = [];
          }
          symbolData[item.symbol].push(item);
        });
        
        for (const symbol of symbols) {
          if (symbolData[symbol] && symbolData[symbol].length > 0) {
            const sortedData = symbolData[symbol].sort((a, b) => {
              return new Date(b.date) - new Date(a.date);
            });
            
            const latestData = sortedData[0];
            const previousData = sortedData.length > 1 ? sortedData[1] : latestData;
            
            const lastPrice = getNumericValueFromFields(latestData, ['marketstack_last', 'last', 'close', 'price'], 0);
            const prevPrice = getNumericValueFromFields(previousData, ['marketstack_last', 'last', 'close', 'price'], 0);
            
            quotesMap[symbol] = {
              symbol: symbol,
              price: lastPrice,
              marketstack_last: lastPrice,
              change: lastPrice - prevPrice,
              changePercent: prevPrice !== 0 
                ? ((lastPrice - prevPrice) / prevPrice) * 100 
                : 0,
              high: getNumericValueFromFields(latestData, ['high'], lastPrice),
              low: getNumericValueFromFields(latestData, ['low'], lastPrice),
              open: getNumericValueFromFields(latestData, ['open'], lastPrice),
              volume: getNumericValueFromFields(latestData, ['volume'], 0),
              timestamp: latestData.date,
              isSimulated: false,
              apiSource: 'marketstack'
            };
          } else {
            console.log(`No intraday data available for ${symbol}, using simulated data`);
            quotesMap[symbol] = generateFallbackData(symbol);
          }
        }
      } else {
        console.log('No data in API response, falling back to individual requests');
        for (const symbol of symbols) {
          try {
            const quoteData = await getStockQuote(symbol);
            quotesMap[symbol] = quoteData;
          } catch (err) {
            console.warn(`Error fetching data for ${symbol}, using simulated data`, err);
            quotesMap[symbol] = generateFallbackData(symbol);
          }
        }
      }
    } catch (error) {
      console.warn('API error for multiple stocks, falling back to individual requests', error);
      
      for (const symbol of symbols) {
        try {
          const quoteData = await getStockQuote(symbol);
          quotesMap[symbol] = quoteData;
        } catch (err) {
          console.warn(`Error fetching data for ${symbol}, using simulated data`, err);
          quotesMap[symbol] = generateFallbackData(symbol);
        }
      }
    }
    
    cache.set(batchKey, {
      timestamp: Date.now(),
      data: quotesMap
    });
    
    return quotesMap;
  } catch (error) {
    console.warn('Error in getMultipleStockQuotes, using fallback for all symbols', error);
    const fallbackMap = {};
    symbols.forEach(symbol => {
      fallbackMap[symbol] = generateFallbackData(symbol);
    });
    return fallbackMap;
  }
};

const getIntradayData = async (symbol, interval = '15min') => {
  const today = new Date();
  let startDate = new Date();
  
  if (interval === '1hour' || interval === 'hourly') {
    startDate.setDate(today.getDate() - 9);
  } else if (interval === '15min') {
    startDate.setDate(today.getDate() - 1);
  } else {
    startDate.setDate(today.getDate() - 30);
  }
  
  const formattedStartDate = startDate.toISOString().split('T')[0];
  const formattedEndDate = today.toISOString().split('T')[0];
  
  try {
    const cacheKey = `intraday-${symbol}-${interval}`;
    
    const cachedData = cache.get(cacheKey);
    if (cachedData && cachedData.timestamp > Date.now() - CACHE_DURATIONS.quote) {
      return cachedData.data;
    }
    
    try {
      let apiEndpoint, apiParams;
      
      if (interval === '15min' || interval === '1hour' || interval === 'hourly') {
        let apiInterval = interval;
        if (interval === '1hour' || interval === 'hourly') apiInterval = '1hour';
        
        apiEndpoint = '/intraday';
        apiParams = {
          symbols: symbol,
          interval: apiInterval,
          date_from: formattedStartDate,
          date_to: formattedEndDate,
          limit: 1000
        };
      } else {
        apiEndpoint = '/eod';
        apiParams = {
          symbols: symbol,
          date_from: formattedStartDate,
          date_to: formattedEndDate,
          limit: 1000
        };
      }
      
      const response = await apiRequest(apiEndpoint, apiParams);
      
      if (!response.data || response.data.length === 0) {
        console.log(`No data from API for ${symbol}, using simulated data`);
        const simulatedData = generateSimulatedHistoricalData(symbol, formattedStartDate, formattedEndDate, interval);
        
        cache.set(cacheKey, {
          timestamp: Date.now(),
          data: simulatedData
        });
        
        return simulatedData;
      }
      
      const formattedData = formatHistoricalData(response.data, symbol).map(item => ({
        ...item,
        apiSource: 'marketstack',
        isSimulated: false
      }));
      
      cache.set(cacheKey, {
        timestamp: Date.now(),
        data: formattedData
      });
      
      return formattedData;
    } catch (apiError) {
      console.warn('Marketstack API error:', apiError);
      const simulatedData = generateSimulatedHistoricalData(symbol, formattedStartDate, formattedEndDate, interval);
      return simulatedData;
    }
  } catch (error) {
    console.warn('Error in getIntradayData:', error);
    return generateSimulatedHistoricalData(symbol, formattedStartDate, formattedEndDate, interval);
  }
};

const getEODData = async (symbol, fromDate, toDate) => {
  try {
    const cacheKey = `eod-${symbol}-${fromDate}-${toDate}`;
    
    const cachedData = cache.get(cacheKey);
    if (cachedData && cachedData.timestamp > Date.now() - CACHE_DURATIONS.historical) {
      return cachedData.data;
    }
    
    try {
      const response = await apiRequest('/eod', {
        symbols: symbol,
        date_from: fromDate,
        date_to: toDate,
        limit: 2000
      });
      
      if (!response.data || response.data.length === 0) {
        console.log(`No EOD data from API for ${symbol}, using simulated data`);
        const simulatedData = generateSimulatedHistoricalData(symbol, fromDate, toDate, 'daily');
        
        cache.set(cacheKey, {
          timestamp: Date.now(),
          data: simulatedData
        });
        
        return simulatedData;
      }
      
      const formattedData = formatHistoricalData(response.data, symbol).map(item => ({
        ...item,
        apiSource: 'marketstack',
        isSimulated: false
      }));
      
      cache.set(cacheKey, {
        timestamp: Date.now(),
        data: formattedData
      });
      
      return formattedData;
    } catch (apiError) {
      console.warn('Marketstack API error for EOD data:', apiError);
      const simulatedData = generateSimulatedHistoricalData(symbol, fromDate, toDate, 'daily');
      return simulatedData;
    }
  } catch (error) {
    console.warn('Error in getEODData:', error);
    return generateSimulatedHistoricalData(symbol, fromDate, toDate, 'daily');
  }
};

const clearCache = () => {
  cache.clear();
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem('marketstackApiCache');
  }
  return true;
};

const getCacheStats = () => {
  return {
    size: cache.size,
    keys: Array.from(cache.keys()),
    durations: CACHE_DURATIONS
  };
};

const getTickerInfo = async (symbol) => {
  try {
    const cacheKey = `tickerinfo-${symbol}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData && cachedData.timestamp > Date.now() - CACHE_DURATIONS.quote) {
      console.log('Returning cached company info for', symbol);
      return cachedData.data;
    }

    console.log(`Fetching company info for ${symbol} from API`);
    const response = await apiRequest('/tickerinfo', {
      ticker: symbol,
      include: 'profile,financials,statistics'
    });

    console.log('Raw TickerInfo API Response:', response);

    if (!response) {
      throw new Error('No response from API');
    }

    let companyInfo = null;

    if (response.data) {
      companyInfo = response.data;
    } else if (typeof response === 'object') {
      companyInfo = response;
    }

    if (!companyInfo) {
      throw new Error('No valid company information found in API response');
    }

    console.log('Processed company info:', companyInfo);

    cache.set(cacheKey, {
      timestamp: Date.now(),
      data: companyInfo
    });

    return companyInfo;
  } catch (error) {
    console.error(`Error fetching company info for ${symbol}:`, error);
    return null;
  }
};

const getCommodityQuote = async (commodityName) => {
  try {
    const cacheKey = `commodity-${commodityName}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData && cachedData.timestamp > Date.now() - CACHE_DURATIONS.quote) {
      return cachedData.data;
    }

    const response = await apiRequest('/commodities', {
      commodity_name: commodityName.toLowerCase()
    });

    if (!response.data || response.data.length === 0) {
      throw new Error(`No data available for ${commodityName}`);
    }

    const commodityData = response.data[0];
    const result = {
      symbol: commodityName.toUpperCase(),
      price: commodityData.price,
      marketstack_last: commodityData.price,
      change: commodityData.change,
      changePercent: commodityData.change_percent,
      volume: commodityData.volume,
      timestamp: commodityData.date,
      isSimulated: false,
      apiSource: 'marketstack'
    };

    cache.set(cacheKey, {
      timestamp: Date.now(),
      data: result
    });

    return result;
  } catch (error) {
    console.warn(`Error fetching commodity data for ${commodityName}:`, error);
    return generateFallbackCommodityData(commodityName);
  }
};

const getMultipleCommodityQuotes = async (commodityNames) => {
  try {
    const quotesMap = {};
    
    for (const name of commodityNames) {
      try {
        const quote = await getCommodityQuote(name);
        quotesMap[name.toUpperCase()] = quote;
      } catch (error) {
        console.warn(`Error fetching data for ${name}, using fallback data`, error);
        quotesMap[name.toUpperCase()] = generateFallbackCommodityData(name);
      }
    }
    
    return quotesMap;
  } catch (error) {
    console.warn('Error in getMultipleCommodityQuotes:', error);
    const fallbackMap = {};
    commodityNames.forEach(name => {
      fallbackMap[name.toUpperCase()] = generateFallbackCommodityData(name);
    });
    return fallbackMap;
  }
};

const generateFallbackCommodityData = (commodityName) => {
  const basePrices = {
    GOLD: 2000,
    OIL: 80,
    SILVER: 25
  };

  const basePrice = basePrices[commodityName.toUpperCase()] || 100;
  const change = (Math.random() * 2 - 1) * basePrice * 0.02;
  const changePercent = (change / basePrice) * 100;
  const price = basePrice + change;

  return {
    symbol: commodityName.toUpperCase(),
    price: price.toFixed(2),
    marketstack_last: price.toFixed(2),
    change: change.toFixed(2),
    changePercent: changePercent.toFixed(2),
    volume: Math.floor(Math.random() * 1000000),
    timestamp: new Date().toISOString(),
    isSimulated: true,
    apiSource: 'fallback'
  };
};

const marketstackApi = {
  getStockQuote,
  getMultipleStockQuotes,
  getIntradayData,
  getEODData,
  clearCache,
  getCacheStats,
  generateSimulatedHistoricalData,
  getTickerInfo,
  getCommodityQuote,
  getMultipleCommodityQuotes
};

export default marketstackApi;
