import React, { useState } from 'react';
import '../styles/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login attempt:', { email, password, rememberMe });
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-form-wrapper">
          <h2>Conectează-te la contul tău</h2>
          <p className="login-subtitle">Accesează-ți portofoliul și continuă să tranzacționezi</p>
          
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
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
            
            <div className="form-group">
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
            
            <div className="form-options">
              <div className="remember-me">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember">Ține-mă minte</label>
              </div>
              <a href="/forgot-password" className="forgot-password">Ai uitat parola?</a>
            </div>
            
            <button type="submit" className="login-button">
              Conectează-te
            </button>
          </form>
          
          <div className="login-footer">
            <p>Nu ai un cont? <a href="/signup">Înregistrează-te</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;