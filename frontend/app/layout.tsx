import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Roxstar AI Voice Room Assistant',
  description: 'Real-time multi-bot Indian AI voice assistant in LiveKit',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
