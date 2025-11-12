import React, { useState, useEffect } from 'react';
import socket from '../socket';

export default function AdminPanel() {
  const [paused, setPaused] = useState(false);
  const [intervalMs, setIntervalMs] = useState(1000);
  const [lastAck, setLastAck] = useState(null);
  const [manualAmount, setManualAmount] = useState(100);

  useEffect(() => {
    function onAck(data) {
      setLastAck(data);
      if (data && typeof data.paused !== 'undefined') setPaused(data.paused);
      if (data && typeof data.intervalMs !== 'undefined') setIntervalMs(data.intervalMs);
    }
    socket.on('control:ack', onAck);
    return () => socket.off('control:ack', onAck);
  }, []);

  function sendControl(action, payload) {
    socket.emit('control', { action, payload });
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Admin Panel</h2>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button
            className={`px-4 py-2 rounded ${paused ? 'bg-green-600 text-white' : 'bg-red-500 text-white'}`}
            onClick={() => {
              sendControl(paused ? 'resume' : 'pause');
              setPaused(!paused);
            }}
          >
            {paused ? 'Resume Simulator' : 'Pause Simulator'}
          </button>

          <div className="flex items-center gap-2">
            <label className="text-sm">Interval (ms):</label>
            <input
              type="number"
              value={intervalMs}
              onChange={(e) => setIntervalMs(Number(e.target.value))}
              className="border rounded px-2 py-1 w-32"
            />
            <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={() => sendControl('setInterval', intervalMs)}>Apply</button>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-medium mb-2">Manual Events</h3>
          <div className="flex items-center gap-2">
            <input type="number" value={manualAmount} onChange={(e) => setManualAmount(Number(e.target.value))} className="border rounded px-2 py-1 w-32" />
            <button className="px-3 py-1 bg-yellow-500 text-white rounded" onClick={() => sendControl('manualSale', manualAmount)}>Inject Sale</button>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-medium">Last ack</h3>
          <pre className="text-sm bg-gray-100 p-2 rounded">{JSON.stringify(lastAck, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}
