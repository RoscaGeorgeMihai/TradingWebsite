import React from 'react';
import PropTypes from 'prop-types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Îmbunătățim tooltip-ul pentru a afișa mai multe informații
const CustomTooltip = ({ active, payload, label, color }) => {
  if (active && payload && payload.length) {
    let displayDate;
    try {
      const dateObj = new Date(label);
      if (isNaN(dateObj)) {
        displayDate = label; // Dacă nu putem converti, folosim valoarea originală
      } else {
        // Verificăm dacă label-ul include și ora (pentru intraday)
        if (label && label.includes(':')) {
          // Format pentru date intraday: "15 Apr 2025, 14:30"
          displayDate = dateObj.toLocaleDateString('ro-RO', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          }) + ', ' + dateObj.toLocaleTimeString('ro-RO', {
            hour: '2-digit',
            minute: '2-digit'
          });
        } else {
          // Format pentru date non-intraday: "15 Apr 2025"
          displayDate = dateObj.toLocaleDateString('ro-RO', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          });
        }
      }
    } catch (e) {
      displayDate = label;
    }

    // Adăugăm mai multe informații în tooltip dacă sunt disponibile
    const hasOHLC = payload[0].payload && 
                    payload[0].payload.open !== undefined && 
                    payload[0].payload.high !== undefined && 
                    payload[0].payload.low !== undefined;

    return (
      <div style={{
        backgroundColor: 'white',
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <p style={{ margin: '0', fontWeight: 'bold' }}>{displayDate}</p>
        <p style={{ margin: '4px 0 0', color: color }}>
          <strong>Price:</strong> ${payload[0].value.toFixed(2)}
        </p>
        
        {hasOHLC && (
          <div style={{ marginTop: '4px', fontSize: '0.9em' }}>
            <p style={{ margin: '2px 0' }}>Deschidere: ${payload[0].payload.open.toFixed(2)}</p>
            <p style={{ margin: '2px 0' }}>Maxim: ${payload[0].payload.high.toFixed(2)}</p>
            <p style={{ margin: '2px 0' }}>Minim: ${payload[0].payload.low.toFixed(2)}</p>
            {payload[0].payload.volume && (
              <p style={{ margin: '2px 0' }}>Volum: {payload[0].payload.volume.toLocaleString()}</p>
            )}
          </div>
        )}
      </div>
    );
  }
  return null;
};

// PropTypes pentru CustomTooltip
CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.number,
      payload: PropTypes.object
    })
  ),
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  color: PropTypes.string
};

