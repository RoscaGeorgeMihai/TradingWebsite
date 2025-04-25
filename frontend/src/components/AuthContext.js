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
        isAdmin: action.payload.role === 'admin'
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        loading: false,
        isAdmin: false
      };
    case 'USER_LOADED':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        loading: false,
        isAdmin: action.payload.role === 'admin'
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        loading: false,
        isAdmin: false
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: true
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
    isAdmin: false
  };

  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user only once when component mounts
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const res = await api.get('/api/auth/me');
        dispatch({
          type: 'USER_LOADED',
          payload: res.data
        });
      } catch (err) {
        dispatch({ type: 'AUTH_ERROR' });
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      dispatch({ type: 'SET_LOADING' });
      const res = await api.post('/api/auth/login', { email, password });
      
      dispatch({
        type: 'LOGIN',
        payload: res.data.user
      });
      
      return true;
    } catch (err) {
      dispatch({ type: 'AUTH_ERROR' });
      throw err;
    }
  };

  const register = async (firstName, lastName, email, password) => {
    try {
      dispatch({ type: 'SET_LOADING' });
      const res = await api.post('/api/auth/register', { 
        firstName, 
        lastName, 
        email, 
        password 
      });
      
      dispatch({
        type: 'LOGIN',
        payload: res.data.user
      });
      
      return true;
    } catch (err) {
      dispatch({ type: 'AUTH_ERROR' });
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
      dispatch({ type: 'LOGOUT' });
    } catch (err) {
      console.error('Logout error:', err);
      // Still logout on frontend even if backend fails
      dispatch({ type: 'LOGOUT' });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: state.isAuthenticated,
        isAdmin: state.isAdmin,
        user: state.user,
        loading: state.loading,
        login,
        register,
        logout
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