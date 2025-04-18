import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../components/AuthContext";
import styles from "../styles/Navbar.module.css";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  
  const { isAuthenticated, isAdmin, logout } = useContext(AuthContext);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleNavigation = (path, event) => {
    event.preventDefault();
    navigate(path);
    setMenuOpen(false);
  };
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarContainer}>
        <div className={styles.logoContainer}>
          <div className={styles.logo}>
            <h1 className={styles.logoText}>
              TR<span className={styles.accent}>A</span>DING APP
            </h1>
            <p className={styles.tagline}>Build wealth in time</p>
          </div>
        </div>

        <ul className={`${styles.navLinks} ${menuOpen ? styles.open : ""}`}>
          <li>
            <a href="/" onClick={(e) => handleNavigation("/", e)}>
              Home
            </a>
          </li>
          <li>
            <a href="/invest" onClick={(e) => handleNavigation("/invest", e)}>
              Invest
            </a>
          </li>
          <li className={styles.dropdown}>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                toggleDropdown();
              }}
            >
              Markets <span className={styles.dropdownIcon}>▼</span>
            </a>
            <ul className={`${styles.dropdownMenu} ${dropdownOpen ? styles.active : ""}`}>
              <li>
                <a href="/crypto" onClick={(e) => handleNavigation("/crypto", e)}>
                  Crypto
                </a>
              </li>
              <li>
                <a href="/stocks" onClick={(e) => handleNavigation("/stocks", e)}>
                  Stocks
                </a>
              </li>
              <li>
                <a
                  href="/commodities"
                  onClick={(e) => handleNavigation("/commodities", e)}
                >
                  Commodities
                </a>
              </li>
            </ul>
          </li>
          <li>
            <a
              href="/portfolio"
              onClick={(e) => handleNavigation("/portfolio", e)}
            >
              Portfolio
            </a>
          </li>
          <li>
            <a href="/news" onClick={(e) => handleNavigation("/news", e)}>
              News
            </a>
          </li>
          
          {/* Admin link */}
          {isAuthenticated && isAdmin && (
            <li>
              <a
                href="/admin"
                onClick={(e) => handleNavigation("/admin", e)}
                className={styles.adminLink}
              >
                Admin
              </a>
            </li>
          )}
        </ul>

        <div className={styles.authButtons}>
          {isAuthenticated ? (
            <button className={styles.logoutBtn} onClick={handleLogout}>
              Log Out
            </button>
          ) : (
            <>
              <button className={styles.loginBtn} onClick={() => navigate("/login")}>
                Log In
              </button>
              <button className={styles.signupBtn} onClick={() => navigate("/signup")}>
                Sign Up
              </button>
            </>
          )}
        </div>

        <button className={styles.menuBtn} onClick={toggleMenu}>
          ☰
        </button>
      </div>
    </nav>
  );
}

export default Navbar;