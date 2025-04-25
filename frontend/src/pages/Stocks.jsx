import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import styles from '../styles/Stocks.module.css'
import api from '../services/axios'

const Stocks = () => {
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [stocksData, setStocksData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const categories = [
    { id: 'all', name: 'All Stocks' },
    { id: 'Technology', name: 'Technology' },
    { id: 'Finance', name: 'Finance' },
    { id: 'Healthcare', name: 'Healthcare' },
    { id: 'Consumer', name: 'Consumer' },
    { id: 'Energy', name: 'Energy' },
    { id: 'Industrial', name: 'Industrial' },
    { id: 'Real Estate', name: 'Real Estate' },
    { id: 'Utilities', name: 'Utilities' },
    { id: 'Other', name: 'Other' },
  ]

  useEffect(() => {
    const fetchStocks = async () => {
      setLoading(true)
      try {
        const response = await api.get('/api/stocks')
        setStocksData(response.data || []) // Set to empty array if response.data is undefined
      } catch (err) {
        setError('Failed to fetch stocks. Please try again later.')
        console.error('Error fetching stocks:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStocks()
  }, [])

  const filteredStocks = stocksData?.filter((stock) => {
    const matchesSearch =
      stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory =
      activeCategory === 'all' || stock.category === activeCategory
    return matchesSearch && matchesCategory
  }) || []

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Stock Market</h1>
        <p className={styles.pageSubtitle}>
          Track stocks across global markets
        </p>
      </div>

      <div className={styles.searchContainer}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search stocks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className={styles.searchButton}>
          <span className={styles.searchIcon}>🔍</span>
        </button>
      </div>

      <div className={styles.filtersContainer}>
        <div className={styles.categoryFilters}>
          {categories.map((category) => (
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

      {loading && (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading stocks...</p>
        </div>
      )}

      {error && (
        <div className={styles.errorContainer}>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className={styles.stocksGrid}>
          {filteredStocks.map((stock) => (
            <Link
              to={`/stocks/${stock.symbol}`}
              key={stock.symbol}
              className={styles.stockCard}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div className={styles.stockHeader}>
                <div
                  className={styles.stockIcon}
                  style={{ backgroundColor: stock.color || '#0dcaf0' }}
                >
                  {stock.symbol[0]}
                </div>
                <div className={styles.stockDetails}>
                  <div className={styles.stockName}>{stock.name}</div>
                  <div className={styles.stockSymbol}>{stock.symbol}</div>
                </div>
              </div>
              <div className={styles.stockFooter}>
                <div className={styles.stockCategory}>{stock.category}</div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && !error && filteredStocks.length === 0 && (
        <div className={styles.noResults}>
          <p>No stocks found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}

export default Stocks