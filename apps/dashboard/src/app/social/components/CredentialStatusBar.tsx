'use client';

import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const platforms = [
  { id: 'facebook', name: 'Facebook', status: 'connected', color: 'bg-blue-500' },
  { id: 'instagram', name: 'Instagram', status: 'connected', color: 'bg-pink-500' },
  { id: 'twitter', name: 'Twitter', status: 'warning', color: 'bg-sky-500' },
  { id: 'linkedin', name: 'LinkedIn', status: 'disconnected', color: 'bg-blue-700' },
  { id: 'tiktok', name: 'TikTok', status: 'disconnected', color: 'bg-black' },
];

export default function CredentialStatusBar() {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircleIcon className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600" />;
      case 'disconnected':
        return <XCircleIcon className="h-4 w-4 text-red-600" />;
      default:
        return <XCircleIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'warning':
        return 'Token expiring';
      case 'disconnected':
        return 'Not connected';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'disconnected':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="mt-4">
      <div className="flex items-center gap-4 text-sm">
        <span className="text-gray-600">Platform Status:</span>
        <div className="flex items-center gap-3">
          {platforms.map(platform => (
            <div
              key={platform.id}
              className={`flex items-center gap-2 px-3 py-1 rounded-lg border ${getStatusColor(platform.status)}`}
            >
              <div className={`w-2 h-2 rounded ${platform.color}`}></div>
              {getStatusIcon(platform.status)}
              <span className="font-medium">{platform.name}</span>
              <span className="text-xs text-gray-600">{getStatusText(platform.status)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 