import axios from 'axios';

const API_KEY = 'API_KEY';
const BASE_URL = '/marketstack';

const CACHE_DURATIONS = {
  quote: 30 * 60 * 1000,
  historical: 30 * 24 * 60 * 60 * 1000
};

const cache = new Map();
const pendingRequests = new Map();

// Presetări pentru simboluri populare - ajută la generarea unor date mai realiste
const STOCK_BASICS = {
  AAPL: { name: 'Apple Inc.', sector: 'Technology', industry: 'Consumer Electronics', basePrice: 175 },
  MSFT: { name: 'Microsoft Corporation', sector: 'Technology', industry: 'Software', basePrice: 330 },
  GOOGL: { name: 'Alphabet Inc.', sector: 'Technology', industry: 'Internet Content & Information', basePrice: 140 },
  AMZN: { name: 'Amazon.com Inc.', sector: 'Consumer Cyclical', industry: 'Internet Retail', basePrice: 145 },
  TSLA: { name: 'Tesla, Inc.', sector: 'Consumer Cyclical', industry: 'Auto Manufacturers', basePrice: 250 },
  META: { name: 'Meta Platforms, Inc.', sector: 'Technology', industry: 'Internet Content & Information', basePrice: 340 },
  NVDA: { name: 'NVIDIA Corporation', sector: 'Technology', industry: 'Semiconductors', basePrice: 800 },
  BTCUSD: { name: 'Bitcoin / USD', sector: 'Cryptocurrency', industry: 'Digital Currency', basePrice: 62000 },
  ETHUSD: { name: 'Ethereum / USD', sector: 'Cryptocurrency', industry: 'Digital Currency', basePrice: 3400 },
};

