import { Inter } from 'next/font/google';
import { Providers } from '../lib/providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'NeonHub Dashboard',
  description: 'AI-powered marketing automation platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <nav className="bg-white border-b border-gray-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                  <div className="flex">
                    <div className="flex-shrink-0 flex items-center">
                      <h1 className="text-xl font-bold text-gray-900">NeonHub</h1>
                    </div>
                    <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                      <a
                        href="/"
                        className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
                      >
                        Dashboard
                      </a>
                      <a
                        href="/agents"
                        className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
                      >
                        AI Agents
                      </a>
                      <a
                        href="/email"
                        className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
                      >
                        Email Marketing
                      </a>
                      <a
                        href="/social"
                        className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
                      >
                        Social Media
                      </a>
                      <a
                        href="/support"
                        className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
                      >
                        Customer Support
                      </a>
                      <a
                        href="/analytics"
                        className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
                      >
                        Analytics
                      </a>
                    </div>
                  </div>
                  <div className="hidden sm:ml-6 sm:flex sm:items-center">
                    <div className="ml-3 relative">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-700">Welcome back!</span>
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">U</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
