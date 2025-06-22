'use client';

import { useState } from 'react';
import { 
  PlusIcon,
  CalendarIcon,
  ChartBarIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import SocialCalendar from './components/SocialCalendar';
import PlatformStatsPanel from './components/PlatformStatsPanel';
import PostEditorModal from './components/PostEditorModal';
import CredentialStatusBar from './components/CredentialStatusBar';

const tabs = [
  { id: 'calendar', name: 'Calendar', icon: CalendarIcon },
  { id: 'analytics', name: 'Analytics', icon: ChartBarIcon },
  { id: 'settings', name: 'Settings', icon: Cog6ToothIcon },
];

export default function SocialPage() {
  const [activeTab, setActiveTab] = useState('calendar');
  const [showPostEditor, setShowPostEditor] = useState(false);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Social Media</h1>
            <p className="text-gray-600">Schedule and manage your social media presence</p>
          </div>
          <button
            onClick={() => setShowPostEditor(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            Create Post
          </button>
        </div>

        {/* Platform Status */}
        <CredentialStatusBar />

        {/* Tabs */}
        <div className="mt-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'calendar' && <SocialCalendar />}
        {activeTab === 'analytics' && <PlatformStatsPanel />}
        {activeTab === 'settings' && (
          <div className="p-6">
            <div className="text-center py-12">
              <Cog6ToothIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Platform Settings</h3>
              <p className="text-gray-600">Coming soon - Platform connection settings</p>
            </div>
          </div>
        )}
      </div>

      {/* Post Editor Modal */}
      {showPostEditor && (
        <PostEditorModal onClose={() => setShowPostEditor(false)} />
      )}
    </div>
  );
} 