import React, { createContext, useReducer, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import api from '../services/axios';
import { AuthContext } from './AuthContext';

const InvestContext = createContext();

const investReducer = (state, action) => {
  switch (action.type) {
    case 'LOAD_PROFILE':
      return {
        ...state,
        totalBalance: action.payload.totalBalance,
        availableFunds: action.payload.availableFunds,
        investedAmount: action.payload.investedAmount,
        loading: false
      };
    case 'LOAD_TRANSACTIONS':
      return {
        ...state,
        transactions: action.payload,
        loading: false
      };
    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [action.payload.transaction, ...state.transactions],
        totalBalance: action.payload.profile.totalBalance,
        availableFunds: action.payload.profile.availableFunds,
        investedAmount: action.payload.profile.investedAmount,
        loading: false
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: true
      };
    case 'RESET':
      return {
        totalBalance: 0,
        availableFunds: 0,
        investedAmount: 0,
        transactions: [],
        loading: false
      };
    default:
      return state;
  }
};

const InvestProvider = ({ children }) => {
  const initialState = {
    totalBalance: 0,
    availableFunds: 0,
    investedAmount: 0,
    transactions: [],
    loading: true
  };

  const [state, dispatch] = useReducer(investReducer, initialState);
  const { isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    if (isAuthenticated) {
      loadProfile();
    } else {
      dispatch({ type: 'RESET' });
    }
  }, [isAuthenticated]);

  const loadProfile = async () => {
    dispatch({ type: 'SET_LOADING' });
    try {
      console.log('Începe încărcarea profilului...');
      const res = await api.get('/invest/profile');
      console.log('Răspuns primit:', res.data);
      
      dispatch({
        type: 'LOAD_PROFILE',
        payload: res.data.profile
      });
      
      dispatch({
        type: 'LOAD_TRANSACTIONS',
        payload: res.data.transactions
      });
    } catch (err) {
      console.error('Eroare la încărcarea profilului:', err);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const depositFunds = async (amount, cardDetails) => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const res = await api.post('/invest/deposit', {
        amount,
        ...cardDetails
      });
      
      // În loc să declanșăm două acțiuni separate, trimitem tot într-o singură acțiune
      dispatch({
        type: 'ADD_TRANSACTION',
        payload: {
          transaction: res.data.transaction,
          profile: res.data.profile
        }
      });
      
      return { success: true };
    } catch (err) {
      console.error('Eroare la depozitare:', err);
      return { 
        success: false, 
        message: err.response?.data?.message || 'Eroare la procesarea depozitului' 
      };
    }
  };

  const withdrawFunds = async (amount, iban) => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const res = await api.post('/invest/withdraw', {
        amount,
        iban
      });

      // În loc să declanșăm două acțiuni separate, trimitem tot într-o singură acțiune
      dispatch({
        type: 'ADD_TRANSACTION',
        payload: {
          transaction: res.data.transaction,
          profile: res.data.profile
        }
      });
      
      return { success: true };
    } catch (err) {
      console.error('Eroare la retragere:', err);
      return { 
        success: false, 
        message: err.response?.data?.message || 'Eroare la procesarea retragerii' 
      };
    }
  };

  return (
    <InvestContext.Provider
      value={{
        totalBalance: state.totalBalance,
        availableFunds: state.availableFunds,
        investedAmount: state.investedAmount,
        transactions: state.transactions,
        loading: state.loading,
        depositFunds,
        withdrawFunds,
        loadProfile
      }}
    >
      {children}
    </InvestContext.Provider>
  );
};

InvestProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export { InvestContext, InvestProvider };