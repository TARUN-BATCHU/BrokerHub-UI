import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import TodayMarket from '../components/TodayMarket';

const TodayMarketPage = () => {
  const { theme } = useTheme();

  return (
    <div style={{ padding: '24px' }}>
      <div style={{
        backgroundColor: theme.cardBackground,
        borderRadius: '16px',
        padding: '24px',
        boxShadow: theme.shadowCard,
        marginBottom: '24px'
      }}>
        <h2 style={{
          margin: '0 0 24px 0',
          color: theme.textPrimary,
          fontSize: '24px',
          fontWeight: '700'
        }}>
          Today's Market
        </h2>
      </div>

      <TodayMarket />
    </div>
  );
};

export default TodayMarketPage;