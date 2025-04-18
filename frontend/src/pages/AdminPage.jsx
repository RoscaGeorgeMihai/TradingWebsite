// AdminPage.js
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../components/AuthContext';
import api from '../services/axios';
import styles from '../styles/Admin.module.css';

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
    setActivePage(pageId);
  };
  
  // Handle logout function similar to Navbar
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  
  // Sidebar Component
  const AdminSidebar = () => {
    // Check if user is authenticated and has admin role
    useEffect(() => {
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
      { id: 'transactions', name: 'Transactions', icon: '🔄' },
      { id: 'settings', name: 'Settings', icon: '⚙️' },
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
        case 'transactions': return 'Platform Transactions';
        case 'settings': return 'Admin Settings';
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
  
  // Dashboard content (example)
  const DashboardContent = () => {
    // Rest of the DashboardContent component remains the same
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
      // Simulating API data loading
      const fetchData = async () => {
        try {
          // In a real implementation, this would be an API call
          // const response = await api.get('/admin/dashboard');
          
          // Demo data for illustration
          setTimeout(() => {
            setDashboardData({
              totalUsers: 5248,
              activeUsers: 1892,
              totalAssets: 127,
              totalDeposits: 8934560,
              todayDeposits: 156400,
              todayWithdrawals: 87200,
              recentActivity: [
                { id: 1, user: 'user123', action: 'Deposit', amount: 5000, date: '18 Apr 2025 14:32' },
                { id: 2, user: 'trader456', action: 'Buy BTC', amount: 0.25, date: '18 Apr 2025 14:15' },
                { id: 3, user: 'investor789', action: 'Sell AAPL', amount: 10, date: '18 Apr 2025 13:48' },
                { id: 4, user: 'newuser555', action: 'Registration', amount: null, date: '18 Apr 2025 13:22' },
                { id: 5, user: 'active_user', action: 'Withdrawal', amount: 1200, date: '18 Apr 2025 12:55' },
              ],
              alertsCount: 3
            });
            setLoading(false);
          }, 1000);
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
          setLoading(false);
        }
      };
      
      fetchData();
    }, []);
    
    if (loading) {
      return <div className={styles.loadingMessage}>Loading dashboard data...</div>;
    }
    
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
              <h2 className={styles.summaryValue}>${(dashboardData.totalDeposits / 1000000).toFixed(2)}M</h2>
              <p className={styles.summaryLabel}>Total Deposits</p>
            </div>
          </div>
          
          <div className={styles.summaryCard}>
            <div className={styles.summaryIconWarning}>📊</div>
            <div className={styles.summaryContent}>
              <h2 className={styles.summaryValue}>{dashboardData.totalAssets}</h2>
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
        
        {/* Rest of component stays the same */}
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
                  <span className={styles.textSuccess}>${dashboardData.todayDeposits.toLocaleString()}</span>
                </div>
                <div className={styles.progressBar}>
                  <div 
                    className={`${styles.progressFill} ${styles.progressFillSuccess}`} 
                    style={{ width: `${Math.min((dashboardData.todayDeposits / (dashboardData.todayDeposits + dashboardData.todayWithdrawals)) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div className={styles.progressContainer}>
                <div className={styles.progressLabel}>
                  <span>Withdrawals</span>
                  <span className={styles.textDanger}>${dashboardData.todayWithdrawals.toLocaleString()}</span>
                </div>
                <div className={styles.progressBar}>
                  <div 
                    className={`${styles.progressFill} ${styles.progressFillDanger}`} 
                    style={{ width: `${Math.min((dashboardData.todayWithdrawals / (dashboardData.todayDeposits + dashboardData.todayWithdrawals)) * 100, 100)}%` }}
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
              <div className={styles.alert}>
                <div className={`${styles.alertDot} ${styles.alertDotWarning}`}></div>
                <div className={styles.alertContent}>
                  <div className={styles.alertTitle}>Major price fluctuation: BTC (+12% in the last hour)</div>
                  <div className={styles.alertTime}>18 Apr 2025, 13:45</div>
                </div>
              </div>
              <div className={styles.alert}>
                <div className={`${styles.alertDot} ${styles.alertDotDanger}`}></div>
                <div className={styles.alertContent}>
                  <div className={styles.alertTitle}>External API Error: Coinbase</div>
                  <div className={styles.alertTime}>18 Apr 2025, 12:30</div>
                </div>
              </div>
              <div className={styles.alert}>
                <div className={`${styles.alertDot} ${styles.alertDotInfo}`}></div>
                <div className={styles.alertContent}>
                  <div className={styles.alertTitle}>Scheduled maintenance: 19 Apr, 02:00-04:00</div>
                  <div className={styles.alertTime}>18 Apr 2025, 09:00</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Recent Activity */}
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
                {dashboardData.recentActivity.map((activity) => (
                  <tr key={activity.id}>
                    <td className={styles.td}>{activity.id}</td>
                    <td className={styles.td}>{activity.user}</td>
                    <td className={styles.td}>{activity.action}</td>
                    <td className={`${styles.td} ${styles.textRight}`}>
                      {activity.amount !== null ? (
                        activity.action.includes('Deposit') || activity.action.includes('Buy') 
                          ? <span className={styles.textSuccess}>{activity.amount}</span>
                          : activity.action.includes('Withdrawal') || activity.action.includes('Sell')
                            ? <span className={styles.textDanger}>{activity.amount}</span>
                            : <span>{activity.amount}</span>
                      ) : <span>-</span>}
                    </td>
                    <td className={styles.td}>{activity.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
              <button className={`${styles.btn} ${styles.btnAction}`}>
                <span className={styles.actionIcon}>📊</span>
                <span>Activity Report</span>
              </button>
              <button 
                className={`${styles.btn} ${styles.btnAction}`}
                onClick={() => handleNavigation('users')}
              >
                <span className={styles.actionIcon}>👥</span>
                <span>Manage Users</span>
              </button>
              <button className={`${styles.btn} ${styles.btnAction}`}>
                <span className={styles.actionIcon}>🔔</span>
                <span>System Notifications</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Statistics component and other components remain the same
  const StatisticsContent = () => {
    // Implementation remains the same
    return (
      <div className={styles.statisticsContainer}>
        {/* Content remains the same */}
        <div className={styles.filterButtons}>
          <button className={`${styles.btnFilter} ${styles.active}`}>All</button>
          <button className={styles.btnFilter}>Year</button>
          <button className={styles.btnFilter}>Month</button>
          <button className={styles.btnFilter}>Week</button>
        </div>
        
        {/* Summary statistics */}
        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <div className={styles.summaryIconPrimary}>👥</div>
            <div className={styles.summaryContent}>
              <h2 className={styles.summaryValue}>5,248</h2>
              <p className={styles.summaryLabel}>Total Users</p>
            </div>
          </div>
          
          <div className={styles.summaryCard}>
            <div className={styles.summaryIconSuccess}>💰</div>
            <div className={styles.summaryContent}>
              <h2 className={styles.summaryValue}>$8,934,560</h2>
              <p className={styles.summaryLabel}>Total Deposits</p>
            </div>
          </div>
          
          <div className={styles.summaryCard}>
            <div className={styles.summaryIconWarning}>📈</div>
            <div className={styles.summaryContent}>
              <h2 className={styles.summaryValue}>$12,567,890</h2>
              <p className={styles.summaryLabel}>Asset Value</p>
            </div>
          </div>
          
          <div className={styles.summaryCard}>
            <div className={styles.summaryIconInfo}>🔄</div>
            <div className={styles.summaryContent}>
              <h2 className={styles.summaryValue}>352,789</h2>
              <p className={styles.summaryLabel}>Transaction Volume</p>
            </div>
          </div>
        </div>
        
        {/* Rest of the component remains the same */}
      </div>
    );
  };
  
  // AddAssetContent component remains the same
  const AddAssetContent = () => {
    // Implementation remains the same
    const [assetType, setAssetType] = useState('stock');
    const [formData, setFormData] = useState({
      symbol: '',
      name: '',
      price: '',
      description: '',
      category: '',
      exchange: '',
      logoUrl: '',
      color: '#0dcaf0', // Default color
    });
    
    // Categories based on asset type
    const categories = {
      stock: ['Technology', 'Finance', 'Healthcare', 'Consumer', 'Energy', 'Industrial', 'Real Estate', 'Utilities', 'Other'],
      crypto: ['Currency', 'Platform', 'DeFi', 'NFT', 'Metaverse', 'Web3', 'Other'],
      commodity: ['Precious Metals', 'Energy', 'Agriculture', 'Industrial Metals', 'Livestock', 'Other'],
    };
    
    // Exchanges/Markets based on asset type
    const exchanges = {
      stock: ['NASDAQ', 'NYSE', 'LSE', 'EURONEXT', 'TSX', 'ASX', 'OTHER'],
      crypto: ['Binance', 'Coinbase', 'Kraken', 'KuCoin', 'Huobi', 'Other'],
      commodity: ['COMEX', 'NYMEX', 'LME', 'ICE', 'CME', 'Other'],
    };
    
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    };
    
    return (
      <div className={styles.addAssetContainer}>
        {/* Content remains the same */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.h3}>Add New Asset</h3>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.assetTypeSelector}>
              <button 
                className={`${styles.btnAssetType} ${assetType === 'stock' ? styles.active : ''}`} 
                onClick={() => setAssetType('stock')}
              >
                Stock
              </button>
              <button 
                className={`${styles.btnAssetType} ${assetType === 'crypto' ? styles.active : ''}`} 
                onClick={() => setAssetType('crypto')}
              >
                Cryptocurrency
              </button>
              <button 
                className={`${styles.btnAssetType} ${assetType === 'commodity' ? styles.active : ''}`} 
                onClick={() => setAssetType('commodity')}
              >
                Commodity
              </button>
            </div>
            
            <form className={styles.addAssetForm}>
              {/* Form content remains the same */}
            </form>
          </div>
        </div>
        
        {/* Preview Card */}
        <div className={styles.card}>
          {/* Content remains the same */}
        </div>
      </div>
    );
  };
  
  // Placeholder for other page contents
  const ContentPlaceholder = () => {
    return (
      <div className={styles.emptyMessage}>
        <h2>The page &quot;{activePage}&quot; is under development</h2>
        <p>This section will be available soon.</p>
      </div>
    );
  };
  
  // Conditional rendering of content based on active page
  const renderContent = () => {
    switch(activePage) {
      case 'dashboard':
        return <DashboardContent />;
      case 'statistics':
        return <StatisticsContent />;
      case 'add-asset':
        return <AddAssetContent />;
      default:
        return <ContentPlaceholder />;
    }
  };
  
  return (
    <div className={styles.adminLayoutContainer}>
      <AdminSidebar />
      <div className={styles.adminContent}>
        <AdminHeader />
        <div className={styles.adminPageContent}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;