import React, { useState, useContext } from 'react';
import styles from '../styles/Login.module.css';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../components/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  
  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    
    try {
      const success = await login(email, password);
      if (success) {
        navigate('/');
      } else {
        setError('Login failed. Please try again.');
      }
    } catch(err) {
      console.error(err);
      
      // Check if it's a deactivated account error
      if (err.response?.status === 403 && err.response?.data?.message?.includes('deactivated')) {
        setError(`${err.response.data.message} Please contact our support team for assistance.`);
      } else {
        setError(err.response?.data?.message || 'Login failed. Please try again.');
      }
    }
  };
  
  return (
    <div className={styles.loginPage}>
      <div className={styles.loginContainer}>
        <div className={styles.loginFormWrapper}>
          <h2>Log in to your account</h2>
          <p className={styles.loginSubtitle}>Access your portfolio and continue investing</p>
          
          {error && <div className={styles.errorMessage}>{error}</div>}
          
          <form className={styles.loginForm} onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            
            <div className={styles.formOptions}>
              <a href="/forgot-password" className={styles.forgotPassword}>Forgot password?</a>
            </div>
            
            <button type="submit" className={styles.loginButton}>
              Log in
            </button>
          </form>
          
          <div className={styles.loginFooter}>
            <p>Don&apos;t have an account? <a href="/signup">Sign up</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;