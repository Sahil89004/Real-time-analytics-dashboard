import React from 'react';
import { Line, Doughnut } from 'react-chartjs-2';

export function LineChart({ data, labels, label, borderColor = '#3B82F6' }) {
  const chartData = {
    labels,
    datasets: [
      {
        label,
        data,
        fill: false,
        borderColor,
        tension: 0.4
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return <Line data={chartData} options={options} />;
}

export function DoughnutChart({ data, labels }) {
  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: [
          '#3B82F6',
          '#10B981',
          '#F59E0B',
          '#EF4444',
          '#8B5CF6'
        ]
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  return <Doughnut data={chartData} options={options} />;
}