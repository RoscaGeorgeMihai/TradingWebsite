import React, { useState, useEffect, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import styles from "../styles/Crypto.module.css";
import { Link } from 'react-router-dom';
import marketstackApi from "../services/marketstackApi"; // Update with the correct path

const Crypto = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [timeInterval, setTimeInterval] = useState('1d');
    const [activeCategory, setActiveCategory] = useState('all');
    const [cryptocurrencies, setCryptocurrencies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const scrollContainerRef = useRef(null);

    // Crypto configuration - metadata not provided by the API
    const cryptoConfig = {
        "btcusd": { name: "Bitcoin", color: "#f7931a", category: "l1" },
        "ethusd": { name: "Ethereum", color: "#627eea", category: "l1" },
        "usdtusd": { name: "Tether", color: "#26a17b", category: "stable" },
        "bnbusd": { name: "Binance Coin", color: "#f0b90b", category: "l1" },
        "solusd": { name: "Solana", color: "#7b5fe7", category: "l1" },
        "dogeusd": { name: "Dogecoin", color: "#c2a633", category: "meme" }
    };

    // List of crypto symbols to fetch
    const cryptoSymbols = ["btcusd", "ethusd", "usdtusd", "bnbusd", "solusd", "dogeusd"];

    // Categories for coin types
    const categories = [
        { id: 'all', name: 'All Coins' },
        { id: 'stable', name: 'Stablecoins' },
        { id: 'meme', name: 'Meme Coins' },
        { id: 'l1', name: 'Layer 1s' }
    ];

    // Helper function to fetch data for a specific time period
    const fetchCryptoDataForTimeRange = async (symbol, interval) => {
        const now = new Date();
        let fromDate;

        switch (interval) {
            case '1d':
                fromDate = new Date(now);
                fromDate.setDate(now.getDate() - 1);
                break;
            case '1w':
                fromDate = new Date(now);
                fromDate.setDate(now.getDate() - 7);
                break;
            case '1m':
                fromDate = new Date(now);
                fromDate.setMonth(now.getMonth() - 1);
                break;
            case '1y':
                fromDate = new Date(now);
                fromDate.setFullYear(now.getFullYear() - 1);
                break;
            case 'max':
                fromDate = new Date('2020-01-01'); // Arbitrary start date for max
                break;
            default:
                fromDate = new Date(now);
                fromDate.setDate(now.getDate() - 1);
        }

        // Call the API
        const intervalType = interval === '1d' ? 'daily' : 'daily'; // Can be adjusted based on API capabilities
        return await marketstackApi.getCryptoData(symbol, fromDate, now, intervalType);
    };

    // Format historical data into the structure needed for charts
    const formatPriceHistory = (apiData, timeInterval) => {
        if (!apiData || !Array.isArray(apiData) || apiData.length === 0) {
            return [];
        }
        
        // Sort by date ascending
        const sortedData = [...apiData].sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Format based on the timeInterval
        switch (timeInterval) {
            case '1d':{
                // Get the last day of data
                const last24h = takeEvenly(sortedData, 5);
                return last24h.map((item, index) => {
                    const labels = ['1d', '12h', '6h', '3h', 'Now'];
                    return {
                        name: labels[index] || `Point ${index}`,
                        price: item.close
                    };
                });
            }
            case '1w':{
                // Get the last 7 days of data
                const last7d = takeEvenly(sortedData, 5);
                return last7d.map((item, index) => {
                    const labels = ['7d', '5d', '3d', '1d', 'Now'];
                    return {
                        name: labels[index] || `Point ${index}`,
                        price: item.close
                    };
                });
            }
            case '1m': {
                // For monthly data, take 5 points
                const monthlyData = takeEvenly(sortedData, 5);
                return monthlyData.map((item, index) => {
                    const labels = ['30d', '20d', '10d', '5d', 'Now'];
                    return {
                        name: labels[index] || `Point ${index}`,
                        price: item.close
                    };
                });
        }    
            case '1y':{
                // For yearly data, take 5 points
                const yearlyData = takeEvenly(sortedData, 5);
                return yearlyData.map((item, index) => {
                    const labels = ['Jan', 'Mar', 'Jun', 'Sep', 'Now'];
                    return {
                        name: labels[index] || `Point ${index}`,
                        price: item.close
                    };
                });
            }   
            case 'max':{
                // For max data, take yearly points
                const maxData = takeEvenly(sortedData, 5);
                return maxData.map((item, index) => {
                    // Get year from date
                    const year = new Date(item.date).getFullYear();
                    const labels = ['2020', '2021', '2022', '2023', 'Now'];
                    return {
                        name: labels[index] || year.toString(),
                        price: item.close
                    };
                });
            }
            default:{
                return sortedData.map(item => ({
                    name: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    price: item.close
                }));
            }
        }
    };

    // Helper function to take evenly spaced items from an array
    const takeEvenly = (array, count) => {
        const result = [];
        if (array.length <= count) {
            return array;
        }
        
        const interval = Math.floor((array.length - 1) / (count - 1));
        for (let i = 0; i < count - 1; i++) {
            result.push(array[i * interval]);
        }
        result.push(array[array.length - 1]); // Always include the last item
        
        return result;
    };

    // Format large numbers (market cap, volume)
    const formatLargeNumber = (number) => {
        if (number >= 1e12) {
            return `$${(number / 1e12).toFixed(2)}T`;
        } else if (number >= 1e9) {
            return `$${(number / 1e9).toFixed(2)}B`;
        } else if (number >= 1e6) {
            return `$${(number / 1e6).toFixed(2)}M`;
        } else {
            return `$${Math.floor(number).toLocaleString()}`;
        }
    };

    // Format price
    const formatPrice = (price) => {
        if (price >= 1000) {
            return price.toLocaleString(undefined, { 
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        } else if (price >= 1) {
            return price.toFixed(2);
        } else {
            return price.toPrecision(2);
        }
    };

    // Initialize data when component mounts
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Fetch current quotes for all symbols
                const quotes = await marketstackApi.getMultipleStockQuotes(
                    cryptoSymbols
                );
                
                // Create an array to hold all promises for historical data
                const historyPromises = [];
                
                // For each crypto, fetch the historical data for all time intervals
                for (const symbol of cryptoSymbols) {
                    const timeIntervalsToFetch = ['1d', '1w', '1m', '1y', 'max'];
                    
                    for (const interval of timeIntervalsToFetch) {
                        historyPromises.push(
                            fetchCryptoDataForTimeRange(symbol, interval)
                                .then(data => ({ symbol, interval, data }))
                        );
                    }
                }
                
                // Wait for all historical data to be fetched
                const historicalResults = await Promise.all(historyPromises);
                
                // Process quotes and historical data
                const processedCryptos = cryptoSymbols.map(symbol => {
                    const quote = quotes[symbol] || {};
                    const config = cryptoConfig[symbol] || {};
                    
                    // Build priceHistory object for each time interval
                    const priceHistory = {};
                    
                    for (const interval of ['1d', '1w', '1m', '1y', 'max']) {
                        const historyResult = historicalResults.find(
                            result => result.symbol === symbol && result.interval === interval
                        );
                        
                        if (historyResult) {
                            priceHistory[interval] = formatPriceHistory(historyResult.data, interval);
                        } else {
                            priceHistory[interval] = [];
                        }
                    }
                    
                    // Estimate market cap (price * arbitrary number for circulating supply)
                    const estimatedSupply = {
                        "btcusd": 19000000,
                        "ethusd": 120000000,
                        "usdtusd": 83000000000,
                        "bnbusd": 155000000,
                        "solusd": 400000000,
                        "dogeusd": 140000000000
                    };
                    
                    const supply = estimatedSupply[symbol] || 1000000;
                    const marketCap = quote.price * supply;
                    
                    // Format the data for display
                    return {
                        symbol: symbol.toUpperCase().replace('USD', ''),
                        name: config.name || symbol,
                        price: formatPrice(quote.price || 0),
                        change: quote.changePercent >= 0 ? `+${quote.changePercent.toFixed(2)}%` : `${quote.changePercent.toFixed(2)}%`,
                        color: config.color || "#999999",
                        category: config.category || "other",
                        marketCap: formatLargeNumber(marketCap),
                        volume: formatLargeNumber(quote.volume || 0),
                        priceHistory: priceHistory
                    };
                });
                
                setCryptocurrencies(processedCryptos);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching crypto data:", err);
                setError("Failed to load cryptocurrency data. Please try again later.");
                setLoading(false);
            }
        };
        
        fetchData();
    }, []);

    // Filter cryptocurrencies based on search term and category
    const filteredCryptos = cryptocurrencies.filter(crypto => {
        const matchesSearch = crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             crypto.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = activeCategory === 'all' || crypto.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    // Auto-scroll effect
    useEffect(() => {
        const scrollInterval = setInterval(() => {
            if (scrollContainerRef.current && filteredCryptos.length > 0) {
                const nextIndex = (activeIndex + 1) % filteredCryptos.length;
                setActiveIndex(nextIndex);
                
                const scrollContainer = scrollContainerRef.current;
                const nextElement = scrollContainer.children[nextIndex];
                
                if (nextElement) {
                    nextElement.scrollIntoView({ 
                        behavior: 'smooth', 
                        inline: 'center' 
                    });
                }
            }
        }, 5000);

        return () => clearInterval(scrollInterval);
    }, [activeIndex, filteredCryptos.length]);

    const handleTimeIntervalChange = (interval) => {
        setTimeInterval(interval);
    };

    const timeIntervalOptions = [
        { value: '1d', label: '1D' },
        { value: '1w', label: '1W' },
        { value: '1m', label: '1M' },
        { value: '1y', label: '1Y' },
        { value: 'max', label: 'MAX' }
    ];

    // Render loading state
    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loadingContainer}>
                    <div className={styles.loadingSpinner}></div>
                    <p>Loading cryptocurrency data...</p>
                </div>
            </div>
        );
    }

    // Render error state
    if (error) {
        return (
            <div className={styles.container}>
                <div className={styles.errorContainer}>
                    <h2>Error</h2>
                    <p>{error}</p>
                    <button 
                        className={styles.retryButton}
                        onClick={() => window.location.reload()}
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Cryptocurrency Market</h1>
                <p className={styles.pageSubtitle}>Track real-time prices and trends of the top digital assets</p>
            </div>
            
            {/* Search and filters section */}
            <div className={styles.searchContainer}>
                <input 
                    type="text" 
                    className={styles.searchInput} 
                    placeholder="Search cryptocurrencies..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className={styles.searchButton}>
                    <span className={styles.searchIcon}>🔍</span>
                </button>
            </div>
            
            {/* Category filters */}
            <div className={styles.filtersContainer}>
                <div className={styles.categoryFilters}>
                    {categories.map(category => (
                        <button 
                            key={category.id}
                            className={`${styles.filterBtn} ${activeCategory === category.id ? styles.active : ''}`}
                            onClick={() => setActiveCategory(category.id)}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>
                <div className={styles.timeFilters}>
                    {timeIntervalOptions.map(option => (
                        <button
                            key={option.value}
                            className={`${styles.filterBtn} ${styles.timeFilter} ${timeInterval === option.value ? styles.active : ''}`}
                            onClick={() => handleTimeIntervalChange(option.value)}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>
            
            {/* Featured cryptocurrency - show first in filtered list */}
            {filteredCryptos.length > 0 && (
                <div className={styles.featuredCrypto}>
                    <div className={styles.featuredContent}>
                        <div className={styles.featuredHeader}>
                            <div 
                                className={styles.cryptoIcon} 
                                style={{ backgroundColor: filteredCryptos[0].color }}
                            >
                                {filteredCryptos[0].symbol[0]}
                            </div>
                            <div className={styles.cryptoInfo}>
                                <h2>{filteredCryptos[0].name} <span className={styles.symbolLabel}>({filteredCryptos[0].symbol})</span></h2>
                                <div className={styles.cryptoMeta}>
                                    <span>Market Cap: {filteredCryptos[0].marketCap}</span>
                                    <span>Volume: {filteredCryptos[0].volume}</span>
                                </div>
                            </div>
                        </div>
                        <div className={styles.priceInfo}>
                            <div className={styles.currentPrice}>
                                ${filteredCryptos[0].price}
                            </div>
                            <div className={`${styles.priceChange} ${filteredCryptos[0].change.startsWith('+') ? styles.positive : styles.negative}`}>
                                {filteredCryptos[0].change}
                            </div>
                        </div>
                        <div className={styles.chartContainer}>
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={filteredCryptos[0].priceHistory[timeInterval]}>
                                    <XAxis dataKey="name" />
                                    <YAxis hide={true} />
                                    <Tooltip />
                                    <Line 
                                        type="monotone" 
                                        dataKey="price" 
                                        stroke={filteredCryptos[0].color} 
                                        strokeWidth={3}
                                        dot={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <div className={styles.tradingButtons}>
                            <Link to={`/crypto/${filteredCryptos[0].symbol}`} className={styles.buyButton}>
                                Buy {filteredCryptos[0].symbol}
                            </Link>
                            <Link to={`/crypto/${filteredCryptos[0].symbol}`} className={styles.sellButton}>
                                Sell {filteredCryptos[0].symbol}
                            </Link>
                        </div>
                    </div>
                </div>
            )}
            
            {/* List of other cryptocurrencies */}
            <div className={styles.cryptoGrid} ref={scrollContainerRef}>
                {filteredCryptos.slice(1).map((crypto) => (
                    <div key={crypto.symbol} className={styles.cryptoCard}>
                        <div className={styles.cryptoHeader}>
                            <div 
                                className={styles.cryptoIcon} 
                                style={{ backgroundColor: crypto.color }}
                            >
                                {crypto.symbol[0]}
                            </div>
                            <div className={styles.cryptoDetails}>
                                <div className={styles.cryptoName}>{crypto.name}</div>
                                <div className={styles.cryptoSymbol}>{crypto.symbol}</div>
                            </div>
                            <div className={styles.cryptoPriceInfo}>
                                <div className={styles.cryptoPrice}>${crypto.price}</div>
                                <div className={`${styles.cryptoPriceChange} ${crypto.change.startsWith('+') ? styles.positive : styles.negative}`}>
                                    {crypto.change}
                                </div>
                            </div>
                        </div>
                        <div className={styles.cryptoChart}>
                            <ResponsiveContainer width="100%" height={120}>
                                <LineChart data={crypto.priceHistory[timeInterval]}>
                                    <XAxis dataKey="name" tick={false} hide />
                                    <YAxis hide={true} />
                                    <Line 
                                        type="monotone" 
                                        dataKey="price" 
                                        stroke={crypto.color} 
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <div className={styles.cryptoFooter}>
                            <div className={styles.cryptoStats}>
                                <div className={styles.statItem}>
                                    <span className={styles.statLabel}>Market Cap</span>
                                    <span className={styles.statValue}>{crypto.marketCap}</span>
                                </div>
                                <div className={styles.statItem}>
                                    <span className={styles.statLabel}>Volume</span>
                                    <span className={styles.statValue}>{crypto.volume}</span>
                                </div>
                            </div>
                            <Link to={`/crypto/${crypto.symbol}`} className={styles.tradeButton}>
                                Buy
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Show message if no cryptocurrencies match filter */}
            {filteredCryptos.length === 0 && (
                <div className={styles.noResults}>
                    <p>No cryptocurrencies found matching your criteria. Try adjusting your search or filters.</p>
                </div>
            )}
            
            {/* Market overview section */}
            <div className={styles.newsletterContainer}>
                <div className={styles.newsletterContent}>
                    <h2>Stay Updated on Crypto Trends</h2>
                    <p>Subscribe to our newsletter for daily market analysis, trading signals, and crypto news.</p>
                    <div className={styles.subscribeForm}>
                        <input type="email" placeholder="Your email address" className={styles.emailInput} />
                        <button className={styles.subscribeBtn}>Subscribe</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Crypto;