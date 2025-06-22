'use client';

import { useState } from 'react';
import { 
  PlusIcon,
  EnvelopeIcon,
  ChartBarIcon,
  ClockIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import EmailDashboard from './components/EmailDashboard';
import EmailComposer from './components/EmailComposer';

const tabs = [
  { id: 'dashboard', name: 'Dashboard', icon: ChartBarIcon },
  { id: 'campaigns', name: 'Campaigns', icon: EnvelopeIcon },
  { id: 'templates', name: 'Templates', icon: ClockIcon },
  { id: 'audiences', name: 'Audiences', icon: UserGroupIcon },
];

export default function EmailPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showComposer, setShowComposer] = useState(false);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Email Marketing</h1>
            <p className="text-gray-600">Create and manage email campaigns with AI</p>
          </div>
          <button
            onClick={() => setShowComposer(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            New Campaign
          </button>
        </div>

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
        {activeTab === 'dashboard' && <EmailDashboard />}
        {activeTab === 'campaigns' && <EmailDashboard showCampaigns />}
        {activeTab === 'templates' && (
          <div className="p-6">
            <div className="text-center py-12">
              <EnvelopeIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Email Templates</h3>
              <p className="text-gray-600">Coming soon - Pre-built email templates</p>
            </div>
          </div>
        )}
        {activeTab === 'audiences' && (
          <div className="p-6">
            <div className="text-center py-12">
              <UserGroupIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Audience Management</h3>
              <p className="text-gray-600">Coming soon - Audience segmentation</p>
            </div>
          </div>
        )}
      </div>

      {/* Email Composer Modal */}
      {showComposer && (
        <EmailComposer onClose={() => setShowComposer(false)} />
      )}
    </div>
  );
} 