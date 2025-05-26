import React from 'react';
import useIntersectionObserver from '../hooks/useIntersectionObserver';
import { useTheme } from '../contexts/ThemeContext';
import './AnimatedChartWrapper.css';

const AnimatedChartWrapper = ({
  children,
  title,
  height = '400px',
  loadingDuration = 2000,
  style = {}
}) => {
  const { theme } = useTheme();
  const { targetRef, hasIntersected } = useIntersectionObserver({
    threshold: 0.2,
    rootMargin: '0px 0px -100px 0px'
  });

  const LoadingAnimation = () => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      position: 'relative'
    }}>
      {/* Animated Chart Skeleton */}
      <div style={{
        width: '100%',
        height: '80%',
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-around',
        padding: '20px'
      }}>
        {/* Animated Bars */}
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="chart-loading-bar"
            style={{
              width: '40px',
              backgroundColor: theme.buttonPrimary,
              borderRadius: '4px 4px 0 0',
              opacity: 0.7,
              height: '0%',
              transition: 'all 0.3s ease'
            }}
          />
        ))}
      </div>

      {/* Loading Text */}
      <div style={{
        marginTop: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        color: theme.textSecondary,
        fontSize: '14px'
      }}>
        <div
          className="loading-spinner"
          style={{
            width: '20px',
            height: '20px',
            border: `2px solid ${theme.borderLight}`,
            borderTop: `2px solid ${theme.buttonPrimary}`,
            borderRadius: '50%'
          }}
        />
        Loading chart data...
      </div>

      {/* Floating Data Points Animation */}
      <div
        className="floating-dot"
        style={{
          position: 'absolute',
          top: '20%',
          left: '20%',
          width: '8px',
          height: '8px',
          backgroundColor: theme.success,
          borderRadius: '50%'
        }}
      />
      <div
        className="floating-dot"
        style={{
          position: 'absolute',
          top: '40%',
          right: '30%',
          width: '6px',
          height: '6px',
          backgroundColor: theme.warning,
          borderRadius: '50%',
          animationDelay: '0.5s'
        }}
      />
      <div
        className="floating-dot"
        style={{
          position: 'absolute',
          bottom: '30%',
          left: '50%',
          width: '10px',
          height: '10px',
          backgroundColor: theme.info,
          borderRadius: '50%',
          animationDelay: '1s'
        }}
      />


    </div>
  );

  return (
    <div
      ref={targetRef}
      style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        border: '1px solid #e5e7eb',
        height,
        position: 'relative',
        overflow: 'hidden',
        ...style
      }}
    >
      {title && (
        <h3
          className={hasIntersected ? 'chart-title-enter' : ''}
          style={{
            margin: '0 0 16px 0',
            color: '#1e293b',
            fontSize: '16px',
            fontWeight: '600',
            opacity: hasIntersected ? 1 : 0,
            transform: hasIntersected ? 'translateY(0)' : 'translateY(-10px)',
            transition: hasIntersected ? 'none' : 'all 0.6s ease 0.2s'
          }}
        >
          {title}
        </h3>
      )}

      <div style={{
        height: title ? 'calc(100% - 40px)' : '100%',
        position: 'relative'
      }}>
        {!hasIntersected ? (
          <LoadingAnimation />
        ) : (
          <div
            className={hasIntersected ? 'chart-content-enter' : ''}
            style={{
              opacity: hasIntersected ? 1 : 0,
              transform: hasIntersected ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
              transition: hasIntersected ? 'none' : 'all 0.8s ease 0.5s',
              height: '100%'
            }}
          >
            {children}
          </div>
        )}
      </div>

      {/* Shimmer Effect Overlay */}
      {!hasIntersected && (
        <div
          className="shimmer-overlay"
          style={{
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
            pointerEvents: 'none'
          }}
        />
      )}


    </div>
  );
};

export default AnimatedChartWrapper;
