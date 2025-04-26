import React from "react";
import styles from "../styles/Home.module.css";
import StockDashboard from "./StockDashboard";
import PhoneWithChart from "../components/Phone.jsx";

const HomePage = () => {
  return (
    <div className={styles.homepage}>
      <div className={styles.backgroundImage}></div>
      
      <div className={styles.container}>
        <div className={styles.phoneSection}>
          <PhoneWithChart />
        </div>
        
        <StockDashboard />
      </div>
    </div>
  );
};

export default HomePage;