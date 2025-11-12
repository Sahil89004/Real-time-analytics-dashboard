import React, { useEffect, useState } from 'react';
import socket from './socket';
import AdminPanel from './components/AdminPanel';
import { Chart as ChartJS, registerables } from 'chart.js';
import MetricCard from './components/MetricCard';
import { LineChart, DoughnutChart } from './components/Charts';
import ActivityFeed from './components/ActivityFeed';

// Register Chart.js components
ChartJS.register(...registerables);


export default function App() {
  const [metrics, setMetrics] = useState({
    activeUsers: 0,
    totalVisits: 0,
    totalSales: 0,
    cpuUsage: 0,
    recentActivities: [],
    salesDistribution: { products: [], values: [] }
  });

  // Store historical data for line charts
  const [history, setHistory] = useState({
    cpuHistory: [],
    salesHistory: [],
    timeLabels: []
  });
  const [view, setView] = useState('dashboard');

  useEffect(() => {
    function onMetrics(data) {
      setMetrics(data);
      const now = new Date().toLocaleTimeString();
      setHistory((prev) => ({
        cpuHistory: [...prev.cpuHistory, data.cpuUsage].slice(-20),
        salesHistory: [...prev.salesHistory, data.totalSales].slice(-20),
        timeLabels: [...prev.timeLabels, now].slice(-20)
      }));
    }

    socket.on('metrics', onMetrics);
    return () => {
      socket.off('metrics', onMetrics);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Real-Time Analytics Dashboard</h1>
          <nav className="space-x-3">
            <button onClick={() => setView('dashboard')} className={`px-3 py-2 rounded ${view === 'dashboard' ? 'bg-blue-600 text-white' : 'bg-white'}`}>Dashboard</button>
            <button onClick={() => setView('admin')} className={`px-3 py-2 rounded ${view === 'admin' ? 'bg-blue-600 text-white' : 'bg-white'}`}>Admin</button>
          </nav>
        </header>

        {view === 'dashboard' ? (
          <>
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <MetricCard title="Active Users" value={metrics.activeUsers} icon={<span>👥</span>} />
              <MetricCard title="Total Visits" value={metrics.totalVisits} icon={<span>🔍</span>} />
              <MetricCard title="Total Sales" value={`$${metrics.totalSales.toLocaleString()}`} icon={<span>💰</span>} />
              <MetricCard title="CPU Usage" value={`${metrics.cpuUsage}%`} icon={<span>⚡</span>} />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">CPU Usage Over Time</h2>
                <LineChart data={history.cpuHistory} labels={history.timeLabels} label="CPU %" borderColor="#EF4444" />
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Sales Overview</h2>
                <LineChart data={history.salesHistory} labels={history.timeLabels} label="Total Sales ($)" />
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Distribution of Sales</h2>
                <DoughnutChart data={metrics.salesDistribution.values} labels={metrics.salesDistribution.products} />
              </div>

              <div className="h-[400px] overflow-auto">
                <ActivityFeed activities={metrics.recentActivities} />
              </div>
            </div>
          </>
        ) : (
          <AdminPanel />
        )}
      </div>
    </div>
  );
}