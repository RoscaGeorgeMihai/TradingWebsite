import React, { useState } from 'react';
import styles from '../styles/Invest.module.css';

const Invest = () => {
  // State pentru datele utilizatorului
  const [balance, setBalance] = useState(5000.00); // Buget initial
  const [availableFunds, setAvailableFunds] = useState(2750.25); // Fonduri disponibile pentru investiții
  const [investedAmount, setInvestedAmount] = useState(2249.75); // Suma deja investită
  
  // State pentru formularul de depozit/retragere
  const [depositAmount, setDepositAmount] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [iban, setIban] = useState(''); // Adăugat state pentru IBAN
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('deposit'); // deposit sau withdraw

  // Istoricul tranzacțiilor
  const [transactions, setTransactions] = useState([
    { id: 1, type: 'Deposit', amount: 1000.00, date: '2025-03-24', status: 'Completed' },
    { id: 2, type: 'Investment', amount: -500.50, date: '2025-03-26', status: 'Completed' },
    { id: 3, type: 'Deposit', amount: 1500.00, date: '2025-04-01', status: 'Completed' },
    { id: 4, type: 'Withdrawal', amount: -250.00, date: '2025-04-03', status: 'Completed' },
    { id: 5, type: 'Investment', amount: -749.25, date: '2025-04-05', status: 'Completed' }
  ]);

  // Formatare număr card (adaugă spații la fiecare 4 cifre)
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  // Formatare dată expirare (MM/YY)
  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    
    return value;
  };

  // Formatare IBAN (adaugă spații la fiecare 4 caractere)
  const formatIban = (value) => {
    const v = value.replace(/\s+/g, '').toUpperCase();
    const parts = [];
    
    for (let i = 0, len = v.length; i < len; i += 4) {
      parts.push(v.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  // Handler pentru schimbare număr card
  const handleCardNumberChange = (e) => {
    const formattedValue = formatCardNumber(e.target.value);
    setCardNumber(formattedValue);
  };

  // Handler pentru schimbare dată expirare
  const handleExpiryDateChange = (e) => {
    const formattedValue = formatExpiryDate(e.target.value);
    setExpiryDate(formattedValue);
  };

  // Handler pentru schimbare IBAN
  const handleIbanChange = (e) => {
    const formattedValue = formatIban(e.target.value);
    setIban(formattedValue);
  };

  // Handler pentru depozit
  const handleDeposit = (e) => {
    e.preventDefault();
    
    if (!depositAmount || !cardNumber || !cardHolder || !expiryDate || !cvv) {
      alert('Vă rugăm să completați toate câmpurile.');
      return;
    }

    const amount = parseFloat(depositAmount);
    
    if (isNaN(amount) || amount <= 0) {
      alert('Vă rugăm să introduceți o sumă validă.');
      return;
    }

    // Simulează procesarea plății
    setIsProcessing(true);
    
    setTimeout(() => {
      const newBalance = balance + amount;
      const newAvailableFunds = availableFunds + amount;
      const currentDate = new Date().toISOString().split('T')[0];
      
      // Actualizează balanța și fondurile disponibile
      setBalance(newBalance);
      setAvailableFunds(newAvailableFunds);
      // Nu modificăm investedAmount deoarece depozitul crește doar fondurile disponibile
      
      // Adaugă tranzacția în istoric
      const newTransaction = {
        id: transactions.length + 1,
        type: 'Deposit',
        amount: amount,
        date: currentDate,
        status: 'Completed'
      };
      
      setTransactions([newTransaction, ...transactions]);
      
      // Resetează formularul
      setDepositAmount('');
      setCardNumber('');
      setCardHolder('');
      setExpiryDate('');
      setCvv('');
      
      setIsProcessing(false);
      setShowSuccess(true);
      
      // Ascunde mesajul de succes după 3 secunde
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    }, 1500);
  };

  // Handler pentru retragere
  const handleWithdraw = (e) => {
    e.preventDefault();
    
    if (!depositAmount || !iban) {
      alert('Vă rugăm să completați suma și IBAN-ul.');
      return;
    }

    const amount = parseFloat(depositAmount);
    
    if (isNaN(amount) || amount <= 0) {
      alert('Vă rugăm să introduceți o sumă validă.');
      return;
    }

    if (amount > availableFunds) {
      alert('Fonduri insuficiente pentru retragere.');
      return;
    }

    // Simulează procesarea retragerii
    setIsProcessing(true);
    
    setTimeout(() => {
      const newBalance = balance - amount;
      const newAvailableFunds = availableFunds - amount;
      const currentDate = new Date().toISOString().split('T')[0];
      
      // Actualizează balanța și fondurile disponibile
      setBalance(newBalance);
      setAvailableFunds(newAvailableFunds);
      // Nu modificăm investedAmount deoarece retragerea afectează doar fondurile disponibile
      
      // Adaugă tranzacția în istoric
      const newTransaction = {
        id: transactions.length + 1,
        type: 'Withdrawal',
        amount: -amount,
        date: currentDate,
        status: 'Completed'
      };
      
      setTransactions([newTransaction, ...transactions]);
      
      // Resetează formularul
      setDepositAmount('');
      setIban('');
      
      setIsProcessing(false);
      setShowSuccess(true);
      
      // Ascunde mesajul de succes după 3 secunde
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    }, 1500);
  };

  // Adăugat: Funcție pentru a face o investiție
  const handleInvestment = (amount) => {
    if (amount > availableFunds) {
      alert('Fonduri insuficiente pentru investiție.');
      return;
    }

    const newAvailableFunds = availableFunds - amount;
    const newInvestedAmount = investedAmount + amount;
    const currentDate = new Date().toISOString().split('T')[0];
    
    setAvailableFunds(newAvailableFunds);
    setInvestedAmount(newInvestedAmount);
    
    const newTransaction = {
      id: transactions.length + 1,
      type: 'Investment',
      amount: -amount,
      date: currentDate,
      status: 'Completed'
    };
    
    setTransactions([newTransaction, ...transactions]);
    
    alert('Investiție efectuată cu succes!');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setDepositAmount('');
    
    if (tab === 'deposit') {
      setCardNumber('');
      setCardHolder('');
      setExpiryDate('');
      setCvv('');
    } else {
      setIban('');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Investment Portal</h1>
        <p className={styles.pageSubtitle}>Manage your funds, deposit money, and track your investment portfolio</p>
      </div>
      
      <div className={styles.overviewCards}>
        <div className={styles.card}>
          <div className={styles.cardIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <div className={styles.cardContent}>
            <h2>Total Balance</h2>
            <p className={styles.cardValue}>${balance.toFixed(2)}</p>
          </div>
        </div>
        
        <div className={styles.card}>
          <div className={styles.cardIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <div className={styles.cardContent}>
            <h2>Available Funds</h2>
            <p className={styles.cardValue}>${availableFunds.toFixed(2)}</p>
          </div>
        </div>
        
        <div className={styles.card}>
          <div className={styles.cardIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 20h.01M7 20v-4"></path>
              <path d="M12 20v-8"></path>
              <path d="M17 20V8"></path>
              <path d="M22 4v16h.01"></path>
            </svg>
          </div>
          <div className={styles.cardContent}>
            <h2>Invested Amount</h2>
            <p className={styles.cardValue}>${investedAmount.toFixed(2)}</p>
          </div>
        </div>
      </div>
      
      <div className={styles.mainContent}>
        <div className={styles.formSection}>
          <div className={styles.formHeader}>
            <div className={styles.formTabs}>
              <button 
                className={`${styles.formTab} ${activeTab === 'deposit' ? styles.active : ''}`}
                onClick={() => handleTabChange('deposit')}
              >
                Deposit Funds
              </button>
              <button 
                className={`${styles.formTab} ${activeTab === 'withdraw' ? styles.active : ''}`}
                onClick={() => handleTabChange('withdraw')}
              >
                Withdraw Funds
              </button>
            </div>
          </div>
          
          <form className={styles.depositForm} onSubmit={activeTab === 'deposit' ? handleDeposit : handleWithdraw}>
            <div className={styles.formGroup}>
              <label htmlFor="amount">Amount (USD)</label>
              <div className={styles.inputWithIcon}>
                <span className={styles.dollarSign}>$</span>
                <input
                  type="text"
                  id="amount"
                  placeholder="Enter amount"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  disabled={isProcessing}
                />
              </div>
            </div>
            
            {activeTab === 'deposit' ? (
              <>
                <div className={styles.formGroup}>
                  <label htmlFor="cardNumber">Card Number</label>
                  <input
                    type="text"
                    id="cardNumber"
                    placeholder="**** **** **** ****"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    maxLength="19"
                    disabled={isProcessing}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="cardHolder">Card Holder Name</label>
                  <input
                    type="text"
                    id="cardHolder"
                    placeholder="Your name as it appears on card"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    disabled={isProcessing}
                  />
                </div>
                
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="expiryDate">Expiry Date</label>
                    <input
                      type="text"
                      id="expiryDate"
                      placeholder="MM/YY"
                      value={expiryDate}
                      onChange={handleExpiryDateChange}
                      maxLength="5"
                      disabled={isProcessing}
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="cvv">CVV</label>
                    <input
                      type="text"
                      id="cvv"
                      placeholder="***"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                      maxLength="3"
                      disabled={isProcessing}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className={styles.formGroup}>
                <label htmlFor="iban">IBAN</label>
                <input
                  type="text"
                  id="iban"
                  placeholder="ROXX XXXX XXXX XXXX XXXX XXXX"
                  value={iban}
                  onChange={handleIbanChange}
                  disabled={isProcessing}
                />
              </div>
            )}
            
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : activeTab === 'deposit' ? 'Deposit Funds' : 'Withdraw Funds'}
            </button>
            
            {showSuccess && (
              <div className={styles.successMessage}>
                {activeTab === 'deposit' ? 'Deposit successful!' : 'Withdrawal successful!'}
              </div>
            )}
            
            <div className={styles.secureNote}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <span>All transactions are secure and encrypted</span>
            </div>
          </form>
        </div>
        
        {/* Transaction history */}
        <div className={styles.transactionSection}>
          <h2>Recent Transactions</h2>
          <div className={styles.transactionList}>
            {transactions.map(transaction => (
              <div key={transaction.id} className={styles.transactionItem}>
                <div className={styles.transactionIcon} data-type={transaction.type.toLowerCase()}>
                  {transaction.type === 'Deposit' && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2v20M2 12h20"></path>
                    </svg>
                  )}
                  {transaction.type === 'Withdrawal' && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14"></path>
                    </svg>
                  )}
                  {transaction.type === 'Investment' && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 20h.01M7 20v-4"></path>
                      <path d="M12 20v-8"></path>
                      <path d="M17 20V8"></path>
                      <path d="M22 4v16h.01"></path>
                    </svg>
                  )}
                </div>
                <div className={styles.transactionDetails}>
                  <div className={styles.transactionType}>{transaction.type}</div>
                  <div className={styles.transactionDate}>{transaction.date}</div>
                </div>
                <div className={styles.transactionAmount} data-positive={transaction.amount > 0}>
                  {transaction.amount > 0 ? '+' : ''}{transaction.amount.toFixed(2)} USD
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className={styles.tipsSection}>
        <h2>Investment Tips</h2>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <div className={styles.tipIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 12h4v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-8h4L12 2Z"></path>
              </svg>
            </div>
            <h3>Build a Diverse Portfolio</h3>
            <p>Don&apos;t put all your eggs in one basket. Spread your investments across different asset classes to reduce risk.</p>
          </div>
          
          <div className={styles.tipCard}>
            <div className={styles.tipIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20v-6M6 20V10M18 20V4"></path>
              </svg>
            </div>
            <h3>Invest Regularly</h3>
            <p>Dollar-cost averaging can help reduce the impact of market volatility over time.</p>
          </div>
          
          <div className={styles.tipCard}>
            <div className={styles.tipIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="14" x="2" y="5" rx="2"></rect>
                <line x1="2" x2="22" y1="10" y2="10"></line>
              </svg>
            </div>
            <h3>Know Your Fees</h3>
            <p>Pay attention to investment fees as they can significantly impact your long-term returns.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invest;