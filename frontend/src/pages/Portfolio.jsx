import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../components/AuthContext';
import api from '../services/axios';
import marketstackApi from '../services/marketstackApi';
import styles from '../styles/Portfolio.module.css';

const Portfolio = () => {
  const { isAuthenticated } = useContext(AuthContext);

  const [portfolioData, setPortfolioData] = useState(null);
  const [portfolioHistory, setPortfolioHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stocksLoading, setStocksLoading] = useState(false);
  const [priceAlerts, setPriceAlerts] = useState([]);

  const [activeFilter, setActiveFilter] = useState('all');
  const [screenSize, setScreenSize] = useState('large');

  const fetchPortfolioData = async () => {
    try {
      if (isAuthenticated) {
        setLoading(true);
        
        // Get portfolio data, history, and price alerts in parallel
        const [portfolioResponse, historyResponse, colorMap, priceAlertsResponse] = await Promise.all([
          api.get('/api/portfolio'),
          api.get('/api/portfolio/history'),
          fetchStockColors(),
          api.get('/api/portfolio/price-alerts')
        ]);
  
        const data = portfolioResponse.data;
        const history = historyResponse.data;
        const alerts = priceAlertsResponse.data;
  
        // Update colors for assets
        if (data && data.assets && data.assets.length > 0) {
          data.assets = data.assets.map(asset => {
            const color = colorMap[asset.symbol] || 
                         asset.color || 
                         `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
            
            return {
              ...asset,
              color
            };
          });
        }
  
        setPortfolioData(data);
        setPortfolioHistory(history);
        setPriceAlerts(alerts);
  
        if (data && data.assets && data.assets.length > 0) {
          fetchCurrentStockPrices(data);
        }
      }
    } catch (err) {
      console.error('Error fetching portfolio data:', err);
      setError('Failed to load portfolio data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolioData();
  }, [isAuthenticated]);
  const fetchStockColors = async () => {
    try {
      const response = await api.get('/api/stocks');
      const stocks = response.data || [];
      
      // Creează un map de simboluri la culori
      const colorMap = {};
      stocks.forEach(stock => {
        if (stock.symbol && stock.color) {
          colorMap[stock.symbol] = stock.color;
        }
      });
      
      return colorMap;
    } catch (err) {
      console.error('Error fetching stock colors:', err);
      return {};
    }
  };

 // Funcția îmbunătățită pentru obținerea prețurilor curente ale acțiunilor
const fetchCurrentStockPrices = async (data) => {
  try {
    setStocksLoading(true);

    if (!data || !data.assets || data.assets.length === 0) {
      setStocksLoading(false);
      return;
    }

    const symbols = data.assets.map(asset => asset.symbol);
    let quotesMap = {};

    try {
      quotesMap = await marketstackApi.getMultipleStockQuotes(symbols);
    } catch (error) {
      console.error('Error fetching stock quotes:', error);
    }

    if (quotesMap) {
      const updatedAssets = data.assets.map(asset => {
        const quote = quotesMap[asset.symbol];
        const purchasePrice = parseFloat(asset.purchasePrice) || parseFloat(asset.price) || 0;

        let currentPrice = purchasePrice;

        if (quote && quote.price) {
          currentPrice = parseFloat(quote.price);
        }

        const quantity = parseFloat(asset.quantity) || 0;
        const changeValue = currentPrice - purchasePrice;
        const changePercent = purchasePrice > 0 ? (changeValue / purchasePrice) * 100 : 0;

        return {
          ...asset,
          price: currentPrice,
          purchasePrice: purchasePrice,
          quantity: quantity,
          value: currentPrice * quantity,
          changeValue: changeValue,
          changePercent: changePercent
        };
      });

      let totalValue = 0;
      let totalInvested = 0;

      updatedAssets.forEach(asset => {
        const price = parseFloat(asset.price) || 0;
        const quantity = parseFloat(asset.quantity) || 0;
        const purchasePrice = parseFloat(asset.purchasePrice) || price || 0;

        const currentValue = price * quantity;
        totalValue += currentValue;
        totalInvested += (purchasePrice * quantity);
      });

      const changeValue = totalInvested > 0 ? totalValue - totalInvested : 0;
      const overallChangePercent = totalInvested > 0 ? (changeValue / totalInvested) * 100 : 0;

      // Save the overall change as the performance baseline in case API call fails
      const baselinePerformance = {
        daily: overallChangePercent,
        weekly: overallChangePercent,
        monthly: overallChangePercent,
        yearly: overallChangePercent,
        overall: overallChangePercent
      };

      try {
        const performanceResponse = await api.post('/api/portfolio/calculate-performance', {
          currentTotalValue: totalValue,
          totalInvested: totalInvested,
          assets: updatedAssets.map(asset => ({
            symbol: asset.symbol,
            name: asset.name,
            price: parseFloat(asset.price) || 0,
            quantity: parseFloat(asset.quantity) || 0,
            value: parseFloat(asset.value) || 0,
            changePercent: parseFloat(asset.changePercent) || 0
          })),
          // Add this parameter to indicate we want to use available days even if less than 7
          useAvailableDays: true
        });

        if (performanceResponse && performanceResponse.data) {
          const { performance, currentTotalValue, totalInvested: updatedTotalInvested } = performanceResponse.data;

          // Adăugăm log pentru a verifica ce date primim de la API
          console.log('Performance received from API:', 
                     JSON.stringify(performance, null, 2), 
                     'totalValue:', currentTotalValue, 
                     'totalInvested:', updatedTotalInvested);

          // Update portfolio history with latest performance data
          if (performance && portfolioHistory) {
            // Ne asigurăm că folosim exact valorile primite, nu le modificăm
            setPortfolioHistory({
              ...portfolioHistory,
              performance: performance,
              currentTotalValue: currentTotalValue,
              totalInvested: updatedTotalInvested
            });
          }

          // Ne asigurăm că folosim exact valorile primite, nu le modificăm
          setPortfolioData({
            ...data,
            assets: updatedAssets,
            totalValue: currentTotalValue || totalValue,
            totalInvested: updatedTotalInvested || totalInvested,
            dailyChange: performance?.daily,
            performance: performance
          });
        } else {
          setPortfolioData({
            ...data,
            assets: updatedAssets,
            totalValue: totalValue,
            totalInvested: totalInvested,
            dailyChange: overallChangePercent,
            performance: baselinePerformance
          });
        }
      } catch (apiError) {
        console.error("Error calculating performance:", apiError);

        setPortfolioData({
          ...data,
          assets: updatedAssets,
          totalValue: totalValue,
          totalInvested: totalInvested,
          dailyChange: overallChangePercent,
          performance: baselinePerformance
        });
      }
    }
  } catch (err) {
    console.error("Error in fetchCurrentStockPrices:", err);
  } finally {
    setStocksLoading(false);
  }
};

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 400) {
        setScreenSize('xsmall');
      } else if (width < 576) {
        setScreenSize('small');
      } else if (width < 768) {
        setScreenSize('medium');
      } else {
        setScreenSize('large');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getVisibleColumns = () => {
    if (screenSize === 'xsmall') {
      return {
        showSymbol: true,
        showName: false,
        showPrice: true,
        showQuantity: false,
        showValue: false,
        showChange: true
      };
    } else if (screenSize === 'small') {
      return {
        showSymbol: true,
        showName: false,
        showPrice: true,
        showQuantity: false,
        showValue: true,
        showChange: true
      };
    } else if (screenSize === 'medium') {
      return {
        showSymbol: true,
        showName: true,
        showPrice: true,
        showQuantity: false,
        showValue: true,
        showChange: true
      };
    } else {
      return {
        showSymbol: true,
        showName: true,
        showPrice: true,
        showQuantity: true,
        showValue: true,
        showChange: true
      };
    }
  };

  const columns = getVisibleColumns();

  if (loading) {
    return (
      <div className={styles.dashboardContainer}>
        <div className={styles.container}>
          <div className={styles.loadingMessage}>Loading portfolio data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.dashboardContainer}>
        <div className={styles.container}>
          <div className={styles.errorMessage}>{error}</div>
        </div>
      </div>
    );
  }

  if (!portfolioData) {
    return (
      <div className={styles.dashboardContainer}>
        <div className={styles.container}>
          <div className={styles.emptyMessage}>No portfolio data available. Add assets to get started.</div>
        </div>
      </div>
    );
  }

  const hasAssets = portfolioData.assets && portfolioData.assets.length > 0;
  const hasTransactions = portfolioData.transactions && portfolioData.transactions.length > 0;
  const hasAlerts = portfolioData.alerts && portfolioData.alerts.length > 0;

  const PortfolioSummary = () => {
    if (!portfolioData) {
      return (
        <div className={styles.portfolioSummary}>
          <h1 className={styles.h1}>My Portfolio</h1>
          <div className={`${styles.flexBetween} ${styles.summaryContent}`}>
            <div>
              <p className={styles.textSecondary}>Loading portfolio data...</p>
            </div>
          </div>
        </div>
      );
    }

    const totalValue = portfolioData.totalValue || 0;
    const dailyChange = portfolioData.dailyChange || 0;

    return (
      <div className={styles.portfolioSummary}>
        <h1 className={styles.h1}>My Portfolio</h1>
        <div className={`${styles.flexBetween} ${styles.summaryContent}`}>
          <div>
            <p className={styles.textSecondary}>Total Value</p>
            <h2 className={styles.portfolioTotal}>${totalValue.toLocaleString()}</h2>
          </div>
          <div className={styles.textRight}>
            <p className={styles.textSecondary}>Daily Change</p>
            <p className={`${styles.portfolioChange} ${dailyChange >= 0 ? styles.textSuccess : styles.textDanger}`}>
              {dailyChange >= 0 ? '+' : ''}{dailyChange.toFixed(2)}%
            </p>
          </div>
        </div>
      </div>
    );
  };

// Versiune îmbunătățită a componentei AssetAllocation cu focus pe afișarea corectă a pie chart-ului

const AssetAllocation = () => {
  if (!hasAssets) {
    return (
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.h3}>Asset Allocation</h3>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.emptyMessage}>You don't have any assets in your portfolio.</div>
        </div>
      </div>
    );
  }

  const calculateAssetAllocations = () => {
    const totalValue = portfolioData.totalValue || 
      portfolioData.assets.reduce((sum, a) => {
        const price = parseFloat(a.price) || 0;
        const quantity = parseFloat(a.quantity) || 0;
        return sum + (price * quantity);
      }, 0);

    console.log('Total Value:', totalValue);

    if (totalValue === 0) {
      console.warn('Total value is 0, cannot calculate allocations.');
      return [];
    }

    const commonStockColors = {
      'AAPL': '#999900',
      'MSFT': '#00A800',
      'AMZN': '#FF9900',
      'GOOGL': '#4285F4',
      'META': '#1877F2',
      'TSLA': '#CC0000',
      'NFLX': '#E50914',
      'NVDA': '#76B900'
    };

    // Helper function to validate and fix hex colors
    const validateHexColor = (color) => {
      if (!color || !color.startsWith('#')) return false;
      const hex = color.replace('#', '');
      return /^[0-9A-Fa-f]{6}$/.test(hex); // Ensure it's a 6-character hex code
    };

    const fixHexColor = (color) => {
      if (!color || !color.startsWith('#')) return null;
      let hex = color.replace('#', '');
      // If the hex code is too short, pad it with zeros
      if (hex.length < 6) {
        hex = hex.padEnd(6, '0');
      }
      // If the hex code is too long, truncate it
      if (hex.length > 6) {
        hex = hex.substring(0, 6);
      }
      // Ensure the characters are valid hex
      if (!/^[0-9A-Fa-f]{6}$/.test(hex)) {
        return null; // Invalid hex, return null to fall back to default
      }
      return `#${hex}`;
    };

    const allocations = portfolioData.assets
      .map(asset => {
        const price = parseFloat(asset.price) || 0;
        const quantity = parseFloat(asset.quantity) || 0;
        const assetValue = price * quantity;
        const allocation = (assetValue / totalValue) * 100;

        if (isNaN(allocation)) {
          console.warn(`Invalid allocation for ${asset.symbol}:`, { price, quantity, assetValue });
          return null;
        }

        let color = asset.color;
        // Validate and fix the color
        if (!validateHexColor(color)) {
          // Try to fix the color
          const fixedColor = fixHexColor(color);
          if (fixedColor) {
            color = fixedColor;
          } else {
            // Fall back to commonStockColors or a random color
            color = commonStockColors[asset.symbol] || 
              `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
          }
        }

        return {
          ...asset,
          allocation,
          color
        };
      })
      .filter(asset => asset && asset.allocation > 0)
      .sort((a, b) => b.allocation - a.allocation);

    console.log('Assets with Allocation:', allocations);
    return allocations;
  };

  const assetsWithAllocation = calculateAssetAllocations();

  const generateConicGradient = () => {
    if (assetsWithAllocation.length === 0) {
      console.warn('No assets with allocation, using fallback background.');
      return '#e0e0e0'; // Use a visible fallback color
    }

    let currentDegree = 0;
    const gradientParts = [];

    assetsWithAllocation.forEach(asset => {
      const startDegree = currentDegree;
      const endDegree = currentDegree + (asset.allocation * 3.6);
      gradientParts.push(`${asset.color} ${startDegree}deg ${endDegree}deg`);
      currentDegree = endDegree;
    });

    const gradient = `conic-gradient(${gradientParts.join(', ')})`;
    console.log('Generated Conic Gradient:', gradient);
    return gradient;
  };

  if (assetsWithAllocation.length === 0) {
    return (
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.h3}>Asset Allocation</h3>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.emptyMessage}>No valid asset allocations to display.</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.h3}>Asset Allocation</h3>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.allocationChart}>
          <div className={styles.pieChartContainer}>
            <div
              style={{
                width: '160px',
                height: '160px',
                borderRadius: '50%',
                background: generateConicGradient(),
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                border: 'none'
              }}
            />
          </div>
          <div className={styles.legend}>
            {assetsWithAllocation.map((asset, index) => (
              <div key={index} className={styles.legendItem}>
                <div className={styles.flexCenter}>
                  <div 
                    className={styles.colorIndicator} 
                    style={{ backgroundColor: asset.color }}
                  ></div>
                  <span>{asset.symbol}</span>
                </div>
                <span>{asset.allocation.toFixed(1)}%</span>
              </div>
            ))}
            {screenSize !== 'xsmall' && portfolioData.otherAssets && portfolioData.otherAssets.length > 0 &&
              portfolioData.otherAssets.map((asset, index) => (
                <div key={`other-${index}`} className={styles.legendItem}>
                  <div className={styles.flexCenter}>
                    <div className={styles.colorIndicator} style={{ backgroundColor: asset.color }}></div>
                    <span>{asset.symbol}</span>
                  </div>
                  <span>{asset.allocation.toFixed(1)}%</span>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
};

const Performance = () => {
  if (!portfolioHistory || !portfolioHistory.performance) {
    // Folosește datele de performanță din portfolioData dacă istoricul nu este disponibil
    if (portfolioData && portfolioData.performance) {
      const performance = portfolioData.performance;
      
      // Am eliminat console.log-ul pentru debugging
      
      // Verificăm explicit fiecare perioadă pentru a ne asigura că folosim valoarea corectă
      const performancePeriods = [
        { label: 'Today', value: performance.daily !== undefined ? performance.daily : 0 },
        { label: 'This Week', value: performance.weekly !== undefined ? performance.weekly : 0 },
        { label: 'This Month', value: performance.monthly !== undefined ? performance.monthly : 0 },
        { label: 'This Year', value: performance.yearly !== undefined ? performance.yearly : 0 },
        { label: 'Overall', value: performance.overall !== undefined ? performance.overall : 0 }
      ];

      const formatPercentage = (value) => {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) return 'N/A';
        const isPositive = numValue >= 0;
        return `${isPositive ? '+' : ''}${numValue.toFixed(2)}%`;
      };

      return (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.h3}>Portfolio Performance</h3>
          </div>
          <div className={styles.cardBody}>
            {performancePeriods.map((period, index) => {
              const value = parseFloat(period.value);
              const isPositive = value >= 0;
              const formattedValue = formatPercentage(period.value);

              return (
                <div key={index} className={styles.progressContainer}>
                  <div className={styles.progressLabel}>
                    <span>{period.label}</span>
                    <span className={isPositive ? styles.textSuccess : styles.textDanger}>
                      {formattedValue}
                    </span>
                  </div>
                  <div className={styles.progressBar}>
                    <div
                      className={`${styles.progressFill} ${isPositive ? styles.progressFillSuccess : styles.progressFillDanger}`}
                      style={{ width: `${Math.min(Math.abs(value) * 2, 100)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    
    return (
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.h3}>Portfolio Performance</h3>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.emptyMessage}>No performance data available.</div>
        </div>
      </div>
    );
  }

  // Folosește datele de performanță din istoricul portofoliului
  const performance = portfolioHistory.performance || {};
  
  // Am eliminat console.log-ul pentru debugging
  
  // Verificăm explicit fiecare perioadă pentru a ne asigura că folosim valoarea corectă
  const performancePeriods = [
    { label: 'Today', value: performance.daily !== undefined ? performance.daily : 0 },
    { label: 'This Week', value: performance.weekly !== undefined ? performance.weekly : 0 },
    { label: 'This Month', value: performance.monthly !== undefined ? performance.monthly : 0 },
    { label: 'This Year', value: performance.yearly !== undefined ? performance.yearly : 0 },
    { label: 'Overall', value: performance.overall !== undefined ? performance.overall : 0 }
  ];

  const formatPercentage = (value) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return 'N/A';
    const isPositive = numValue >= 0;
    return `${isPositive ? '+' : ''}${numValue.toFixed(2)}%`;
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.h3}>Portfolio Performance</h3>
      </div>
      <div className={styles.cardBody}>
        {performancePeriods.map((period, index) => {
          const value = parseFloat(period.value);
          const isPositive = value >= 0;
          const formattedValue = formatPercentage(period.value);

          return (
            <div key={index} className={styles.progressContainer}>
              <div className={styles.progressLabel}>
                <span>{period.label}</span>
                <span className={isPositive ? styles.textSuccess : styles.textDanger}>
                  {formattedValue}
                </span>
              </div>
              <div className={styles.progressBar}>
                <div
                  className={`${styles.progressFill} ${isPositive ? styles.progressFillSuccess : styles.progressFillDanger}`}
                  style={{ width: `${Math.min(Math.abs(value) * 2, 100)}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

  const AssetList = () => {
    if (!hasAssets) {
      return (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.h3}>Assets</h3>
            <button
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={() => window.location.href = '/add-asset'}
            >
              Add Assets
            </button>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.emptyMessage}>You don&apos;t have any assets in your portfolio. Click &quot;Add Assets&quot; to get started.</div>
          </div>
        </div>
      );
    }

    return (
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.h3}>Assets</h3>
          <div className={styles.headerButtons}>
            {stocksLoading && <span className={styles.refreshingMessage}>Updating prices...</span>}
            <button
              className={`${styles.btn} ${styles.btnOutline} ${stocksLoading ? styles.btnDisabled : ''}`}
              onClick={() => fetchCurrentStockPrices(portfolioData)}
              disabled={stocksLoading}
            >
              Refresh Prices
            </button>
            <button
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={() => window.location.href = '/add-asset'}
            >
              Add Assets
            </button>
          </div>
        </div>

        <div className={`${styles.cardBody} ${styles.assetsTable}`}>
          <table className={styles.table}>
            <thead>
              <tr>
                {columns.showSymbol && <th className={styles.th}>Symbol</th>}
                {columns.showName && <th className={styles.th}>Name</th>}
                {columns.showPrice && <th className={`${styles.th} ${styles.textRight}`}>Price</th>}
                {columns.showQuantity && <th className={`${styles.th} ${styles.textRight}`}>Quantity</th>}
                {columns.showValue && <th className={`${styles.th} ${styles.textRight}`}>Value</th>}
                {columns.showChange && <th className={`${styles.th} ${styles.textRight}`}>Change</th>}
              </tr>
            </thead>
            <tbody>
              {portfolioData.assets.map((asset, index) => {
                const purchasePrice = asset.purchasePrice || asset.price || 0;
                const price = asset.price || 0;
                const quantity = asset.quantity || 0;
                const changePercent = asset.changePercent || 0;

                return (
                  <tr key={index}>
                    {columns.showSymbol && (
                      <td className={styles.td}>
                        <div className={styles.flexCenter}>
                          <div className={styles.assetIcon} style={{ backgroundColor: asset.color || '#cccccc' }}>
                            {(asset.symbol || '?').charAt(0)}
                          </div>
                          <span className={styles.assetSymbol}>{asset.symbol || 'Unknown'}</span>
                        </div>
                      </td>
                    )}
                    {columns.showName && <td className={styles.td}>{asset.name || 'Unknown'}</td>}
                    {columns.showPrice && (
                      <td className={`${styles.td} ${styles.textRight}`}>
                        ${typeof price === 'number' ? price.toLocaleString() : '0.00'}
                      </td>
                    )}
                    {columns.showQuantity && (
                      <td className={`${styles.td} ${styles.textRight}`}>
                        {quantity.toLocaleString()}
                      </td>
                    )}
                    {columns.showValue && (
                      <td className={`${styles.td} ${styles.textRight}`}>
                        ${typeof price === 'number' && typeof quantity === 'number'
                          ? (price * quantity).toLocaleString()
                          : '0.00'}
                      </td>
                    )}
                    {columns.showChange && (
                      <td className={`${styles.td} ${styles.textRight} ${changePercent >= 0 ? styles.textSuccess : styles.textDanger}`}>
                        {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const Transactions = () => {
    const txColumns = screenSize === 'xsmall' ?
      { date: true, type: true, symbol: true, quantity: false, price: false, total: true } :
      screenSize === 'small' ?
        { date: true, type: true, symbol: true, quantity: false, price: false, total: true } :
        { date: true, type: true, symbol: true, quantity: true, price: true, total: true };

    if (!hasTransactions) {
      return (
        <div className={`${styles.card} ${styles.transactionsCard}`}>
          <div className={styles.cardHeader}>
            <h3 className={styles.h3}>Recent Transactions</h3>
            <div className={styles.filterButtons}>
              <button
                className={`${styles.btnFilter} ${activeFilter === 'all' ? styles.active : ''}`}
                onClick={() => setActiveFilter('all')}
              >
                All
              </button>
              <button
                className={`${styles.btnFilter} ${activeFilter === 'buy' ? styles.active : ''}`}
                onClick={() => setActiveFilter('buy')}
              >
                Buys
              </button>
              <button
                className={`${styles.btnFilter} ${activeFilter === 'sell' ? styles.active : ''}`}
                onClick={() => setActiveFilter('sell')}
              >
                Sells
              </button>
            </div>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.emptyMessage}>No recent transactions.</div>
          </div>
        </div>
      );
    }

    const formattedTransactions = portfolioData.transactions.map(tx => {
      const txDate = new Date(tx.date);
      const formattedDate = txDate.toISOString().split('T')[0];
      const type = tx.type === 'Buy' ? 'Buy' : 'Sell';

      return {
        id: tx._id,
        date: formattedDate,
        type: type,
        symbol: tx.symbol,
        quantity: tx.quantity,
        price: tx.price,
        total: tx.price * tx.quantity
      };
    });

    return (
      <div className={`${styles.card} ${styles.transactionsCard}`}>
        <div className={styles.cardHeader}>
          <h3 className={styles.h3}>Recent Transactions</h3>
          <div className={styles.filterButtons}>
            <button
              className={`${styles.btnFilter} ${activeFilter === 'all' ? styles.active : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              All
            </button>
            <button
              className={`${styles.btnFilter} ${activeFilter === 'buy' ? styles.active : ''}`}
              onClick={() => setActiveFilter('buy')}
            >
              Buys
            </button>
            <button
              className={`${styles.btnFilter} ${activeFilter === 'sell' ? styles.active : ''}`}
              onClick={() => setActiveFilter('sell')}
            >
              Sells
            </button>
          </div>
        </div>

        <div className={`${styles.cardBody} ${styles.transactionsTable}`}>
          <table className={styles.table}>
            <thead>
              <tr>
                {txColumns.date && <th className={styles.th}>Date</th>}
                {txColumns.type && <th className={styles.th}>Type</th>}
                {txColumns.symbol && <th className={styles.th}>Symbol</th>}
                {txColumns.quantity && <th className={`${styles.th} ${styles.textRight}`}>Quantity</th>}
                {txColumns.price && <th className={`${styles.th} ${styles.textRight}`}>Price</th>}
                {txColumns.total && <th className={`${styles.th} ${styles.textRight}`}>Total</th>}
              </tr>
            </thead>
            <tbody>
              {formattedTransactions
                .filter(transaction => {
                  if (activeFilter === 'all') return true;
                  return transaction.type.toLowerCase() === activeFilter;
                })
                .map((transaction) => (
                  <tr key={transaction.id}>
                    {txColumns.date && <td className={styles.td}>{transaction.date}</td>}
                    {txColumns.type && (
                      <td className={`${styles.td} ${transaction.type === 'Buy' ? styles.textSuccess : styles.textDanger}`}>
                        {transaction.type}
                      </td>
                    )}
                    {txColumns.symbol && <td className={styles.td}>{transaction.symbol}</td>}
                    {txColumns.quantity && <td className={`${styles.td} ${styles.textRight}`}>{transaction.quantity}</td>}
                    {txColumns.price && <td className={`${styles.td} ${styles.textRight}`}>${transaction.price}</td>}
                    {txColumns.total && <td className={`${styles.td} ${styles.textRight}`}>${transaction.total.toLocaleString()}</td>}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const TopPerformers = () => {
    if (!hasAssets) {
      return (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.h3}>Top Performers</h3>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.emptyMessage}>You don&apos;t have any assets in your portfolio.</div>
          </div>
        </div>
      );
    }
  
    // Modificare: filtrează toate activele cu procent pozitiv și sortează-le descrescător
    const positiveAssets = [...portfolioData.assets]
      .filter(asset => asset.changePercent > 0)  // Folosim > 0 în loc de >= 5 pentru a include toate activele pozitive
      .sort((a, b) => b.changePercent - a.changePercent);  // Sortează descrescător după procent
  
    if (positiveAssets.length === 0) {
      return (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.h3}>Top Performers</h3>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.emptyMessage}>No assets with positive gains in your portfolio.</div>
          </div>
        </div>
      );
    }
  
    return (
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.h3}>Top Performers</h3>
        </div>
        <div className={styles.cardBody}>
          {positiveAssets.map((asset, index) => (
            <div key={index} className={styles.topPerformer}>
              <div className={styles.flexBetween}>
                <div className={styles.flexCenter}>
                  <div className={styles.assetIcon} style={{ backgroundColor: asset.color }}>
                    {asset.symbol.charAt(0)}
                  </div>
                  <div>
                    <div>{asset.symbol}</div>
                    {screenSize !== 'xsmall' && <div className={styles.textSecondary}>{asset.name}</div>}
                  </div>
                </div>
                <div className={styles.textRight}>
                  <div>${asset.price.toLocaleString()}</div>
                  <div className={asset.changePercent >= 0 ? styles.textSuccess : styles.textDanger}>
                    {asset.changePercent >= 0 ? '+' : ''}{asset.changePercent.toFixed(2)}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const Alerts = () => {
    const activeAlerts = priceAlerts.filter(alert => alert.isActive);
    const allAlerts = [
      ...(portfolioData?.alerts || []),
      ...activeAlerts.map(alert => ({
        id: alert._id,
        message: `Price alert for ${alert.symbol}: ${alert.type === 'above' ? 'Above' : 'Below'} $${alert.price}`,
        type: 'info',
        time: 'Active',
        isPriceAlert: true
      }))
    ];

    if (allAlerts.length === 0) {
      return (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.h3}>Alerts</h3>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.emptyMessage}>You don't have any alerts.</div>
          </div>
        </div>
      );
    }

    const handleDeleteAlert = async (alertId, isPriceAlert) => {
      try {
        if (isPriceAlert) {
          // Delete price alert
          await api.delete(`/api/portfolio/price-alerts/${alertId}`);
          // Update both states
          setPriceAlerts(prev => prev.filter(a => a._id !== alertId));
          setPortfolioData(prev => ({
            ...prev,
            alerts: prev.alerts.filter(a => a.id !== alertId)
          }));
        } else {
          // Delete regular alert
          await api.put(`/api/portfolio/alerts/${alertId}`);
          setPortfolioData(prev => ({
            ...prev,
            alerts: prev.alerts.filter(a => a.id !== alertId)
          }));
        }
      } catch (err) {
        console.error('Error deleting alert:', err);
      }
    };

    return (
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.h3}>Alerts</h3>
        </div>
        <div className={styles.cardBody}>
          {allAlerts.map((alert, index) => (
            <div key={index} className={styles.alert}>
              <div className={`${styles.alertDot} ${alert.type === 'success' ? styles.alertDotSuccess : styles.alertDotDanger}`}></div>
              <div className={styles.alertContent}>
                <div className={styles.alertTitle}>{alert.message}</div>
                <div className={styles.alertTime}>{alert.time}</div>
                <button 
                  className={styles.deleteAlertButton}
                  onClick={() => handleDeleteAlert(alert.id, alert.isPriceAlert)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const QuickActions = () => (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.h3}>Quick Actions</h3>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.quickActions}>
          <button
            className={`${styles.btn} ${styles.btnAction}`}
            onClick={() => window.location.href = '/deposit'}
          >
            <span className={styles.actionIcon}>💰</span>
            <span>Deposit</span>
          </button>
          <button
            className={`${styles.btn} ${styles.btnAction}`}
            onClick={() => window.location.href = '/transfer'}
          >
            <span className={styles.actionIcon}>🔄</span>
            <span>Transfer</span>
          </button>
          <button
            className={`${styles.btn} ${styles.btnAction}`}
            onClick={() => window.location.href = '/analysis'}
          >
            <span className={styles.actionIcon}>📊</span>
            <span>Analysis</span>
          </button>
          <button
            className={`${styles.btn} ${styles.btnAction}`}
            onClick={() => window.location.href = '/change-password'}
          >
            <span className={styles.actionIcon}>🔑</span>
            <span>Change Password</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.container}>
        <div className={styles.dashboardGrid}>
          <div className={styles.mainColumn}>
            <PortfolioSummary />
            <AssetList />
            <Transactions />
          </div>

          <div className={styles.statsColumn}>
            <AssetAllocation />
            <Performance />
            <QuickActions />
          </div>

          <div className={styles.sideColumn}>
            <TopPerformers />
            <Alerts />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;