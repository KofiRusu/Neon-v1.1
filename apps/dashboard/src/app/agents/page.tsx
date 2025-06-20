'use client'

import { trpc } from '../../lib/trpc'
import { SparklesIcon, PlayIcon, PauseIcon } from '@heroicons/react/24/outline'

export default function AgentsPage() {
  const { data: recentActions, isLoading } = trpc.agent.getRecentActions.useQuery({ limit: 10 })

  return (
    <div className="min-h-screen bg-dark-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gradient mb-2">AI Agents</h1>
            <p className="text-dark-400">Monitor and control your autonomous marketing agents</p>
          </div>
          <button className="btn-primary flex items-center space-x-2">
            <SparklesIcon className="h-5 w-5" />
            <span>Deploy New Agent</span>
          </button>
        </div>

        {/* Recent Agent Activity */}
        <div className="card-glow mb-8">
          <h2 className="text-xl font-semibold text-white mb-6">Recent Agent Activity</h2>
          {isLoading ? (
            <div className="text-dark-400">Loading agent activity...</div>
          ) : (
            <div className="space-y-3">
              {recentActions?.map((activity: any) => (
                <div key={activity.id} className="activity-item">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-neon-400 rounded-full animate-pulse"></div>
                      <div>
                        <p className="text-white font-medium">{activity.agent}</p>
                        <p className="text-dark-400 text-sm">{activity.action}</p>
                      </div>
                    </div>
                    <span className="text-dark-400 text-sm">
                      {new Date(activity.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
              {(!recentActions || recentActions.length === 0) && (
                <div className="text-dark-400">No recent agent activity</div>
              )}
            </div>
          )}
        </div>

        {/* Agent Control Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { name: 'Content Agent', status: 'active', color: 'text-blue-400' },
            { name: 'Ad Agent', status: 'active', color: 'text-green-400' },
            { name: 'Outreach Agent', status: 'idle', color: 'text-purple-400' },
            { name: 'Trend Agent', status: 'active', color: 'text-orange-400' },
            { name: 'Insight Agent', status: 'active', color: 'text-cyan-400' },
            { name: 'Design Agent', status: 'idle', color: 'text-pink-400' },
          ].map((agent) => (
            <div key={agent.name} className="agent-card">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <SparklesIcon className={`h-8 w-8 ${agent.color}`} />
                  <div>
                    <h3 className="text-white font-medium">{agent.name}</h3>
                    <p className="text-dark-400 text-xs">AI-powered automation</p>
                  </div>
                </div>
                <div className={`status-indicator ${agent.status}`}></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-dark-400 text-sm capitalize">{agent.status}</span>
                <button className="btn-pill">
                  {agent.status === 'active' ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 