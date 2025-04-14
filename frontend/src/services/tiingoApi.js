import axios from 'axios';

const API_KEY = '2685659d56bc71ab92b6f6c1d4e8404603b2af46';
const BASE_URL = '/tiingo';

const CACHE_DURATIONS = {
  quote: 5 * 60 * 1000,
  historical: 24 * 60 * 60 * 1000,
  profile: 7 * 24 * 60 * 60 * 1000,
  index: 10 * 60 * 1000
};

const cache = new Map();

const TIINGO_LIMITS = {
  supportedEndpoints: ['daily', 'meta', 'prices', 'fundamentals'],
  maxRequests: 500,
  supportedIntervals: ['daily']
};

const COMMON_SYMBOLS = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META',
  '^GSPC', '^DJI', '^IXIC'
];

const tiingoIndexMap = {
  '^GSPC': 'SPY',
  '^DJI': 'DIA',
  '^IXIC': 'QQQ'
};

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

const tiingoClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  params: {
    token: API_KEY
  }
});

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

  console.log(`Generating fallback data for ${symbol} with price ${price} and change ${change} (${changePercent}%)`);
  
  return {
    symbol: symbol,
    name: `${symbol} Inc.`,
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

const generateSimulatedHistoricalData = (symbol, fromDate, toDate) => {
  console.log(`Generating simulated historical data for ${symbol} from ${fromDate} to ${toDate}`);
  
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
  
  console.log(`Generating ${totalDays + 1} data points`);
  
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
      adjusted_close: parseFloat(lastPrice.toFixed(2))
    });
  }
  
  console.log(`Generated ${data.length} historical data points`);
  return data;
};

const formatHistoricalData = (data) => {
  if (!Array.isArray(data)) {
    console.warn('Historical data is not an array, returning empty array');
    return [];
  }
  
  if (data.length === 0) {
    console.warn('Historical data array is empty');
    return [];
  }
  
  console.log('First raw historical item before formatting:', data[0]);
  
  const formatted = data.map(item => {
    const formattedItem = {
      date: item.date,
      symbol: item.ticker || item.symbol,
      open: typeof item.open === 'number' ? item.open : parseFloat(item.open) || 0,
      high: typeof item.high === 'number' ? item.high : parseFloat(item.high) || 0,
      low: typeof item.low === 'number' ? item.low : parseFloat(item.low) || 0,
      close: typeof item.close === 'number' ? item.close : parseFloat(item.close) || 0,
      volume: typeof item.volume === 'number' ? item.volume : parseInt(item.volume) || 0,
      price: typeof item.close === 'number' ? item.close : parseFloat(item.close) || 0
    };
    
    return formattedItem;
  });
  
  console.log('First formatted historical item after formatting:', formatted[0]);
  
  formatted.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  return formatted;
};

