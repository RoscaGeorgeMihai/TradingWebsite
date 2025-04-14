import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../components/AuthContext';
import api from '../services/axios';
import styles from '../styles/Portfolio.module.css';

const Portfolio = () => {
  // Use only isAuthenticated from context
  const { isAuthenticated } = useContext(AuthContext);

  // State for portfolio data
  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [activeFilter, setActiveFilter] = useState('all');
  const [screenSize, setScreenSize] = useState('large');

  // Get portfolio data from backend
  useEffect(() => {
    const fetchPortfolioData = async () => {
      try {
        if (isAuthenticated) {
          const response = await api.get('/portfolio');
          setPortfolioData(response.data);
        }
      } catch (err) {
        console.error('Error details:', err);
        
        if (err.response) {
          // Server responded with status code outside of 2xx range
          console.error('Response status:', err.response.status);
          console.error('Response data:', err.response.data);
          setError(`Server error: ${err.response.status} - ${err.response.data.message || 'Unknown error'}`);
        } else if (err.request) {
          // Request was made but no response received
          console.error('No response received:', err.request);
          setError('No response from server. Please check your connection.');
        } else {
          // Something happened in setting up the request
          console.error('Request error:', err.message);
          setError(`Request error: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioData();
  }, [isAuthenticated]);

  // Screen size detection and display mode setting
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
    
    handleResize(); // Check on load
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Adapt displayed columns based on screen size
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
  
  // Display loading state
  if (loading) {
    return (
      <div className={styles.dashboardContainer}>
        <div className={styles.container}>
          <div className={styles.loadingMessage}>Loading portfolio data...</div>
        </div>
      </div>
    );
  }

  // Display error message if there are issues
  if (error) {
    return (
      <div className={styles.dashboardContainer}>
        <div className={styles.container}>
          <div className={styles.errorMessage}>{error}</div>
        </div>
      </div>
    );
  }

  // If no data is available
  if (!portfolioData) {
    return (
      <div className={styles.dashboardContainer}>
        <div className={styles.container}>
          <div className={styles.emptyMessage}>No portfolio data available. Add assets to get started.</div>
        </div>
      </div>
    );
  }

  // Check if there are assets or if it's an empty portfolio
  const hasAssets = portfolioData.assets && portfolioData.assets.length > 0;
  const hasTransactions = portfolioData.transactions && portfolioData.transactions.length > 0;
  const hasAlerts = portfolioData.alerts && portfolioData.alerts.length > 0;
  
  // Component for portfolio summary
  const PortfolioSummary = () => (
    <div className={styles.portfolioSummary}>
      <h1 className={styles.h1}>My Portfolio</h1>
      <div className={`${styles.flexBetween} ${styles.summaryContent}`}>
        <div>
          <p className={styles.textSecondary}>Total Value</p>
          <h2 className={styles.portfolioTotal}>${portfolioData.totalValue.toLocaleString()}</h2>
        </div>
        <div className={styles.textRight}>
          <p className={styles.textSecondary}>Daily Change</p>
          <p className={`${styles.portfolioChange} ${portfolioData.dailyChange >= 0 ? styles.textSuccess : styles.textDanger}`}>
            {portfolioData.dailyChange >= 0 ? '+' : ''}{portfolioData.dailyChange}%
          </p>
        </div>
      </div>
    </div>
  );

  // Component for asset allocation
  const AssetAllocation = () => {
    // If there are no assets, display a message
    if (!hasAssets) {
      return (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.h3}>Asset Allocation</h3>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.emptyMessage}>You don&apos;t have any assets in your portfolio.</div>
          </div>
        </div>
      );
    }
    
    // Calculate and format style for conic-gradient
    const pieChartStyle = () => {
      const gradientParts = portfolioData.assets.map((asset, index, array) => {
        const startPercent = array.slice(0, index).reduce((sum, a) => sum + a.allocation, 0);
        return `${asset.color} ${startPercent}% ${startPercent + asset.allocation}%`;
      }).join(', ');
      
      return {
        backgroundImage: `conic-gradient(${gradientParts})`,
        width: '160px',
        height: '160px',
        borderRadius: '50%'
      };
    };
  
    return (
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.h3}>Asset Allocation</h3>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.allocationChart}>
            <div className={styles.pieChartContainer}>
              <div 
                className={styles.pieChart}
                style={pieChartStyle()}
              />
            </div>
            <div className={styles.legend}>
              {portfolioData.assets.map((asset, index) => (
                <div key={index} className={styles.legendItem}>
                  <div className={styles.flexCenter}>
                    <div className={styles.colorIndicator} style={{ backgroundColor: asset.color }}></div>
                    <span>{asset.symbol}</span>
                  </div>
                  <span>{asset.allocation}%</span>
                </div>
              ))}
              
              {screenSize !== 'xsmall' && portfolioData.otherAssets && portfolioData.otherAssets.length > 0 && 
                portfolioData.otherAssets.map((asset, index) => (
                  <div key={`other-${index}`} className={styles.legendItem}>
                    <div className={styles.flexCenter}>
                      <div className={styles.colorIndicator} style={{ backgroundColor: asset.color }}></div>
                      <span>{asset.symbol}</span>
                    </div>
                    <span>{asset.allocation}%</span>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Component for performance
  const Performance = () => {
    if (!portfolioData.performance || portfolioData.performance.length === 0) {
      return (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.h3}>Performance</h3>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.emptyMessage}>No performance data available.</div>
          </div>
        </div>
      );
    }
    
    return (
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.h3}>Performance</h3>
        </div>
        <div className={styles.cardBody}>
          {portfolioData.performance.map((period, index) => (
            <div key={index} className={styles.progressContainer}>
              <div className={styles.progressLabel}>
                <span>{period.label}</span>
                <span className={period.value >= 0 ? styles.textSuccess : styles.textDanger}>
                  {period.value >= 0 ? '+' : ''}{period.value}%
                </span>
              </div>
              <div className={styles.progressBar}>
                <div 
                  className={`${styles.progressFill} ${period.value >= 0 ? styles.progressFillSuccess : styles.progressFillDanger}`} 
                  style={{ width: `${Math.min(Math.abs(period.value) * 5, 100)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // AssetList modified to be fully responsive
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
          <button 
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={() => window.location.href = '/add-asset'}
          >
            Add Assets
          </button>
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
              {portfolioData.assets.map((asset, index) => (
                <tr key={index}>
                  {columns.showSymbol && (
                    <td className={styles.td}>
                      <div className={styles.flexCenter}>
                        <div className={styles.assetIcon} style={{ backgroundColor: asset.color }}>
                          {asset.symbol.charAt(0)}
                        </div>
                        <span className={styles.assetSymbol}>{asset.symbol}</span>
                      </div>
                    </td>
                  )}
                  {columns.showName && <td className={styles.td}>{asset.name}</td>}
                  {columns.showPrice && <td className={`${styles.td} ${styles.textRight}`}>${asset.price.toLocaleString()}</td>}
                  {columns.showQuantity && <td className={`${styles.td} ${styles.textRight}`}>{asset.quantity}</td>}
                  {columns.showValue && <td className={`${styles.td} ${styles.textRight}`}>${asset.value.toLocaleString()}</td>}
                  {columns.showChange && (
                    <td className={`${styles.td} ${styles.textRight} ${asset.changePercent >= 0 ? styles.textSuccess : styles.textDanger}`}>
                      {asset.changePercent >= 0 ? '+' : ''}{asset.changePercent}%
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Transactions modified to be fully responsive
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
              {portfolioData.transactions
                .filter(transaction => {
                  if (activeFilter === 'all') return true;
                  if (activeFilter === 'buy') return transaction.type === 'Buy';
                  if (activeFilter === 'sell') return transaction.type === 'Sell';
                  return true;
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

  // Component for Top Performers
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
    
    // Sort assets by percentage performance
    const topAssets = [...portfolioData.assets]
      .sort((a, b) => b.changePercent - a.changePercent)
      .slice(0, 3);
      
    if (topAssets.length === 0) {
      return (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.h3}>Top Performers</h3>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.emptyMessage}>Not enough data available.</div>
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
          {topAssets.map((asset, index) => (
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
                    {asset.changePercent >= 0 ? '+' : ''}{asset.changePercent}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Component for Alerts
  const Alerts = () => {
    if (!hasAlerts) {
      return (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.h3}>Alerts</h3>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.emptyMessage}>You don&apos;t have any new alerts.</div>
          </div>
        </div>
      );
    }
    
    return (
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.h3}>Alerts</h3>
        </div>
        <div className={styles.cardBody}>
          {portfolioData.alerts.map((alert, index) => (
            <div key={index} className={styles.alert}>
              <div className={`${styles.alertDot} ${alert.type === 'success' ? styles.alertDotSuccess : styles.alertDotDanger}`}></div>
              <div className={styles.alertContent}>
                <div className={styles.alertTitle}>{alert.message}</div>
                <div className={styles.alertTime}>{alert.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Component for Quick Actions
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
  
  // Main dashboard structure
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