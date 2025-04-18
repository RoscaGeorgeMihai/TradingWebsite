import React, { createContext, useReducer, useEffect } from 'react';
import PropTypes from 'prop-types';
import api from '../services/axios';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        loading: false,
        isAdmin: action.payload.role === 'admin' // Adaugă verificarea pentru admin
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        loading: false,
        isAdmin: false // Resetează starea de admin
      };
    case 'USER_LOADED':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        loading: false,
        isAdmin: action.payload.role === 'admin' // Verifică rolul la încărcarea utilizatorului
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        loading: false,
        isAdmin: false // Resetează starea de admin în caz de eroare
      };
    default:
      return state;
  }
};

const AuthProvider = ({ children }) => {
  const initialState = {
    isAuthenticated: false,
    user: null,
    loading: true,
    isAdmin: false // Adaugă starea inițială pentru admin
  };

  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      await api.post('/auth/login', { email, password });
      
      dispatch({
        type: 'LOGIN',
        payload: { id: 'authenticated' } // Se va înlocui cu datele utilizatorului după loadUser
      });
      
      loadUser(); // Încarcă datele utilizatorului, inclusiv rolul
      return true;
    } catch (err) {
      dispatch({ type: 'AUTH_ERROR' });
      return false;
    }
  };

  const register = async (firstName, lastName, email, password) => {
    try {
      await api.post('/auth/register', { 
        firstName, 
        lastName, 
        email, 
        password 
      });
      
      dispatch({
        type: 'LOGIN',
        payload: { id: 'authenticated' }
      });
      
      loadUser();
      return true;
    } catch (err) {
      dispatch({ type: 'AUTH_ERROR' });
      return false;
    }
  };

  const logout = async () => {
    await api.post('/auth/logout');
    dispatch({ type: 'LOGOUT' });
  };

  const loadUser = async () => {
    try {
      const res = await api.get('/auth/me');
      dispatch({
        type: 'USER_LOADED',
        payload: res.data
      });
    } catch (err) {
      dispatch({ type: 'AUTH_ERROR' });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: state.isAuthenticated,
        isAdmin: state.isAdmin, // Expune starea de admin
        user: state.user,
        loading: state.loading,
        login,
        register,
        logout,
        loadUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export { AuthContext, AuthProvider };