// AdminPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../components/AuthContext';
import api from '../services/axios';
import styles from '../styles/Admin.module.css';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Chart default options
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: 'rgba(255, 255, 255, 0.7)',
        font: {
          size: 12
        }
      }
    },
    tooltip: {
      backgroundColor: 'rgba(26, 38, 52, 0.9)',
      titleColor: '#0dcaf0',
      bodyColor: 'rgba(255, 255, 255, 0.7)',
      borderColor: 'rgba(13, 202, 240, 0.2)',
      borderWidth: 1
    }
  },
  scales: {
    x: {
      grid: {
        color: 'rgba(255, 255, 255, 0.1)'
      },
      ticks: {
        color: 'rgba(255, 255, 255, 0.7)'
      }
    },
    y: {
      grid: {
        color: 'rgba(255, 255, 255, 0.1)'
      },
      ticks: {
        color: 'rgba(255, 255, 255, 0.7)'
      }
    }
  }
};

const AdminPage = () => {
  // Current active page
  const [activePage, setActivePage] = useState('dashboard');
  
  // Use navigate hook for redirection
  const navigate = useNavigate();
  
  // Use authentication context
  const { isAuthenticated, isAdmin, logout } = useContext(AuthContext);
  
  // Mock user for demonstration
  const user = { name: "Admin User" };
  
  // Navigation between pages
  const handleNavigation = (pageId) => {
    if (pageId === 'logout') {
      // Use the logout function from AuthContext
      handleLogout();
      return;
    }
    if (pageId === 'back') {
      // Navigate back to the main page
      navigate('/');
      return;
    }
    setActivePage(pageId);
  };
  
  // Handle logout function similar to Navbar
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  
  // Funcție helper pentru formatarea valorilor în funcție de numărul de stocuri
  const formatValueBasedOnStocks = (value, stocksCount) => {
    if (value === 0) return "$0";
    
    // Dacă avem puține stocks (sub 5), afișăm valoarea fără scurtare
    if (stocksCount < 5) {
      return `$${value.toLocaleString()}`;
    }
    // Dacă avem între 5-10 stocks, afișăm în K
    else if (stocksCount >= 5 && stocksCount < 10) {
      return `$${(value / 1000).toFixed(2)}K`;
    }
    // Dacă avem peste 10 stocks, afișăm în M
    else {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
  };
  
  // Sidebar Component
  const AdminSidebar = () => {
    // Check if user is authenticated and has admin role
    useEffect(() => {
      console.log('AdminPage auth state:', { isAuthenticated, isAdmin });
      if (!isAuthenticated || !isAdmin) {
        // Redirect to login or show unauthorized message
        console.log('User is not authenticated or not an admin');
        navigate('/login');
      }
    }, [isAuthenticated, isAdmin]);
    
    // Sidebar menu items
    const menuItems = [
      { id: 'dashboard', name: 'Dashboard', icon: '📊' },
      { id: 'statistics', name: 'Statistics', icon: '📈' },
      { id: 'users', name: 'Users', icon: '👥' },
      { id: 'assets', name: 'Assets', icon: '💰' },
      { id: 'add-asset', name: 'Add Asset', icon: '➕' },
      { id: 'popular-stocks', name: 'Popular Stocks', icon: '⭐' },
    ];
    
    return (
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2>Admin Panel</h2>
        </div>
        <div className={styles.sidebarMenu}>
          {menuItems.map((item) => (
            <div 
              key={item.id}
              className={`${styles.sidebarItem} ${activePage === item.id ? styles.active : ''}`}
              onClick={() => handleNavigation(item.id)}
            >
              <span className={styles.sidebarIcon}>{item.icon}</span>
              <span className={styles.sidebarText}>{item.name}</span>
            </div>
          ))}
        </div>
        <div className={styles.sidebarFooter}>
          <div 
            className={styles.sidebarItem}
            onClick={() => handleNavigation('back')}
          >
            <span className={styles.sidebarIcon}>🏠</span>
            <span className={styles.sidebarText}>Back to Main</span>
          </div>
          <div 
            className={styles.sidebarItem}
            onClick={() => handleNavigation('logout')}
          >
            <span className={styles.sidebarIcon}>🚪</span>
            <span className={styles.sidebarText}>Logout</span>
          </div>
        </div>
      </div>
    );
  };
  
  // Header component
  const AdminHeader = () => {
    // Page title based on active page
    const getPageTitle = () => {
      switch(activePage) {
        case 'dashboard': return 'Admin Dashboard';
        case 'statistics': return 'Platform Statistics';
        case 'users': return 'User Management';
        case 'assets': return 'Asset Management';
        case 'add-asset': return 'Add New Assets';
        case 'popular-stocks': return 'Popular Stocks';
        default: return 'Admin Dashboard';
      }
    };
    
    return (
      <div className={styles.adminHeader}>
        <h1 className={styles.h1}>{getPageTitle()}</h1>
        <div className={styles.userInfo}>
          <div className={styles.userIcon}>
            <span>{user.name.charAt(0)}</span>
          </div>
          <div className={styles.userName}>{user.name}</div>
        </div>
      </div>
    );
  };
  
  // Dashboard content
  const DashboardContent = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [transactionsPerPage] = useState(10); // Numărul de tranzacții pe pagină
    
    useEffect(() => {
      const fetchData = async () => {
        try {
          console.log('Fetching dashboard data...');
          const response = await api.get('/api/admin/dashboard');
          console.log('Dashboard data received:', response.data);
          setDashboardData(response.data);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
          setError(error.response?.data?.message || 'Failed to load dashboard data');
          setLoading(false);
        }
      };
      
      fetchData();
    }, []);
    
    if (loading) {
      return (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingMessage}>Loading dashboard data...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className={styles.errorContainer}>
          <div className={styles.errorMessage}>
            <h3>Error Loading Dashboard</h3>
            <p>{error}</p>
            <button 
              className={styles.btn}
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    if (!dashboardData) {
      return (
        <div className={styles.errorContainer}>
          <div className={styles.errorMessage}>
            <h3>No Data Available</h3>
            <p>The dashboard data could not be loaded.</p>
            <button 
              className={styles.btn}
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </div>
      );
    }
    
    // Calculează tranzacțiile pentru pagina curentă
    const indexOfLastTransaction = currentPage * transactionsPerPage;
    const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
    const currentTransactions = dashboardData.recentActivity.slice(
      indexOfFirstTransaction, 
      indexOfLastTransaction
    );

    // Funcție pentru schimbarea paginii
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    
    return (
      <div className={styles.dashboardContent}>
        {/* Summary Cards */}
        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <div className={styles.summaryIconPrimary}>👥</div>
            <div className={styles.summaryContent}>
              <h2 className={styles.summaryValue}>{dashboardData.totalUsers}</h2>
              <p className={styles.summaryLabel}>Total Users</p>
            </div>
          </div>
          
          <div className={styles.summaryCard}>
            <div className={styles.summaryIconSuccess}>💰</div>
            <div className={styles.summaryContent}>
              <h2 className={styles.summaryValue}>
                {formatValueBasedOnStocks(dashboardData.totalDeposits, dashboardData.totalStocks)}
              </h2>
              <p className={styles.summaryLabel}>Total Deposits</p>
            </div>
          </div>
          
          <div className={styles.summaryCard}>
            <div className={styles.summaryIconWarning}>📊</div>
            <div className={styles.summaryContent}>
              <h2 className={styles.summaryValue}>{dashboardData.totalStocks}</h2>
              <p className={styles.summaryLabel}>Available Assets</p>
            </div>
          </div>
          
          <div className={styles.summaryCard}>
            <div className={styles.summaryIconInfo}>📱</div>
            <div className={styles.summaryContent}>
              <h2 className={styles.summaryValue}>{dashboardData.activeUsers}</h2>
              <p className={styles.summaryLabel}>Active Users</p>
            </div>
          </div>
        </div>
        
        {/* Today's Activity */}
        <div className={styles.dashboardGrid}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.h3}>Today&apos;s Activity</h3>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.progressContainer}>
                <div className={styles.progressLabel}>
                  <span>Deposits</span>
                  <span className={styles.textSuccess}>
                    {formatValueBasedOnStocks(dashboardData.todayDeposits, dashboardData.totalStocks)}
                  </span>
                </div>
                <div className={styles.progressBar}>
                  <div 
                    className={`${styles.progressFill} ${styles.progressFillSuccess}`} 
                    style={{ width: `${Math.min((dashboardData.todayDeposits / (dashboardData.todayDeposits + dashboardData.todayWithdrawals || 1)) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div className={styles.progressContainer}>
                <div className={styles.progressLabel}>
                  <span>Withdrawals</span>
                  <span className={styles.textDanger}>
                    {formatValueBasedOnStocks(dashboardData.todayWithdrawals, dashboardData.totalStocks)}
                  </span>
                </div>
                <div className={styles.progressBar}>
                  <div 
                    className={`${styles.progressFill} ${styles.progressFillDanger}`} 
                    style={{ width: `${Math.min((dashboardData.todayWithdrawals / (dashboardData.todayDeposits + dashboardData.todayWithdrawals || 1)) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.h3}>Alerts <span className={styles.badgeAlert}>{dashboardData.alertsCount}</span></h3>
            </div>
            <div className={styles.cardBody}>
              {dashboardData.alerts && dashboardData.alerts.length > 0 ? (
                dashboardData.alerts.map((alert, index) => (
                  <div key={index} className={styles.alert}>
                    <div className={`${styles.alertDot} ${styles[`alertDot${alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}`]}`}></div>
                    <div className={styles.alertContent}>
                      <div className={styles.alertTitle}>{alert.message}</div>
                      <div className={styles.alertTime}>Today</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.alert}>
                  <div className={`${styles.alertDot} ${styles.alertDotSuccess}`}></div>
                  <div className={styles.alertContent}>
                    <div className={styles.alertTitle}>No critical alerts</div>
                    <div className={styles.alertTime}>System is running normally</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Recent Activity with Pagination */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.h3}>Recent Activity</h3>
          </div>
          <div className={styles.cardBody}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>ID</th>
                  <th className={styles.th}>User</th>
                  <th className={styles.th}>Action</th>
                  <th className={`${styles.th} ${styles.textRight}`}>Amount</th>
                  <th className={styles.th}>Date</th>
                </tr>
              </thead>
              <tbody>
                {currentTransactions.map((activity) => (
                  <tr key={activity.id}>
                    <td className={styles.td}>{activity.id}</td>
                    <td className={styles.td}>{activity.user}</td>
                    <td className={styles.td}>{activity.action}</td>
                    <td className={`${styles.td} ${styles.textRight}`}>
                      {activity.amount !== null ? (
                        activity.action.includes('Deposit') || activity.action.includes('Buy') 
                          ? <span className={styles.textSuccess}>
                            {formatValueBasedOnStocks(activity.amount, dashboardData.totalStocks)}
                          </span>
                          : activity.action.includes('Withdrawal') || activity.action.includes('Sell')
                            ? <span className={styles.textDanger}>
                              {formatValueBasedOnStocks(activity.amount, dashboardData.totalStocks)}
                            </span>
                            : <span>{formatValueBasedOnStocks(activity.amount, dashboardData.totalStocks)}</span>
                      ) : <span>-</span>}
                    </td>
                    <td className={styles.td}>{activity.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Controalele pentru paginare */}
            <div className={styles.pagination}>
              <button 
                className={`${styles.paginationButton} ${currentPage === 1 ? styles.disabled : ''}`}
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              
              {/* Afișează numerele paginilor (maxim 5 pagini) */}
              <div className={styles.pageNumbers}>
                {Array.from({ length: Math.min(5, Math.ceil(dashboardData.recentActivity.length / transactionsPerPage)) }).map((_, index) => {
                  // Calculează corect numărul paginii pentru a afișa un interval centrat în jurul paginii curente
                  const totalPages = Math.ceil(dashboardData.recentActivity.length / transactionsPerPage);
                  let pageNum;
                  
                  if (totalPages <= 5) {
                    // Dacă sunt mai puțin de 5 pagini, afișăm toate
                    pageNum = index + 1;
                  } else if (currentPage <= 3) {
                    // Dacă suntem la început, afișăm primele 5 pagini
                    pageNum = index + 1;
                  } else if (currentPage >= totalPages - 2) {
                    // Dacă suntem la sfârșit, afișăm ultimele 5 pagini
                    pageNum = totalPages - 4 + index;
                  } else {
                    // Altfel, centrăm în jurul paginii curente
                    pageNum = currentPage - 2 + index;
                  }
                  
                  return (
                    <button 
                      key={pageNum}
                      className={`${styles.pageNumber} ${currentPage === pageNum ? styles.active : ''}`}
                      onClick={() => paginate(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button 
                className={`${styles.paginationButton} ${currentPage === Math.ceil(dashboardData.recentActivity.length / transactionsPerPage) ? styles.disabled : ''}`}
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === Math.ceil(dashboardData.recentActivity.length / transactionsPerPage)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className={styles.card}>
  <div className={styles.cardHeader}>
    <h3 className={styles.h3}>Quick Actions</h3>
  </div>
  <div className={styles.cardBody}>
    <div className={styles.quickActions}>
      <button 
        className={`${styles.btn} ${styles.btnAction}`}
        onClick={() => handleNavigation('add-asset')}
      >
        <span className={styles.actionIcon}>➕</span>
        <span>Add Asset</span>
      </button>
      <button 
        className={`${styles.btn} ${styles.btnAction}`}
        onClick={() => handleNavigation('statistics')}
      >
        <span className={styles.actionIcon}>📈</span>
        <span>Statistics</span>
      </button>
      <button 
        className={`${styles.btn} ${styles.btnAction}`}
        onClick={() => handleNavigation('users')}
      >
        <span className={styles.actionIcon}>👥</span>
        <span>Manage Users</span>
      </button>
      <button 
        className={`${styles.btn} ${styles.btnAction}`}
        onClick={() => handleNavigation('assets')}
      >
        <span className={styles.actionIcon}>💰</span>
        <span>Assets</span>
      </button>
    </div>
  </div>
</div>
      </div>
    );
  };
  
  // Statistics component
  const StatisticsContent = () => {
    const [statisticsData, setStatisticsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeRange, setTimeRange] = useState('yearly');
    const [portfolioDistribution, setPortfolioDistribution] = useState(null);

    useEffect(() => {
      const fetchData = async () => {
        try {
          setLoading(true);
          console.log('Fetching statistics data for timeRange:', timeRange);
          const [statsResponse, distributionResponse] = await Promise.all([
            api.get(`/api/admin/statistics?timeRange=${timeRange}`),
            api.get('/api/portfolio/distribution')
          ]);
          
          console.log('Statistics data received:', statsResponse.data);
          console.log('Portfolio distribution data received:', distributionResponse.data);
          
          setStatisticsData(statsResponse.data);
          setPortfolioDistribution(distributionResponse.data);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching data:', error);
          setError(error.response?.data?.message || error.message || 'Failed to load data');
          setLoading(false);
        }
      };

      fetchData();
    }, [timeRange]);

    if (loading) {
      return (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingMessage}>Loading statistics data...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className={styles.errorContainer}>
          <div className={styles.errorMessage}>
            <h3>Error Loading Statistics</h3>
            <p>{error}</p>
            <button 
              className={styles.btn}
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    if (!statisticsData || !statisticsData.userGrowth) {
      return (
        <div className={styles.errorContainer}>
          <div className={styles.errorMessage}>
            <h3>No Data Available</h3>
            <p>The statistics data could not be loaded or is incomplete.</p>
            <button 
              className={styles.btn}
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    // Format date for display based on timeRange
    const formatDate = (dateStr) => {
      if (!dateStr || dateStr === 'Invalid Date') {
        console.error('Invalid date string:', dateStr);
        return 'N/A';
      }
      
      try {
        const [year, month, day] = dateStr.split('-').map(s => parseInt(s, 10));
        
        if (isNaN(year)) {
          return 'N/A';
        }
        
        if (timeRange === 'yearly') {
          return year.toString();
        } else if (timeRange === 'monthly') {
          const date = new Date(year, month - 1, 1);
          return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short'
          });
        } else { // daily
          const date = new Date(year, month - 1, day);
          return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
        }
      } catch (error) {
        console.error('Error formatting date:', error, dateStr);
        return 'Error';
      }
    };

    // Check if we have valid data for each chart
    const hasUserData = statisticsData.userGrowth && statisticsData.userGrowth.length > 0;
    const hasDepositsData = statisticsData.depositsGrowth && statisticsData.depositsGrowth.length > 0;
    const hasTransactionData = statisticsData.transactionVolume && statisticsData.transactionVolume.length > 0;
    const hasPortfolioData = portfolioDistribution && portfolioDistribution.portfolioAssets && portfolioDistribution.portfolioAssets.length > 0;

    // Chart configurations
    const userGrowthConfig = {
      data: {
        labels: hasUserData ? statisticsData.userGrowth.map(item => formatDate(item.date)) : ['No Data'],
        datasets: [{
          label: 'User Growth',
          data: hasUserData ? statisticsData.userGrowth.map(item => item.count) : [0],
          borderColor: '#0dcaf0',
          backgroundColor: 'rgba(13, 202, 240, 0.1)',
          tension: 0.4,
          fill: true,
          pointRadius: 5,
          pointHoverRadius: 8
        }]
      },
      options: {
        ...chartOptions,
        plugins: {
          ...chartOptions.plugins,
          title: {
            display: true,
            text: timeRange === 'yearly' ? 'Total Users by Year' : 
                  timeRange === 'monthly' ? 'New Users by Month' : 'New Users by Day',
            color: '#0dcaf0',
            font: {
              size: 16,
              weight: 'bold'
            }
          },
          tooltip: {
            ...chartOptions.plugins.tooltip,
            callbacks: {
              label: function(context) {
                const label = context.dataset.label || '';
                const value = context.parsed.y;
                return `${label}: ${value} user${value !== 1 ? 's' : ''}`;
              }
            }
          }
        }
      }
    };

    const depositsGrowthConfig = {
      data: {
        labels: hasDepositsData ? statisticsData.depositsGrowth.map(item => formatDate(item.date)) : ['No Data'],
        datasets: [{
          label: 'Deposits',
          data: hasDepositsData ? statisticsData.depositsGrowth.map(item => item.total) : [0],
          backgroundColor: 'rgba(0, 200, 83, 0.2)',
          borderColor: '#00c853',
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 7
        }]
      },
      options: {
        ...chartOptions,
        plugins: {
          ...chartOptions.plugins,
          title: {
            display: true,
            text: timeRange === 'yearly' ? 'Deposits by Year' : 
                  timeRange === 'monthly' ? 'Deposits by Month' : 'Deposits by Day',
            color: '#00c853',
            font: {
              size: 16,
              weight: 'bold'
            }
          },
          tooltip: {
            ...chartOptions.plugins.tooltip,
            callbacks: {
              label: function(context) {
                const label = context.dataset.label || '';
                const value = context.parsed.y;
                return `${label}: $${value.toLocaleString()}`;
              }
            }
          }
        }
      }
    };

    const transactionVolumeConfig = {
      data: {
        labels: hasTransactionData ? statisticsData.transactionVolume.map(item => formatDate(item.date)) : ['No Data'],
        datasets: [{
          label: 'Transactions',
          data: hasTransactionData ? statisticsData.transactionVolume.map(item => item.count) : [0],
          backgroundColor: 'rgba(255, 193, 7, 0.2)',
          borderColor: '#ffc107',
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 7
        }]
      },
      options: {
        ...chartOptions,
        plugins: {
          ...chartOptions.plugins,
          title: {
            display: true,
            text: timeRange === 'yearly' ? 'Transactions by Year' : 
                  timeRange === 'monthly' ? 'Transactions by Month' : 'Transactions by Day',
            color: '#ffc107',
            font: {
              size: 16,
              weight: 'bold'
            }
          },
          tooltip: {
            ...chartOptions.plugins.tooltip,
            callbacks: {
              label: function(context) {
                const label = context.dataset.label || '';
                const value = context.parsed.y;
                return `${label}: ${value.toLocaleString()}`;
              }
            }
          }
        }
      }
    };

    const portfolioDistributionConfig = {
      data: {
        labels: hasPortfolioData ? portfolioDistribution.portfolioAssets.map(asset => asset.symbol) : ['No Data'],
        datasets: [{
          data: hasPortfolioData ? portfolioDistribution.portfolioAssets.map(asset => {
            const totalShares = portfolioDistribution.totalShares;
            return ((asset.totalShares / totalShares) * 100).toFixed(1);
          }) : [0],
          backgroundColor: hasPortfolioData ? portfolioDistribution.portfolioAssets.map(asset => 
            asset.color || `hsl(${Math.random() * 360}, 70%, 50%)`
          ) : ['#888888'],
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          hoverOffset: 4
        }]
      },
      options: {
        ...chartOptions,
        plugins: {
          ...chartOptions.plugins,
          title: {
            display: true,
            text: 'Share Distribution Across All Portfolios (%)',
            color: '#0dcaf0',
            font: {
              size: 16,
              weight: 'bold'
            }
          },
          tooltip: {
            ...chartOptions.plugins.tooltip,
            callbacks: {
              label: function(context) {
                if (!hasPortfolioData) return 'No data';
                
                const label = context.label || '';
                const percentage = context.raw || 0;
                const shares = portfolioDistribution.portfolioAssets.find(asset => asset.symbol === label)?.totalShares || 0;
                return `${label}: ${percentage}% (${shares.toLocaleString()} shares)`;
              }
            }
          }
        },
        maintainAspectRatio: false,
        responsive: true,
        cutout: '0%',
        radius: '90%'
      }
    };

    return (
      <div className={styles.statisticsContainer}>
        <div className={styles.filterButtons}>
          <button 
            className={`${styles.btnFilter} ${timeRange === 'yearly' ? styles.active : ''}`}
            onClick={() => setTimeRange('yearly')}
          >
            Year by Year
          </button>
          <button 
            className={`${styles.btnFilter} ${timeRange === 'monthly' ? styles.active : ''}`}
            onClick={() => setTimeRange('monthly')}
          >
            Month by Month
          </button>
          <button 
            className={`${styles.btnFilter} ${timeRange === 'daily' ? styles.active : ''}`}
            onClick={() => setTimeRange('daily')}
          >
            Day by Day
          </button>
        </div>

        <div className={styles.chartsGrid}>
          <div className={styles.chartCard}>
            <div style={{ height: '300px', backgroundColor: '#1a2634', padding: '20px', borderRadius: '8px' }}>
              <Line {...userGrowthConfig} />
            </div>
          </div>

          <div className={styles.chartCard}>
            <div style={{ height: '300px', backgroundColor: '#1a2634', padding: '20px', borderRadius: '8px' }}>
              <Bar {...depositsGrowthConfig} />
            </div>
          </div>

          <div className={styles.chartCard}>
            <div style={{ height: '300px', backgroundColor: '#1a2634', padding: '20px', borderRadius: '8px' }}>
              <Bar {...transactionVolumeConfig} />
            </div>
          </div>

          <div className={styles.chartCard}>
            <div style={{ height: '300px', backgroundColor: '#1a2634', padding: '20px', borderRadius: '8px' }}>
              <Pie data={portfolioDistributionConfig.data} options={portfolioDistributionConfig.options} />
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // AddAssetContent component
  const AddAssetContent = () => {
    const [formData, setFormData] = useState({
      symbol: '',
      name: '',
      category: '',
      color: '#0dcaf0',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const categories = ['Technology', 'Finance', 'Healthcare', 'Consumer', 'Energy', 'Industrial', 'Real Estate', 'Utilities', 'Other'];

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError('');
      setSuccess('');

      console.log('Submitting stock data:', formData);
      console.log('Current auth state:', { isAuthenticated, isAdmin });

      try {
        const response = await api.post('/api/stocks', formData);
        console.log('Stock creation response:', response);
        setSuccess('Stock added successfully!');
        setFormData({
          symbol: '',
          name: '',
          category: '',
          color: '#0dcaf0',
        });
      } catch (err) {
        console.error('Stock creation error:', err.response || err);
        setError(err.response?.data?.message || 'Failed to add stock');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className={styles.addAssetContainer}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.h3}>Add New Stock</h3>
          </div>
          <div className={styles.cardBody}>
            {error && <div className={styles.alertDanger}>{error}</div>}
            {success && <div className={styles.alertSuccess}>{success}</div>}
            
            <form className={styles.addAssetForm} onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="symbol">Symbol</label>
                <input
                  type="text"
                  id="symbol"
                  name="symbol"
                  value={formData.symbol}
                  onChange={handleChange}
                  required
                  placeholder="e.g., AAPL"
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="name">Company Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Apple Inc."
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className={styles.formSelect}
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="color">Color</label>
                <input
                  type="color"
                  id="color"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className={styles.formColorInput}
                />
              </div>

              <button 
                type="submit" 
                className={`${styles.btn} ${styles.btnPrimary}`}
                disabled={loading}
              >
                {loading ? 'Adding...' : 'Add Stock'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  };
  
  // UsersContent component
  const UsersContent = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(5);

    useEffect(() => {
      const fetchUsers = async () => {
        try {
          const response = await api.get('/api/admin/users');
          setUsers(response.data);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching users:', error);
          setError(error.response?.data?.message || 'Failed to load users');
          setLoading(false);
        }
      };

      fetchUsers();
    }, []);

    const handleStatusChange = async (userId, newStatus) => {
      try {
        await api.patch(`/api/admin/users/${userId}/status`, { status: newStatus });
        setUsers(users.map(user => 
          user._id === userId ? { ...user, status: newStatus } : user
        ));
      } catch (error) {
        console.error('Error updating user status:', error);
        setError(error.response?.data?.message || 'Failed to update user status');
      }
    };

    // Format currency values
    const formatCurrency = (value) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(value);
    };

    if (loading) {
      return (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingMessage}>Loading users...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className={styles.errorContainer}>
          <div className={styles.errorMessage}>
            <h3>Error Loading Users</h3>
            <p>{error}</p>
            <button 
              className={styles.btn}
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    // Calculate current users
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(users.length / usersPerPage);

    return (
      <div className={styles.usersContainer}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.h3}>User Management</h3>
          </div>
          <div className={styles.cardBody}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Name</th>
                  <th className={styles.th}>Email</th>
                  <th className={styles.th}>Role</th>
                  <th className={styles.th}>Status</th>
                  <th className={styles.th}>Total Balance</th>
                  <th className={styles.th}>Available Funds</th>
                  <th className={styles.th}>Invested Amount</th>
                  <th className={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map((user) => (
                  <tr key={user._id}>
                    <td className={styles.td}>{user.firstName} {user.lastName}</td>
                    <td className={styles.td}>{user.email}</td>
                    <td className={styles.td}>{user.role}</td>
                    <td className={styles.td}>
                      <span className={`${styles.badge} ${user.status === 'active' ? styles.badgeSuccess : styles.badgeDanger}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className={styles.td}>{formatCurrency(user.totalBalance)}</td>
                    <td className={styles.td}>{formatCurrency(user.availableFunds)}</td>
                    <td className={styles.td}>{formatCurrency(user.investedAmount)}</td>
                    <td className={styles.td}>
                      {user.status === 'active' ? (
                        <button
                          className={`${styles.btn} ${styles.btnDanger}`}
                          onClick={() => handleStatusChange(user._id, 'deactivate')}
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          className={`${styles.btn} ${styles.btnSuccess}`}
                          onClick={() => handleStatusChange(user._id, 'active')}
                        >
                          Activate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className={styles.pagination}>
              <button 
                className={`${styles.paginationButton} ${currentPage === 1 ? styles.disabled : ''}`}
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              
              <div className={styles.pageNumbers}>
                {Array.from({ length: Math.min(5, totalPages) }).map((_, index) => {
                  let pageNum;
                  
                  if (totalPages <= 5) {
                    pageNum = index + 1;
                  } else if (currentPage <= 3) {
                    pageNum = index + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + index;
                  } else {
                    pageNum = currentPage - 2 + index;
                  }
                  
                  return (
                    <button 
                      key={pageNum}
                      className={`${styles.pageNumber} ${currentPage === pageNum ? styles.active : ''}`}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button 
                className={`${styles.paginationButton} ${currentPage === totalPages ? styles.disabled : ''}`}
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // AssetsContent component
  const AssetsContent = () => {
    const [stocks, setStocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingStock, setEditingStock] = useState(null);
    const [editForm, setEditForm] = useState({
      symbol: '',
      name: '',
      category: '',
      color: '#0dcaf0'
    });

    useEffect(() => {
      fetchStocks();
    }, []);

    const fetchStocks = async () => {
      try {
        const response = await api.get('/api/stocks');
        setStocks(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching stocks:', error);
        setError(error.response?.data?.message || 'Failed to load stocks');
        setLoading(false);
      }
    };

    const handleEdit = (stock) => {
      setEditingStock(stock._id);
      setEditForm({
        symbol: stock.symbol,
        name: stock.name,
        category: stock.category,
        color: stock.color
      });
    };

    const handleCancelEdit = () => {
      setEditingStock(null);
      setEditForm({
        symbol: '',
        name: '',
        category: '',
        color: '#0dcaf0'
      });
    };

    const handleEditChange = (e) => {
      const { name, value } = e.target;
      setEditForm(prev => ({
        ...prev,
        [name]: value
      }));
    };

    const handleSaveEdit = async (stockId) => {
      try {
        const response = await api.put(`/api/stocks/${stockId}`, editForm);
        setStocks(stocks.map(stock => 
          stock._id === stockId ? response.data : stock
        ));
        setEditingStock(null);
      } catch (error) {
        console.error('Error updating stock:', error);
        setError(error.response?.data?.message || 'Failed to update stock');
      }
    };

    const handleDelete = async (stockId) => {
      if (window.confirm('Are you sure you want to delete this stock?')) {
        try {
          await api.delete(`/api/stocks/${stockId}`);
          setStocks(stocks.filter(stock => stock._id !== stockId));
        } catch (error) {
          console.error('Error deleting stock:', error);
          setError(error.response?.data?.message || 'Failed to delete stock');
        }
      }
    };

    if (loading) {
      return (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingMessage}>Loading stocks...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className={styles.errorContainer}>
          <div className={styles.errorMessage}>
            <h3>Error Loading Stocks</h3>
            <p>{error}</p>
            <button 
              className={styles.btn}
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className={styles.assetsContainer}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.h3}>Asset Management</h3>
          </div>
          <div className={styles.cardBody}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Symbol</th>
                  <th className={styles.th}>Name</th>
                  <th className={styles.th}>Category</th>
                  <th className={styles.th}>Color</th>
                  <th className={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {stocks.map((stock) => (
                  <tr key={stock._id}>
                    <td className={styles.td}>
                      {editingStock === stock._id ? (
                        <input
                          type="text"
                          name="symbol"
                          value={editForm.symbol}
                          onChange={handleEditChange}
                          className={styles.formInput}
                        />
                      ) : (
                        stock.symbol
                      )}
                    </td>
                    <td className={styles.td}>
                      {editingStock === stock._id ? (
                        <input
                          type="text"
                          name="name"
                          value={editForm.name}
                          onChange={handleEditChange}
                          className={styles.formInput}
                        />
                      ) : (
                        stock.name
                      )}
                    </td>
                    <td className={styles.td}>
                      {editingStock === stock._id ? (
                        <input
                          type="text"
                          name="category"
                          value={editForm.category}
                          onChange={handleEditChange}
                          className={styles.formInput}
                        />
                      ) : (
                        stock.category
                      )}
                    </td>
                    <td className={styles.td}>
                      {editingStock === stock._id ? (
                        <input
                          type="color"
                          name="color"
                          value={editForm.color}
                          onChange={handleEditChange}
                          className={styles.formColorInput}
                        />
                      ) : (
                        <div 
                          className={styles.colorPreview}
                          style={{ backgroundColor: stock.color }}
                        />
                      )}
                    </td>
                    <td className={styles.td}>
                      {editingStock === stock._id ? (
                        <div className={styles.editActions}>
                          <button
                            className={`${styles.btn} ${styles.btnSuccess}`}
                            onClick={() => handleSaveEdit(stock._id)}
                          >
                            Save
                          </button>
                          <button
                            className={`${styles.btn} ${styles.btnDanger}`}
                            onClick={handleCancelEdit}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className={styles.actions}>
                          <button
                            className={`${styles.btn} ${styles.btnPrimary}`}
                            onClick={() => handleEdit(stock)}
                          >
                            Edit
                          </button>
                          <button
                            className={`${styles.btn} ${styles.btnDanger}`}
                            onClick={() => handleDelete(stock._id)}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };
  
  // PopularStocksContent component
  const PopularStocksContent = () => {
    const [stocks, setStocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
      fetchStocks();
    }, []);

    const fetchStocks = async () => {
      try {
        const response = await api.get('/api/stocks');
        setStocks(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching stocks:', error);
        setError(error.response?.data?.message || 'Failed to load stocks');
        setLoading(false);
      }
    };

    const handleTogglePopularity = async (stockId, currentStatus) => {
      try {
        const response = await api.put(`/api/admin/stocks/${stockId}/popularity`, {
          isPopular: !currentStatus
        });
        setStocks(stocks.map(stock => 
          stock._id === stockId ? response.data : stock
        ));
      } catch (error) {
        console.error('Error toggling stock popularity:', error);
        setError(error.response?.data?.message || 'Failed to update stock popularity');
      }
    };

    if (loading) {
      return (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingMessage}>Loading stocks...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className={styles.errorContainer}>
          <div className={styles.errorMessage}>
            <h3>Error Loading Stocks</h3>
            <p>{error}</p>
            <button 
              className={styles.btn}
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className={styles.popularStocksContainer}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.h3}>Manage Popular Stocks</h3>
          </div>
          <div className={styles.cardBody}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Symbol</th>
                  <th className={styles.th}>Name</th>
                  <th className={styles.th}>Category</th>
                  <th className={styles.th}>Status</th>
                  <th className={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {stocks.map((stock) => (
                  <tr key={stock._id}>
                    <td className={styles.td}>{stock.symbol}</td>
                    <td className={styles.td}>{stock.name}</td>
                    <td className={styles.td}>{stock.category}</td>
                    <td className={styles.td}>
                      <span className={`${styles.badge} ${stock.isPopular ? styles.badgeSuccess : styles.badgeWarning}`}>
                        {stock.isPopular ? 'Popular' : 'Not Popular'}
                      </span>
                    </td>
                    <td className={styles.td}>
                      <button
                        className={`${styles.btn} ${stock.isPopular ? styles.btnWarning : styles.btnSuccess}`}
                        onClick={() => handleTogglePopularity(stock._id, stock.isPopular)}
                      >
                        {stock.isPopular ? 'Remove from Popular' : 'Make Popular'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className={styles.adminPage}>
      <AdminSidebar />
      <div className={styles.adminContent}>
        <AdminHeader />
        {activePage === 'dashboard' && <DashboardContent />}
        {activePage === 'statistics' && <StatisticsContent />}
        {activePage === 'add-asset' && <AddAssetContent />}
        {activePage === 'users' && <UsersContent />}
        {activePage === 'assets' && <AssetsContent />}
        {activePage === 'popular-stocks' && <PopularStocksContent />}
      </div>
    </div>
  );
};

export default AdminPage;