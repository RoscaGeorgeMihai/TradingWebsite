import React, { useState, useEffect, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import styles from "../styles/Crypto.module.css";

const Crypto = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [timeInterval, setTimeInterval] = useState('1d');
    const scrollContainerRef = useRef(null);

    const cryptocurrencies = [
        { 
            symbol: "BTC", 
            name: "Bitcoin", 
            price: "68,542.30", 
            change: "+2.45%", 
            color: "#f7931a",
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
        }
    ];

    useEffect(() => {
        const scrollInterval = setInterval(() => {
            if (scrollContainerRef.current) {
                const nextIndex = (activeIndex + 1) % cryptocurrencies.length;
                setActiveIndex(nextIndex);
                
                const scrollContainer = scrollContainerRef.current;
                const nextElement = scrollContainer.children[nextIndex];
                
                nextElement.scrollIntoView({ 
                    behavior: 'smooth', 
                    inline: 'center' 
                });
            }
        }, 5000);

        return () => clearInterval(scrollInterval);
    }, [activeIndex, cryptocurrencies.length]);

    const filteredCryptos = cryptocurrencies.filter(crypto => 
        crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crypto.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                <h1 className={styles.pageTitle}>Cryptocurrencies</h1>
                <div className={styles.searchFilter}>
                    <input 
                        type="text" 
                        className={styles.searchBox} 
                        placeholder="Search cryptocurrencies..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className={styles.filterButton}>Search</button>
                </div>
            </div>
            
            <div 
                ref={scrollContainerRef} 
                className={styles.cryptocurrenciesScrollContainer}
            >
                {filteredCryptos.map((crypto, index) => (
                    <div 
                        key={crypto.symbol} 
                        className={`${styles.cryptoScrollItem} ${index === activeIndex ? styles.activeCrypto : ''}`}
                    >
                        <div className={styles.cryptoMainInfo}>
                            <div className={styles.stockInfo}>
                                <div 
                                    className={styles.stockIcon} 
                                    style={{ backgroundColor: crypto.color }}
                                >
                                    {crypto.symbol[0]}
                                </div>
                                <div className={styles.stockDetails}>
                                    <div className={styles.stockSymbol}>{crypto.symbol}</div>
                                    <div className={styles.stockName}>{crypto.name}</div>
                                </div>
                            </div>
                            <div className={styles.stockPrice}>
                                <div className={styles.priceValue}>${crypto.price}</div>
                                <div className={`${styles.priceChange} ${crypto.change.startsWith('+') ? styles.positive : styles.negative}`}>
                                    {crypto.change}
                                </div>
                            </div>
                        </div>
                        
                        <div className={styles.timeIntervalSelector}>
                            {timeIntervalOptions.map(option => (
                                <button
                                    key={option.value}
                                    className={`${styles.timeIntervalButton} ${timeInterval === option.value ? styles.activeTimeInterval : ''}`}
                                    onClick={() => handleTimeIntervalChange(option.value)}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                        
                        <div className={styles.cryptoPriceChart}>
                            <ResponsiveContainer width="100%" height={200}>
                                <LineChart data={crypto.priceHistory[timeInterval]}>
                                    <XAxis dataKey="name" />
                                    <YAxis hide={true} />
                                    <Tooltip />
                                    <Line 
                                        type="monotone" 
                                        dataKey="price" 
                                        stroke={crypto.color} 
                                        strokeWidth={3}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className={styles.cryptoIndicators}>
                {filteredCryptos.map((crypto, index) => (
                    <div 
                        key={`indicator-${crypto.symbol}`}
                        className={`${styles.cryptoIndicatorDot} ${index === activeIndex ? styles.active : ''}`}
                        onClick={() => {
                            setActiveIndex(index);
                            if (scrollContainerRef.current) {
                                const scrollContainer = scrollContainerRef.current;
                                const element = scrollContainer.children[index];
                                element.scrollIntoView({ 
                                    behavior: 'smooth', 
                                    inline: 'center' 
                                });
                            }
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export default Crypto;