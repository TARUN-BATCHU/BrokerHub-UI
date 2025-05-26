import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import useResponsive from '../hooks/useResponsive';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

// Sales Chart Component
export const SalesChart = ({ data, animated = true }) => {
  const { isMobile } = useResponsive();
  const chartData = {
    labels: data.map(item => item.month),
    datasets: [
      {
        label: 'Sales (₹)',
        data: data.map(item => item.sales),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: animated ? {
      duration: 2000,
      easing: 'easeOutQuart',
      delay: (context) => {
        return context.type === 'data' && context.mode === 'default'
          ? context.dataIndex * 200
          : 0;
      }
    } : false,
    plugins: {
      legend: {
        position: isMobile ? 'bottom' : 'top',
        labels: {
          padding: isMobile ? 10 : 20,
          font: {
            size: isMobile ? 10 : 12
          }
        }
      },
      title: {
        display: true,
        text: 'Monthly Sales Performance',
        font: {
          size: isMobile ? 12 : 14
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            size: isMobile ? 10 : 12
          },
          callback: function(value) {
            return '₹' + (value / 1000) + 'K';
          }
        }
      },
      x: {
        ticks: {
          font: {
            size: isMobile ? 10 : 12
          }
        }
      }
    }
  };

  return <Bar data={chartData} options={options} />;
};

// Quantity Chart Component
export const QuantityChart = ({ data, animated = true }) => {
  const { isMobile } = useResponsive();
  const chartData = {
    labels: data.map(item => item.month),
    datasets: [
      {
        label: 'Quantity (Tons)',
        data: data.map(item => item.quantity),
        borderColor: 'rgba(34, 197, 94, 1)',
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: animated ? {
      duration: 2500,
      easing: 'easeOutCubic',
      delay: (context) => {
        return context.type === 'data' && context.mode === 'default'
          ? context.dataIndex * 150
          : 0;
      }
    } : false,
    plugins: {
      legend: {
        position: isMobile ? 'bottom' : 'top',
        labels: {
          padding: isMobile ? 10 : 20,
          font: {
            size: isMobile ? 10 : 12
          }
        }
      },
      title: {
        display: true,
        text: 'Monthly Quantity Sold',
        font: {
          size: isMobile ? 12 : 14
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            size: isMobile ? 10 : 12
          }
        }
      },
      x: {
        ticks: {
          font: {
            size: isMobile ? 10 : 12
          }
        }
      }
    }
  };

  return <Line data={chartData} options={options} />;
};

// Product Distribution Pie Chart
export const ProductPieChart = ({ data, animated = true }) => {
  const { isMobile } = useResponsive();
  const chartData = {
    labels: data.map(item => item.product),
    datasets: [
      {
        data: data.map(item => item.percentage),
        backgroundColor: [
          '#3B82F6',
          '#10B981',
          '#F59E0B',
          '#EF4444',
          '#8B5CF6',
          '#F97316',
          '#06B6D4',
        ],
        borderColor: [
          '#2563EB',
          '#059669',
          '#D97706',
          '#DC2626',
          '#7C3AED',
          '#EA580C',
          '#0891B2',
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: animated ? {
      duration: 1500,
      easing: 'easeOutQuart',
      animateRotate: true,
      animateScale: false,
      delay: (context) => {
        return context.type === 'data' && context.mode === 'default'
          ? context.dataIndex * 150
          : 0;
      }
    } : false,
    plugins: {
      legend: {
        position: isMobile ? 'bottom' : 'right',
        labels: {
          padding: isMobile ? 10 : 20,
          font: {
            size: isMobile ? 10 : 12
          }
        }
      },
      title: {
        display: true,
        text: 'Product Distribution',
        font: {
          size: isMobile ? 12 : 14
        }
      },
    },
  };

  return <Pie data={chartData} options={options} />;
};

// City Analytics Bar Chart
export const CityChart = ({ data, animated = true }) => {
  const { isMobile } = useResponsive();
  const chartData = {
    labels: data.map(item => item.city),
    datasets: [
      {
        label: 'Buyers',
        data: data.map(item => item.buyers),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
      {
        label: 'Sellers',
        data: data.map(item => item.sellers),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: animated ? {
      duration: 2200,
      easing: 'easeOutQuart',
      delay: (context) => {
        return context.type === 'data' && context.mode === 'default'
          ? context.datasetIndex * 400 + context.dataIndex * 100
          : 0;
      }
    } : false,
    plugins: {
      legend: {
        position: isMobile ? 'bottom' : 'top',
        labels: {
          padding: isMobile ? 10 : 20,
          font: {
            size: isMobile ? 10 : 12
          }
        }
      },
      title: {
        display: true,
        text: 'City-wise Buyers vs Sellers',
        font: {
          size: isMobile ? 12 : 14
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            size: isMobile ? 10 : 12
          }
        }
      },
      x: {
        ticks: {
          font: {
            size: isMobile ? 10 : 12
          }
        }
      }
    }
  };

  return <Bar data={chartData} options={options} />;
};

// Top Performers Chart
export const TopPerformersChart = ({ buyers, sellers, animated = true }) => {
  const { isMobile } = useResponsive();
  const chartData = {
    labels: buyers.slice(0, 5).map(item => item.name),
    datasets: [
      {
        label: 'Purchase Amount (₹)',
        data: buyers.slice(0, 5).map(item => item.totalPurchases),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: animated ? {
      duration: 2300,
      easing: 'easeOutElastic',
      delay: (context) => {
        return context.type === 'data' && context.mode === 'default'
          ? context.dataIndex * 250
          : 0;
      }
    } : false,
    plugins: {
      legend: {
        position: isMobile ? 'bottom' : 'top',
        labels: {
          padding: isMobile ? 10 : 20,
          font: {
            size: isMobile ? 10 : 12
          }
        }
      },
      title: {
        display: true,
        text: 'Top 5 Buyers by Purchase Amount',
        font: {
          size: isMobile ? 12 : 14
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            size: isMobile ? 10 : 12
          },
          callback: function(value) {
            return '₹' + (value / 1000) + 'K';
          }
        }
      },
      x: {
        ticks: {
          font: {
            size: isMobile ? 10 : 12
          }
        }
      }
    }
  };

  return <Bar data={chartData} options={options} />;
};

// Merchant Type Analytics Chart
export const MerchantTypeChart = ({ data, animated = true }) => {
  const { isMobile } = useResponsive();

  if (!data || data.length === 0) {
    return <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No merchant data available</div>;
  }

  const chartData = {
    labels: data.map(item => item.type),
    datasets: [
      {
        label: 'Total Merchants',
        data: data.map(item => item.totalMerchants),
        backgroundColor: 'rgba(139, 92, 246, 0.8)',
        borderColor: 'rgba(139, 92, 246, 1)',
        borderWidth: 1,
      },
      {
        label: 'Total Transactions',
        data: data.map(item => item.totalTransactions),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: animated ? {
      duration: 2000,
      easing: 'easeOutQuart',
      delay: (context) => {
        return context.type === 'data' && context.mode === 'default'
          ? context.datasetIndex * 300 + context.dataIndex * 150
          : 0;
      }
    } : false,
    plugins: {
      legend: {
        position: isMobile ? 'bottom' : 'top',
        labels: {
          padding: isMobile ? 10 : 20,
          font: {
            size: isMobile ? 10 : 12
          }
        }
      },
      title: {
        display: true,
        text: 'Merchant Type Analytics',
        font: {
          size: isMobile ? 12 : 14
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            size: isMobile ? 10 : 12
          }
        }
      },
      x: {
        ticks: {
          font: {
            size: isMobile ? 10 : 12
          }
        }
      }
    }
  };

  return <Bar data={chartData} options={options} />;
};

// Brokerage Chart Component
export const BrokerageChart = ({ data, animated = true }) => {
  const { isMobile } = useResponsive();

  if (!data || data.length === 0) {
    return <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No brokerage data available</div>;
  }

  const chartData = {
    labels: data.map(item => item.month),
    datasets: [
      {
        label: 'Brokerage Earned (₹)',
        data: data.map(item => item.brokerage || 0),
        backgroundColor: 'rgba(245, 158, 11, 0.8)',
        borderColor: 'rgba(245, 158, 11, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: animated ? {
      duration: 2000,
      easing: 'easeOutQuart',
      delay: (context) => {
        return context.type === 'data' && context.mode === 'default'
          ? context.dataIndex * 200
          : 0;
      }
    } : false,
    plugins: {
      legend: {
        position: isMobile ? 'bottom' : 'top',
        labels: {
          padding: isMobile ? 10 : 20,
          font: {
            size: isMobile ? 10 : 12
          }
        }
      },
      title: {
        display: true,
        text: 'Monthly Brokerage Earnings',
        font: {
          size: isMobile ? 12 : 14
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            size: isMobile ? 10 : 12
          },
          callback: function(value) {
            return '₹' + (value / 1000) + 'K';
          }
        }
      },
      x: {
        ticks: {
          font: {
            size: isMobile ? 10 : 12
          }
        }
      }
    }
  };

  return <Bar data={chartData} options={options} />;
};

// Top Buyers by Quantity Chart
export const TopBuyersByQuantityChart = ({ data, animated = true }) => {
  const { isMobile } = useResponsive();

  if (!data || data.length === 0) {
    return <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No buyer data available</div>;
  }

  const chartData = {
    labels: data.map(item => item.buyerName || item.firmName),
    datasets: [
      {
        label: 'Quantity Bought (Tons)',
        data: data.map(item => item.totalQuantityBought),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: animated ? {
      duration: 2000,
      easing: 'easeOutQuart',
      delay: (context) => {
        return context.type === 'data' && context.mode === 'default'
          ? context.dataIndex * 200
          : 0;
      }
    } : false,
    plugins: {
      legend: {
        position: isMobile ? 'bottom' : 'top',
        labels: {
          padding: isMobile ? 10 : 20,
          font: {
            size: isMobile ? 10 : 12
          }
        }
      },
      title: {
        display: true,
        text: 'Top 5 Buyers by Quantity',
        font: {
          size: isMobile ? 12 : 14
        }
      },
      tooltip: {
        callbacks: {
          afterLabel: function(context) {
            const dataPoint = data[context.dataIndex];
            return [
              `Amount Spent: ₹${(dataPoint.totalAmountSpent / 1000).toFixed(0)}K`,
              `Brokerage Paid: ₹${(dataPoint.totalBrokeragePaid / 1000).toFixed(0)}K`,
              `Transactions: ${dataPoint.totalTransactions}`,
              `City: ${dataPoint.city}`
            ];
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            size: isMobile ? 10 : 12
          }
        }
      },
      x: {
        ticks: {
          font: {
            size: isMobile ? 10 : 12
          },
          maxRotation: isMobile ? 45 : 0
        }
      }
    }
  };

  return <Bar data={chartData} options={options} />;
};

// Top Sellers by Quantity Chart
export const TopSellersByQuantityChart = ({ data, animated = true }) => {
  const { isMobile } = useResponsive();

  if (!data || data.length === 0) {
    return <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No seller data available</div>;
  }

  const chartData = {
    labels: data.map(item => item.sellerName || item.firmName),
    datasets: [
      {
        label: 'Quantity Sold (Tons)',
        data: data.map(item => item.totalQuantitySold),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: animated ? {
      duration: 2000,
      easing: 'easeOutQuart',
      delay: (context) => {
        return context.type === 'data' && context.mode === 'default'
          ? context.dataIndex * 200
          : 0;
      }
    } : false,
    plugins: {
      legend: {
        position: isMobile ? 'bottom' : 'top',
        labels: {
          padding: isMobile ? 10 : 20,
          font: {
            size: isMobile ? 10 : 12
          }
        }
      },
      title: {
        display: true,
        text: 'Top Sellers by Quantity',
        font: {
          size: isMobile ? 12 : 14
        }
      },
      tooltip: {
        callbacks: {
          afterLabel: function(context) {
            const dataPoint = data[context.dataIndex];
            return [
              `Amount Received: ₹${(dataPoint.totalAmountReceived / 1000).toFixed(0)}K`,
              `Brokerage Generated: ₹${(dataPoint.totalBrokerageGenerated / 1000).toFixed(0)}K`,
              `Transactions: ${dataPoint.totalTransactions}`,
              `City: ${dataPoint.city}`
            ];
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            size: isMobile ? 10 : 12
          }
        }
      },
      x: {
        ticks: {
          font: {
            size: isMobile ? 10 : 12
          },
          maxRotation: isMobile ? 45 : 0
        }
      }
    }
  };

  return <Bar data={chartData} options={options} />;
};

// Top Merchants by Brokerage Chart
export const TopMerchantsByBrokerageChart = ({ data, animated = true }) => {
  const { isMobile } = useResponsive();

  if (!data || data.length === 0) {
    return <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No merchant data available</div>;
  }

  const chartData = {
    labels: data.map(item => item.merchantName || item.firmName),
    datasets: [
      {
        label: 'Brokerage Paid (₹)',
        data: data.map(item => item.totalBrokeragePaid),
        backgroundColor: 'rgba(245, 158, 11, 0.8)',
        borderColor: 'rgba(245, 158, 11, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: animated ? {
      duration: 2000,
      easing: 'easeOutQuart',
      delay: (context) => {
        return context.type === 'data' && context.mode === 'default'
          ? context.dataIndex * 200
          : 0;
      }
    } : false,
    plugins: {
      legend: {
        position: isMobile ? 'bottom' : 'top',
        labels: {
          padding: isMobile ? 10 : 20,
          font: {
            size: isMobile ? 10 : 12
          }
        }
      },
      title: {
        display: true,
        text: 'Top 5 Merchants by Brokerage',
        font: {
          size: isMobile ? 12 : 14
        }
      },
      tooltip: {
        callbacks: {
          afterLabel: function(context) {
            const dataPoint = data[context.dataIndex];
            return [
              `Quantity Traded: ${dataPoint.totalQuantityTraded} tons`,
              `Amount Traded: ₹${(dataPoint.totalAmountTraded / 1000).toFixed(0)}K`,
              `Transactions: ${dataPoint.totalTransactions}`,
              `Avg Brokerage/Transaction: ₹${dataPoint.averageBrokeragePerTransaction?.toFixed(0) || 0}`,
              `City: ${dataPoint.city}`
            ];
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            size: isMobile ? 10 : 12
          },
          callback: function(value) {
            return '₹' + (value / 1000).toFixed(0) + 'K';
          }
        }
      },
      x: {
        ticks: {
          font: {
            size: isMobile ? 10 : 12
          },
          maxRotation: isMobile ? 45 : 0
        }
      }
    }
  };

  return <Bar data={chartData} options={options} />;
};

// Brokerage Distribution Pie Chart
export const BrokerageDistributionPieChart = ({ data, animated = true }) => {
  const { isMobile } = useResponsive();

  if (!data || data.length === 0) {
    return <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No brokerage data available</div>;
  }

  const chartData = {
    labels: data.map(item => item.merchantName || item.firmName),
    datasets: [
      {
        data: data.map(item => item.totalBrokeragePaid),
        backgroundColor: [
          '#F59E0B',
          '#3B82F6',
          '#10B981',
          '#EF4444',
          '#8B5CF6',
          '#F97316',
          '#06B6D4',
        ],
        borderColor: [
          '#D97706',
          '#2563EB',
          '#059669',
          '#DC2626',
          '#7C3AED',
          '#EA580C',
          '#0891B2',
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: animated ? {
      duration: 1500,
      easing: 'easeOutQuart',
      animateRotate: true,
      animateScale: false,
      delay: (context) => {
        return context.type === 'data' && context.mode === 'default'
          ? context.dataIndex * 150
          : 0;
      }
    } : false,
    plugins: {
      legend: {
        position: isMobile ? 'bottom' : 'right',
        labels: {
          padding: isMobile ? 10 : 20,
          font: {
            size: isMobile ? 10 : 12
          }
        }
      },
      title: {
        display: true,
        text: 'Brokerage Distribution',
        font: {
          size: isMobile ? 12 : 14
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const dataPoint = data[context.dataIndex];
            const total = data.reduce((sum, item) => sum + item.totalBrokeragePaid, 0);
            const percentage = ((dataPoint.totalBrokeragePaid / total) * 100).toFixed(1);
            return `${dataPoint.merchantName || dataPoint.firmName}: ₹${(dataPoint.totalBrokeragePaid / 1000).toFixed(0)}K (${percentage}%)`;
          },
          afterLabel: function(context) {
            const dataPoint = data[context.dataIndex];
            return [
              `Quantity: ${dataPoint.totalQuantityTraded} tons`,
              `Transactions: ${dataPoint.totalTransactions}`,
              `City: ${dataPoint.city}`
            ];
          }
        }
      }
    },
  };

  return <Pie data={chartData} options={options} />;
};