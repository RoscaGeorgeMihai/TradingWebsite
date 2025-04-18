import axios from 'axios';

const API_KEY = 'API_KEY';
const BASE_URL = '/marketstack';

const CACHE_DURATIONS = {
  quote: 30 * 60 * 1000,
  historical: 30 * 24 * 60 * 60 * 1000
};

const cache = new Map();
const pendingRequests = new Map();

const withCache = async (cacheKey, fetchFunction, type = 'quote') => {
  const cachedData = cache.get(cacheKey);
  const cacheDuration = CACHE_DURATIONS[type] || CACHE_DURATIONS.quote;
  
  if (cachedData && cachedData.timestamp > Date.now() - cacheDuration) {
    return cachedData.data;
  }
  
  const data = await fetchFunction();
  cache.set(cacheKey, {
    timestamp: Date.now(),
    data
  });
  
  return data;
};

const marketstackClient = axios.create({
  baseURL: BASE_URL,
  params: {
    access_key: API_KEY
  }
});

// Generează date implicite dacă API-ul nu răspunde
const generateFallbackData = (symbol) => {
  const getNumericValue = (str) => {
    let val = 0;
    for (let i = 0; i < str.length; i++) {
      val += str.charCodeAt(i);
    }
    return val;
  };

  const seed = getNumericValue(symbol);
  const basePrice = (seed % 100) + 50;
  const currentDate = new Date();
  
  const changePercent = (Math.sin(seed) * 3).toFixed(2);
  const change = (basePrice * changePercent / 100).toFixed(2);
  const price = basePrice;
  
  return {
    symbol: symbol,
    price: price,
    change: parseFloat(change),
    changePercent: parseFloat(changePercent),
    high: price * 1.02,
    low: price * 0.98,
    open: price - parseFloat(change) / 2,
    volume: 100000 + (seed % 900000),
    timestamp: currentDate.toISOString(),
    isSimulated: true
  };
};

// Generare date istorice simulate pentru cazul în care API-ul nu poate oferi date
const generateSimulatedHistoricalData = (symbol, fromDate, toDate) => {
  const data = [];
  const getNumericValue = (str) => {
    let val = 0;
    for (let i = 0; i < str.length; i++) {
      val += str.charCodeAt(i);
    }
    return val;
  };

  const seed = getNumericValue(symbol);
  const basePrice = (seed % 100) + 50;
  const volatility = basePrice * 0.015;
  
  const currentDate = new Date(fromDate);
  const endDate = new Date(toDate);
  
  const totalDays = Math.min(
    Math.floor((endDate - currentDate) / (24 * 60 * 60 * 1000)),
    100
  );
  
  const trendDirection = (seed % 2 === 0) ? 1 : -1;
  const trendStrength = (seed % 10) / 1000;
  
  let lastPrice = basePrice;
  
  for (let i = 0; i <= totalDays; i++) {
    const randomComponent = (Math.random() * 2 - 1) * volatility;
    const trendComponent = trendDirection * i * trendStrength * basePrice;
    const totalChange = randomComponent + trendComponent;
    
    lastPrice += totalChange;
    lastPrice = Math.max(lastPrice, 1);
    
    const date = new Date(currentDate);
    date.setDate(currentDate.getDate() + i);
    
    const dailyVolatility = volatility * Math.random();
    const open = lastPrice - (Math.random() * 0.6 - 0.3) * dailyVolatility;
    const high = Math.max(open, lastPrice) + Math.random() * dailyVolatility;
    const low = Math.min(open, lastPrice) - Math.random() * dailyVolatility;
    
    data.push({
      date: date.toISOString(),
      symbol: symbol,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(lastPrice.toFixed(2)),
      volume: Math.floor(Math.random() * 1000000) + 100000,
      price: parseFloat(lastPrice.toFixed(2))
    });
  }
  
  return data;
};

// Formatarea datelor istorice într-un format standard
const formatHistoricalData = (data, symbol) => {
  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }
  
  const formatted = data.map(item => ({
    date: item.date,
    symbol: symbol,
    open: typeof item.open === 'number' ? item.open : parseFloat(item.open) || 0,
    high: typeof item.high === 'number' ? item.high : parseFloat(item.high) || 0,
    low: typeof item.low === 'number' ? item.low : parseFloat(item.low) || 0,
    close: typeof item.close === 'number' ? item.close : parseFloat(item.close) || 0,
    volume: typeof item.volume === 'number' ? item.volume : parseInt(item.volume) || 0,
    price: typeof item.close === 'number' ? item.close : parseFloat(item.close) || 0
  }));
  
  return formatted.sort((a, b) => new Date(a.date) - new Date(b.date));
};

