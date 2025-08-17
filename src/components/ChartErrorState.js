import { useTheme } from '../contexts/ThemeContext';

const ChartErrorState = ({ error, title, onRetry }) => {
  const { theme } = useTheme();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      minHeight: '300px',
      padding: '20px',
      textAlign: 'center',
      backgroundColor: theme.errorBg,
      borderRadius: '8px',
      border: `1px solid ${theme.errorBorder || theme.border}`
    }}>
      <div style={{
        fontSize: '48px',
        marginBottom: '16px',
        opacity: 0.7
      }}>
        ⚠️
      </div>
      <h4 style={{
        margin: '0 0 8px 0',
        color: theme.error,
        fontSize: '16px',
        fontWeight: '600'
      }}>
        Failed to Load {title}
      </h4>
      <p style={{
        margin: '0 0 16px 0',
        color: theme.textSecondary,
        fontSize: '14px',
        maxWidth: '300px',
        lineHeight: '1.4'
      }}>
        {error}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            padding: '8px 16px',
            border: `1px solid ${theme.error}`,
            borderRadius: '6px',
            backgroundColor: theme.errorBg,
            color: theme.error,
            fontSize: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.error;
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = theme.errorBg;
            e.currentTarget.style.color = theme.error;
          }}
        >
          🔄 Retry
        </button>
      )}
    </div>
  );
};

export default ChartErrorState;