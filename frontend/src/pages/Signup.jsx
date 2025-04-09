import React, { useState, useContext } from 'react';
import '../styles/Signup.css';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../components/AuthContext';

const SignUp = () => {
  // Move useNavigate to the top level
  const navigate = useNavigate();
  const { register } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });
  
  // Add error state
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: undefined
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Password validation
    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter';
    } else if (!/\d/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one number';
    }
    
    // Confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const success = await register(
        formData.firstName, 
        formData.lastName, 
        formData.email, 
        formData.password
      );
      
      if (success) {
        navigate('/');
      } else {
        setErrors({ submit: 'Registration failed. Please try again.' });
      }
    } catch(err) {
      console.error(err.response?.data || err);
      setErrors({ submit: err.response?.data?.message || 'Registration failed' });
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <div className="signup-form-wrapper">
          <h2>Create a new account</h2>
          <p className="signup-subtitle">Register to start investing</p>
          
          {/* Display general submission error if exists */}
          {errors.submit && (
            <div className="error-message">{errors.submit}</div>
          )}
          
          <form className="signup-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Enter your first name"
                  required
                  className={errors.firstName ? 'input-error' : ''}
                />
                {errors.firstName && (
                  <div className="error-text">{errors.firstName}</div>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Enter your last name"
                  required
                  className={errors.lastName ? 'input-error' : ''}
                />
                {errors.lastName && (
                  <div className="error-text">{errors.lastName}</div>
                )}
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email address"
                required
                className={errors.email ? 'input-error' : ''}
              />
              {errors.email && (
                <div className="error-text">{errors.email}</div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                required
                className={errors.password ? 'input-error' : ''}
              />
              <small className="password-hint">Password must contain at least 8 characters, one uppercase letter and one number</small>
              {errors.password && (
                <div className="error-text">{errors.password}</div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
                className={errors.confirmPassword ? 'input-error' : ''}
              />
              {errors.confirmPassword && (
                <div className="error-text">{errors.confirmPassword}</div>
              )}
            </div>
            
            <div className="form-checkbox">
              <input
                type="checkbox"
                id="agreeTerms"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                required
              />
              <label htmlFor="agreeTerms">I agree to the <a href="/terms">Terms and Conditions</a> and <a href="/privacy">Privacy Policy</a></label>
              {errors.agreeTerms && (
                <div className="error-text">{errors.agreeTerms}</div>
              )}
            </div>
            
            <button type="submit" className="signup-button">
              Create Account
            </button>
          </form>
          
          <div className="signup-footer">
            <p>Already have an account? <a href="/login">Log in</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;