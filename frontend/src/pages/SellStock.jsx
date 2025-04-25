import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import marketstackApi from '../services/marketstackApi';
import { AuthContext } from '../components/AuthContext';
import styles from '../styles/BuyStock.module.css';
import api from '../services/axios';

const SellStock = () => {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [stock, setStock] = useState(null);
  const [quantity, setQuantity] = useState('1.00');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sellSuccess, setSellSuccess] = useState(false);
  const [isDollarMode, setIsDollarMode] = useState(false);
  const [dollarAmount, setDollarAmount] = useState('100.00');
  const [availableShares, setAvailableShares] = useState(0);

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        // Get current stock price
        const data = await marketstackApi.getStockQuote(symbol);
        setStock(data);

        // Get user's portfolio to check available shares
        const portfolioResponse = await api.get('/api/portfolio');
        const portfolioData = portfolioResponse.data;
        const asset = portfolioData.assets.find(a => a.symbol === symbol);
        
        if (asset) {
          setAvailableShares(asset.quantity);
        } else {
          setError('You do not own any shares of this stock');
        }

        setLoading(false);
      } catch (err) {
        setError('Failed to fetch stock data');
        setLoading(false);
      }
    };

    fetchStockData();
  }, [symbol]);

  const handleQuantityChange = (e) => {
    const value = e.target.value;
    if (
      value === '' || 
      /^[0-9]+(\.[0-9]*)?$/.test(value) || 
      value === '0.' ||
      value === '.'
    ) {
      setQuantity(value);
    }
  };

  const handleDollarAmountChange = (e) => {
    const value = e.target.value;
    if (
      value === '' || 
      /^[0-9]+(\.[0-9]*)?$/.test(value) || 
      value === '0.' ||
      value === '.'
    ) {
      setDollarAmount(value);
    }
  };

  const toggleInputMode = () => {
    setIsDollarMode(!isDollarMode);
    
    if (stock) {
      if (!isDollarMode) {
        const amount = (stock.price * (parseFloat(quantity) || 0)).toFixed(2);
        setDollarAmount(amount);
      } else {
        const calculatedQuantity = ((parseFloat(dollarAmount) || 0) / stock.price).toFixed(2);
        setQuantity(calculatedQuantity);
      }
    }
  };

  const handleSell = async () => {
    try {
      setLoading(true);
      
      let totalValue = 0;
      let calculatedShares = 0;
      
      if (isDollarMode) {
        totalValue = parseFloat(dollarAmount) || 0;
        calculatedShares = (totalValue / stock.price).toFixed(4);
      } else {
        calculatedShares = parseFloat(quantity) || 0;
        totalValue = stock.price * calculatedShares;
      }

      // Check if user has enough shares
      if (calculatedShares > availableShares) {
        setError('Not enough shares to sell');
        setLoading(false);
        return;
      }

      const sellData = {
        symbol: stock.symbol,
        quantity: isDollarMode ? calculatedShares : parseFloat(quantity),
        price: stock.price
      };

      // Make API call to process the sale
      const response = await api.post('/api/portfolio/sell', sellData);

      // Update local user data with new funds
      if (user) {
        user.availableFunds = response.data.availableFunds;
        user.investedAmount = response.data.investedAmount;
      }

      setSellSuccess(true);
      setTimeout(() => {
        navigate('/portfolio');
      }, 2000);
    } catch (err) {
      console.error('Sell error:', err);
      setError(err.response?.data?.message || 'Failed to process sale');
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner} />
        <p>Loading stock details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>{error}</h2>
        <button className={styles.btnRetry} onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  if (!stock) {
    return (
      <div className={styles.errorContainer}>
        <h2>Stock not found</h2>
      </div>
    );
  }

  // Calculate values based on current mode
  let totalValue = 0;
  let calculatedShares = 0;
  
  if (isDollarMode) {
    totalValue = parseFloat(dollarAmount) || 0;
    calculatedShares = (totalValue / stock.price).toFixed(4);
  } else {
    calculatedShares = parseFloat(quantity) || 0;
    totalValue = stock.price * calculatedShares;
  }

  // Check if user has enough shares for sale
  const hasEnoughShares = calculatedShares <= availableShares;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={handleBack}>
          ← Back
        </button>
        <h1>Sell {stock.symbol}</h1>
        
        {/* Display available shares */}
        <div className={styles.availableFunds}>
          <span className={styles.fundsLabel}>Available Shares:</span>
          <span className={styles.fundsValue}>{availableShares}</span>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.stockInfo}>
          <div className={styles.currentPrice}>
            <span className={styles.label}>Current Price</span>
            <span className={styles.value}>${stock.price.toFixed(2)}</span>
          </div>
          <div className={styles.change}>
            <span className={styles.label}>Change</span>
            <span className={`${styles.value} ${stock.change >= 0 ? styles.positive : styles.negative}`}>
              {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
            </span>
          </div>
        </div>

        <div className={styles.purchaseForm}>
          {/* Mode switch toggle */}
          <div className={styles.toggleContainer}>
            <span className={!isDollarMode ? styles.activeMode : ''}>Shares</span>
            <label className={styles.switch}>
              <input 
                type="checkbox" 
                checked={isDollarMode} 
                onChange={toggleInputMode} 
              />
              <span className={styles.slider}></span>
            </label>
            <span className={isDollarMode ? styles.activeMode : ''}>Dollars</span>
          </div>
          
          {/* Conditional input based on mode */}
          {isDollarMode ? (
            <div className={styles.inputGroup}>
              <label htmlFor="dollarAmount">Dollar Amount</label>
              <input
                type="text"
                id="dollarAmount"
                value={dollarAmount}
                onChange={handleDollarAmountChange}
                className={styles.quantityInput}
                inputMode="decimal"
                placeholder="0.00"
              />
              <div className={styles.calculatedShares}>
                <span className={styles.label}>Calculated Shares</span>
                <span className={styles.value}>{calculatedShares}</span>
              </div>
            </div>
          ) : (
            <div className={styles.inputGroup}>
              <label htmlFor="quantity">Quantity</label>
              <input
                type="text"
                id="quantity"
                value={quantity}
                onChange={handleQuantityChange}
                className={styles.quantityInput}
                inputMode="decimal"
                placeholder="0.00"
              />
            </div>
          )}

          <div className={styles.totalCost}>
            <span className={styles.label}>Total Value</span>
            <span className={styles.value}>${Number(totalValue).toFixed(2)}</span>
          </div>

          {/* Show warning if not enough shares */}
          {!hasEnoughShares && totalValue > 0 && (
            <div className={styles.warningMessage}>
              Not enough shares available for this sale!
            </div>
          )}

          <button
            className={styles.purchaseButton}
            onClick={handleSell}
            disabled={
              sellSuccess || 
              !hasEnoughShares ||
              (isDollarMode ? 
                !dollarAmount || parseFloat(dollarAmount) <= 0 : 
                !quantity || parseFloat(quantity) <= 0)
            }
          >
            {sellSuccess ? 'Processing...' : 'Confirm Sale'}
          </button>

          {sellSuccess && (
            <div className={styles.successMessage}>
              Sale successful! Redirecting to portfolio...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellStock; 