import React from 'react';
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
export const SalesChart = ({ data }) => {
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
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Sales Performance',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '₹' + (value / 1000) + 'K';
          }
        }
      }
    }
  };

  return <Bar data={chartData} options={options} />;
};

// Quantity Chart Component
export const QuantityChart = ({ data }) => {
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
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Quantity Sold',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      }
    }
  };

  return <Line data={chartData} options={options} />;
};

// Product Distribution Pie Chart
export const ProductPieChart = ({ data }) => {
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
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Product Distribution',
      },
    },
  };

  return <Pie data={chartData} options={options} />;
};

// City Analytics Bar Chart
export const CityChart = ({ data }) => {
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
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'City-wise Buyers vs Sellers',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      }
    }
  };

  return <Bar data={chartData} options={options} />;
};

// Top Performers Chart
export const TopPerformersChart = ({ buyers, sellers }) => {
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
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Top 5 Buyers by Purchase Amount',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '₹' + (value / 1000) + 'K';
          }
        }
      }
    }
  };

  return <Bar data={chartData} options={options} />;
};
