import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import marketstackApi from '../services/marketstackApi';
import { AuthContext } from '../components/AuthContext'; // Import AuthContext
import styles from '../styles/BuyStock.module.css';
import api from '../services/axios';

const BuyStock = () => {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext); // Get user from AuthContext
  const [stock, setStock] = useState(null);
  const [quantity, setQuantity] = useState('1.00');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  // New state for input mode (quantity or dollar amount)
  const [isDollarMode, setIsDollarMode] = useState(false);
  // State for dollar amount input
  const [dollarAmount, setDollarAmount] = useState('100.00');

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const data = await marketstackApi.getStockQuote(symbol);
        setStock(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch stock data');
        setLoading(false);
      }
    };

    fetchStockData();
  }, [symbol]);

  // Modified to handle decimal inputs starting with 0
  const handleQuantityChange = (e) => {
    const value = e.target.value;
    // Allow empty string, any number of digits, optional decimal part
    if (
      value === '' || 
      /^[0-9]+(\.[0-9]*)?$/.test(value) || 
      value === '0.' ||
      value === '.'
    ) {
      setQuantity(value);
    }
  };

  // Handler for dollar amount input
  const handleDollarAmountChange = (e) => {
    const value = e.target.value;
    // Same pattern as quantity, but for dollar amount
    if (
      value === '' || 
      /^[0-9]+(\.[0-9]*)?$/.test(value) || 
      value === '0.' ||
      value === '.'
    ) {
      setDollarAmount(value);
    }
  };

  // Toggle between quantity and dollar amount modes
  const toggleInputMode = () => {
    setIsDollarMode(!isDollarMode);
    
    // When switching modes, calculate the equivalent value
    if (stock) {
      if (!isDollarMode) {
        // Switching to dollar mode - calculate dollar amount from quantity
        const amount = (stock.price * (parseFloat(quantity) || 0)).toFixed(2);
        setDollarAmount(amount);
      } else {
        // Switching to quantity mode - calculate quantity from dollar amount
        const calculatedQuantity = ((parseFloat(dollarAmount) || 0) / stock.price).toFixed(2);
        setQuantity(calculatedQuantity);
      }
    }
  };

  const handlePurchase = async () => {
    try {
      setLoading(true);
      
      // Calculate values based on current mode
      let totalCost = 0;
      let calculatedShares = 0;
      
      if (isDollarMode) {
        totalCost = parseFloat(dollarAmount) || 0;
        calculatedShares = (totalCost / stock.price).toFixed(4);
      } else {
        calculatedShares = parseFloat(quantity) || 0;
        totalCost = stock.price * calculatedShares;
      }

      // Check if user has enough funds
      if (!user || user.availableFunds < totalCost) {
        setError('Insufficient funds for this purchase');
        setLoading(false);
        return;
      }

      const purchaseData = {
        symbol: stock.symbol,
        quantity: isDollarMode ? calculatedShares : parseFloat(quantity),
        price: stock.price,
        totalCost: totalCost
      };

      console.log('Making purchase with data:', purchaseData);
      console.log('User available funds:', user.availableFunds);

      // Make API call to process the purchase
      const response = await api.post('/api/portfolio/buy', purchaseData);

      // Update local user data with new funds
      if (user) {
        user.availableFunds = response.data.availableFunds;
        user.investedAmount = response.data.investedAmount;
      }

      setPurchaseSuccess(true);
      setTimeout(() => {
        navigate('/portfolio');
      }, 2000);
    } catch (err) {
      console.error('Purchase error:', err);
      setError(err.response?.data?.message || 'Failed to process purchase');
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
  let totalCost = 0;
  let calculatedShares = 0;
  
  if (isDollarMode) {
    totalCost = parseFloat(dollarAmount) || 0;
    calculatedShares = (totalCost / stock.price).toFixed(4);
  } else {
    calculatedShares = parseFloat(quantity) || 0;
    totalCost = stock.price * calculatedShares;
  }

  // Check if user has enough funds for purchase
  const hasEnoughFunds = user && user.availableFunds >= totalCost;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={handleBack}>
          ← Back
        </button>
        <h1>Buy {stock.symbol}</h1>
        
        {/* Display available funds */}
        {user && (
          <div className={styles.availableFunds}>
            <span className={styles.fundsLabel}>Available Funds:</span>
            <span className={styles.fundsValue}>${user.availableFunds?.toFixed(2) || '0.00'}</span>
          </div>
        )}
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
            <span className={styles.label}>Total Cost</span>
            <span className={styles.value}>${Number(totalCost).toFixed(2)}</span>
          </div>

          {/* Show warning if not enough funds */}
          {!hasEnoughFunds && totalCost > 0 && (
            <div className={styles.warningMessage}>
              Insufficient funds for this purchase!
            </div>
          )}

          <button
            className={styles.purchaseButton}
            onClick={handlePurchase}
            disabled={
              purchaseSuccess || 
              !hasEnoughFunds ||
              (isDollarMode ? 
                !dollarAmount || parseFloat(dollarAmount) <= 0 : 
                !quantity || parseFloat(quantity) <= 0)
            }
          >
            {purchaseSuccess ? 'Processing...' : 'Confirm Purchase'}
          </button>

          {purchaseSuccess && (
            <div className={styles.successMessage}>
              Purchase successful! Redirecting to portfolio...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuyStock;