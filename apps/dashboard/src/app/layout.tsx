'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { api } from '../utils/trpc';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <html lang="en">
      <head>
        <title>NeonHub Dashboard</title>
        <meta name="description" content="AI-powered marketing automation platform" />
      </head>
      <body className={inter.className}>
        <api.Provider>{children}</api.Provider>
      </body>
    </html>
  );
}
