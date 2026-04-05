import type { Metadata } from 'next';
import { Sora, Space_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/AuthContext';
import { Toaster } from 'react-hot-toast';

const sora = Sora({ subsets: ['latin'], variable: '--font-sora', display: 'swap' });
const spaceMono = Space_Mono({ subsets: ['latin'], variable: '--font-space-mono', weight: ['400', '700'], display: 'swap' });

export const metadata: Metadata = {
  title: 'FlatWork – Flat Work Manager',
  description: 'Manage chores and tasks across your flat',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sora.variable} ${spaceMono.variable}`}>
      <body className="bg-surface text-white antialiased">
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: { background: '#1e293b', color: '#fff', border: '1px solid #334155' },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
