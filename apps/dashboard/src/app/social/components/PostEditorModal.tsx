'use client';

import { useState } from 'react';
import { 
  XMarkIcon,
  CalendarIcon,
  SparklesIcon,
  PhotoIcon,
  LinkIcon
} from '@heroicons/react/24/outline';
import { trpc } from '../../../lib/trpc';

interface PostEditorModalProps {
  onClose: () => void;
}

const platforms = [
  { id: 'facebook', name: 'Facebook', color: 'bg-blue-500', limit: 63206 },
  { id: 'instagram', name: 'Instagram', color: 'bg-pink-500', limit: 2200 },
  { id: 'twitter', name: 'Twitter', color: 'bg-sky-500', limit: 280 },
  { id: 'linkedin', name: 'LinkedIn', color: 'bg-blue-700', limit: 3000 },
  { id: 'tiktok', name: 'TikTok', color: 'bg-black', limit: 2200 },
];

export default function PostEditorModal({ onClose }: PostEditorModalProps) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['facebook']);
  const [postData, setPostData] = useState({
    content: {
      text: '',
      hashtags: [] as string[],
      mentions: [] as string[],
    },
    scheduling: {
      publishNow: true,
      scheduledAt: undefined as Date | undefined,
    },
    settings: {
      enableComments: true,
      crossPost: [] as string[],
    },
  });

  const publishPostMutation = trpc.social.publishPost.useMutation({
    onSuccess: () => {
      onClose();
    },
    onError: (error) => {
      console.error('Failed to publish post:', error);
    },
  });

  const schedulePostMutation = trpc.social.schedulePost.useMutation({
    onSuccess: () => {
      onClose();
    },
    onError: (error) => {
      console.error('Failed to schedule post:', error);
    },
  });

  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const handlePublish = async () => {
    if (!postData.content.text || selectedPlatforms.length === 0) return;

    for (const platform of selectedPlatforms) {
             const payload = {
         platform: platform as 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'tiktok',
         content: postData.content,
         scheduling: postData.scheduling,
         settings: postData.settings,
       };

      try {
        if (postData.scheduling.publishNow) {
          await publishPostMutation.mutateAsync(payload);
        } else {
          await schedulePostMutation.mutateAsync(payload);
        }
      } catch (error) {
        console.error(`Failed to post to ${platform}:`, error);
      }
    }
  };

  const getCharacterLimit = () => {
    if (selectedPlatforms.length === 1) {
      const platform = platforms.find(p => p.id === selectedPlatforms[0]);
      return platform?.limit || 280;
    }
    return Math.min(...selectedPlatforms.map(id => 
      platforms.find(p => p.id === id)?.limit || 280
    ));
  };

  const characterCount = postData.content.text.length;
  const characterLimit = getCharacterLimit();
  const isOverLimit = characterCount > characterLimit;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create Post</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Platform Selection */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Select Platforms</h3>
            <div className="flex flex-wrap gap-2">
              {platforms.map(platform => (
                <button
                  key={platform.id}
                  onClick={() => handlePlatformToggle(platform.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                    selectedPlatforms.includes(platform.id)
                      ? 'border-blue-300 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-3 h-3 rounded ${platform.color}`}></div>
                  {platform.name}
                </button>
              ))}
            </div>
          </div>

          {/* Content Editor */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Post Content
              </label>
              <div className="flex items-center gap-2">
                <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  <SparklesIcon className="h-4 w-4" />
                  AI Generate
                </button>
                <span className={`text-sm ${
                  isOverLimit ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {characterCount}/{characterLimit}
                </span>
              </div>
            </div>
            <textarea
              value={postData.content.text}
              onChange={(e) => setPostData(prev => ({
                ...prev,
                content: { ...prev.content, text: e.target.value }
              }))}
              placeholder="What's on your mind?"
              rows={6}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 resize-none ${
                isOverLimit 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {isOverLimit && (
              <p className="text-sm text-red-600 mt-1">
                Content exceeds character limit for selected platforms
              </p>
            )}
          </div>

          {/* Media & Links */}
          <div className="mb-6">
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:border-gray-300">
                <PhotoIcon className="h-4 w-4" />
                Add Media
              </button>
              <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:border-gray-300">
                <LinkIcon className="h-4 w-4" />
                Add Link
              </button>
            </div>
          </div>

          {/* Scheduling */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Scheduling</h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={postData.scheduling.publishNow}
                  onChange={() => setPostData(prev => ({
                    ...prev,
                    scheduling: { ...prev.scheduling, publishNow: true, scheduledAt: undefined }
                  }))}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Publish now</span>
              </label>

              <label className="flex items-center">
                <input
                  type="radio"
                  checked={!postData.scheduling.publishNow}
                  onChange={() => setPostData(prev => ({
                    ...prev,
                    scheduling: { ...prev.scheduling, publishNow: false }
                  }))}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Schedule for later</span>
              </label>

              {!postData.scheduling.publishNow && (
                <div className="ml-6">
                  <input
                    type="datetime-local"
                    value={postData.scheduling.scheduledAt?.toISOString().slice(0, 16) || ''}
                    onChange={(e) => setPostData(prev => ({
                      ...prev,
                      scheduling: { ...prev.scheduling, scheduledAt: new Date(e.target.value) }
                    }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Settings</h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={postData.settings.enableComments}
                  onChange={(e) => setPostData(prev => ({
                    ...prev,
                    settings: { ...prev.settings, enableComments: e.target.checked }
                  }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Enable comments</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CalendarIcon className="h-4 w-4" />
            Posting to {selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? 's' : ''}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              onClick={handlePublish}
              disabled={!postData.content.text || selectedPlatforms.length === 0 || isOverLimit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {postData.scheduling.publishNow ? 'Publish' : 'Schedule'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 