'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/components/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Send, Image as ImageIcon, X, Users, MessageSquare } from 'lucide-react';

interface Message {
  _id: string;
  userId: { _id: string; name: string };
  text?: string;
  imageUrl?: string;
  createdAt: string;
}

interface WorkType { _id: string; name: string; icon: string; color: string; }
interface Work { _id: string; userId: { _id: string; name: string }; workTypeId: WorkType; date: string; completed: boolean; }

function timeAgo(dateStr: string) {
  const d = new Date(dateStr);
  const diff = Date.now() - d.getTime();
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString();
}

export default function TeamPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [works, setWorks] = useState<Work[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'team'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => { if (!loading && !user) router.push('/login'); }, [user, loading, router]);

  const fetchMessages = useCallback(async () => {
    const res = await fetch('/api/chat');
    if (res.ok) setMessages(await res.json());
  }, []);

  const fetchWorks = useCallback(async () => {
    const res = await fetch(`/api/works?date=${today}`);
    if (res.ok) setWorks(await res.json());
  }, [today]);

  useEffect(() => {
    if (!user) return;
    fetchMessages();
    fetchWorks();
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, [user, fetchMessages, fetchWorks]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Max file size: 5MB'); return; }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const sendMessage = async () => {
    if (!text.trim() && !imageFile) return;
    setSending(true);
    try {
      let imageUrl: string | undefined;
      if (imageFile) {
        const fd = new FormData();
        fd.append('file', imageFile);
        const upRes = await fetch('/api/upload', { method: 'POST', body: fd });
        if (upRes.ok) { const d = await upRes.json(); imageUrl = d.url; }
        else { toast.error('Image upload failed'); return; }
      }
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim() || undefined, imageUrl }),
      });
      if (!res.ok) { toast.error('Failed to send'); return; }
      setText('');
      setImageFile(null);
      setImagePreview(null);
      fetchMessages();
    } finally { setSending(false); }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  if (loading) return <div className="page-wrapper"><div className="page-content flex justify-center pt-20">
    <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
  </div></div>;

  return (
    <div className="page-wrapper">
      <Sidebar />
      <div className="page-content max-w-3xl mx-auto pb-0">
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-white">Team</h1>
          <p className="text-slate-400 text-sm">Chat and view today's work status</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-surface-card border border-surface-border rounded-xl p-1 mb-5">
          {([['chat', 'Chat', MessageSquare], ['team', "Today's Work", Users]] as const).map(([tab, label, Icon]) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === tab ? 'bg-brand-500/20 text-brand-400' : 'text-slate-400 hover:text-white'}`}>
              <Icon size={15} />{label}
            </button>
          ))}
        </div>

        {activeTab === 'team' ? (
          /* Today's work overview */
          <div className="space-y-3">
            {works.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                <Users size={40} className="mx-auto mb-3 opacity-30" />
                <p>No tasks assigned for today</p>
              </div>
            ) : works.map(w => (
              <div key={w._id} className={`bg-surface-card border rounded-xl px-4 py-3.5 flex items-center gap-3 animate-fade-in ${w.completed ? 'border-brand-500/30' : 'border-surface-border'}`}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ backgroundColor: w.workTypeId.color + '20' }}>
                  {w.workTypeId.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{w.workTypeId.name}</p>
                  <p className="text-xs text-slate-400">{w.userId.name}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${w.completed ? 'bg-brand-500/20 text-brand-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  {w.completed ? '✓ Done' : 'Pending'}
                </span>
              </div>
            ))}
            <div className="mt-4 bg-surface-card border border-surface-border rounded-xl p-4">
              <p className="text-xs text-slate-400 mb-2">Today's Summary</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-3 bg-surface-elevated rounded-full overflow-hidden">
                  <div className="h-full bg-brand-500 rounded-full transition-all duration-700"
                    style={{ width: works.length ? `${works.filter(w => w.completed).length / works.length * 100}%` : '0%' }} />
                </div>
                <span className="text-sm font-mono font-bold text-white">
                  {works.filter(w => w.completed).length}/{works.length}
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Chat */
          <div className="bg-surface-card border border-surface-border rounded-2xl flex flex-col" style={{ height: 'calc(100vh - 240px)', minHeight: '400px' }}>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-10 text-slate-500">
                  <MessageSquare size={32} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No messages yet. Say hello!</p>
                </div>
              )}
              {messages.map(msg => {
                const isMe = msg.userId._id === user?.id;
                return (
                  <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                    <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                      {!isMe && (
                        <span className="text-xs font-medium text-brand-400 px-1">{msg.userId.name}</span>
                      )}
                      <div className={`rounded-2xl px-4 py-2.5 ${
                        isMe
                          ? 'bg-brand-600 text-white rounded-tr-sm'
                          : 'bg-surface-elevated text-slate-100 rounded-tl-sm'
                      }`}>
                        {msg.text && <p className="text-sm leading-relaxed">{msg.text}</p>}
                        {msg.imageUrl && (
                          <img src={msg.imageUrl} alt="uploaded" className="max-w-full rounded-lg mt-1 max-h-48 object-cover" />
                        )}
                      </div>
                      <span className="text-xs text-slate-500 px-1">{timeAgo(msg.createdAt)}</span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Image preview */}
            {imagePreview && (
              <div className="px-4 pb-2 flex items-center gap-2">
                <div className="relative inline-block">
                  <img src={imagePreview} alt="preview" className="h-16 w-16 object-cover rounded-lg border border-surface-border" />
                  <button onClick={() => { setImageFile(null); setImagePreview(null); }}
                    className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                    <X size={10} />
                  </button>
                </div>
              </div>
            )}

            {/* Input */}
            <div className="border-t border-surface-border px-3 py-3 flex items-center gap-2">
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-slate-400 hover:text-brand-400 transition-colors rounded-lg hover:bg-brand-500/10"
              >
                <ImageIcon size={20} />
              </button>
              <input
                type="text"
                className="flex-1 bg-surface-elevated border border-surface-border rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 text-sm"
                placeholder="Type a message…"
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={handleKey}
              />
              <button
                onClick={sendMessage}
                disabled={sending || (!text.trim() && !imageFile)}
                className="p-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white rounded-xl transition-all active:scale-95"
              >
                {sending ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Send size={16} />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
