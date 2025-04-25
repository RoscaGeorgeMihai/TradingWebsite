import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Home from './pages/Home';
import SignUp from './pages/Signup';
import Invest from './pages/Invest';
import Stocks from './pages/Stocks';
import News from './pages/News';
import StockDetails from './pages/StockDetails';
import Portfolio from './pages/Portfolio';
import AdminPage from './pages/AdminPage';
import BuyStock from './pages/BuyStock';
import SellStock from './pages/SellStock';
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
          <Route path="/stocks" element={<Stocks />} />
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
          <Route 
            path="/buy/:symbol" 
            element={
              <PrivateRoute>
                <BuyStock />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/sell/:symbol" 
            element={
              <PrivateRoute>
                <SellStock />
              </PrivateRoute>
            } 
          />
          
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