// Salvarea cache-ului în localStorage
const saveCacheToLocalStorage = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const serializedCache = Array.from(cache.entries()).reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {});
      localStorage.setItem('marketstackApiCache', JSON.stringify(serializedCache));
    } catch (e) {
      console.log('Error while trying to save cache to local storage');
    }
  }
};

// Încărcarea cache-ului din localStorage
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
      console.log('Error while trying to load cache from local storage');
    }
  }
};

// Inițializarea cache-ului la încărcarea modulului
loadCacheFromLocalStorage();

// Setare pentru salvarea periodică a cache-ului
if (typeof window !== 'undefined') {
  setInterval(saveCacheToLocalStorage, 5 * 60 * 1000);
  window.addEventListener('beforeunload', saveCacheToLocalStorage);
}

// FUNCȚIILE API PRINCIPALE

// Obținerea cotației curente pentru un simbol
const getStockQuote = async (symbol) => {
  try {
    const cacheKey = `quote-${symbol}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData && cachedData.timestamp > Date.now() - CACHE_DURATIONS.quote) {
      return cachedData.data;
    }
    
    for (const [batchKey, requestPromise] of pendingRequests.entries()) {
      if (batchKey.startsWith('quotes-') && batchKey.includes(symbol)) {
        const resultMap = await requestPromise;
        
        if (resultMap[symbol]) {
          cache.set(cacheKey, {
            timestamp: Date.now(),
            data: resultMap[symbol]
          });
          return resultMap[symbol];
        }
      }
    }
    
    // Pentru simboluri crypto, folosim endpoint-ul crypto/prices
    if (symbol.toUpperCase().includes('USD')) {
      try {
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - 2);
        
        const cryptoData = await getCryptoData(
          symbol.toLowerCase(),
          fromDate,
          new Date(),
          'daily'
        );
        
        if (cryptoData && cryptoData.length > 0) {
          const lastDataPoint = cryptoData[cryptoData.length - 1];
          const secondLastPoint = cryptoData.length > 1 ? cryptoData[cryptoData.length - 2] : null;
          
          const cryptoQuote = {
            symbol: symbol,
            price: lastDataPoint.close,
            change: secondLastPoint ? (lastDataPoint.close - secondLastPoint.close) : 0,
            changePercent: secondLastPoint && secondLastPoint.close !== 0 
              ? ((lastDataPoint.close - secondLastPoint.close) / secondLastPoint.close) * 100 
              : 0,
            high: lastDataPoint.high,
            low: lastDataPoint.low,
            open: lastDataPoint.open,
            volume: lastDataPoint.volume,
            timestamp: lastDataPoint.date,
            isSimulated: false
          };
          
          cache.set(cacheKey, {
            timestamp: Date.now(),
            data: cryptoQuote
          });
          
          return cryptoQuote;
        }
      } catch (error) {
        console.log('Error while trying to get stock quote')
      }
    }
    
    // Pentru acțiuni normale, folosim endpoint-ul EOD
    const batchKey = `quotes-${symbol}`;
    if (!pendingRequests.has(batchKey)) {
      const requestPromise = marketstackClient.get(`/eod/latest`, {
        params: { symbols: symbol }
      })
      .then(response => {
        if (response.data && response.data.data && response.data.data.length > 0) {
          const quoteData = response.data.data[0];
          const previousData = response.data.data[1] || quoteData;
          
          const quoteResult = {
            symbol: symbol,
            price: quoteData.close,
            change: quoteData.close - previousData.close,
            changePercent: previousData.close !== 0 
              ? ((quoteData.close - previousData.close) / previousData.close) * 100 
              : 0,
            high: quoteData.high,
            low: quoteData.low,
            open: quoteData.open,
            volume: quoteData.volume,
            timestamp: quoteData.date,
            isSimulated: false
          };
          
          return quoteResult;
        } else {
          return generateFallbackData(symbol);
        }
      })
      .catch(() => {
        return generateFallbackData(symbol);
      });
      
      pendingRequests.set(batchKey, requestPromise);
      
      try {
        const result = await requestPromise;
        
        cache.set(cacheKey, {
          timestamp: Date.now(),
          data: result
        });
        
        return result;
      } finally {
        pendingRequests.delete(batchKey);
      }
    } else {
      const result = await pendingRequests.get(batchKey);
      return result || generateFallbackData(symbol);
    }
  } catch (error) {
    return generateFallbackData(symbol);
  }
};

// Obținerea mai multor cotații simultan
const getMultipleStockQuotes = async (symbols) => {
  try {
    if (symbols.length === 0) return {};
    
    const batchKey = `quotes-${symbols.sort().join('-')}`;
    
    return await withCache(batchKey, async () => {
      const quotesMap = {};
      
      for (const symbol of symbols) {
        try {
          const response = await marketstackClient.get(`/eod/latest`, {
            params: {
              symbols: symbol
            }
          });
          
          if (response.data && response.data.data && response.data.data.length > 0) {
            const quoteData = response.data.data[0];
            const previousClose = quoteData.close;
            
            quotesMap[symbol] = {
              symbol: symbol,
              price: quoteData.close,
              change: quoteData.close - previousClose,
              changePercent: previousClose ? ((quoteData.close - previousClose) / previousClose) * 100 : 0,
              high: quoteData.high,
              low: quoteData.low,
              open: quoteData.open,
              volume: quoteData.volume,
              timestamp: quoteData.date,
              isSimulated: false
            };
          } else {
            quotesMap[symbol] = generateFallbackData(symbol);
          }
        } catch (error) {
          quotesMap[symbol] = generateFallbackData(symbol);
        }
      }
      
      return quotesMap;
    }, 'quote');
  } catch (error) {
    const fallbackMap = {};
    symbols.forEach(symbol => {
      fallbackMap[symbol] = generateFallbackData(symbol);
    });
    return fallbackMap;
  }
};

// Funcție pentru a obține date despre criptomonede
const getCryptoData = async (symbol, from, to, intervalType = 'daily') => {
  try {
    // Formatare corectă a datelor (fără milisecunde și cu timezone explicit)
    const formatDate = (date) => {
      const d = new Date(date);
      return d.toISOString().split('.')[0] + '+00:00'; // Format ISO-8601 fără milisecunde
    };

    const fromDate = formatDate(from);
    const toDate = formatDate(to);
    const cryptoSymbol = symbol.toLowerCase();
    const cacheKey = `crypto-${cryptoSymbol}-${fromDate}-${toDate}-${intervalType}`;
    
    return await withCache(cacheKey, async () => {
      try {
        const marketstackSymbol = `CRYPTO:${cryptoSymbol.replace('usd', '')}`;
        const interval = intervalType === '1day' ? 'daily' : intervalType;
        
        const response = await marketstackClient.get(`/intraday/${interval}`, {
          params: {
            symbols: marketstackSymbol,
            date_from: fromDate.split('T')[0], // Trimite doar partea de date pentru 'date_from'
            date_to: toDate.split('T')[0],     // Trimite doar partea de date pentru 'date_to'
            limit: 1000
          }
        });
        
        if (!response.data?.data?.length) {
          return generateSimulatedHistoricalData(symbol, fromDate, toDate);
        }
        
        return formatHistoricalData(response.data.data, symbol);
      } catch (apiError) {
        console.error('Marketstack API error:', apiError.response?.data);
        return generateSimulatedHistoricalData(symbol, fromDate, toDate);
      }
    }, 'historical');
  } catch (error) {
    console.error('Error in getCryptoData:', error);
    return generateSimulatedHistoricalData(symbol, from, to);
  }
};

// Funcție pentru obținerea datelor intraday
const getIntradayData = async (symbol, interval = '15min') => {
  try {
    const cacheKey = `intraday-${symbol}-${interval}`;
    
    return await withCache(cacheKey, async () => {
      try {
        const today = new Date();
        let startDate;
        
        if (interval === '1hour' || interval === 'hourly') {
          startDate = new Date();
          startDate.setDate(today.getDate() - 9);
        } else {
          startDate = new Date();
          startDate.setDate(today.getDate() - 2);
        }
        
        const formattedStartDate = startDate.toISOString().split('T')[0];
        
        const apiInterval = interval === '1hour' ? 'hourly' : interval;
        
        const response = await marketstackClient.get(`/intraday/${apiInterval}`, {
          params: {
            symbols: symbol,
            date_from: formattedStartDate,
            limit: 1000
          }
        });
        
        if (!response.data || !response.data.data || response.data.data.length === 0) {
          return generateSimulatedHistoricalData(symbol, formattedStartDate, today.toISOString().split('T')[0]);
        }
        
        return formatHistoricalData(response.data.data, symbol);
      } catch (apiError) {
        const today = new Date();
        const startDate = new Date();
        startDate.setDate(today.getDate() - 2);
        return generateSimulatedHistoricalData(symbol, startDate.toISOString().split('T')[0], today.toISOString().split('T')[0]);
      }
    }, 'historical');
  } catch (error) {
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - 2);
    return generateSimulatedHistoricalData(symbol, startDate.toISOString().split('T')[0], today.toISOString().split('T')[0]);
  }
};

// Curățarea cache-ului
const clearCache = () => {
  cache.clear();
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem('marketstackApiCache');
  }
};

// Obținerea statisticilor de cache
const getCacheStats = () => {
  return {
    size: cache.size,
    keys: Array.from(cache.keys()),
    durations: CACHE_DURATIONS
  };
};

// Exportăm toate funcțiile API
const marketstackApi = {
  getStockQuote,
  getMultipleStockQuotes,
  getCryptoData,
  getIntradayData,
  clearCache,
  getCacheStats
};

export default marketstackApi;