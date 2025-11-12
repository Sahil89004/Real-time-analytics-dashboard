import React from 'react';

export default function MetricCard({ title, value, icon, trend }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
          <p className="text-2xl font-semibold mt-1">{value}</p>
        </div>
        <div className="text-blue-500 bg-blue-100 p-3 rounded-full">
          {icon}
        </div>
      </div>
    </div>
  );
}