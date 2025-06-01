import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import CreatePassword from './pages/CreatePassword';
import ChangePassword from './pages/ChangePassword';
import VerifyAccount from './pages/VerifyAccount';
import Dashboard from './pages/Dashboard';
import CreateMerchant from './pages/CreateMerchant';
import FinancialYears from './pages/FinancialYears';
import DailyLedger from './pages/DailyLedger';
import LedgerDetail from './pages/LedgerDetail';
import CalendarView from './pages/CalendarView';
import LedgerSummary from './pages/LedgerSummary';
import CreateTransaction from './pages/CreateTransaction';
import EditTransaction from './pages/EditTransaction';
import TestLedger from './pages/TestLedger';
import GlobalNavigation from './components/GlobalNavigation';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('authToken');
  return token ? children : <Navigate to="/login" replace />;
};

// Public Route component (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('authToken');
  return token ? <Navigate to="/dashboard" replace /> : children;
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="App">
          {/* Show global navigation on all pages except login/signup */}
          <GlobalNavigation />
          <Routes>
          {/* Public routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            }
          />
          <Route
            path="/create-password"
            element={
              <PublicRoute>
                <CreatePassword />
              </PublicRoute>
            }
          />
          <Route
            path="/verify-account"
            element={
              <PublicRoute>
                <VerifyAccount />
              </PublicRoute>
            }
          />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/change-password"
            element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-merchant"
            element={
              <ProtectedRoute>
                <CreateMerchant />
              </ProtectedRoute>
            }
          />
          <Route
            path="/financial-years"
            element={
              <ProtectedRoute>
                <FinancialYears />
              </ProtectedRoute>
            }
          />
          <Route
            path="/daily-ledger"
            element={
              <ProtectedRoute>
                <DailyLedger />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ledger-detail"
            element={
              <ProtectedRoute>
                <LedgerDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/calendar-view"
            element={
              <ProtectedRoute>
                <CalendarView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ledger-summary"
            element={
              <ProtectedRoute>
                <LedgerSummary />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-transaction"
            element={
              <ProtectedRoute>
                <CreateTransaction />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-transaction"
            element={
              <ProtectedRoute>
                <EditTransaction />
              </ProtectedRoute>
            }
          />
          <Route
            path="/test-ledger"
            element={
              <ProtectedRoute>
                <TestLedger />
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
    </ThemeProvider>
  );
}

export default App;
