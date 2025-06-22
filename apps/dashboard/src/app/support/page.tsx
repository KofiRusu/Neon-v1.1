'use client';

import { useState } from 'react';
import { 
  InboxIcon,
  ChartBarIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import SupportInbox from './components/SupportInbox';
import ThreadList from './components/ThreadList';
import ContactPanel from './components/ContactPanel';

const tabs = [
  { id: 'inbox', name: 'Inbox', icon: InboxIcon },
  { id: 'analytics', name: 'Analytics', icon: ChartBarIcon },
  { id: 'contacts', name: 'Contacts', icon: UserGroupIcon },
  { id: 'settings', name: 'Settings', icon: Cog6ToothIcon },
];

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState('inbox');
  const [selectedThread, setSelectedThread] = useState<string | null>(null);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Customer Support</h1>
            <p className="text-gray-600">Manage customer conversations and support tickets</p>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <PlusIcon className="h-5 w-5" />
            New Ticket
          </button>
        </div>

        {/* Support Stats */}
        <div className="mt-4 grid grid-cols-4 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-sm text-blue-600">Open Tickets</div>
            <div className="text-xl font-bold text-blue-900">12</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="text-sm text-yellow-600">Pending Review</div>
            <div className="text-xl font-bold text-yellow-900">3</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="text-sm text-green-600">Resolved Today</div>
            <div className="text-xl font-bold text-green-900">8</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <div className="text-sm text-purple-600">Avg Response Time</div>
            <div className="text-xl font-bold text-purple-900">4m</div>
          </div>
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
      <div className="flex-1 overflow-hidden">
        {activeTab === 'inbox' && (
          <div className="h-full flex">
            <div className="w-80 border-r border-gray-200">
              <ThreadList 
                selectedThread={selectedThread}
                onSelectThread={setSelectedThread}
              />
            </div>
            <div className="flex-1">
              <SupportInbox selectedThread={selectedThread} />
            </div>
          </div>
        )}
        
        {activeTab === 'analytics' && (
          <div className="p-6">
            <div className="text-center py-12">
              <ChartBarIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Support Analytics</h3>
              <p className="text-gray-600">Coming soon - Detailed support metrics and reporting</p>
            </div>
          </div>
        )}
        
        {activeTab === 'contacts' && <ContactPanel />}
        
        {activeTab === 'settings' && (
          <div className="p-6">
            <div className="text-center py-12">
              <Cog6ToothIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Support Settings</h3>
              <p className="text-gray-600">Coming soon - Configure support workflows and integrations</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 