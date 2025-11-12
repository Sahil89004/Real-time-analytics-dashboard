import React from 'react';

export default function ActivityFeed({ activities }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Recent Activities</h2>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-center justify-between border-b pb-2">
            <div>
              <p className="font-medium">
                New sale: ${activity.amount} ({activity.product})
              </p>
              <p className="text-sm text-gray-500">
                {new Date(activity.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}