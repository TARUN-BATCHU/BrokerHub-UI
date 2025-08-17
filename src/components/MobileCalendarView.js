import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const MobileCalendarView = ({ data, onDateSelect }) => {
  const { theme } = useTheme();

  const renderCalendar = () => {
    // This is a simplified calendar view for mobile
    // In a real implementation, you would use a proper date library like date-fns
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    
    const weeks = [];
    let days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<td key={`empty-${i}`} style={{ padding: '12px', textAlign: 'center' }}></td>);
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const isToday = day === today.getDate();
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const hasData = data && data[`${currentYear}-${currentMonth + 1}-${day}`];
      
      days.push(
        <td
          key={day}
          onClick={() => onDateSelect(date)}
          style={{
            padding: '12px',
            textAlign: 'center',
            backgroundColor: isToday ? theme.primaryLight : isWeekend ? theme.backgroundSecondary : 'transparent',
            color: isToday ? theme.primary : theme.textPrimary,
            fontWeight: isToday || hasData ? 600 : 'normal',
            cursor: 'pointer',
            position: 'relative',
            minWidth: '40px',
            height: '40px'
          }}
        >
          {day}
          {hasData && (
            <span style={{
              position: 'absolute',
              bottom: '4px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              backgroundColor: theme.primary
            }}></span>
          )}
        </td>
      );
      
      if (days.length === 7) {
        weeks.push(<tr key={weeks.length}>{days}</tr>);
        days = [];
      }
    }
    
    // Add remaining days to the last week
    if (days.length > 0) {
      for (let i = days.length; i < 7; i++) {
        days.push(<td key={`empty-end-${i}`} style={{ padding: '12px', textAlign: 'center' }}></td>);
      }
      weeks.push(<tr key={weeks.length}>{days}</tr>);
    }
    
    return weeks;
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div style={{
      backgroundColor: theme.cardBackground,
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '20px'
    }}>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '14px'
      }}>
        <thead>
          <tr>
            {weekDays.map(day => (
              <th
                key={day}
                style={{
                  padding: '8px',
                  textAlign: 'center',
                  color: theme.textSecondary,
                  fontWeight: 500
                }}
              >
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {renderCalendar()}
        </tbody>
      </table>
    </div>
  );
};

export default MobileCalendarView;