'use client';

import { useState } from 'react';
import { 
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  ClockIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

export default function SocialCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Mock scheduled posts
  const scheduledPosts = [
    {
      id: '1',
      platform: 'facebook',
      content: 'Exciting AI updates coming to NeonHub! 🚀',
      scheduledAt: new Date(2024, 0, 18, 14, 0),
      status: 'scheduled',
      media: ['image1.jpg']
    },
    {
      id: '2',
      platform: 'instagram',
      content: 'Behind the scenes at NeonHub',
      scheduledAt: new Date(2024, 0, 19, 10, 30),
      status: 'scheduled',
      media: ['video1.mp4']
    },
    {
      id: '3',
      platform: 'twitter',
      content: 'Just shipped a new feature! Check it out 👀',
      scheduledAt: new Date(2024, 0, 20, 16, 0),
      status: 'published',
      media: []
    },
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getPostsForDate = (date: Date | null) => {
    if (!date) return [];
    return scheduledPosts.filter(post => {
      const postDate = new Date(post.scheduledAt);
      return postDate.toDateString() === date.toDateString();
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getPlatformColor = (platform: string) => {
    const colors = {
      facebook: 'bg-blue-500',
      instagram: 'bg-pink-500',
      twitter: 'bg-sky-500',
      linkedin: 'bg-blue-700',
      tiktok: 'bg-black',
      youtube: 'bg-red-500',
    };
    return colors[platform as keyof typeof colors] || 'bg-gray-500';
  };

  const days = getDaysInMonth(currentDate);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="p-6">
      <div className="flex gap-6 h-full">
        {/* Calendar */}
        <div className="flex-1">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Calendar Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {formatMonthYear(currentDate)}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-3 py-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  Today
                </button>
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="p-6">
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map(day => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                  const isToday = day && day.toDateString() === new Date().toDateString();
                  const isSelected = day && selectedDate && day.toDateString() === selectedDate.toDateString();
                  const posts = getPostsForDate(day);

                  return (
                    <div
                      key={index}
                      className={`min-h-24 border border-gray-200 rounded-lg p-2 cursor-pointer transition-colors ${
                        day ? 'hover:bg-gray-50' : ''
                      } ${isSelected ? 'bg-blue-50 border-blue-300' : ''}`}
                      onClick={() => day && setSelectedDate(day)}
                    >
                      {day && (
                        <>
                          <div className={`text-sm font-medium mb-1 ${
                            isToday ? 'text-blue-600' : 'text-gray-900'
                          }`}>
                            {day.getDate()}
                          </div>
                          
                          {/* Scheduled Posts */}
                          <div className="space-y-1">
                            {posts.slice(0, 2).map(post => (
                              <div
                                key={post.id}
                                className="text-xs p-1 rounded bg-gray-100 truncate"
                                title={post.content}
                              >
                                <div className="flex items-center gap-1">
                                  <div className={`w-2 h-2 rounded-full ${getPlatformColor(post.platform)}`}></div>
                                  <span className="truncate">{post.content.slice(0, 20)}...</span>
                                </div>
                              </div>
                            ))}
                            {posts.length > 2 && (
                              <div className="text-xs text-gray-500">
                                +{posts.length - 2} more
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 p-3 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <PlusIcon className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Create Post</div>
                  <div className="text-sm text-gray-600">Schedule new content</div>
                </div>
              </button>
            </div>
          </div>

          {/* Selected Date Posts */}
          {selectedDate && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {selectedDate.toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
              
              <div className="space-y-3">
                {getPostsForDate(selectedDate).map(post => (
                  <div key={post.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-3 h-3 rounded-full ${getPlatformColor(post.platform)}`}></div>
                      <span className="text-sm font-medium capitalize">{post.platform}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        post.status === 'published' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {post.status}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-900 mb-2">{post.content}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <ClockIcon className="h-3 w-3" />
                        {post.scheduledAt.toLocaleTimeString('en-US', { 
                          hour: 'numeric', 
                          minute: '2-digit' 
                        })}
                      </div>
                      {post.media.length > 0 && (
                        <span>{post.media.length} media</span>
                      )}
                    </div>
                  </div>
                ))}
                
                {getPostsForDate(selectedDate).length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No posts scheduled for this date
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Upcoming Posts */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Posts</h3>
            
            <div className="space-y-3">
              {scheduledPosts
                .filter(post => post.status === 'scheduled')
                .slice(0, 3)
                .map(post => (
                  <div key={post.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                    <div className={`w-3 h-3 rounded-full ${getPlatformColor(post.platform)}`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {post.content.slice(0, 30)}...
                      </p>
                      <p className="text-xs text-gray-500">
                        {post.scheduledAt.toLocaleDateString()} at{' '}
                        {post.scheduledAt.toLocaleTimeString('en-US', { 
                          hour: 'numeric', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <EyeIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 