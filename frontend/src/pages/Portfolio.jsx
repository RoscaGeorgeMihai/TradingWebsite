import React, { useState, useEffect } from 'react';
import styles from '../styles/Portfolio.module.css';

const Portfolio = () => {
  const [portfolioData, setPortfolioData] = useState({
    totalValue: 85432.67,
    dailyChange: 1.35,
    assets: [
      { 
        symbol: 'AAPL', 
        name: 'Apple Inc.', 
        price: 178.72, 
        quantity: 15, 
        value: 2680.80, 
        changePercent: 1.25,
        allocation: 12,
        color: '#0088FE'
      },
      { 
        symbol: 'GOOGL', 
        name: 'Alphabet Inc.', 
        price: 142.17, 
        quantity: 10, 
        value: 1421.70, 
        changePercent: 0.87,
        allocation: 8,
        color: '#00C49F'
      },
      { 
        symbol: 'MSFT', 
        name: 'Microsoft Corp.', 
        price: 413.56, 
        quantity: 25, 
        value: 10339.00, 
        changePercent: 0.63,
        allocation: 28,
        color: '#FFBB28'
      },
      { 
        symbol: 'AMZN', 
        name: 'Amazon.com Inc.', 
        price: 180.85, 
        quantity: 18, 
        value: 3255.30, 
        changePercent: 1.42,
        allocation: 14,
        color: '#FF8042'
      },
      { 
        symbol: 'BTC', 
        name: 'Bitcoin', 
        price: 61245.30, 
        quantity: 0.7, 
        value: 42871.71, 
        changePercent: 2.15,
        allocation: 38,
        color: '#9146FF'
      }
    ],
    transactions: [
      { id: 1, date: '2025-03-15', type: 'Cumpărare', symbol: 'AAPL', quantity: 5, price: 175.32, total: 876.60 },
      { id: 2, date: '2025-03-10', type: 'Vânzare', symbol: 'MSFT', quantity: 2, price: 410.25, total: 820.50 },
      { id: 3, date: '2025-03-05', type: 'Cumpărare', symbol: 'BTC', quantity: 0.2, price: 59320.45, total: 11864.09 },
      { id: 4, date: '2025-03-01', type: 'Cumpărare', symbol: 'AMZN', quantity: 3, price: 178.65, total: 535.95 },
      { id: 5, date: '2025-02-25', type: 'Vânzare', symbol: 'GOOGL', quantity: 2, price: 140.35, total: 280.70 },
    ]
  });

  const [activeFilter, setActiveFilter] = useState('all');
  const [screenSize, setScreenSize] = useState('large');

  // Detectare dimensiune ecran și setare mod de afișare
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
    
    handleResize(); // Verifică la încărcare
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Adaptează coloanele afișate în funcție de dimensiunea ecranului
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
  
  // Componenta pentru sumarul portofoliului
  const PortfolioSummary = () => (
    <div className={styles.portfolioSummary}>
      <h1 className={styles.h1}>Portofoliul meu</h1>
      <div className={`${styles.flexBetween} ${styles.summaryContent}`}>
        <div>
          <p className={styles.textSecondary}>Valoare totală</p>
          <h2 className={styles.portfolioTotal}>${portfolioData.totalValue.toLocaleString()}</h2>
        </div>
        <div className={styles.textRight}>
          <p className={styles.textSecondary}>Schimbare zilnică</p>
          <p className={`${styles.portfolioChange} ${portfolioData.dailyChange >= 0 ? styles.textSuccess : styles.textDanger}`}>
            {portfolioData.dailyChange >= 0 ? '+' : ''}{portfolioData.dailyChange}%
          </p>
        </div>
      </div>
    </div>
  );

  // Componenta pentru alocarea activelor
  const AssetAllocation = () => {
    // Calculează și formatează stilul pentru conic-gradient
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
          <h3 className={styles.h3}>Alocarea activelor</h3>
        </div>
        {/* Modificare aici: Am eliminat clasa allocationChart de pe cardBody */}
        <div className={styles.cardBody}>
          {/* Adăugat container separat pentru conținutul de alocare */}
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
              
              {screenSize !== 'xsmall' && (
                <>
                  <div className={styles.legendItem}>
                    <div className={styles.flexCenter}>
                      <div className={styles.colorIndicator} style={{ backgroundColor: '#6A5ACD' }}></div>
                      <span>ETF</span>
                    </div>
                    <span>5%</span>
                  </div>
                  <div className={styles.legendItem}>
                    <div className={styles.flexCenter}>
                      <div className={styles.colorIndicator} style={{ backgroundColor: '#20B2AA' }}></div>
                      <span>BOND</span>
                    </div>
                    <span>3%</span>
                  </div>
                  <div className={styles.legendItem}>
                    <div className={styles.flexCenter}>
                      <div className={styles.colorIndicator} style={{ backgroundColor: '#FF6347' }}></div>
                      <span>REAL</span>
                    </div>
                    <span>2%</span>
                  </div>
                  <div className={styles.legendItem}>
                    <div className={styles.flexCenter}>
                      <div className={styles.colorIndicator} style={{ backgroundColor: '#FFA500' }}></div>
                      <span>GOLD</span>
                    </div>
                    <span>2%</span>
                  </div>
                  <div className={styles.legendItem}>
                    <div className={styles.flexCenter}>
                      <div className={styles.colorIndicator} style={{ backgroundColor: '#4682B4' }}></div>
                      <span>CASH</span>
                    </div>
                    <span>1%</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Componenta pentru performanță
  const Performance = () => (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.h3}>Performanță</h3>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.progressContainer}>
          <div className={styles.progressLabel}>
            <span>Astăzi</span>
            <span className={styles.textSuccess}>+1.35%</span>
          </div>
          <div className={styles.progressBar}>
            <div className={`${styles.progressFill} ${styles.progressFillSuccess}`} style={{ width: '60%' }}></div>
          </div>
        </div>
        <div className={styles.progressContainer}>
          <div className={styles.progressLabel}>
            <span>Săptămâna aceasta</span>
            <span className={styles.textSuccess}>+3.72%</span>
          </div>
          <div className={styles.progressBar}>
            <div className={`${styles.progressFill} ${styles.progressFillSuccess}`} style={{ width: '78%' }}></div>
          </div>
        </div>
        <div className={styles.progressContainer}>
          <div className={styles.progressLabel}>
            <span>Luna aceasta</span>
            <span className={styles.textSuccess}>+8.45%</span>
          </div>
          <div className={styles.progressBar}>
            <div className={`${styles.progressFill} ${styles.progressFillSuccess}`} style={{ width: '85%' }}></div>
          </div>
        </div>
        <div className={styles.progressContainer}>
          <div className={styles.progressLabel}>
            <span>Anual</span>
            <span className={styles.textDanger}>-2.15%</span>
          </div>
          <div className={styles.progressBar}>
            <div className={`${styles.progressFill} ${styles.progressFillDanger}`} style={{ width: '35%' }}></div>
          </div>
        </div>
        <div className={styles.progressContainer}>
          <div className={styles.progressLabel}>
            <span>Total</span>
            <span className={styles.textSuccess}>+24.67%</span>
          </div>
          <div className={styles.progressBar}>
            <div className={`${styles.progressFill} ${styles.progressFillSuccess}`} style={{ width: '92%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );

  // AssetList modificat pentru a fi complet responsive
  const AssetList = () => (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.h3}>Active</h3>
        <button className={`${styles.btn} ${styles.btnPrimary}`}>
          Adaugă active
        </button>
      </div>
      
      <div className={`${styles.cardBody} ${styles.assetsTable}`}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.showSymbol && <th className={styles.th}>Simbol</th>}
              {columns.showName && <th className={styles.th}>Nume</th>}
              {columns.showPrice && <th className={`${styles.th} ${styles.textRight}`}>Preț</th>}
              {columns.showQuantity && <th className={`${styles.th} ${styles.textRight}`}>Cantitate</th>}
              {columns.showValue && <th className={`${styles.th} ${styles.textRight}`}>Valoare</th>}
              {columns.showChange && <th className={`${styles.th} ${styles.textRight}`}>Schimbare</th>}
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

  // Transactions modificat pentru a fi complet responsive
  const Transactions = () => {
    const txColumns = screenSize === 'xsmall' ? 
      { date: true, type: true, symbol: true, quantity: false, price: false, total: true } :
      screenSize === 'small' ? 
      { date: true, type: true, symbol: true, quantity: false, price: false, total: true } :
      { date: true, type: true, symbol: true, quantity: true, price: true, total: true };
    
    return (
      <div className={`${styles.card} ${styles.transactionsCard}`}>
        <div className={styles.cardHeader}>
          <h3 className={styles.h3}>Tranzacții recente</h3>
          <div className={styles.filterButtons}>
            <button 
              className={`${styles.btnFilter} ${activeFilter === 'all' ? styles.active : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              Toate
            </button>
            <button 
              className={`${styles.btnFilter} ${activeFilter === 'buy' ? styles.active : ''}`}
              onClick={() => setActiveFilter('buy')}
            >
              Cumpărări
            </button>
            <button 
              className={`${styles.btnFilter} ${activeFilter === 'sell' ? styles.active : ''}`}
              onClick={() => setActiveFilter('sell')}
            >
              Vânzări
            </button>
          </div>
        </div>
        
        <div className={`${styles.cardBody} ${styles.transactionsTable}`}>
          <table className={styles.table}>
            <thead>
              <tr>
                {txColumns.date && <th className={styles.th}>Data</th>}
                {txColumns.type && <th className={styles.th}>Tip</th>}
                {txColumns.symbol && <th className={styles.th}>Simbol</th>}
                {txColumns.quantity && <th className={`${styles.th} ${styles.textRight}`}>Cantitate</th>}
                {txColumns.price && <th className={`${styles.th} ${styles.textRight}`}>Preț</th>}
                {txColumns.total && <th className={`${styles.th} ${styles.textRight}`}>Total</th>}
              </tr>
            </thead>
            <tbody>
              {portfolioData.transactions
                .filter(transaction => {
                  if (activeFilter === 'all') return true;
                  if (activeFilter === 'buy') return transaction.type === 'Cumpărare';
                  if (activeFilter === 'sell') return transaction.type === 'Vânzare';
                  return true;
                })
                .map((transaction) => (
                  <tr key={transaction.id}>
                    {txColumns.date && <td className={styles.td}>{transaction.date}</td>}
                    {txColumns.type && (
                      <td className={`${styles.td} ${transaction.type === 'Cumpărare' ? styles.textSuccess : styles.textDanger}`}>
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

  // Componenta pentru Top Performeri
  const TopPerformers = () => (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.h3}>Top Performeri</h3>
      </div>
      <div className={styles.cardBody}>
        {portfolioData.assets
          .slice()
          .sort((a, b) => b.changePercent - a.changePercent)
          .slice(0, 3)
          .map((asset, index) => (
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
                  <div className={styles.textSuccess}>+{asset.changePercent}%</div>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );

  // Componenta pentru Alerte
  const Alerts = () => (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.h3}>Alerte</h3>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.alert}>
          <div className={`${styles.alertDot} ${styles.alertDotSuccess}`}></div>
          <div className={styles.alertContent}>
            <div className={styles.alertTitle}>BTC a depășit $60,000</div>
            <div className={styles.alertTime}>Acum 2 ore</div>
          </div>
        </div>
        <div className={styles.alert}>
          <div className={`${styles.alertDot} ${styles.alertDotDanger}`}></div>
          <div className={styles.alertContent}>
            <div className={styles.alertTitle}>MSFT a scăzut cu 0.5%</div>
            <div className={styles.alertTime}>Acum 5 ore</div>
          </div>
        </div>
        <div className={styles.alert}>
          <div className={`${styles.alertDot} ${styles.alertDotSuccess}`}></div>
          <div className={styles.alertContent}>
            <div className={styles.alertTitle}>AAPL a crescut cu 1.25%</div>
            <div className={styles.alertTime}>Acum 8 ore</div>
          </div>
        </div>
        <div className={styles.alert}>
          <div className={`${styles.alertDot} ${styles.alertDotSuccess}`}></div>
          <div className={styles.alertContent}>
            <div className={styles.alertTitle}>AMZN a crescut cu 1.42%</div>
            <div className={styles.alertTime}>Acum 9 ore</div>
          </div>
        </div>
      </div>
    </div>
  );

  // Componenta pentru Acțiuni Rapide
  const QuickActions = () => (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.h3}>Acțiuni rapide</h3>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.quickActions}>
          <button className={`${styles.btn} ${styles.btnAction}`}>
            <span className={styles.actionIcon}>💰</span>
            <span>Depozit</span>
          </button>
          <button className={`${styles.btn} ${styles.btnAction}`}>
            <span className={styles.actionIcon}>🔄</span>
            <span>Transfer</span>
          </button>
          <button className={`${styles.btn} ${styles.btnAction}`}>
            <span className={styles.actionIcon}>📊</span>
            <span>Analiză</span>
          </button>
          <button className={`${styles.btn} ${styles.btnAction}`}>
            <span className={styles.actionIcon}>📱</span>
            <span>Mobil</span>
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