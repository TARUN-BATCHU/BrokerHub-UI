import React from 'react';
import ChartErrorState from '../components/ChartErrorState';
import { ThemeProvider } from '../contexts/ThemeContext';

// Simple test component to verify ChartErrorState works
const ChartErrorTest = () => {
  const handleRetry = () => {
    console.log('Retry clicked');
    alert('Retry functionality working!');
  };

  return (
    <ThemeProvider>
      <div style={{ padding: '20px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
        <h1>Chart Error State Test</h1>
        
        <div style={{ marginBottom: '20px' }}>
          <h2>Error with Retry Button</h2>
          <div style={{ height: '300px', border: '1px solid #ccc' }}>
            <ChartErrorState 
              error="Failed to load sales data from server. Connection timeout occurred."
              title="Sales Chart"
              onRetry={handleRetry}
            />
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h2>Error without Retry Button</h2>
          <div style={{ height: '300px', border: '1px solid #ccc' }}>
            <ChartErrorState 
              error="API endpoint not available. Please contact administrator."
              title="Analytics Data"
            />
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default ChartErrorTest;