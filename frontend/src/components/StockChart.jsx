import React from 'react';
import PropTypes from 'prop-types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label, color }) => {
  if (active && payload && payload.length) {
    let displayDate;
    try {
      const dateObj = new Date(label);
      if (isNaN(dateObj)) {
        displayDate = label;
      } else {
        if (label && label.includes(':')) {
          displayDate = dateObj.toLocaleDateString('ro-RO', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
        } else {
          displayDate = dateObj.toLocaleDateString('ro-RO', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          });
        }
      }
    } catch (e) {
      displayDate = label;
    }

    const hasOHLC = payload[0].payload && 
                    payload[0].payload.open !== undefined && 
                    payload[0].payload.high !== undefined && 
                    payload[0].payload.low !== undefined;

    return (
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: '12px',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        fontSize: '14px'
      }}>
        <p style={{ 
          margin: '0 0 8px 0', 
          fontWeight: 'bold',
          color: '#333'
        }}>
          {displayDate}
        </p>
        <p style={{ 
          margin: '4px 0', 
          color: color,
          fontWeight: '500'
        }}>
          <strong>Preț:</strong> ${payload[0].value.toFixed(2)}
        </p>
        
        {hasOHLC && (
          <div style={{ 
            marginTop: '8px',
            borderTop: '1px solid #eee',
            paddingTop: '8px'
          }}>
            <p style={{ margin: '4px 0', color: '#666' }}>
              <strong>Deschidere:</strong> ${payload[0].payload.open.toFixed(2)}
            </p>
            <p style={{ margin: '4px 0', color: '#666' }}>
              <strong>Maxim:</strong> ${payload[0].payload.high.toFixed(2)}
            </p>
            <p style={{ margin: '4px 0', color: '#666' }}>
              <strong>Minim:</strong> ${payload[0].payload.low.toFixed(2)}
            </p>
            {payload[0].payload.volume && (
              <p style={{ margin: '4px 0', color: '#666' }}>
                <strong>Volum:</strong> {payload[0].payload.volume.toLocaleString()}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
  return null;
};

const StockChart = ({ data, color = '#1976d2', isIntraday = false }) => {
  if (!data || data.length === 0) {
    return <div>Nu există date disponibile pentru acest interval.</div>;
  }

  const validData = data.filter(item => {
    if (!item) {
      return false;
    }
    
    const marketstackLast = item.marketstack_last;
    const price = item.price;
    const hasValidPrice = (marketstackLast !== undefined && 
                         marketstackLast !== null && 
                         !isNaN(Number(marketstackLast))) ||
                        (price !== undefined && 
                         price !== null && 
                         !isNaN(Number(price)));
    
    const dateStr = item.date;
    const dateObj = new Date(dateStr);
    const hasValidDate = dateStr && dateObj.toString() !== 'Invalid Date';
    
    return hasValidPrice && hasValidDate;
  });
  
  if (validData.length === 0) {
    return <div>Nu există date valide disponibile pentru acest interval.</div>;
  }

  const prices = validData.map(item => {
    const price = item.marketstack_last !== undefined ? Number(item.marketstack_last) : Number(item.price);
    return price;
  });
  
  const minPrice = Math.min(...prices) * 0.997;
  const maxPrice = Math.max(...prices) * 1.003;

  const formattedData = validData.map(item => {
    const numericPrice = item.marketstack_last !== undefined ? Number(item.marketstack_last) : Number(item.price);
    
    let formattedDate;
    try {
      const dateObj = new Date(item.date);
      if (isNaN(dateObj.getTime())) {
        formattedDate = '';
      } else if (isIntraday) {
        formattedDate = dateObj.toLocaleTimeString('ro-RO', {
          hour: '2-digit',
          minute: '2-digit'
        });
      } else {
        formattedDate = dateObj.toLocaleDateString('ro-RO', {
          month: 'short',
          day: 'numeric'
        });
      }
    } catch (e) {
      formattedDate = '';
    }

    const formattedItem = {
      ...item,
      date: item.date,
      formattedDate,
      price: numericPrice,
      open: item.open !== undefined ? Number(item.open) : undefined,
      high: item.high !== undefined ? Number(item.high) : undefined,
      low: item.low !== undefined ? Number(item.low) : undefined,
      volume: item.volume !== undefined ? Number(item.volume) : undefined
    };
    
    return formattedItem;
  });

  formattedData.sort((a, b) => new Date(a.date) - new Date(b.date));

  const formatXAxis = (tickItem) => {
    if (!tickItem) return '';
    
    try {
      const date = new Date(tickItem);
      
      if (isNaN(date.getTime())) {
        return tickItem;
      }
      
      if (isIntraday) {
        return date.toLocaleTimeString('ro-RO', { 
          hour: '2-digit',
          minute: '2-digit'
        });
      } else if (validData.length > 180) {
        return date.toLocaleDateString('ro-RO', { 
          month: 'short',
          year: '2-digit'
        });
      } else if (validData.length > 60) {
        return date.toLocaleDateString('ro-RO', { month: 'short' });
      } else {
        return date.toLocaleDateString('ro-RO', { 
          day: 'numeric',
          month: 'short'
        });
      }
    } catch (e) {
      return tickItem;
    }
  };

  const formatYAxis = (value) => {
    if (typeof value !== 'number' || isNaN(value)) {
      return '$0';
    }
    
    if (value < 10) {
      return `$${value.toFixed(2)}`;
    } else if (value < 1000) {
      return `$${value.toFixed(1)}`;
    } else {
      return `$${value.toFixed(0)}`;
    }
  };

  const getTickCount = () => {
    if (validData.length <= 1) {
      return 1;
    }
    
    if (isIntraday) {
      return Math.min(8, validData.length);
    }
    
    if (validData.length > 100) {
      return 8;
    } else if (validData.length > 30) {
      return 6;
    } else if (validData.length > 10) {
      return 5;
    } else {
      return validData.length;
    }
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart 
        data={formattedData} 
        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
      >
        <CartesianGrid 
          stroke="#f0f0f0" 
          strokeDasharray="3 3" 
          vertical={false}
        />
        <XAxis 
          dataKey="date" 
          tickFormatter={formatXAxis} 
          minTickGap={30}
          tick={{ fontSize: 12, fill: '#666' }}
          axisLine={{ stroke: '#e0e0e0' }}
          interval={isIntraday ? Math.floor(validData.length / getTickCount()) : 'preserveEnd'}
        />
        <YAxis 
          domain={[minPrice, maxPrice]} 
          tickFormatter={formatYAxis}
          tick={{ fontSize: 12, fill: '#666' }}
          axisLine={{ stroke: '#e0e0e0' }}
          ticks={[
            minPrice, 
            minPrice + (maxPrice - minPrice) * 0.25, 
            minPrice + (maxPrice - minPrice) * 0.5, 
            minPrice + (maxPrice - minPrice) * 0.75, 
            maxPrice
          ]}
        />
        <Tooltip 
          content={<CustomTooltip color={color} />}
          cursor={{ stroke: '#e0e0e0', strokeWidth: 1 }}
        />
        <Line 
          type="linear"
          dataKey="price" 
          stroke={color} 
          dot={false}
          strokeWidth={1.5}
          activeDot={{ 
            r: 4, 
            stroke: color, 
            strokeWidth: 1.5, 
            fill: '#fff',
            style: { filter: 'drop-shadow(0 0 1px rgba(0,0,0,0.2))' }
          }} 
          connectNulls={true}
          animationDuration={0}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

StockChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
      open: PropTypes.number,
      high: PropTypes.number,
      low: PropTypes.number,
      volume: PropTypes.number
    })
  ).isRequired,
  color: PropTypes.string,
  isIntraday: PropTypes.bool
};

export default StockChart;