const generateDetailedSimulatedIntradayData = (symbol, interval) => {
  console.log(`Generating detailed simulated intraday data for ${symbol} with interval ${interval}`);
  
  const getNumericValue = (str) => {
    let val = 0;
    for (let i = 0; i < str.length; i++) {
      val += str.charCodeAt(i);
    }
    return val;
  };

  const seed = getNumericValue(symbol);
  const basePrice = (seed % 100) + 50;
  const volatility = basePrice * 0.005;
  
  const now = new Date();
  const simulatedData = [];
  
  const patternType = seed % 3;
  
  let minutesPerInterval;
  let daysToGoBack;
  
  switch(interval) {
    case '15min':
      minutesPerInterval = 15;
      daysToGoBack = 2;
      break;
    case '30min':
      minutesPerInterval = 30;
      daysToGoBack = 3;
      break;
    case '1hour':
    case 'hourly':
      minutesPerInterval = 60;
      daysToGoBack = 9;
      break;
    default:
      minutesPerInterval = 15;
      daysToGoBack = 2;
  }
  
  const intervalsPerDay = Math.ceil(7 * 60 / minutesPerInterval);
  const totalIntervals = intervalsPerDay * daysToGoBack;
  
  console.log(`Generating ${totalIntervals} intervals for ${interval} data over ${daysToGoBack} days`);
  
  let lastPrice = basePrice;
  
  for (let i = 0; i < totalIntervals; i++) {
    const minutesAgo = i * minutesPerInterval;
    const pointTime = new Date(now.getTime() - (minutesAgo * 60 * 1000));
    
    const hours = pointTime.getHours();
    const day = pointTime.getDay();
    
    if (day === 0 || day === 6) {
      continue;
    }
    
    if (hours < 7 || hours > 20) {
      continue;
    }
    
    let priceChange;
    
    switch(patternType) {
      case 0:
        priceChange = (Math.random() * 2 - 1) * volatility;
        break;
      case 1:
        priceChange = volatility * (Math.random() * 1.2 - 0.4);
        break;
      case 2:
        priceChange = volatility * (Math.random() * 1.2 - 0.8);
        break;
    }
    
    const isMarketHours = hours >= 9 && hours < 16;
    
    if (!isMarketHours) {
      priceChange = priceChange * 0.3;
    }
    
    if (hours === 9 && patternType !== 2) {
      priceChange += volatility * 0.8;
    } else if (hours === 12) {
      priceChange -= volatility * 0.5;
    } else if (hours === 15) {
      priceChange += patternType === 1 ? volatility * 1 : (patternType === 2 ? -volatility * 1 : 0);
    }
    
    const recencyFactor = 1 - (i / totalIntervals) * 0.5;
    lastPrice += (priceChange * recencyFactor);
    
    lastPrice = Math.max(lastPrice, 1);
    
    const intraMinuteVolatility = volatility * 0.2 * Math.random();
    const open = lastPrice - intraMinuteVolatility * 0.5;
    const close = lastPrice;
    const high = Math.max(open, close) + intraMinuteVolatility;
    const low = Math.min(open, close) - intraMinuteVolatility;
    
    const baseVolume = isMarketHours ? 10000 : 3000;
    
    simulatedData.push({
      date: pointTime.toISOString(),
      symbol: symbol,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      price: parseFloat(close.toFixed(2)),
      volume: Math.floor(Math.random() * baseVolume) + 1000
    });
  }
  
  simulatedData.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  console.log(`Generated ${simulatedData.length} intraday data points`);
  return simulatedData;
};

const generateSimulatedIndexData = (symbol) => {
  const baseValue = symbol === '^GSPC' ? 4500 : 
                    symbol === '^DJI' ? 38000 : 
                    symbol === '^IXIC' ? 14500 : 10000;
  
  const randomChange = (Math.random() * 2 - 1) * (baseValue * 0.01);
  
  return {
    symbol: symbol,
    name: getIndexName(symbol),
    last: baseValue + randomChange,
    high: baseValue + Math.abs(randomChange) + 10,
    low: baseValue - Math.abs(randomChange) - 10,
    open: baseValue - (randomChange / 2),
    volume: Math.floor(Math.random() * 1000000) + 100000,
    timestamp: new Date().toISOString()
  };
};

const getIndexName = (symbol) => {
  switch (symbol) {
    case '^GSPC': return 'S&P 500';
    case '^DJI': return 'Dow Jones Industrial Average';
    case '^IXIC': return 'NASDAQ Composite';
    default: return `Index ${symbol}`;
  }
};

const pendingRequests = new Map();

