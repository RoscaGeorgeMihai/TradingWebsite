import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from "../styles/Commodities.module.css";

const Commodities = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Categories for commodity types
  const categories = [
    { id: 'all', name: 'All Commodities' },
    { id: 'agriculture', name: 'Agriculture' },
    { id: 'metals', name: 'Base Metals' },
    { id: 'energy', name: 'Energy' },
    { id: 'precious', name: 'Precious Metals' }
  ];

  // Featured commodities data
  const featuredCommodities = [
    { 
      symbol: 'GOLD', 
      name: 'Gold', 
      price: '2,315.75', 
      change: '+1.42%', 
      isPositive: true, 
      color: '#D4AF37',
      category: 'precious',
      marketCap: 'N/A',
      volume: '$186.4B',
      unit: 'per oz',
      description: 'Gold is a precious metal that has been used throughout history as a store of value and medium of exchange.',
      topProducers: ['China', 'Australia', 'Russia', 'United States', 'Canada']
    },
    { 
      symbol: 'OIL', 
      name: 'Crude Oil (WTI)', 
      price: '78.42', 
      change: '-1.70%', 
      isPositive: false, 
      color: '#264040',
      category: 'energy',
      marketCap: 'N/A',
      volume: '$95.8B',
      unit: 'per barrel',
      description: 'Crude oil is a fossil fuel formed from ancient organic matter and is refined to make products such as gasoline and plastics.',
      topProducers: ['United States', 'Saudi Arabia', 'Russia', 'Canada', 'Iraq']
    },
    { 
      symbol: 'SILVER', 
      name: 'Silver', 
      price: '28.65', 
      change: '+3.06%', 
      isPositive: true, 
      color: '#C0C0C0',
      category: 'precious',
      marketCap: 'N/A',
      volume: '$48.2B',
      unit: 'per oz',
      description: 'Silver is a precious metal with high electrical conductivity, used in jewelry, electronics, and photography.',
      topProducers: ['Mexico', 'Peru', 'China', 'Australia', 'Russia']
    },
    { 
      symbol: 'CORN', 
      name: 'Corn', 
      price: '5.28', 
      change: '+2.72%', 
      isPositive: true, 
      color: '#FFDD00',
      category: 'agriculture',
      marketCap: 'N/A',
      volume: '$23.5B',
      unit: 'per bushel',
      description: 'Corn is one of the world\'s most important cereal crops, used for food, feed, and biofuel production.',
      topProducers: ['United States', 'China', 'Brazil', 'Argentina', 'Ukraine']
    },
    { 
      symbol: 'NG', 
      name: 'Natural Gas', 
      price: '2.45', 
      change: '-4.30%', 
      isPositive: false, 
      color: '#71A6D2',
      category: 'energy',
      marketCap: 'N/A',
      volume: '$42.1B',
      unit: 'per MMBtu',
      description: 'Natural gas is a fossil fuel used for electricity generation, heating, and industrial processes.',
      topProducers: ['United States', 'Russia', 'Iran', 'Qatar', 'China']
    },
    { 
      symbol: 'COPPER', 
      name: 'Copper', 
      price: '4.52', 
      change: '+0.85%', 
      isPositive: true, 
      color: '#B87333',
      category: 'metals',
      marketCap: 'N/A',
      volume: '$35.6B',
      unit: 'per lb',
      description: 'Copper is a base metal with high electrical conductivity, essential for electrical equipment and construction.',
      topProducers: ['Chile', 'Peru', 'China', 'Congo', 'United States']
    },
    { 
      symbol: 'WHEAT', 
      name: 'Wheat', 
      price: '6.15', 
      change: '+1.15%', 
      isPositive: true, 
      color: '#E5D68E',
      category: 'agriculture',
      marketCap: 'N/A',
      volume: '$18.3B',
      unit: 'per bushel',
      description: 'Wheat is a globally important cereal grain used primarily for human consumption.',
      topProducers: ['China', 'India', 'Russia', 'United States', 'France']
    },
    { 
      symbol: 'ALUM', 
      name: 'Aluminum', 
      price: '2.78', 
      change: '+2.20%', 
      isPositive: true, 
      color: '#848789',
      category: 'metals',
      marketCap: 'N/A',
      volume: '$28.7B',
      unit: 'per lb',
      description: 'Aluminum is a lightweight metal used in transportation, packaging, and construction.',
      topProducers: ['China', 'India', 'Russia', 'Canada', 'United Arab Emirates']
    }
  ];

  // Filter commodities based on active category and search term
  const filteredCommodities = featuredCommodities.filter(commodity => {
    const matchesSearch = commodity.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         commodity.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || commodity.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Commodities Market</h1>
        <p className={styles.pageSubtitle}>Track real-time prices and trends across global commodity markets</p>
      </div>
      
      {/* Search and filters section */}
      <div className={styles.searchContainer}>
        <input 
          type="text" 
          className={styles.searchInput} 
          placeholder="Search commodities..." 
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
      </div>
      
      {/* Featured commodity - show first in filtered list */}
      {filteredCommodities.length > 0 && (
        <div className={styles.featuredCommodity}>
          <div className={styles.featuredContent}>
            <div className={styles.featuredHeader}>
              <div 
                className={styles.commodityIcon} 
                style={{ backgroundColor: filteredCommodities[0].color }}
              >
                {filteredCommodities[0].symbol[0]}
              </div>
              <div className={styles.commodityInfo}>
                <h2>{filteredCommodities[0].name} <span className={styles.symbolLabel}>({filteredCommodities[0].symbol})</span></h2>
                <div className={styles.commodityMeta}>
                  <span>Trading Volume: {filteredCommodities[0].volume}</span>
                  <span>Unit: {filteredCommodities[0].unit}</span>
                </div>
              </div>
            </div>
            <div className={styles.priceInfo}>
              <div className={styles.currentPrice}>
                ${filteredCommodities[0].price}
              </div>
              <div className={`${styles.priceChange} ${filteredCommodities[0].isPositive ? styles.positive : styles.negative}`}>
                {filteredCommodities[0].change}
              </div>
            </div>
            <p className={styles.commodityDescription}>
              {filteredCommodities[0].description}
            </p>
            <div className={styles.topProducers}>
              <h3>Top Producers</h3>
              <div className={styles.producersList}>
                {filteredCommodities[0].topProducers.map((producer, index) => (
                  <span key={index} className={styles.producerTag}>
                    {producer}
                  </span>
                ))}
              </div>
            </div>
            <div className={styles.tradingButtons}>
              <Link to={`/commodities/${filteredCommodities[0].symbol}`} className={styles.buyButton}>
                Buy {filteredCommodities[0].symbol} 
              </Link>
              <Link to={`/commodities/${filteredCommodities[0].symbol}`} className={styles.sellButton}>
                Sell {filteredCommodities[0].symbol} 
              </Link>
            </div>
          </div>
        </div>
      )}
      
      {/* List of other commodities */}
      <div className={styles.commoditiesGrid}>
        {filteredCommodities.slice(1).map((commodity) => (
          <Link 
            to={`/commodities/${commodity.symbol}`}
            key={commodity.symbol} 
            className={styles.commodityCard}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div className={styles.commodityHeader}>
              <div 
                className={styles.commodityIcon} 
                style={{ backgroundColor: commodity.color }}
              >
                {commodity.symbol[0]}
              </div>
              <div className={styles.commodityDetails}>
                <div className={styles.commodityName}>{commodity.name}</div>
                <div className={styles.commoditySymbol}>{commodity.symbol}</div>
              </div>
              <div className={styles.commodityPriceInfo}>
                <div className={styles.commodityPrice}>${commodity.price}</div>
                <div className={`${styles.commodityPriceChange} ${commodity.isPositive ? styles.positive : styles.negative}`}>
                  {commodity.change}
                </div>
              </div>
            </div>
            <div className={styles.commodityFooter}>
              <div className={styles.commodityStats}>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Volume</span>
                  <span className={styles.statValue}>{commodity.volume}</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Unit</span>
                  <span className={styles.statValue}>{commodity.unit}</span>
                </div>
              </div>
              <div className={styles.viewDetailsTag}>
                View Details
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {/* Show message if no commodities match filter */}
      {filteredCommodities.length === 0 && (
        <div className={styles.noResults}>
          <p>No commodities found matching your criteria. Try adjusting your search or filters.</p>
        </div>
      )}
      
      {/* Market overview section */}
      <div className={styles.newsletterContainer}>
        <div className={styles.newsletterContent}>
          <h2>Stay Informed on Commodity Markets</h2>
          <p>Subscribe to our newsletter for daily market insights, price analysis, and trading opportunities.</p>
          <div className={styles.subscribeForm}>
            <input type="email" placeholder="Your email address" className={styles.emailInput} />
            <button className={styles.subscribeBtn}>Subscribe</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Commodities;