const withCache = async (cacheKey, fetchFunction, type = 'quote') => {
  const cachedData = cache.get(cacheKey);
  const cacheDuration = CACHE_DURATIONS[type] || CACHE_DURATIONS.quote;
  
  if (cachedData && cachedData.timestamp > Date.now() - cacheDuration) {
    console.log(`[Cache Hit] Using cached data for ${cacheKey}`);
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

// Funcție îmbunătățită pentru generarea datelor de fallback
const generateFallbackData = (symbol) => {
  // Verifică dacă avem presetări pentru acest simbol
  const stockPreset = STOCK_BASICS[symbol] || null;
  
  // Generare consistentă bazată pe simbol (pentru simboluri care nu sunt în presetări)
  const getNumericValue = (str) => {
    let val = 0;
    for (let i = 0; i < str.length; i++) {
      val += str.charCodeAt(i);
    }
    return val;
  };

  const seed = getNumericValue(symbol);
  // Folosește valoarea de bază din presetări sau generează una bazată pe simbol
  const basePrice = stockPreset ? stockPreset.basePrice : (seed % 100) + 50;
  const currentDate = new Date();
  
  // Determine if it's a crypto symbol
  const isCrypto = symbol.toUpperCase().includes('USD');
  
  // Creează o variație aleatoare de preț, dar deterministă bazată pe simbol
  const seedRandom = () => {
    const x = Math.sin(seed * 9999) * 10000;
    return x - Math.floor(x);
  };
  
  // Volatilitate mai mare pentru crypto
  const volatility = isCrypto ? 0.05 : 0.02;
  const changePercent = (seedRandom() * 2 - 1) * volatility * 100;
  const change = (basePrice * changePercent / 100);
  
  // Generare OHLC mai realistă
  const dayVolatility = basePrice * volatility * 0.5;
  const open = basePrice - change / 2 + (seedRandom() - 0.5) * dayVolatility;
  const high = Math.max(basePrice, open) + seedRandom() * dayVolatility;
  const low = Math.min(basePrice, open) - seedRandom() * dayVolatility;
  
  // Volume bazat pe preț (acțiunile cu preț mare tind să aibă volume mai mici)
  const volumeBase = isCrypto ? 1000000 : 500000;
  const volumeMultiplier = isCrypto ? 10 : (basePrice > 200 ? 0.5 : (basePrice > 100 ? 1 : 2));
  const volume = Math.floor((volumeBase + (seed % 500000)) * volumeMultiplier);
  
  return {
    symbol: symbol,
    price: parseFloat(basePrice.toFixed(2)),
    change: parseFloat(change.toFixed(2)),
    changePercent: parseFloat(changePercent.toFixed(2)),
    high: parseFloat(high.toFixed(2)),
    low: parseFloat(low.toFixed(2)),
    open: parseFloat(open.toFixed(2)),
    volume: volume,
    timestamp: currentDate.toISOString(),
    isSimulated: true
  };
};

// Funcție îmbunătățită de generare a datelor istorice
const generateSimulatedHistoricalData = (symbol, fromDate, toDate, interval = 'daily') => {
  const data = [];
  
  // Verifică dacă avem presetări pentru acest simbol
  const stockPreset = STOCK_BASICS[symbol] || null;
  
  // Generare consistentă bazată pe simbol
  const getNumericValue = (str) => {
    let val = 0;
    for (let i = 0; i < str.length; i++) {
      val += str.charCodeAt(i);
    }
    return val;
  };

  const seed = getNumericValue(symbol);
  
  // Folosește valoarea de bază din presetări sau generează una bazată pe simbol
  const basePrice = stockPreset ? stockPreset.basePrice : (seed % 100) + 50;
  
  // Verifică dacă este un simbol crypto
  const isCrypto = symbol.toUpperCase().includes('USD');
  
  // Volatilitate mai mare pentru crypto
  const volatility = basePrice * (isCrypto ? 0.04 : 0.015);
  
  // Convertim datele în obiecte Date
  const start = new Date(fromDate);
  const end = new Date(toDate);
  
  // Determinăm pasul de timp bazat pe interval
  let step = 24 * 60 * 60 * 1000; // 1 zi în milisecunde (default pentru daily)
  
  if (interval === '15min' || interval === '15mins') {
    step = 15 * 60 * 1000;
  } else if (interval === '1hour' || interval === 'hourly') {
    step = 60 * 60 * 1000;
  }
  
  // Limitează numărul de puncte pentru a evita generarea prea multor date
  const totalSteps = Math.ceil((end - start) / step);
  const maxSteps = interval === 'daily' ? 500 : 1000;
  const actualSteps = Math.min(totalSteps, maxSteps);
  
  // Recalculăm step-ul dacă este necesar pentru a acoperi intervalul cu maxSteps
  const effectiveStep = totalSteps > maxSteps ? (end - start) / maxSteps : step;
  
  // Generăm un trend general pentru întreaga perioadă (-1 = bearish, 1 = bullish)
  const overallTrend = ((seed % 10) - 5) / 10; // Valoare între -0.5 și 0.5
  
  // Funcție pentru trend fluctuant
  const getTrendAtStep = (step, totalSteps) => {
    // Creăm un trend sinusoidal 
    const baseFreq = 2 * Math.PI / (totalSteps || 100); // O perioadă completă
    const secondaryFreq = 6 * Math.PI / (totalSteps || 100); // Fluctuații secundare
    
    return (
      overallTrend + 
      Math.sin(step * baseFreq + seed) * 0.3 + // Trend principal sinusoidal
      Math.sin(step * secondaryFreq + seed * 2) * 0.05 // Fluctuații mici secundare
    );
  };
  
  // Funcție pentru a genera număr pseudo-aleator dar deterministic
  const seedRandom = (stepSeed) => {
    const x = Math.sin(seed + stepSeed * 9999) * 10000;
    return x - Math.floor(x);
  };
  
  let lastPrice = basePrice;
  
  for (let i = 0; i < actualSteps; i++) {
    const currentDate = new Date(start.getTime() + i * effectiveStep);
    
    // Calculăm factorul de trend pentru acest pas
    const trend = getTrendAtStep(i, actualSteps);
    
    // Componentă aleatoare (bazată pe seed și pas pentru determinism)
    const randomComponent = (seedRandom(i) * 2 - 1) * volatility;
    
    // Componentă de trend
    const trendComponent = trend * volatility * 0.5;
    
    // Calculăm variația totală a prețului
    const totalChange = randomComponent + trendComponent;
    
    // Actualizăm prețul
    lastPrice += totalChange;
    lastPrice = Math.max(lastPrice, 0.01); // Prețul nu poate fi negativ
    
    // Generăm variații OHLC pentru data curentă
    const dailyVolatility = volatility * seedRandom(i + 1000);
    
    // Creăm variații mai realiste pentru OHLC
    let open, high, low, close;
    
    if (seedRandom(i) > 0.5) {
      // Zi cu trend ascendent
      open = lastPrice - dailyVolatility * seedRandom(i + 2000);
      close = lastPrice;
      high = Math.max(open, close) + dailyVolatility * seedRandom(i + 3000);
      low = Math.min(open, close) - dailyVolatility * 0.5 * seedRandom(i + 4000);
    } else {
      // Zi cu trend descendent
      open = lastPrice + dailyVolatility * seedRandom(i + 2000);
      close = lastPrice;
      high = open + dailyVolatility * seedRandom(i + 3000);
      low = close - dailyVolatility * seedRandom(i + 4000);
    }
    
    // Asigurăm că valorile sunt rezonabile
    high = Math.max(high, Math.max(open, close));
    low = Math.min(low, Math.min(open, close));
    
    // Generăm volum care variază în funcție de dimensiunea mișcării prețului
    const priceMove = Math.abs(close - open);
    const movePercentage = priceMove / ((open + close) / 2);
    
    // Volume mai mare pentru mișcări mai mari de preț
    const volumeBase = isCrypto ? 5000000 : 500000;
    const volumeVariation = movePercentage * 5;
    const volume = Math.floor((volumeBase + seedRandom(i + 5000) * volumeBase) * (1 + volumeVariation));
    
    data.push({
      date: currentDate.toISOString(),
      symbol: symbol,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: volume,
      price: parseFloat(close.toFixed(2)),
      isSimulated: true
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
    price: typeof item.close === 'number' ? item.close : parseFloat(item.close) || 0,
    isSimulated: item.isSimulated || false
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
      console.log(`[Cache] Saved ${Object.keys(serializedCache).length} items to localStorage`);
    } catch (e) {
      console.log('Error while trying to save cache to local storage', e);
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
        console.log(`[Cache] Loaded ${Object.keys(parsedCache).length} items from localStorage`);
      }
    } catch (e) {
      console.log('Error while trying to load cache from local storage', e);
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

// Îmbunătățim funcția de obținere a cotației pentru a încorpora mai bine datele simulate
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
          // Continuăm cu execuția pentru a încerca direct API-ul
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
            isSimulated: lastDataPoint.isSimulated || false
          };
          
          cache.set(cacheKey, {
            timestamp: Date.now(),
            data: cryptoQuote
          });
          
          return cryptoQuote;
        }
      } catch (error) {
        console.warn('Error fetching crypto data, will use simulated data', error);
        // Continuăm cu execuția pentru a folosi date simulate
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
          console.log(`No data available for ${symbol}, using simulated data`);
          return generateFallbackData(symbol);
        }
      })
      .catch(error => {
        console.warn(`API error for ${symbol}, using simulated data`, error);
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
            console.log(`No data available for ${symbol}, using simulated data`);
            quotesMap[symbol] = generateFallbackData(symbol);
          }
        } catch (error) {
          console.warn(`API error for ${symbol}, using simulated data`, error);
          quotesMap[symbol] = generateFallbackData(symbol);
        }
      }
      
      return quotesMap;
    }, 'quote');
  } catch (error) {
    console.warn('Error in getMultipleStockQuotes, using fallback for all symbols', error);
    const fallbackMap = {};
    symbols.forEach(symbol => {
      fallbackMap[symbol] = generateFallbackData(symbol);
    });
    return fallbackMap;
  }
};

