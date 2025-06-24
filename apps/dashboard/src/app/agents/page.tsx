'use client';

import { useState, useEffect } from 'react';
import { api } from '../../utils/trpc';
import {
  CpuChipIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  ChatBubbleLeftIcon,
  ChartBarIcon,
  PaintBrushIcon,
  BoltIcon,
  MagnifyingGlassIcon,
  PlayIcon,
  PauseIcon,
  Cog6ToothIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

interface Agent {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive' | 'error';
  performance: number;
  lastAction: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
}

export default function AgentsPage(): JSX.Element {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const agents: Agent[] = [
    {
      id: 'content',
      name: 'ContentAgent',
      type: 'Content Generation',
      status: 'active',
      performance: 94,
      lastAction: '2 min ago',
      description: 'AI-powered content generation and optimization',
      icon: DocumentTextIcon,
      color: 'text-blue-400'
    },
    {
      id: 'email',
      name: 'EmailAgent',
      type: 'Email Marketing',
      status: 'active',
      performance: 91,
      lastAction: '1 min ago',
      description: 'Automated email campaigns and sequences',
      icon: EnvelopeIcon,
      color: 'text-purple-400'
    },
    {
      id: 'social',
      name: 'SocialAgent',
      type: 'Social Media',
      status: 'active',
      performance: 89,
      lastAction: '3 min ago',
      description: 'Multi-platform social media management',
      icon: GlobeAltIcon,
      color: 'text-green-400'
    },
    {
      id: 'support',
      name: 'SupportAgent',
      type: 'Customer Support',
      status: 'active',
      performance: 96,
      lastAction: '4 min ago',
      description: 'AI-powered customer support automation',
      icon: ChatBubbleLeftIcon,
      color: 'text-pink-400'
    },
    {
      id: 'seo',
      name: 'SEOAgent',
      type: 'SEO Optimization',
      status: 'active',
      performance: 87,
      lastAction: '5 min ago',
      description: 'Search engine optimization and keyword targeting',
      icon: MagnifyingGlassIcon,
      color: 'text-indigo-400'
    },
    {
      id: 'insight',
      name: 'InsightAgent',
      type: 'Analytics & Insights',
      status: 'active',
      performance: 92,
      lastAction: '6 min ago',
      description: 'Advanced analytics and performance insights',
      icon: ChartBarIcon,
      color: 'text-cyan-400'
    },
    {
      id: 'design',
      name: 'DesignAgent',
      type: 'Creative Design',
      status: 'active',
      performance: 88,
      lastAction: '8 min ago',
      description: 'AI-powered creative asset generation',
      icon: PaintBrushIcon,
      color: 'text-orange-400'
    },
    {
      id: 'ad',
      name: 'AdAgent',
      type: 'Ad Optimization',
      status: 'active',
      performance: 93,
      lastAction: '7 min ago',
      description: 'Automated ad optimization and bidding',
      icon: BoltIcon,
      color: 'text-yellow-400'
    },
  ];

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active':
        return 'text-green-400 bg-green-400/20';
      case 'inactive':
        return 'text-gray-400 bg-gray-400/20';
      case 'error':
        return 'text-red-400 bg-red-400/20';
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getStatusIcon = (status: string): React.ComponentType<any> => {
    switch (status) {
      case 'active':
        return CheckCircleIcon;
      case 'error':
        return ExclamationTriangleIcon;
      default:
        return Cog6ToothIcon;
    }
  };

  return (
    <div className="min-h-screen bg-space-gray">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-3xl font-bold text-white">AI Agents Hub</h1>
              <p className="text-gray-400 mt-1">Manage and monitor your AI workforce</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-400">All systems operational</span>
              </div>
              <div className="text-sm text-gray-500">{currentTime.toLocaleTimeString()}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {agents.map((agent) => {
            const Icon = agent.icon;
            const StatusIcon = getStatusIcon(agent.status);
            
            return (
              <div
                key={agent.id}
                className={`glass-strong p-6 rounded-2xl hover:scale-105 transition-all duration-300 cursor-pointer ${
                  selectedAgent === agent.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedAgent(selectedAgent === agent.id ? null : agent.id)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${getStatusColor(agent.status)}`}>
                    <StatusIcon className="h-4 w-4" />
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="text-lg font-bold text-white mb-1">{agent.name}</h3>
                  <p className="text-sm text-gray-400 mb-2">{agent.type}</p>
                  <p className="text-xs text-gray-500">{agent.description}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Performance</span>
                    <span className={`font-semibold ${agent.color}`}>{agent.performance}%</span>
                  </div>
                  
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${agent.performance}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Last action</span>
                    <span className="text-gray-400">{agent.lastAction}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="flex items-center justify-between">
                    <button className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors">
                      <PlayIcon className="h-4 w-4" />
                      <span className="text-sm">Configure</span>
                    </button>
                    <button className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
                      <ArrowTrendingUpIcon className="h-4 w-4" />
                      <span className="text-sm">View Metrics</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Agent Details Panel */}
        {selectedAgent && (
          <div className="mt-8 glass-strong p-6 rounded-2xl">
            <h2 className="text-xl font-bold text-white mb-4">
              {agents.find(a => a.id === selectedAgent)?.name} Details
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Recent Activity</h3>
                <div className="space-y-3">
                  {[1, 2, 3].map((_, index) => (
                    <div key={index} className="glass p-3 rounded-lg">
                      <p className="text-sm text-white">Sample activity {index + 1}</p>
                      <p className="text-xs text-gray-400 mt-1">{index + 1} minutes ago</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Performance Metrics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Success Rate</span>
                    <span className="text-green-400 font-semibold">98.5%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Response Time</span>
                    <span className="text-blue-400 font-semibold">1.2s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Tasks Completed</span>
                    <span className="text-purple-400 font-semibold">247</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
