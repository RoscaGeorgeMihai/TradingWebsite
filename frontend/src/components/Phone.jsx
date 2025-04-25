import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Clock, Battery, Wifi, Signal, BarChart2, Volume2, VolumeX } from 'lucide-react';
import styles from '../styles/Phone.module.css';

const PhoneWithChart = () => {
  const [points, setPoints] = useState('');
  const [dataPoints, setDataPoints] = useState([]);
  const [currentValue, setCurrentValue] = useState(183.50);
  const [prevValue, setPrevValue] = useState(183.50);
  const [time, setTime] = useState('');
  const [batteryLevel, setBatteryLevel] = useState(76);
  const [isMuted, setIsMuted] = useState(false);
  const [signalStrength, setSignalStrength] = useState(3);
  
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const mins = now.getMinutes().toString().padStart(2, '0');
      setTime(`${hours}:${mins}`);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    const initialData = Array.from({ length: 30 }, (_, i) => ({
      x: i * 8,
      y: 50 + Math.sin(i * 0.2) * 15 + Math.random() * 10
    }));
    setDataPoints(initialData);

    const interval = setInterval(() => {
      setDataPoints(prevData => {
        setPrevValue(currentValue);
        
        const newData = [...prevData.slice(1)];
        const lastPoint = prevData[prevData.length - 1];
        
        const trend = Math.random() > 0.5 ? 0.2 : -0.2;
        const seasonal = Math.sin(lastPoint.x * 0.01) * 2;
        const noise = (Math.random() - 0.5) * 6;
        
        const newY = lastPoint.y + trend + seasonal + noise;
        const boundedY = Math.max(20, Math.min(80, newY));
        
        const changePercent = (boundedY - lastPoint.y) / lastPoint.y;
        const newValue = currentValue * (1 + changePercent * 0.01);
        setCurrentValue(Math.round(newValue * 100) / 100);
        
        newData.push({
          x: lastPoint.x + 8,
          y: boundedY
        });
        
        return newData;
      });
    }, 300);

    return () => clearInterval(interval);
  }, [currentValue]);

  useEffect(() => {
    if (dataPoints.length > 0) {
      const pathPoints = dataPoints.map((point, index) => 
        `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
      ).join(' ');
      setPoints(pathPoints);
    }
  }, [dataPoints]);

  const isPositive = currentValue > prevValue;
  const percentChange = prevValue ? ((currentValue - prevValue) / prevValue * 100).toFixed(2) : '0.00';

  return (
    <div className={styles.container}>
      <div className={styles.phoneContainer}>
        <div className={styles.ambientLight}></div>
        
        <div className={styles.phoneBody}>
          <div className={styles.phoneFrame}></div>
          <div className={styles.phoneGlow}></div>
          <div className={styles.edgeHighlight}></div>
          
          <div className={styles.speakers}>
            <div className={styles.speakerHole}></div>
            <div className={styles.speakerHole}></div>
            <div className={styles.speakerHole}></div>
            <div className={styles.speakerHole}></div>
            <div className={styles.speakerHole}></div>
          </div>
          
          <div className={styles.notch}>
            <div className={styles.notchDot1}></div>
            <div className={styles.notchDot2}></div>
            <div className={styles.notchDot3}></div>
          </div>
          
          <div className={styles.buttonRight1}></div>
          <div className={styles.buttonRight2}></div>
          <div className={styles.buttonRight3}></div>
          <div className={styles.buttonLeft}></div>
          <div className={styles.chargingPort}></div>
          
          <div className={styles.screen}>
            <div className={styles.statusBar}>
              <span>{time || '21:45'}</span>
              <div className={styles.statusIcons}>
                <div className={styles.signalStrength}>
                  {[...Array(4)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`${styles.signalBar} ${i < signalStrength ? styles.active : ''}`}
                    ></div>
                  ))}
                </div>
                <Wifi size={12} />
                <div className={styles.batteryContainer}>
                  <span className={styles.batteryLevel}>{batteryLevel}%</span>
                  <div className={styles.batteryIcon}>
                    <div 
                      className={styles.batteryFill}
                      style={{ width: `${batteryLevel}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className={styles.appContent}>
              <div className={styles.appHeader}>
                <h2 className={styles.appTitle}>
                  <BarChart2 size={20} className={styles.appIcon} />
                  Trading App
                </h2>
                <div className={styles.updateInfo}>
                  <Clock size={14} className={styles.updateIcon} />
                  <span>Updated just now</span>
                </div>
              </div>
              
              <div className={styles.stockInfo}>
                <div className={styles.stockHeader}>
                  <div>
                    <h3 className={styles.stockName}>AAPL</h3>
                    <span className={styles.stockCompany}>Apple Inc.</span>
                  </div>
                  <div>
                    <div className={styles.stockPrice}>${currentValue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                    <div className={`${styles.priceChange} ${isPositive ? styles.priceUp : styles.priceDown}`}>
                      {isPositive ? <TrendingUp size={14} className={styles.trendIcon} /> : <TrendingDown size={14} className={styles.trendIcon} />}
                      {isPositive ? '+' : ''}{percentChange}%
                    </div>
                  </div>
                </div>
              </div>
              
              <div className={styles.chartContainer}>
                <div className={styles.chartHeader}>
                  <span>1D</span>
                  <div className={styles.timeOptions}>
                    <span className={styles.activeTime}>1H</span>
                    <span>4H</span>
                    <span>1D</span>
                    <span>1W</span>
                  </div>
                </div>
                
                <svg width="100%" height="180" viewBox="0 0 260 100" preserveAspectRatio="none">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <line 
                      key={`horizontal-${i}`}
                      x1="0" 
                      y1={i * 20} 
                      x2="260" 
                      y2={i * 20} 
                      stroke="#333" 
                      strokeWidth="1"
                      strokeDasharray="2,2"
                    />
                  ))}
                  {Array.from({ length: 9 }).map((_, i) => (
                    <line 
                      key={`vertical-${i}`}
                      x1={i * 30} 
                      y1="0" 
                      x2={i * 30} 
                      y2="100" 
                      stroke="#333" 
                      strokeWidth="1"
                      strokeDasharray="2,2"
                    />
                  ))}
                  
                  <defs>
                    <linearGradient id="graphGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor={isPositive ? "#10B98155" : "#EF444455"} />
                      <stop offset="100%" stopColor={isPositive ? "#10B98100" : "#EF444400"} />
                    </linearGradient>
                  </defs>
                  
                  <path 
                    d={`${points} L ${dataPoints.length > 0 ? dataPoints[dataPoints.length-1].x : 0} 100 L ${dataPoints.length > 0 ? dataPoints[0].x : 0} 100 Z`} 
                    fill="url(#graphGradient)"
                  />
                  
                  <path 
                    d={points} 
                    fill="none" 
                    stroke={isPositive ? "#10B981" : "#EF4444"} 
                    strokeWidth="2" 
                    strokeLinejoin="round"
                  />
                  
                  {dataPoints.filter((_, i) => i % 5 === 0 || i === dataPoints.length - 1).map((point, index) => (
                    <circle 
                      key={`point-${index}`}
                      cx={point.x} 
                      cy={point.y} 
                      r="2" 
                      fill={isPositive ? "#10B981" : "#EF4444"}
                      stroke="#222"
                      strokeWidth="1"
                    />
                  ))}
                  
                  <text x="2" y="15" fill="#999" fontSize="8">$185.50</text>
                  <text x="2" y="95" fill="#999" fontSize="8">$182.00</text>
                </svg>
              </div>
              
              <div className={styles.stockDetails}>
                <div className={styles.detailBox}>
                  <div className={styles.detailLabel}>Volume 24h</div>
                  <div className={styles.detailValue}>$3.2B</div>
                </div>
                <div className={styles.detailBox}>
                  <div className={styles.detailLabel}>High 24h</div>
                  <div className={styles.detailValue}>$184.95</div>
                </div>
                <div className={styles.detailBox}>
                  <div className={styles.detailLabel}>Low 24h</div>
                  <div className={styles.detailValue}>$182.11</div>
                </div>
              </div>
              
              <div className={styles.moreDetails}>
                <div className={styles.detailsGrid}>
                  <div>
                    <div className={styles.detailLabel}>Open</div>
                    <div className={styles.detailValue}>$182.75</div>
                  </div>
                  <div>
                    <div className={styles.detailLabel}>Prev Close</div>
                    <div className={styles.detailValue}>$181.92</div>
                  </div>
                  <div>
                    <div className={styles.detailLabel}>Market Cap</div>
                    <div className={styles.detailValue}>$2.8T</div>
                  </div>
                  <div>
                    <div className={styles.detailLabel}>P/E Ratio</div>
                    <div className={styles.detailValue}>28.5</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className={styles.navBar}>
              <div className={styles.homeIndicator}></div>
            </div>
          </div>
          
          <div className={styles.screenShadow}></div>
          <div className={styles.screenGradient}></div>
        </div>
      </div>
    </div>
  );
};

export default PhoneWithChart;