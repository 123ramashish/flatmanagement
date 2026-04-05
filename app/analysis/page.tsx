'use client';
import { useEffect, useState, useCallback } from 'react';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/components/AuthContext';
import { useRouter } from 'next/navigation';
import { BarChart2, Filter, TrendingUp } from 'lucide-react';

interface User { _id: string; name: string; }
interface WorkType { _id: string; name: string; icon: string; color: string; }
interface MatrixCell { total: number; completed: number; }

export default function AnalysisPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [workTypes, setWorkTypes] = useState<WorkType[]>([]);
  const [matrix, setMatrix] = useState<Record<string, Record<string, MatrixCell>>>({});
  const [works, setWorks] = useState<{ userId: { _id: string }; workTypeId: { _id: string }; completed: boolean }[]>([]);
  const [fetching, setFetching] = useState(true);

  const today = new Date().toISOString().split('T')[0];
  const firstOfMonth = today.slice(0, 7) + '-01';

  const [filters, setFilters] = useState({ startDate: firstOfMonth, endDate: today, userId: '', workTypeId: '' });

  useEffect(() => { if (!loading && !user) router.push('/login'); }, [user, loading, router]);

  const fetchAnalysis = useCallback(async () => {
    setFetching(true);
    const params = new URLSearchParams();
    if (filters.startDate) params.set('startDate', filters.startDate);
    if (filters.endDate) params.set('endDate', filters.endDate);
    if (filters.userId) params.set('userId', filters.userId);
    if (filters.workTypeId) params.set('workTypeId', filters.workTypeId);
    try {
      const res = await fetch('/api/analysis?' + params.toString());
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
        setWorkTypes(data.workTypes);
        setMatrix(data.matrix);
        setWorks(data.works);
      }
    } finally { setFetching(false); }
  }, [filters]);

  useEffect(() => { if (user) fetchAnalysis(); }, [user, fetchAnalysis]);

  const totalByUser = (uid: string) => {
    return works.filter(w => w.userId._id === uid).length;
  };
  const completedByUser = (uid: string) => {
    return works.filter(w => w.userId._id === uid && w.completed).length;
  };
  const totalAll = works.length;
  const completedAll = works.filter(w => w.completed).length;

  if (loading) return <div className="page-wrapper"><div className="page-content flex justify-center pt-20">
    <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
  </div></div>;

  return (
    <div className="page-wrapper">
      <Sidebar />
      <div className="page-content max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><BarChart2 size={22} />Analysis</h1>
          <p className="text-slate-400 text-sm mt-0.5">Track work completion across your flat</p>
        </div>

        {/* Filters */}
        <div className="bg-surface-card border border-surface-border rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-3 text-sm font-medium text-slate-300">
            <Filter size={15} /> Filters
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">From</label>
              <input type="date" className="input-field text-xs text-black" value={filters.startDate}
                onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">To</label>
              <input type="date" className="input-field text-xs text-black" value={filters.endDate}
                onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">User</label>
              <select className="input-field text-xs text-black" value={filters.userId}
                onChange={e => setFilters(f => ({ ...f, userId: e.target.value }))}>
                <option value="">All Users</option>
                {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Work Type</label>
              <select className="input-field text-xs text-black" value={filters.workTypeId}
                onChange={e => setFilters(f => ({ ...f, workTypeId: e.target.value }))}>
                <option value="">All Types</option>
                {workTypes.map(wt => <option key={wt._id} value={wt._id}>{wt.icon} {wt.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total Tasks', value: totalAll, sub: 'assigned' },
            { label: 'Completed', value: completedAll, sub: `${totalAll ? Math.round(completedAll/totalAll*100) : 0}% rate` },
            { label: 'Pending', value: totalAll - completedAll, sub: 'remaining' },
            { label: 'Members', value: users.length, sub: 'in flat' },
          ].map(({ label, value, sub }) => (
            <div key={label} className="bg-surface-card border border-surface-border rounded-xl p-4 card-hover">
              <p className="text-2xl font-bold text-white font-mono">{value}</p>
              <p className="text-xs font-medium text-slate-300 mt-0.5">{label}</p>
              <p className="text-xs text-slate-500">{sub}</p>
            </div>
          ))}
        </div>

        {fetching ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Matrix table */}
            {users.length > 0 && workTypes.length > 0 && (
              <div className="bg-surface-card border border-surface-border rounded-2xl overflow-hidden mb-6">
                <div className="px-5 py-3 border-b border-surface-border">
                  <h2 className="text-sm font-semibold text-white">Work Matrix</h2>
                  <p className="text-xs text-slate-400">Total tasks per user per work type</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-surface-border">
                        <th className="text-left px-5 py-3 text-slate-400 font-medium text-xs">User</th>
                        {workTypes.map(wt => (
                          <th key={wt._id} className="px-4 py-3 text-center text-xs font-medium" style={{ color: wt.color }}>
                            <div>{wt.icon}</div>
                            <div className="mt-0.5 truncate max-w-[80px]">{wt.name}</div>
                          </th>
                        ))}
                        <th className="px-4 py-3 text-center text-xs font-medium text-slate-400">Total</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-slate-400">Done</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u, i) => (
                        <tr key={u._id} className={i % 2 === 0 ? '' : 'bg-surface-elevated/40'}>
                          <td className="px-5 py-3 font-medium text-white text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-brand-500/20 flex items-center justify-center text-xs font-bold text-brand-400">
                                {u.name.charAt(0)}
                              </div>
                              {u.name}
                            </div>
                          </td>
                          {workTypes.map(wt => {
                            const cell = matrix[u._id]?.[wt._id] || { total: 0, completed: 0 };
                            return (
                              <td key={wt._id} className="px-4 py-3 text-center">
                                <div className="font-mono font-bold text-white">{cell.total}</div>
                                {cell.total > 0 && (
                                  <div className="text-xs text-brand-400 mt-0.5">{cell.completed}✓</div>
                                )}
                              </td>
                            );
                          })}
                          <td className="px-4 py-3 text-center font-mono font-bold text-white">{totalByUser(u._id)}</td>
                          <td className="px-4 py-3 text-center">
                            <span className="font-mono font-bold text-brand-400">{completedByUser(u._id)}</span>
                            {totalByUser(u._id) > 0 && (
                              <div className="text-xs text-slate-500 mt-0.5">
                                {Math.round(completedByUser(u._id) / totalByUser(u._id) * 100)}%
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Per-user bars */}
            {users.length > 0 && (
              <div className="bg-surface-card border border-surface-border rounded-2xl p-5">
                <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <TrendingUp size={15} /> Completion Rate by Member
                </h2>
                <div className="space-y-4">
                  {users.map(u => {
                    const total = totalByUser(u._id);
                    const done = completedByUser(u._id);
                    const pct = total ? Math.round(done / total * 100) : 0;
                    return (
                      <div key={u._id}>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-slate-300 font-medium">{u.name}</span>
                          <span className="text-slate-400 font-mono">{done}/{total} ({pct}%)</span>
                        </div>
                        <div className="h-2.5 bg-surface-elevated rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, backgroundColor: pct >= 80 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444' }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {users.length === 0 && (
              <div className="text-center py-16 text-slate-500">
                <BarChart2 size={40} className="mx-auto mb-3 opacity-30" />
                <p>No data yet. Add users and tasks to see analysis.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