const getMultipleStockQuotes = async (symbols) => {
  try {
    if (symbols.length === 0) return {};
    
    const batchKey = `quotes-${symbols.sort().join('-')}`;
    
    return await withCache(batchKey, async () => {
      console.log(`Fetching batch quote data for ${symbols.join(', ')}...`);
      
      // Folosim calea directă /iex pentru a evita prefixul /tiingo
      const response = await axios.get(`/iex`, {
        params: {
          tickers: symbols.join(','),
          token: API_KEY
        }
      });
      
      console.log(`Batch quote response status: ${response.status}`);
      
      if (!response.data || response.data.length === 0) {
        console.warn('No IEX data available for batch request, using fallback');
        const fallbackMap = {};
        symbols.forEach(symbol => {
          fallbackMap[symbol] = generateFallbackData(symbol);
        });
        return fallbackMap;
      }
      
      const quotesMap = {};
      response.data.forEach(quote => {
        const symbol = quote.ticker;
        // MODIFICARE IMPORTANTĂ: Folosim tngoLast în loc de last sau price
        const price = quote.tngoLast || quote.last || quote.price || 0;
        const prevClose = quote.prevClose || price;
        const change = price - prevClose;
        
        quotesMap[symbol] = {
          symbol: symbol,
          price: price,
          change: change,
          changePercent: prevClose !== 0 ? (change / prevClose) * 100 : 0,
          high: quote.high || price,
          low: quote.low || price,
          open: quote.open || price,
          volume: quote.volume || 0,
          timestamp: quote.timestamp || new Date().toISOString(),
          isSimulated: false
        };
      });
      
      symbols.forEach(symbol => {
        if (!quotesMap[symbol]) {
          console.log(`No data for ${symbol} in batch response, using fallback`);
          quotesMap[symbol] = generateFallbackData(symbol);
        }
      });
      
      return quotesMap;
    }, 'quote');
  } catch (error) {
    console.error('Error fetching multiple stock quotes:', error);
    if (error.response) {
      console.error(`Error status: ${error.response.status}`);
      console.error(`Error data:`, error.response.data);
    }
    
    const fallbackMap = {};
    symbols.forEach(symbol => {
      fallbackMap[symbol] = generateFallbackData(symbol);
    });
    return fallbackMap;
  }
};

class DataPreloader {
  constructor() {
    this.lastUpdate = 0;
    this.updateInterval = 5 * 60 * 1000;
    this.isInitialized = false;
    this.commonData = {};
  }
  
  async initialize() {
    if (this.isInitialized) return;
    
    console.log('Initializing data preloader...');
    await this.updateCommonData();
    this.isInitialized = true;
    
    setInterval(() => this.updateCommonData(), this.updateInterval);
  }
  
  async updateCommonData() {
    const now = Date.now();
    if (now - this.lastUpdate < this.updateInterval) {
      return this.commonData;
    }
    
    console.log('Preloading common symbols data...');
    
    try {
      const tiingoSymbols = COMMON_SYMBOLS.map(s => tiingoIndexMap[s] || s);
      
      this.commonData = await getMultipleStockQuotes(tiingoSymbols);
      
      for (const [original, tiingo] of Object.entries(tiingoIndexMap)) {
        if (this.commonData[tiingo] && COMMON_SYMBOLS.includes(original)) {
          const indexData = this.commonData[tiingo];
          this.commonData[original] = {
            ...indexData,
            symbol: original,
            name: getIndexName(original)
          };
        }
      }
      
      this.lastUpdate = now;
      console.log('Common data preloading complete');
    } catch (error) {
      console.error('Error preloading common data:', error);
    }
    
    return this.commonData;
  }
  
  getPreloadedData(symbol) {
    return this.commonData[symbol];
  }
}

const dataPreloader = new DataPreloader();

dataPreloader.initialize().catch(error => {
  console.error('Failed to initialize data preloader:', error);
});

