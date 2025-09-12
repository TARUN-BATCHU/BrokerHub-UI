import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { brokerageAPI } from '../services/brokerageAPI';

const DocumentContext = createContext();

const documentReducer = (state, action) => {
  switch (action.type) {
    case 'SET_DOCUMENTS':
      return {
        ...state,
        documents: action.payload,
        loading: false,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case 'ADD_DOCUMENT':
      return {
        ...state,
        documents: [action.payload, ...state.documents],
      };
    case 'UPDATE_DOCUMENT':
      return {
        ...state,
        documents: state.documents.map(doc =>
          doc.documentId === action.payload.documentId
            ? { ...doc, ...action.payload }
            : doc
        ),
      };
    default:
      return state;
  }
};

export const DocumentProvider = ({ children }) => {
  const [state, dispatch] = useReducer(documentReducer, {
    documents: [],
    loading: false,
    error: null,
  });

  const fetchDocuments = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await brokerageAPI.getDocumentStatus();
      if (response.success !== false) {
        dispatch({ type: 'SET_DOCUMENTS', payload: response.data || [] });
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  // Remove automatic polling - only fetch when explicitly requested

  const value = {
    ...state,
    fetchDocuments,
    dispatch,
  };

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocuments = () => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocuments must be used within a DocumentProvider');
  }
  return context;
};