// Funcție îmbunătățită pentru a obține date despre criptomonede
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
            date_from: fromDate.split('T')[0],
            date_to: toDate.split('T')[0],
            limit: 1000
          }
        });
        
        if (!response.data?.data?.length) {
          console.log(`No crypto data from API for ${symbol}, using simulated data`);
          return generateSimulatedHistoricalData(symbol, fromDate, toDate, intervalType);
        }
        
        return formatHistoricalData(response.data.data, symbol);
      } catch (apiError) {
        console.warn('Marketstack API error for crypto data:', apiError.response?.data || apiError);
        return generateSimulatedHistoricalData(symbol, fromDate, toDate, intervalType);
      }
    }, 'historical');
  } catch (error) {
    console.warn('Error in getCryptoData, using simulated data', error);
    return generateSimulatedHistoricalData(symbol, from, to, intervalType);
  }
};

// Funcție îmbunătățită pentru obținerea datelor intraday
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
          console.log(`No intraday data from API for ${symbol}, using simulated data`);
          return generateSimulatedHistoricalData(symbol, formattedStartDate, today.toISOString().split('T')[0], interval);
        }
        
        return formatHistoricalData(response.data.data, symbol);
      } catch (apiError) {
        console.warn('Marketstack API error for intraday data:', apiError.response?.data || apiError);
        const today = new Date();
        const startDate = new Date();
        startDate.setDate(today.getDate() - 2);
        return generateSimulatedHistoricalData(symbol, startDate.toISOString().split('T')[0], today.toISOString().split('T')[0], interval);
      }
    }, 'historical');
  } catch (error) {
    console.warn('Error in getIntradayData, using simulated data', error);
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - 2);
    return generateSimulatedHistoricalData(symbol, startDate.toISOString().split('T')[0], today.toISOString().split('T')[0], interval);
  }
};

// Curățarea cache-ului
const clearCache = () => {
  cache.clear();
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem('marketstackApiCache');
  }
  console.log('Cache cleared successfully');
  return true;
};

// Obținerea statisticilor de cache
const getCacheStats = () => {
  return {
    size: cache.size,
    keys: Array.from(cache.keys()),
    durations: CACHE_DURATIONS
  };
};

// Exportăm toate funcțiile API și de generare pentru acces public
const marketstackApi = {
  getStockQuote,
  getMultipleStockQuotes,
  getCryptoData,
  getIntradayData,
  clearCache,
  getCacheStats,
  // Expunem și funcțiile de generare pentru acces direct
  generateSimulatedHistoricalData,
};

export default marketstackApi;