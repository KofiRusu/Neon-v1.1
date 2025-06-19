import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NeonHub AI Marketing Ecosystem',
  description: 'Self-operating, AI-driven marketing and sales platform',
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
      <body className="min-h-screen bg-dark-900">
        {children}
      </body>
    </html>
  );
} 