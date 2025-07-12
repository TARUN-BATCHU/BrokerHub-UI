import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import CreatePassword from './pages/CreatePassword';
import ChangePassword from './pages/ChangePassword';
import VerifyAccount from './pages/VerifyAccount';
import OTPVerification from './pages/OTPVerification';
import Dashboard from './pages/Dashboard';
import CreateMerchant from './pages/CreateMerchant';
import FinancialYears from './pages/FinancialYears';
import RouteExplorer from './pages/RouteExplorer';
import TodayMarket from './pages/TodayMarket';
import CalendarView from './pages/CalendarView';
import DailyLedger from './pages/DailyLedger';
import TransactionDetailEnhanced from './pages/TransactionDetailEnhanced';
import LedgerManagement from './pages/LedgerManagement';
import Products from './pages/Products';
import Merchants from './pages/Merchants';
import GlobalNavigation from './components/GlobalNavigation';
import ProtectedRoute from './components/ProtectedRoute';

// Public Route component (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
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
                path="/verify-otp"
                element={
                  <PublicRoute>
                    <OTPVerification />
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
                path="/route-explorer"
                element={
                  <ProtectedRoute>
                    <RouteExplorer />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/today-market"
                element={
                  <ProtectedRoute>
                    <TodayMarket />
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
                path="/daily-ledger"
                element={
                  <ProtectedRoute>
                    <DailyLedger />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/transaction-detail"
                element={
                  <ProtectedRoute>
                    <TransactionDetailEnhanced />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ledger-management"
                element={
                  <ProtectedRoute>
                    <LedgerManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/products"
                element={
                  <ProtectedRoute>
                    <Products />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/merchants"
                element={
                  <ProtectedRoute>
                    <Merchants />
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
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;