const tiingoApi = {
  getStockQuote: async (symbol) => {
    try {
      const preloadedData = dataPreloader.getPreloadedData(symbol);
      if (preloadedData) {
        console.log(`Using preloaded data for ${symbol}`);
        return preloadedData;
      }
      
      const cacheKey = `quote-${symbol}`;
      const cachedData = cache.get(cacheKey);
      if (cachedData && cachedData.timestamp > Date.now() - CACHE_DURATIONS.quote) {
        return cachedData.data;
      }
      
      for (const [batchKey, requestPromise] of pendingRequests.entries()) {
        if (batchKey.startsWith('quotes-') && batchKey.includes(symbol)) {
          console.log(`Joining existing batch request for ${symbol}`);
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
      
      const batchKey = `quotes-${symbol}`;
      if (!pendingRequests.has(batchKey)) {
        const requestPromise = getMultipleStockQuotes([symbol]);
        pendingRequests.set(batchKey, requestPromise);
        
        try {
          const resultMap = await requestPromise;
          
          if (resultMap[symbol]) {
            cache.set(cacheKey, {
              timestamp: Date.now(),
              data: resultMap[symbol]
            });
            return resultMap[symbol];
          } else {
            const fallbackData = generateFallbackData(symbol);
            cache.set(cacheKey, {
              timestamp: Date.now(),
              data: fallbackData
            });
            return fallbackData;
          }
        } finally {
          pendingRequests.delete(batchKey);
        }
      } else {
        const resultMap = await pendingRequests.get(batchKey);
        return resultMap[symbol] || generateFallbackData(symbol);
      }
    } catch (error) {
      console.error('Error fetching stock quote:', error);
      return generateFallbackData(symbol);
    }
  },

  getMultipleStockQuotes,

  getHistoricalData: async (symbol, from, to, interval = 'daily') => {
    try {
      const fromDate = from.toISOString().split('T')[0];
      const toDate = to.toISOString().split('T')[0];
      const cacheKey = `historical-${symbol}-${fromDate}-${toDate}-${interval}`;
      
      console.log(`Fetching historical data for ${symbol} from ${fromDate} to ${toDate} with interval ${interval}...`);
      
      return await withCache(cacheKey, async () => {
        try {
          const response = await tiingoClient.get(`/tiingo/daily/${symbol}/prices`, {
            params: {
              startDate: fromDate,
              endDate: toDate,
              format: 'json',
              resampleFreq: interval === '24hour' ? 'daily' : interval
            }
          });
          
          console.log(`Historical response status: ${response.status}`);
          console.log(`Historical data length:`, response.data ? response.data.length : 0);
          
          if (!response.data || response.data.length === 0) {
            console.warn('No historical data available, using simulated data');
            return formatHistoricalData(generateSimulatedHistoricalData(symbol, fromDate, toDate));
          }
          
          const formattedData = response.data.map(item => ({
            date: item.date,
            symbol: symbol,
            open: item.open,
            high: item.high,
            low: item.low,
            close: item.close,
            volume: item.volume,
            adjusted_close: item.adjClose || item.close
          }));
          
          return formatHistoricalData(formattedData);
        } catch (apiError) {
          console.error('API error fetching historical data:', apiError);
          return formatHistoricalData(generateSimulatedHistoricalData(symbol, fromDate, toDate));
        }
      }, 'historical');
    } catch (error) {
      console.error('Error in historical data function:', error);
      return formatHistoricalData(generateSimulatedHistoricalData(symbol, from.toISOString().split('T')[0], to.toISOString().split('T')[0]));
    }
  },

  getIntradayData: async (symbol, interval = '15min') => {
    try {
      const cacheKey = `intraday-${symbol}-${interval}`;
      
      return await withCache(cacheKey, async () => {
        try {
          const today = new Date();
          let startDate;
          
          if (interval === '1hour') {
            startDate = new Date(today);
            startDate.setDate(today.getDate() - 9);
          } else {
            startDate = new Date(today);
            startDate.setDate(today.getDate() - 2);
          }
          
          const formattedStartDate = startDate.toISOString().split('T')[0];
          
          const response = await tiingoClient.get(`/iex/${symbol}/prices`, {
            params: {
              startDate: formattedStartDate,
              resampleFreq: interval,
              format: 'json'
            }
          });
          
          if (!response.data || response.data.length === 0) {
            console.warn('No intraday data available, using simulated data');
            return generateDetailedSimulatedIntradayData(symbol, interval);
          }
          
          const formattedData = response.data.map(item => ({
            date: item.date,
            symbol: symbol,
            open: item.open || item.last,
            high: item.high || item.last,
            low: item.low || item.last,
            close: item.close || item.last,
            price: item.last || item.close,
            volume: item.volume || 0
          }));
          
          return formattedData;
        } catch (apiError) {
          console.warn('API error fetching intraday data, using simulated data:', apiError);
          return generateDetailedSimulatedIntradayData(symbol, interval);
        }
      }, 'quote');
    } catch (error) {
      console.error('Error generating intraday data:', error);
      return generateDetailedSimulatedIntradayData(symbol, interval);
    }
  },

  getCompanyProfile: async (symbol) => {
    try {
      return await withCache(`profile-${symbol}`, async () => {
        try {
          const response = await tiingoClient.get(`/tiingo/daily/${symbol}`);
          
          if (!response.data) {
            console.warn('No company profile data available, using fallback');
            return {
              name: `${symbol} Inc.`,
              symbol: symbol,
              stock_exchange: 'DEMO',
              exchange_acronym: 'DEMO',
              exchange_country: 'US'
            };
          }
          
          return {
            name: response.data.name || `${symbol} Inc.`,
            symbol: response.data.ticker || symbol,
            stock_exchange: response.data.exchangeCode || 'N/A',
            exchange_acronym: response.data.exchangeCode || 'N/A',
            exchange_country: 'US',
            description: response.data.description || 'No description available.'
          };
        } catch (apiError) {
          console.warn('API error fetching company profile:', apiError);
          return {
            name: `${symbol} Inc.`,
            symbol: symbol,
            stock_exchange: 'DEMO',
            exchange_acronym: 'DEMO',
            exchange_country: 'US'
          };
        }
      }, 'profile');
    } catch (error) {
      console.error('Error fetching company profile:', error);
      return {
        name: `${symbol} Inc.`,
        symbol: symbol,
        stock_exchange: 'DEMO',
        exchange_acronym: 'DEMO',
        exchange_country: 'US'
      };
    }
  },

  getMarketIndex: async (symbol) => {
    try {
      const preloadedData = dataPreloader.getPreloadedData(symbol);
      if (preloadedData) {
        console.log(`Using preloaded index data for ${symbol}`);
        return preloadedData;
      }
      
      const cacheKey = `index-${symbol}`;
      
      return await withCache(cacheKey, async () => {
        const tiingoSymbol = tiingoIndexMap[symbol] || symbol;
        
        try {
          const response = await tiingoClient.get(`/iex`, {
            params: {
              tickers: tiingoSymbol
            }
          });
          
          if (!response.data || response.data.length === 0) {
            console.warn('No index data available, using simulated data');
            return generateSimulatedIndexData(symbol);
          }
          
          const indexData = response.data[0];
          
          return {
            symbol: symbol,
            name: getIndexName(symbol),
            last: indexData.last || 0,
            high: indexData.high || 0,
            low: indexData.low || 0,
            open: indexData.open || 0,
            volume: indexData.volume || 0,
            timestamp: indexData.timestamp || new Date().toISOString()
          };
        } catch (apiError) {
          console.warn('API error fetching index data:', apiError);
          return generateSimulatedIndexData(symbol);
        }
      }, 'index');
    } catch (error) {
      console.error('Error fetching market index:', error);
      return generateSimulatedIndexData(symbol);
    }
  },
  
  preloadCommonData: async () => {
    try {
      await dataPreloader.updateCommonData();
      console.log('Successfully preloaded common data');
    } catch (error) {
      console.error('Error preloading common data:', error);
    }
  },
  
  clearCache: () => {
    cache.clear();
    console.log('Cache cleared');
  },
  
  getCacheStats: () => {
    return {
      size: cache.size,
      keys: Array.from(cache.keys()),
      durations: CACHE_DURATIONS
    };
  }
};

export default tiingoApi;