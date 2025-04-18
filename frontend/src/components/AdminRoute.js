import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { AuthContext } from './AuthContext';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Se încarcă...</div>;
  }

  // Verifică dacă utilizatorul este autentificat ȘI are rol de admin
  return isAuthenticated && isAdmin ? children : <Navigate to="/" />;
};

AdminRoute.propTypes = {
  children: PropTypes.node.isRequired
};

export default AdminRoute;