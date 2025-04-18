import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Home from './pages/Home';
import SignUp from './pages/Signup';
import Crypto from './pages/Crypto';
import Invest from './pages/Invest';
import Stocks from './pages/Stocks';
import Commodities from './pages/Commodities';
import News from './pages/News';
import StockDetails from './pages/StockDetails';
import CryptoDetails from './pages/CryptoDetails';
import CommoditiesDetails from './pages/CommoditiesDetails';
import Portfolio from './pages/Portfolio';
import AdminPage from './pages/AdminPage';
import { AuthProvider } from './components/AuthContext';
import { InvestProvider } from './components/InvestContext';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

// AppContent component to use location
function AppContent() {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');
  
  return (
    <>
      {!isAdminPage && <Navbar />}
      <div className="page-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route 
            path="/invest" 
            element={
              <PrivateRoute>
                <Invest />
              </PrivateRoute>
            } 
          />
          <Route path="/crypto" element={<Crypto />} />
          <Route path="/stocks" element={<Stocks />} />
          <Route path="/commodities" element={<Commodities />} />
          <Route 
            path="/portfolio" 
            element={
              <PrivateRoute>
                <Portfolio />
              </PrivateRoute>
            } 
          />
          <Route path="/news" element={<News />} />
          <Route path="/stocks/:symbol" element={<StockDetails />} />
          <Route path="/crypto/:symbol" element={<CryptoDetails />} />
          <Route path="/commodities/:symbol" element={<CommoditiesDetails />} />
          
          {/* Admin Route */}
          <Route
            path="/admin/*"
            element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            }
          />
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <InvestProvider>
        <Router>
          <AppContent />
        </Router>
      </InvestProvider>
    </AuthProvider>
  );
}

export default App;