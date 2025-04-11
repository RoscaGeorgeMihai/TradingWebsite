import React, { useState, useContext, useEffect } from 'react';
import { InvestContext } from '../components/InvestContext';
import styles from '../styles/Invest.module.css';

const Invest = () => {
  // Context pentru investiții
  const { 
    totalBalance, 
    availableFunds, 
    investedAmount, 
    transactions, 
    loading,
    depositFunds, 
    withdrawFunds
  } = useContext(InvestContext);
  
  // State pentru formularul de depozit/retragere
  const [depositAmount, setDepositAmount] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [iban, setIban] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [activeTab, setActiveTab] = useState('deposit'); // deposit sau withdraw

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
  const handleDeposit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    // Validare date
    if (!depositAmount || !cardNumber || !cardHolder || !expiryDate || !cvv) {
      setErrorMessage('Vă rugăm să completați toate câmpurile.');
      return;
    }

    const amount = parseFloat(depositAmount);
    
    if (isNaN(amount) || amount <= 0) {
      setErrorMessage('Vă rugăm să introduceți o sumă validă.');
      return;
    }

    // Procesarea depozitului
    setIsProcessing(true);
    
    const cardDetails = {
      cardNumber,
      cardHolder,
      expiryDate,
      cvv
    };
    
    const result = await depositFunds(amount, cardDetails);
    
    setIsProcessing(false);
    
    if (result.success) {
      // Resetează formularul
      setDepositAmount('');
      setCardNumber('');
      setCardHolder('');
      setExpiryDate('');
      setCvv('');
      
      // Afișează mesajul de succes
      setSuccessMessage('Depozit efectuat cu succes!');
      setShowSuccess(true);
      
      // Ascunde mesajul de succes după 3 secunde
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } else {
      setErrorMessage(result.message);
    }
  };

  // Handler pentru retragere
  const handleWithdraw = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    // Validare date
    if (!depositAmount || !iban) {
      setErrorMessage('Vă rugăm să completați suma și IBAN-ul.');
      return;
    }

    const amount = parseFloat(depositAmount);
    
    if (isNaN(amount) || amount <= 0) {
      setErrorMessage('Vă rugăm să introduceți o sumă validă.');
      return;
    }

    if (amount > availableFunds) {
      setErrorMessage('Fonduri insuficiente pentru retragere.');
      return;
    }

    // Procesarea retragerii
    setIsProcessing(true);
    
    const result = await withdrawFunds(amount, iban);
    
    setIsProcessing(false);
    
    if (result.success) {
      // Resetează formularul
      setDepositAmount('');
      setIban('');
      
      // Afișează mesajul de succes
      setSuccessMessage('Retragere efectuată cu succes!');
      setShowSuccess(true);
      
      // Ascunde mesajul de succes după 3 secunde
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } else {
      setErrorMessage(result.message);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setDepositAmount('');
    setErrorMessage('');
    
    if (tab === 'deposit') {
      setCardNumber('');
      setCardHolder('');
      setExpiryDate('');
      setCvv('');
    } else {
      setIban('');
    }
  };

  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        // Forțează încărcarea datelor chiar dacă API-ul eșuează
        console.log('Timeout la încărcare, se afișează date implicite');
        // Aici ai putea să apelezi direct dispatch pentru a reseta starea de loading
      }, 5000); // 5 secunde timeout
      
      return () => clearTimeout(timer);
    }
  }, [loading]);

  if (loading) {
    return <div className={styles.loading}>Se încarcă datele financiare...</div>;
  }

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
            <p className={styles.cardValue}>${totalBalance.toFixed(2)}</p>
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
          
          {errorMessage && (
            <div className={styles.errorMessage}>
              {errorMessage}
            </div>
          )}
          
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
                {successMessage}
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
            {transactions.length === 0 ? (
              <div className={styles.noTransactions}>No transactions yet</div>
            ) : (
              transactions.map(transaction => (
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
              ))
            )}
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