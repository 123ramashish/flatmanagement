'use client';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/components/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { UserPlus, Trash2, Phone, Mail, Shield, User as UserIcon } from 'lucide-react';

interface User { _id: string; name: string; email: string; phone: string; role: string; }

export default function UsersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [fetching, setFetching] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'member' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (!loading && user?.role !== 'admin') router.push('/work');
  }, [user, loading, router]);

  const fetchUsers = async () => {
    setFetching(true);
    try {
      const res = await fetch('/api/users');
      if (res.ok) setUsers(await res.json());
    } finally { setFetching(false); }
  };

  useEffect(() => { if (user) fetchUsers(); }, [user]);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      toast.success('User created!');
      setForm({ name: '', email: '', phone: '', password: '', role: 'member' });
      setShowForm(false);
      fetchUsers();
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}?`)) return;
    const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
    if (res.ok) { toast.success('User deleted'); fetchUsers(); }
    else toast.error('Failed to delete');
  };

  if (loading || fetching) return (
    <div className="page-wrapper"><div className="page-content flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div></div>
  );

  return (
    <div className="page-wrapper">
      <Sidebar />
      <div className="page-content max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Users</h1>
            <p className="text-slate-400 text-sm mt-0.5">{users.length} member{users.length !== 1 ? 's' : ''} in your flat</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
            <UserPlus size={16} />
            <span className="hidden sm:inline">Add User</span>
          </button>
        </div>

        {/* Add user form */}
        {showForm && (
          <div className="bg-surface-card border border-surface-border rounded-2xl p-5 mb-6 animate-slide-up">
            <h2 className="text-base font-semibold text-white mb-4">New Member</h2>
            <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { k: 'name', label: 'Full Name', placeholder: 'Rahul Sharma' },
                { k: 'email', label: 'Email', placeholder: 'rahul@email.com', type: 'email' },
                { k: 'phone', label: 'Phone', placeholder: '+91 9876543210', type: 'tel' },
                { k: 'password', label: 'Password', placeholder: '••••••••', type: 'password' },
              ].map(({ k, label, placeholder, type }) => (
                <div key={k}>
                  <label className="block text-xs font-medium text-slate-400 mb-1">{label}</label>
                  <input type={type || 'text'} className="input-field text-black" placeholder={placeholder}
                    value={(form as Record<string,string>)[k]} onChange={set(k)} required />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Role</label>
                <select className="input-field text-black" value={form.role} onChange={set('role')}>
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="sm:col-span-2 flex gap-3 mt-1">
                <button type="submit" className="btn-primary flex-1" disabled={saving}>
                  {saving ? 'Creating…' : 'Create User'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* User list */}
        <div className="space-y-3">
          {users.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <UserIcon size={40} className="mx-auto mb-3 opacity-30" />
              <p>No users yet. Add your first member!</p>
            </div>
          ) : users.map(u => (
            <div key={u._id} className="bg-surface-card border border-surface-border rounded-xl px-5 py-4 flex items-center gap-4 animate-fade-in card-hover">
              <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-brand-400 font-bold text-sm">{u.name.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-white text-sm">{u.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-amber-500/20 text-amber-400' : 'bg-brand-500/20 text-brand-400'}`}>
                    {u.role}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className="text-xs text-slate-400 flex items-center gap-1"><Mail size={11} />{u.email}</span>
                  <span className="text-xs text-slate-400 flex items-center gap-1"><Phone size={11} />{u.phone}</span>
                </div>
              </div>
              {u._id !== user?.id && (
                <button onClick={() => handleDelete(u._id, u.name)} className="text-slate-600 hover:text-red-400 transition-colors p-1.5">
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
