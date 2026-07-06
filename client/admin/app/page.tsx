'use client';
import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const [activities, setActivities] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchActivities = async () => {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://blogify-backend-1-525g.onrender.com';
      const res = await fetch(`${API_BASE}/api/admin/activities?search=${search}`, {
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setActivities(data.activities);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Basic fetch
    setLoading(true);
    fetchActivities();
  }, [search]);

  return (
    <div className="min-h-screen bg-zinc-950 text-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard - User Activity Monitor</h1>
        
        <div className="mb-6 flex gap-4">
          <input 
            type="text" 
            placeholder="Search activities..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-md w-full max-w-md focus:outline-none focus:border-indigo-500"
          />
          <button 
            onClick={fetchActivities}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors"
          >
            Refresh
          </button>
        </div>

        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-zinc-400">Loading activities...</div>
          ) : activities.length === 0 ? (
            <div className="p-8 text-center text-zinc-400">No activities found.</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-950 border-b border-zinc-800">
                <tr>
                  <th className="px-6 py-4 font-semibold">User</th>
                  <th className="px-6 py-4 font-semibold">Action</th>
                  <th className="px-6 py-4 font-semibold">Details</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {activities.map((act: any) => (
                  <tr key={act._id} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4">
                      {act.user ? (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                            {act.user.name?.[0] || '?'}
                          </div>
                          <div>
                            <div className="font-medium">{act.user.name}</div>
                            <div className="text-xs text-zinc-500">{act.user.email}</div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-zinc-500">System / Deleted User</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-zinc-800 text-zinc-300 rounded text-xs font-mono">
                        {act.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-400">
                      {act.details ? JSON.stringify(act.details) : '-'}
                    </td>
                    <td className="px-6 py-4 text-zinc-400">
                      {new Date(act.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
