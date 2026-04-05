'use client';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/components/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Plus, Trash2, Tag } from 'lucide-react';

interface WorkType { _id: string; name: string; icon: string; color: string; }

const PRESET_ICONS = ['🧹', '🍽️', '🪣', '🧺', '🧽', '💧', '🗑️', '🪴', '🛒', '🔧', '🪟', '🛋️', '🚿', '🧻', '🌿'];
const PRESET_COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#a3e635'];

export default function WorkTypesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [types, setTypes] = useState<WorkType[]>([]);
  const [fetching, setFetching] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', icon: '🧹', color: '#22c55e' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (!loading && user?.role !== 'admin') router.push('/work');
  }, [user, loading, router]);

  const fetchTypes = async () => {
    setFetching(true);
    try {
      const res = await fetch('/api/worktypes');
      if (res.ok) setTypes(await res.json());
    } finally { setFetching(false); }
  };

  useEffect(() => { if (user) fetchTypes(); }, [user]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/worktypes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      toast.success('Work type created!');
      setForm({ name: '', icon: '🧹', color: '#22c55e' });
      setShowForm(false);
      fetchTypes();
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This may affect existing work records.`)) return;
    const res = await fetch(`/api/worktypes/${id}`, { method: 'DELETE' });
    if (res.ok) { toast.success('Deleted'); fetchTypes(); }
    else toast.error('Failed to delete');
  };

  if (loading || fetching) return (
    <div className="page-wrapper">
      <Sidebar />
      <div className="page-content flex justify-center pt-20">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );

  return (
    <div className="page-wrapper">
      <Sidebar />
      <div className="page-content max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Tag size={22} /> Work Types
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">Define the types of chores in your flat</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
            <Plus size={16} />
            <span className="hidden sm:inline">New Type</span>
          </button>
        </div>

        {/* Create form */}
        {showForm && (
          <div className="bg-surface-card border border-brand-500/30 rounded-2xl p-5 mb-6 animate-slide-up">
            <h2 className="text-sm font-semibold text-white mb-4">New Work Type</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Name</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Dish Washing"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_ICONS.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, icon }))}
                      className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${
                        form.icon === icon
                          ? 'bg-brand-500/30 border-2 border-brand-500 scale-110'
                          : 'bg-surface-elevated border border-surface-border hover:border-brand-500/50'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Color</label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, color }))}
                      className={`w-8 h-8 rounded-lg transition-all ${
                        form.color === color ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-surface-card' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="flex items-center gap-3 bg-surface-elevated rounded-xl p-3 border border-surface-border">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{ backgroundColor: form.color + '30' }}
                >
                  {form.icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{form.name || 'Preview'}</p>
                  <p className="text-xs text-slate-400">Work type preview</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1" disabled={saving}>
                  {saving ? 'Creating…' : 'Create'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Types list */}
        {types.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <Tag size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No work types yet.</p>
            <p className="text-xs mt-1">Create types like "Dish Washing", "Cleaning", etc.</p>
            <button onClick={() => setShowForm(true)} className="mt-4 text-brand-400 text-sm hover:underline">
              + Create first work type
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {types.map(wt => (
              <div
                key={wt._id}
                className="bg-surface-card border border-surface-border rounded-xl p-4 flex items-center gap-3 card-hover animate-fade-in group"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ backgroundColor: wt.color + '25' }}
                >
                  {wt.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm">{wt.name}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: wt.color }} />
                    <span className="text-xs text-slate-400 font-mono">{wt.color}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(wt._id, wt.name)}
                  className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all p-1.5"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
