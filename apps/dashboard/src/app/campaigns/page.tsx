'use client'

import { trpc } from '../../lib/trpc'
import { MegaphoneIcon, PlusIcon, ChartBarIcon } from '@heroicons/react/24/outline'

export default function CampaignsPage() {
  const { data: campaigns, isLoading } = trpc.campaign.getAll.useQuery({ limit: 20 })
  const { data: stats } = trpc.campaign.getStats.useQuery()

  return (
    <div className="min-h-screen bg-dark-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gradient mb-2">Campaigns</h1>
            <p className="text-dark-400">Manage your AI-powered marketing campaigns</p>
          </div>
          <button className="btn-primary flex items-center space-x-2">
            <PlusIcon className="h-5 w-5" />
            <span>Create Campaign</span>
          </button>
        </div>

        {/* Campaign Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="metric-card">
              <div className="flex items-center justify-between mb-4">
                <MegaphoneIcon className="h-8 w-8 text-blue-400" />
              </div>
              <div>
                <p className="text-dark-400 text-sm font-medium">Total Campaigns</p>
                <p className="text-3xl font-bold text-white neon-text">{stats.total}</p>
              </div>
            </div>
            <div className="metric-card">
              <div className="flex items-center justify-between mb-4">
                <ChartBarIcon className="h-8 w-8 text-green-400" />
              </div>
              <div>
                <p className="text-dark-400 text-sm font-medium">Active</p>
                <p className="text-3xl font-bold text-white neon-text">{stats.active}</p>
              </div>
            </div>
            <div className="metric-card">
              <div className="flex items-center justify-between mb-4">
                <ChartBarIcon className="h-8 w-8 text-cyan-400" />
              </div>
              <div>
                <p className="text-dark-400 text-sm font-medium">Completed</p>
                <p className="text-3xl font-bold text-white neon-text">{stats.completed}</p>
              </div>
            </div>
            <div className="metric-card">
              <div className="flex items-center justify-between mb-4">
                <ChartBarIcon className="h-8 w-8 text-purple-400" />
              </div>
              <div>
                <p className="text-dark-400 text-sm font-medium">Draft</p>
                <p className="text-3xl font-bold text-white neon-text">{stats.draft}</p>
              </div>
            </div>
          </div>
        )}

        {/* Campaigns List */}
        <div className="card-glow">
          <h2 className="text-xl font-semibold text-white mb-6">All Campaigns</h2>
          {isLoading ? (
            <div className="text-dark-400">Loading campaigns...</div>
          ) : (
            <div className="space-y-4">
              {campaigns?.map((campaign) => (
                <div key={campaign.id} className="border border-dark-700 rounded-lg p-4 hover:border-neon-400/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${
                        campaign.status === 'ACTIVE' ? 'bg-green-400' :
                        campaign.status === 'COMPLETED' ? 'bg-blue-400' :
                        campaign.status === 'PAUSED' ? 'bg-yellow-400' :
                        'bg-gray-400'
                      }`}></div>
                      <div>
                        <h3 className="text-white font-medium">{campaign.name}</h3>
                        <p className="text-dark-400 text-sm">
                          {campaign.type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        campaign.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' :
                        campaign.status === 'COMPLETED' ? 'bg-blue-500/20 text-blue-400' :
                        campaign.status === 'PAUSED' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {campaign.status}
                      </span>
                      <span className="text-dark-400 text-sm">
                        {new Date(campaign.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {(!campaigns || campaigns.length === 0) && (
                <div className="text-center text-dark-400 py-8">
                  <MegaphoneIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No campaigns found. Create your first campaign to get started!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 