import React, { useState } from 'react';
import '../styles/Signup.css';

const SignUp = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aici ar trebui adăugată logica de înregistrare
    console.log('Registration attempt:', formData);
  };

  return (
    <div className="signup-page">
      
      <div className="signup-container">
        <div className="signup-form-wrapper">
          <h2>Creează un cont nou</h2>
          <p className="signup-subtitle">Înregistrează-te pentru a începe să tranzacționezi criptomonede</p>
          
          <form className="signup-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">Prenume</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Introdu prenumele"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="lastName">Nume</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Introdu numele"
                  required
                />
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
                placeholder="Introdu adresa de email"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Parolă</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Creează o parolă"
                required
              />
              <small className="password-hint">Parola trebuie să conțină cel puțin 8 caractere, o literă mare și un număr</small>
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmă parola</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirmă parola"
                required
              />
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
              <label htmlFor="agreeTerms">Sunt de acord cu <a href="/terms">Termenii și Condițiile</a> și <a href="/privacy">Politica de Confidențialitate</a></label>
            </div>
            
            <button type="submit" className="signup-button">
              Creează cont
            </button>
          </form>
          
          <div className="signup-footer">
            <p>Ai deja un cont? <a href="/login">Conectează-te</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;