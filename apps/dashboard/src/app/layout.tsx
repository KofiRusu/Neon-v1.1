import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navigation from '@/components/Navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NeonHub AI Marketing Ecosystem',
  description: 'Advanced AI-powered marketing automation platform',
  keywords: ['AI', 'Marketing', 'Automation', 'NeonHub', 'Ecosystem'],
  authors: [{ name: 'NeonHub Team' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-dark-900">
          <Navigation />
          <div className="flex">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
} 