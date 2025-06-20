'use client'

import { ChartBarIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline'

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-dark-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gradient mb-2">Analytics</h1>
            <p className="text-dark-400">Deep insights into your marketing performance</p>
          </div>
          <button className="btn-secondary">Export Report</button>
        </div>

        <div className="card-glow">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Performance Analytics</h2>
            <ArrowTrendingUpIcon className="h-6 w-6 text-neon-400" />
          </div>
          <div className="text-center text-dark-400 py-12">
            <ChartBarIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-xl mb-2">Advanced Analytics Coming Soon</p>
            <p>Comprehensive performance tracking and insights will be available here.</p>
          </div>
        </div>
      </div>
    </div>
  )
} 