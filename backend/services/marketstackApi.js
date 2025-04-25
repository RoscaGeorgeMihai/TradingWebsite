const axios = require('axios');

const API_KEY = process.env.MARKETSTACK_API_KEY;
const BASE_URL = 'https://api.marketstack.com/v1';

const marketstackApi = {
    getMultipleStockQuotes: async (symbols) => {
        try {
            const response = await axios.get(`${BASE_URL}/intraday/latest`, {
                params: {
                    access_key: API_KEY,
                    symbols: symbols.join(',')
                }
            });

            if (response.data && response.data.data) {
                const quotesMap = {};
                response.data.data.forEach(quote => {
                    if (quote.symbol) {
                        quotesMap[quote.symbol] = {
                            symbol: quote.symbol,
                            price: quote.last || quote.close || 0,
                            marketstack_last: quote.last || quote.close || 0,
                            change: quote.change || 0,
                            changePercent: quote.change_percent || 0,
                            volume: quote.volume || 0,
                            timestamp: quote.date
                        };
                    }
                });
                return quotesMap;
            }
            return null;
        } catch (error) {
            console.error('Error fetching stock quotes:', error);
            return null;
        }
    }
};

module.exports = marketstackApi; 