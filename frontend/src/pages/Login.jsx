import React, { useState } from 'react';
import styles from '../styles/Login.module.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login attempt:', { email, password, rememberMe });
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginContainer}>
        <div className={styles.loginFormWrapper}>
          <h2>Conectează-te la contul tău</h2>
          <p className={styles.loginSubtitle}>Accesează-ți portofoliul și continuă să tranzacționezi</p>
          
          <form className={styles.loginForm} onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Introdu adresa de email"
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="password">Parolă</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Introdu parola"
                required
              />
            </div>
            
            <div className={styles.formOptions}>
              <div className={styles.rememberMe}>
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember">Ține-mă minte</label>
              </div>
              <a href="/forgot-password" className={styles.forgotPassword}>Ai uitat parola?</a>
            </div>
            
            <button type="submit" className={styles.loginButton}>
              Conectează-te
            </button>
          </form>
          
          <div className={styles.loginFooter}>
            <p>Nu ai un cont? <a href="/signup">Înregistrează-te</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;