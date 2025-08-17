import React, { useState, useEffect } from 'react';
import { financialYearAPI } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';

const FinancialYearSelector = ({ selectedYear, onYearChange, label = "Financial Year" }) => {
  const { theme } = useTheme();
  const [financialYears, setFinancialYears] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinancialYears();
  }, []);

  const fetchFinancialYears = async () => {
    try {
      const data = await financialYearAPI.getAllFinancialYears();
      setFinancialYears(data || []);
      
      // Auto-select current financial year if none selected
      if (!selectedYear && data && data.length > 0) {
        const currentYear = new Date().getFullYear();
        const currentFY = data.find(fy => fy.financialYearId === currentYear) || data[0];
        onYearChange(currentFY.financialYearId);
      }
    } catch (error) {
      console.error('Error fetching financial years:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ color: theme.textSecondary }}>
        Loading financial years...
      </div>
    );
  }

  return (
    <div>
      <label style={{ 
        display: 'block', 
        marginBottom: '5px', 
        fontWeight: 'bold', 
        color: theme.textPrimary 
      }}>
        {label}:
      </label>
      <select
        value={selectedYear || ''}
        onChange={(e) => onYearChange(parseInt(e.target.value))}
        style={{
          width: '100%',
          padding: '8px 12px',
          border: `1px solid ${theme.border}`,
          borderRadius: '4px',
          fontSize: '14px',
          backgroundColor: theme.inputBackground || theme.cardBackground,
          color: theme.textPrimary
        }}
      >
        <option value="">Select Financial Year</option>
        {financialYears.map(fy => (
          <option key={fy.financialYearId} value={fy.financialYearId}>
            FY {fy.financialYearId} ({fy.startDate} to {fy.endDate})
          </option>
        ))}
      </select>
    </div>
  );
};

export default FinancialYearSelector;