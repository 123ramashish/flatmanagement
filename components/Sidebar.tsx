'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthContext';
import {
  Users, ClipboardList, BarChart2,
  MessageSquare, LogOut, Home, Menu, X, Tag
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { href: '/work', label: 'My Work', icon: ClipboardList },
  { href: '/team', label: 'Team', icon: MessageSquare },
  { href: '/analysis', label: 'Analysis', icon: BarChart2, adminOnly: false },
  { href: '/users', label: 'Users', icon: Users, adminOnly: true },
  { href: '/worktypes', label: 'Work Types', icon: Tag, adminOnly: true },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const items = navItems.filter(i => !i.adminOnly || user?.role === 'admin');

  const NavContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-surface-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/30">
            <Home size={18} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">FlatWork</p>
            <p className="text-slate-400 text-xs truncate max-w-[120px]">{user?.name}</p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-surface-elevated'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-surface-border">
        <div className="px-3 py-2 mb-2">
          <p className="text-xs text-slate-500">Logged in as</p>
          <p className="text-sm text-white font-medium truncate">{user?.name}</p>
          <span className={`text-xs px-2 py-0.5 rounded-full ${user?.role === 'admin' ? 'bg-amber-500/20 text-amber-400' : 'bg-brand-500/20 text-brand-400'}`}>
            {user?.role}
          </span>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-surface-card border-b border-surface-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center">
            <Home size={14} className="text-white" />
          </div>
          <span className="text-white font-bold text-sm">FlatWork</span>
        </div>
        <button onClick={() => setOpen(!open)} className="text-slate-400 hover:text-white">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/50" onClick={() => setOpen(false)}>
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-surface-card border-r border-surface-border" onClick={e => e.stopPropagation()}>
            <div className="pt-14 h-full">
              <NavContent />
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:flex fixed left-0 top-0 bottom-0 w-60 bg-surface-card border-r border-surface-border flex-col z-20">
        <NavContent />
      </div>
    </>
  );
}
