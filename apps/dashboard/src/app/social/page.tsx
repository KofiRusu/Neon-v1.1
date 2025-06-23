'use client';

import { useState } from 'react';
import { SocialCalendar } from './components/SocialCalendar';
import { PostEditorModal } from './components/PostEditorModal';
import { PlatformStatsPanel } from './components/PlatformStatsPanel';
import { CredentialStatusBar } from './components/CredentialStatusBar';

export default function SocialPage() {
  const [showPostEditor, setShowPostEditor] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');

  return (
    <div className="min-h-screen bg-dark-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-700 mb-2">
          Social Media Management
        </h1>
        <p className="text-neutral-600">
          Manage your social media presence across all platforms
        </p>
      </div>

      {/* Credential Status */}
      <CredentialStatusBar />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Left Column: Calendar */}
        <div className="lg:col-span-2">
          <div className="bg-neutral-900 rounded-2xl p-6 border border-neutral-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-neutral-700">
                Content Calendar
              </h2>
              <button
                onClick={() => setShowPostEditor(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Create Post
              </button>
            </div>
            <SocialCalendar />
          </div>
        </div>

        {/* Right Column: Stats */}
        <div className="space-y-6">
          {/* Platform Filter */}
          <div className="bg-neutral-900 rounded-2xl p-4 border border-neutral-800">
            <h3 className="text-lg font-medium text-neutral-600 mb-3">
              Platform Filter
            </h3>
            <div className="space-y-2">
              {['all', 'instagram', 'twitter', 'linkedin', 'facebook'].map((platform) => (
                <button
                  key={platform}
                  onClick={() => setSelectedPlatform(platform)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedPlatform === platform
                      ? 'bg-blue-600 text-white'
                      : 'text-neutral-500 hover:bg-neutral-800'
                  }`}
                >
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Platform Stats */}
          <PlatformStatsPanel selectedPlatform={selectedPlatform} />

          {/* Recent Activity */}
          <div className="bg-neutral-900 rounded-2xl p-4 border border-neutral-800">
            <h3 className="text-lg font-medium text-neutral-600 mb-3">
              Recent Activity
            </h3>
            <div className="space-y-3">
              {[
                { action: 'Post published', platform: 'Instagram', time: '2 hours ago' },
                { action: 'Story uploaded', platform: 'Twitter', time: '4 hours ago' },
                { action: 'Video scheduled', platform: 'LinkedIn', time: '1 day ago' },
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-neutral-500 text-sm">{activity.action}</p>
                    <p className="text-neutral-700 text-xs">{activity.platform}</p>
                  </div>
                  <span className="text-neutral-600 text-xs">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
          <h3 className="text-lg font-medium text-slate-700 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="bg-gray-800 hover:bg-gray-700 text-gray-500 p-4 rounded-lg transition-colors">
              <img src="/icons/analytics.svg" className="w-8 h-8 mx-auto mb-2" />
              <span className="text-sm">Analytics</span>
            </button>
            <button className="bg-gray-800 hover:bg-gray-700 text-gray-500 p-4 rounded-lg transition-colors">
              <img src="/icons/schedule.svg" className="w-8 h-8 mx-auto mb-2" />
              <span className="text-sm">Schedule</span>
            </button>
            <button className="bg-gray-800 hover:bg-gray-700 text-gray-500 p-4 rounded-lg transition-colors">
              <img src="/icons/content.svg" className="w-8 h-8 mx-auto mb-2" />
              <span className="text-sm">Content Library</span>
            </button>
            <button className="bg-gray-800 hover:bg-gray-700 text-gray-500 p-4 rounded-lg transition-colors">
              <img src="/icons/settings.svg" className="w-8 h-8 mx-auto mb-2" />
              <span className="text-sm">Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Post Editor Modal */}
      {showPostEditor && (
        <PostEditorModal 
          isOpen={showPostEditor}
          onClose={() => setShowPostEditor(false)}
        />
      )}
    </div>
  );
}