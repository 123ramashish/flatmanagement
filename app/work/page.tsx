'use client';
import { useEffect, useState, useCallback } from 'react';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/components/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Plus, Trash2, ClipboardList, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

interface WorkType { _id: string; name: string; icon: string; color: string; }
interface User { _id: string; name: string; }
interface Work {
  _id: string;
  userId: { _id: string; name: string };
  workTypeId: { _id: string; name: string; icon: string; color: string };
  date: string;
  completed: boolean;
  notes?: string;
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

export default function WorkPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [date, setDate] = useState(todayStr());
  const [works, setWorks] = useState<Work[]>([]);
  const [workTypes, setWorkTypes] = useState<WorkType[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [fetching, setFetching] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ userId: '', workTypeId: '', notes: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (!loading && !user) router.push('/login'); }, [user, loading, router]);

  const fetchWorks = useCallback(async () => {
    setFetching(true);
    try {
      const url = `/api/works?date=${date}`;
      const res = await fetch(url);
      if (res.ok) setWorks(await res.json());
    } finally { setFetching(false); }
  }, [date]);

  useEffect(() => {
    if (!user) return;
    fetch('/api/worktypes').then(r => r.json()).then(setWorkTypes).catch(() => {});
    if (user.role === 'admin') fetch('/api/users').then(r => r.json()).then(setUsers).catch(() => {});
  }, [user]);

  useEffect(() => { if (user) fetchWorks(); }, [user, date, fetchWorks]);

  const shiftDate = (d: number) => {
    const dt = new Date(date);
    dt.setDate(dt.getDate() + d);
    setDate(dt.toISOString().split('T')[0]);
  };

  const toggleWork = async (work: Work) => {
    const updated = works.map(w => w._id === work._id ? { ...w, completed: !w.completed } : w);
    setWorks(updated);
    const res = await fetch(`/api/works/${work._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !work.completed }),
    });
    if (!res.ok) { setWorks(works); toast.error('Failed to update'); }
    else { toast.success(work.completed ? 'Marked pending' : '✅ Done!'); }
  };

  const addWork = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        userId: user?.role === 'admin' ? form.userId || user.id : user!.id,
        workTypeId: form.workTypeId,
        date,
        notes: form.notes,
      };
      const res = await fetch('/api/works', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      toast.success('Task added!');
      setForm({ userId: '', workTypeId: '', notes: '' });
      setShowAdd(false);
      fetchWorks();
    } finally { setSaving(false); }
  };

  const deleteWork = async (id: string) => {
    const res = await fetch(`/api/works/${id}`, { method: 'DELETE' });
    if (res.ok) { toast.success('Task removed'); fetchWorks(); }
  };

  const isToday = date === todayStr();
  const completedCount = works.filter(w => w.completed).length;

  if (loading) return (
    <div className="page-wrapper"><div className="page-content flex justify-center pt-20">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div></div>
  );

  return (
    <div className="page-wrapper">
      <Sidebar />
      <div className="page-content max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold text-white">Work</h1>
            <p className="text-slate-400 text-sm">{completedCount}/{works.length} tasks done</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => fetchWorks()} className="p-2 rounded-lg bg-surface-card border border-surface-border text-slate-400 hover:text-white transition-colors">
              <RefreshCw size={16} />
            </button>
            {user?.role === 'admin' && (
              <button onClick={() => setShowAdd(!showAdd)} className="btn-primary flex items-center gap-1.5">
                <Plus size={16} /><span className="hidden sm:inline">Add Task</span>
              </button>
            )}
          </div>
        </div>

        {/* Date nav */}
        <div className="flex items-center gap-3 mb-5 bg-surface-card border border-surface-border rounded-xl p-2">
          <button onClick={() => shiftDate(-1)} className="p-2 hover:bg-surface-elevated rounded-lg text-slate-400 hover:text-white transition-colors">
            <ChevronLeft size={18} />
          </button>
          <div className="flex-1 text-center">
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="bg-transparent text-white text-sm font-medium text-center focus:outline-none cursor-pointer"
            />
            {isToday && <span className="ml-2 text-xs bg-brand-500/20 text-brand-400 px-2 py-0.5 rounded-full">Today</span>}
          </div>
          <button onClick={() => shiftDate(1)} className="p-2 hover:bg-surface-elevated rounded-lg text-slate-400 hover:text-white transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Progress bar */}
        {works.length > 0 && (
          <div className="mb-5">
            <div className="flex justify-between text-xs text-slate-400 mb-1.5">
              <span>Progress</span>
              <span>{Math.round((completedCount / works.length) * 100)}%</span>
            </div>
            <div className="h-2 bg-surface-elevated rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-500 rounded-full transition-all duration-500"
                style={{ width: `${(completedCount / works.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Add form */}
        {showAdd && (
          <div className="bg-surface-card border border-brand-500/30 rounded-2xl p-4 mb-5 animate-slide-up">
            <h3 className="text-sm font-semibold text-white mb-3">Add Task for {date}</h3>
            <form onSubmit={addWork} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Work Type</label>
                  <select className="input-field text-black" value={form.workTypeId} onChange={e => setForm(f => ({ ...f, workTypeId: e.target.value }))} required>
                    <option value="">Select type…</option>
                    {workTypes.map(wt => <option key={wt._id} value={wt._id}>{wt.icon} {wt.name}</option>)}
                  </select>
                </div>
                {user?.role === 'admin' && (
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Assign To</label>
                    <select className="input-field text-black" value={form.userId} onChange={e => setForm(f => ({ ...f, userId: e.target.value }))}>
                      <option value="">Self</option>
                      {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                    </select>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Notes (optional)</label>
                <input type="text" className="input-field text-black" placeholder="e.g. Deep clean" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary flex-1" disabled={saving}>
                  {saving ? 'Adding…' : 'Add Task'}
                </button>
                <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Work list */}
        {fetching ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : works.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <ClipboardList size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No tasks for this date</p>
            {user?.role === 'admin' && (
              <button onClick={() => setShowAdd(true)} className="mt-3 text-brand-400 text-sm hover:underline">+ Add a task</button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {works.map(work => (
              <div
                key={work._id}
                className={`bg-surface-card border rounded-xl px-4 py-3.5 flex items-center gap-3 transition-all animate-fade-in ${
                  work.completed ? 'border-brand-500/30 bg-brand-500/5' : 'border-surface-border'
                }`}
              >
                <input
                  type="checkbox"
                  className="work-checkbox"
                  checked={work.completed}
                  onChange={() => toggleWork(work)}
                  disabled={!isToday && user?.role !== 'admin'}
                />
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-base"
                  style={{ backgroundColor: work.workTypeId.color + '20' }}
                >
                  {work.workTypeId.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium transition-all ${work.completed ? 'line-through text-slate-500' : 'text-white'}`}>
                    {work.workTypeId.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-xs text-slate-400">{work.userId.name}</span>
                    {work.notes && <span className="text-xs text-slate-500">· {work.notes}</span>}
                  </div>
                </div>
                {work.completed && (
                  <span className="text-xs text-brand-400 font-medium hidden sm:block">Done ✓</span>
                )}
                {user?.role === 'admin' && (
                  <button onClick={() => deleteWork(work._id)} className="text-slate-600 hover:text-red-400 transition-colors p-1">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
