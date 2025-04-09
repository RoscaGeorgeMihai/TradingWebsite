import React, { useState, useEffect, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import styles from "../styles/Crypto.module.css";
import { Link } from 'react-router-dom';

const Crypto = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [timeInterval, setTimeInterval] = useState('1d');
    const [activeCategory, setActiveCategory] = useState('all');
    const scrollContainerRef = useRef(null);

    // Categories for coin types
    const categories = [
        { id: 'all', name: 'All Coins' },
        { id: 'stable', name: 'Stablecoins' },
        { id: 'meme', name: 'Meme Coins' }
    ];

    const cryptocurrencies = [
        { 
            symbol: "BTC", 
            name: "Bitcoin", 
            price: "68,542.30", 
            change: "+2.45%", 
            color: "#f7931a",
            category: "l1",
            marketCap: "$1.32T",
            volume: "$28.7B",
            priceHistory: {
                '1d': [
                    { name: '1d', price: 67000 },
                    { name: '12h', price: 68000 },
                    { name: '6h', price: 68500 },
                    { name: '3h', price: 69000 },
                    { name: 'Now', price: 68542 }
                ],
                '1w': [
                    { name: '7d', price: 65400 },
                    { name: '5d', price: 66200 },
                    { name: '3d', price: 67000 },
                    { name: '1d', price: 68000 },
                    { name: 'Now', price: 68542 }
                ],
                '1m': [
                    { name: '30d', price: 62000 },
                    { name: '20d', price: 64500 },
                    { name: '10d', price: 66700 },
                    { name: '5d', price: 67500 },
                    { name: 'Now', price: 68542 }
                ],
                '1y': [
                    { name: 'Jan', price: 42000 },
                    { name: 'Mar', price: 48000 },
                    { name: 'Jun', price: 53000 },
                    { name: 'Sep', price: 60000 },
                    { name: 'Now', price: 68542 }
                ],
                'max': [
                    { name: '2020', price: 10000 },
                    { name: '2021', price: 45000 },
                    { name: '2022', price: 38000 },
                    { name: '2023', price: 50000 },
                    { name: 'Now', price: 68542 }
                ]
            }
        },
        { 
            symbol: "ETH", 
            name: "Ethereum", 
            price: "3,782.15", 
            change: "+1.87%", 
            color: "#627eea",
            category: "l1",
            marketCap: "$452.7B",
            volume: "$14.3B",
            priceHistory: {
                '1d': [
                    { name: '1d', price: 3700 },
                    { name: '12h', price: 3750 },
                    { name: '6h', price: 3770 },
                    { name: '3h', price: 3790 },
                    { name: 'Now', price: 3782 }
                ],
                '1w': [
                    { name: '7d', price: 3600 },
                    { name: '5d', price: 3650 },
                    { name: '3d', price: 3700 },
                    { name: '1d', price: 3750 },
                    { name: 'Now', price: 3782 }
                ],
                '1m': [
                    { name: '30d', price: 3300 },
                    { name: '20d', price: 3450 },
                    { name: '10d', price: 3600 },
                    { name: '5d', price: 3700 },
                    { name: 'Now', price: 3782 }
                ],
                '1y': [
                    { name: 'Jan', price: 2200 },
                    { name: 'Mar', price: 2600 },
                    { name: 'Jun', price: 2900 },
                    { name: 'Sep', price: 3400 },
                    { name: 'Now', price: 3782 }
                ],
                'max': [
                    { name: '2020', price: 250 },
                    { name: '2021', price: 3000 },
                    { name: '2022', price: 2000 },
                    { name: '2023', price: 2800 },
                    { name: 'Now', price: 3782 }
                ]
            }
        },
        { 
            symbol: "USDT", 
            name: "Tether", 
            price: "1.00", 
            change: "+0.01%", 
            color: "#26a17b",
            category: "stable",
            marketCap: "$89.2B",
            volume: "$48.5B",
            priceHistory: {
                '1d': [
                    { name: '1d', price: 1.0 },
                    { name: '12h', price: 1.0 },
                    { name: '6h', price: 1.0 },
                    { name: '3h', price: 1.0 },
                    { name: 'Now', price: 1.0 }
                ],
                '1w': [
                    { name: '7d', price: 0.99 },
                    { name: '5d', price: 1.0 },
                    { name: '3d', price: 1.0 },
                    { name: '1d', price: 1.0 },
                    { name: 'Now', price: 1.0 }
                ],
                '1m': [
                    { name: '30d', price: 0.99 },
                    { name: '20d', price: 0.99 },
                    { name: '10d', price: 1.0 },
                    { name: '5d', price: 1.0 },
                    { name: 'Now', price: 1.0 }
                ],
                '1y': [
                    { name: 'Jan', price: 1.0 },
                    { name: 'Mar', price: 1.0 },
                    { name: 'Jun', price: 1.0 },
                    { name: 'Sep', price: 1.0 },
                    { name: 'Now', price: 1.0 }
                ],
                'max': [
                    { name: '2020', price: 1.0 },
                    { name: '2021', price: 1.0 },
                    { name: '2022', price: 1.0 },
                    { name: '2023', price: 1.0 },
                    { name: 'Now', price: 1.0 }
                ]
            }
        },
        { 
            symbol: "BNB", 
            name: "Binance Coin", 
            price: "600.75", 
            change: "+3.12%", 
            color: "#f0b90b",
            category: "l1",
            marketCap: "$91.7B",
            volume: "$4.2B",
            priceHistory: {
                '1d': [
                    { name: '1d', price: 590 },
                    { name: '12h', price: 595 },
                    { name: '6h', price: 598 },
                    { name: '3h', price: 602 },
                    { name: 'Now', price: 600 }
                ],
                '1w': [
                    { name: '7d', price: 570 },
                    { name: '5d', price: 580 },
                    { name: '3d', price: 590 },
                    { name: '1d', price: 595 },
                    { name: 'Now', price: 600 }
                ],
                '1m': [
                    { name: '30d', price: 530 },
                    { name: '20d', price: 550 },
                    { name: '10d', price: 570 },
                    { name: '5d', price: 590 },
                    { name: 'Now', price: 600 }
                ],
                '1y': [
                    { name: 'Jan', price: 320 },
                    { name: 'Mar', price: 380 },
                    { name: 'Jun', price: 450 },
                    { name: 'Sep', price: 540 },
                    { name: 'Now', price: 600 }
                ],
                'max': [
                    { name: '2020', price: 40 },
                    { name: '2021', price: 520 },
                    { name: '2022', price: 280 },
                    { name: '2023', price: 420 },
                    { name: 'Now', price: 600 }
                ]
            }
        },
        { 
            symbol: "SOL", 
            name: "Solana", 
            price: "178.45", 
            change: "+4.56%", 
            color: "#7b5fe7",
            category: "l1",
            marketCap: "$76.3B",
            volume: "$7.1B",
            priceHistory: {
                '1d': [
                    { name: '1d', price: 170 },
                    { name: '12h', price: 172 },
                    { name: '6h', price: 175 },
                    { name: '3h', price: 177 },
                    { name: 'Now', price: 178 }
                ],
                '1w': [
                    { name: '7d', price: 160 },
                    { name: '5d', price: 165 },
                    { name: '3d', price: 170 },
                    { name: '1d', price: 174 },
                    { name: 'Now', price: 178 }
                ],
                '1m': [
                    { name: '30d', price: 135 },
                    { name: '20d', price: 150 },
                    { name: '10d', price: 162 },
                    { name: '5d', price: 170 },
                    { name: 'Now', price: 178 }
                ],
                '1y': [
                    { name: 'Jan', price: 70 },
                    { name: 'Mar', price: 95 },
                    { name: 'Jun', price: 120 },
                    { name: 'Sep', price: 150 },
                    { name: 'Now', price: 178 }
                ],
                'max': [
                    { name: '2020', price: 5 },
                    { name: '2021', price: 180 },
                    { name: '2022', price: 40 },
                    { name: '2023', price: 100 },
                    { name: 'Now', price: 178 }
                ]
            }
        },
        { 
            symbol: "DOGE", 
            name: "Dogecoin", 
            price: "0.12", 
            change: "+5.67%", 
            color: "#c2a633",
            category: "meme",
            marketCap: "$17.1B",
            volume: "$2.4B",
            priceHistory: {
                '1d': [
                    { name: '1d', price: 0.118 },
                    { name: '12h', price: 0.119 },
                    { name: '6h', price: 0.121 },
                    { name: '3h', price: 0.122 },
                    { name: 'Now', price: 0.12 }
                ],
                '1w': [
                    { name: '7d', price: 0.115 },
                    { name: '5d', price: 0.116 },
                    { name: '3d', price: 0.118 },
                    { name: '1d', price: 0.119 },
                    { name: 'Now', price: 0.12 }
                ],
                '1m': [
                    { name: '30d', price: 0.10 },
                    { name: '20d', price: 0.105 },
                    { name: '10d', price: 0.11 },
                    { name: '5d', price: 0.115 },
                    { name: 'Now', price: 0.12 }
                ],
                '1y': [
                    { name: 'Jan', price: 0.08 },
                    { name: 'Mar', price: 0.09 },
                    { name: 'Jun', price: 0.095 },
                    { name: 'Sep', price: 0.105 },
                    { name: 'Now', price: 0.12 }
                ],
                'max': [
                    { name: '2020', price: 0.002 },
                    { name: '2021', price: 0.6 },
                    { name: '2022', price: 0.15 },
                    { name: '2023', price: 0.1 },
                    { name: 'Now', price: 0.12 }
                ]
            }
        }
    ];

    // Filter cryptocurrencies based on search term and category
    const filteredCryptos = cryptocurrencies.filter(crypto => {
        const matchesSearch = crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             crypto.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = activeCategory === 'all' || crypto.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    useEffect(() => {
        const scrollInterval = setInterval(() => {
            if (scrollContainerRef.current) {
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
    }, [activeIndex, filteredCryptos.length]); // Adăugăm filteredCryptos.length la array-ul de dependențe

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
            <div className={styles.cryptoGrid}>
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
                            <Link to={`/crypto/${filteredCryptos[0].symbol}`} className={styles.tradeButton}>
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