const StockChart = ({ data, color = '#1976d2', isIntraday = false }) => {
  // Verifică dacă există date pentru grafic
  if (!data || data.length === 0) {
    return <div>Nu există date disponibile pentru acest interval.</div>;
  }

  // Asigură-te că toate datele au valori numerice pentru 'price'
  const validData = data.filter(item => item && item.price !== undefined && item.price !== null && !isNaN(item.price));
  
  if (validData.length === 0) {
    return <div>Nu există date valide disponibile pentru acest interval.</div>;
  }

  // Determină valorile minime și maxime pentru axa Y cu o marjă mai mică pentru a evidenția mai bine variațiile
  const prices = validData.map(item => Number(item.price));
  const minPrice = Math.min(...prices) * 0.997; // 0.3% mai jos pentru a vedea mai bine variațiile
  const maxPrice = Math.max(...prices) * 1.003; // 0.3% mai sus

  // Formatează datele pentru grafic
  const formattedData = validData.map(item => {
    // Asigură-te că price este un număr
    const numericPrice = Number(item.price);
    
    // Conversia datei în funcție de tipul de date (intraday sau nu)
    let formattedDate;
    try {
      const dateObj = new Date(item.date);
      if (isNaN(dateObj.getTime())) {
        // Dacă data nu este validă, folosește un string gol
        formattedDate = '';
      } else if (isIntraday) {
        // Pentru date intraday, extragem și ora
        formattedDate = dateObj.toLocaleTimeString('ro-RO', {
          hour: '2-digit',
          minute: '2-digit'
        });
      } else {
        // Pentru date zilnice/săptămânale/lunare
        formattedDate = dateObj.toLocaleDateString('ro-RO', {
          month: 'short',
          day: 'numeric'
        });
      }
    } catch (e) {
      formattedDate = '';
    }

    return {
      ...item,
      date: item.date, // Păstrăm data originală pentru tooltip
      formattedDate,
      price: numericPrice, // Asigură-te că price este un număr
      // Păstrăm informațiile OHLC și volum dacă sunt disponibile
      open: item.open !== undefined ? Number(item.open) : undefined,
      high: item.high !== undefined ? Number(item.high) : undefined,
      low: item.low !== undefined ? Number(item.low) : undefined,
      volume: item.volume !== undefined ? Number(item.volume) : undefined
    };
  });

  // Sortăm datele după dată pentru a asigura afișarea corectă
  formattedData.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA - dateB;
  });

  // Formatează eticheta pentru axa X cu logică îmbunătățită
  const formatXAxis = (tickItem) => {
    if (!tickItem) return '';
    
    try {
      const date = new Date(tickItem);
      
      if (isNaN(date.getTime())) {
        return tickItem; // Dacă nu e o dată validă, returnează valoarea originală
      }
      
      if (isIntraday) {
        // Format pentru ore în cazul intraday
        return date.toLocaleTimeString('ro-RO', { 
          hour: '2-digit',
          minute: '2-digit'
        });
      } else if (validData.length > 180) {
        // Pentru seturi foarte mari de date, afișăm doar anul și luna
        return date.toLocaleDateString('ro-RO', { 
          month: 'short',
          year: '2-digit'
        });
      } else if (validData.length > 60) {
        // Pentru seturi mari de date, afișăm doar luna
        return date.toLocaleDateString('ro-RO', { month: 'short' });
      } else {
        // Pentru seturi medii de date, afișăm ziua și luna
        return date.toLocaleDateString('ro-RO', { 
          day: 'numeric',
          month: 'short'
        });
      }
    } catch (e) {
      return tickItem;
    }
  };

  // Formatează eticheta pentru axa Y (valori monetare)
  const formatYAxis = (value) => {
    if (typeof value !== 'number' || isNaN(value)) {
      return '$0';
    }
    
    // Formatare mai precisă în funcție de mărimea valorii
    if (value < 10) {
      return `$${value.toFixed(2)}`; // Două zecimale pentru valori mici
    } else if (value < 1000) {
      return `$${value.toFixed(1)}`; // O zecimală pentru valori medii
    } else {
      return `$${value.toFixed(0)}`; // Fără zecimale pentru valori mari
    }
  };

  // Determină câte etichete să afișăm pe axa X în funcție de numărul de puncte de date
  const getTickCount = () => {
    if (validData.length <= 1) {
      return 1;
    }
    
    if (isIntraday) {
      return Math.min(8, validData.length); // Mai multe etichete pentru intraday
    }
    
    if (validData.length > 100) {
      return 8; // Număr fix de etichete pentru seturi mari de date
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
      <LineChart data={formattedData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <CartesianGrid stroke="#f5f5f5" strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          tickFormatter={formatXAxis} 
          minTickGap={30} // Micșorăm distanța minimă între etichete pentru mai multă detaliere
          tick={{ fontSize: 12 }}
          // Evităm prea multe etichete pentru date intraday
          interval={isIntraday ? Math.floor(validData.length / getTickCount()) : 'preserveEnd'}
        />
        <YAxis 
          domain={[minPrice, maxPrice]} 
          tickFormatter={formatYAxis}
          tick={{ fontSize: 12 }}
          // Folosim algoritm pentru a determina numărul optim de intervale pe axa Y
          ticks={[
            minPrice, 
            minPrice + (maxPrice - minPrice) * 0.25, 
            minPrice + (maxPrice - minPrice) * 0.5, 
            minPrice + (maxPrice - minPrice) * 0.75, 
            maxPrice
          ]}
        />
        <Tooltip content={<CustomTooltip color={color} />} />
        <Line 
          type="linear" // Linie dreaptă între puncte pentru afișare mai exactă
          dataKey="price" 
          stroke={color} 
          dot={false} // Fără puncte pe linie pentru a evita aglomerarea
          strokeWidth={1.5} // Subțiem puțin linia pentru a fi mai clară
          activeDot={{ r: 6, stroke: color, strokeWidth: 1, fill: '#fff' }} 
          connectNulls={true}
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