'use client';

import { useState } from 'react';
import { 
  HeartIcon,
  ChatBubbleLeftIcon,
  ArrowPathIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

const platforms = [
  { id: 'facebook', name: 'Facebook', color: 'bg-blue-500' },
  { id: 'instagram', name: 'Instagram', color: 'bg-pink-500' },
  { id: 'twitter', name: 'Twitter', color: 'bg-sky-500' },
  { id: 'linkedin', name: 'LinkedIn', color: 'bg-blue-700' },
];

export default function PlatformStatsPanel() {
  const [selectedPlatform, setSelectedPlatform] = useState('facebook');
  const [timeRange, setTimeRange] = useState('7d');

  // Mock analytics data
  const platformStats = {
    facebook: {
      followers: 12453,
      engagement: 3.2,
      reach: 45678,
      posts: 8,
      likes: 1234,
      comments: 89,
      shares: 45,
      trend: 'up',
      trendPercent: 12.3,
    },
    instagram: {
      followers: 8921,
      engagement: 4.8,
      reach: 23456,
      posts: 12,
      likes: 2341,
      comments: 156,
      shares: 78,
      trend: 'up',
      trendPercent: 8.7,
    },
    twitter: {
      followers: 15623,
      engagement: 2.1,
      reach: 67890,
      posts: 15,
      likes: 890,
      comments: 234,
      shares: 123,
      trend: 'down',
      trendPercent: -2.1,
    },
    linkedin: {
      followers: 3456,
      engagement: 6.2,
      reach: 12345,
      posts: 4,
      likes: 345,
      comments: 67,
      shares: 23,
      trend: 'up',
      trendPercent: 15.4,
    },
  };

  const currentStats = platformStats[selectedPlatform as keyof typeof platformStats];

  const topPosts = [
    {
      id: '1',
      content: 'Exciting AI updates coming to NeonHub! 🚀',
      platform: 'facebook',
      publishedAt: '2024-01-15',
      likes: 234,
      comments: 45,
      shares: 12,
      engagement: 5.2,
    },
    {
      id: '2',
      content: 'Behind the scenes at NeonHub',
      platform: 'instagram',
      publishedAt: '2024-01-14',
      likes: 456,
      comments: 78,
      shares: 23,
      engagement: 7.8,
    },
    {
      id: '3',
      content: 'Just shipped a new feature! Check it out 👀',
      platform: 'twitter',
      publishedAt: '2024-01-13',
      likes: 89,
      comments: 23,
      shares: 45,
      engagement: 3.4,
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Analytics</h2>
        
        <div className="flex items-center gap-4">
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Platform Selector */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Platforms</h3>
            
            <div className="space-y-2">
              {platforms.map(platform => (
                <button
                  key={platform.id}
                  onClick={() => setSelectedPlatform(platform.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    selectedPlatform === platform.id
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-4 h-4 rounded ${platform.color}`}></div>
                  <span className="font-medium text-gray-900">{platform.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Analytics Overview */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900 capitalize">
                {selectedPlatform} Analytics
              </h3>
              <div className="flex items-center gap-2">
                                 {currentStats.trend === 'up' ? (
                   <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
                 ) : (
                   <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />
                 )}
                <span className={`text-sm font-medium ${
                  currentStats.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {currentStats.trendPercent > 0 ? '+' : ''}{currentStats.trendPercent}%
                </span>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {currentStats.followers.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Followers</div>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {currentStats.engagement}%
                </div>
                <div className="text-sm text-gray-600">Engagement</div>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {currentStats.reach.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Reach</div>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {currentStats.posts}
                </div>
                <div className="text-sm text-gray-600">Posts</div>
              </div>
            </div>

            {/* Engagement Breakdown */}
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <HeartIcon className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">{currentStats.likes}</div>
                  <div className="text-sm text-gray-600">Likes</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ChatBubbleLeftIcon className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">{currentStats.comments}</div>
                  <div className="text-sm text-gray-600">Comments</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <ArrowPathIcon className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">{currentStats.shares}</div>
                  <div className="text-sm text-gray-600">Shares</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing Posts */}
      <div className="mt-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Performing Posts</h3>
          
          <div className="space-y-4">
            {topPosts.map(post => (
              <div key={post.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 mb-1">{post.content}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="capitalize">{post.platform}</span>
                    <span>{post.publishedAt}</span>
                    <span>{post.engagement}% engagement</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-1">
                    <HeartIcon className="h-4 w-4 text-red-500" />
                    <span>{post.likes}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ChatBubbleLeftIcon className="h-4 w-4 text-blue-500" />
                    <span>{post.comments}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ArrowPathIcon className="h-4 w-4 text-green-500" />
                    <span>{post.shares}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 