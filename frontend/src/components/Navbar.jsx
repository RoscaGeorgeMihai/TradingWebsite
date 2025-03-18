import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Importă useNavigate
import "../styles/Navbar.css";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate(); // Inițializează navigatorul

  return (
    <nav className="navbar">
      <div className="navbar-container">
      <div className="logo-container">
        <div className="logo">
          <h1 className="logo-text">TR<span className="accent">A</span>DING APP</h1>
          <p className="tagline">Build wealth in time</p>
        </div>
      </div>

        <ul className={`nav-links ${menuOpen ? "open" : ""}`}>
          <li><a href="/">Home</a></li>
          <li><a href="/invest">Invest</a></li>
          <li className="dropdown">
            <a href="#">Markets</a>
            <ul className="dropdown-menu">
              <li><a href="/crypto">Crypto</a></li>
              <li><a href="/stocks">Stocks</a></li>
              <li><a href="/commodities">Commodities</a></li>
            </ul>
          </li>
          <li><a href="/news">News</a></li>
        </ul>

        <div className="auth-buttons">
          <button className="login-btn" onClick={() => navigate("/login")}>
            Log In
          </button>
          <button className="signup-btn" onClick={() => navigate("/signup")}>Sign Up</button>
        </div>

        <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
