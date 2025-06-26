'use client';

/**
 * A/B Testing Management Page
 * Complete interface for variant generation, test management, and analytics
 */

import React, { useState } from 'react';
import { api } from '../../utils/trpc';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import VariantAnalyticsPanel from '../../components/VariantAnalyticsPanel';
import {
  TestTube,
  Zap,
  BarChart3,
  Clock,
  Users,
  Target,
  Sparkles,
  Play,
  Plus,
  Settings,
  TrendingUp,
  Trophy,
  Activity,
  Calendar,
  Brain,
} from 'lucide-react';

interface ABTestSummary {
  id: string;
  name: string;
  status: 'running' | 'completed' | 'winner_declared' | 'draft';
  progress: number;
  variants: number;
  winner?: string;
  performance: {
    bestLift: number;
    significance: number;
  };
  createdAt: Date;
  completedAt?: Date;
}

export default function ABTestingPage(): JSX.Element {
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateTest, setShowCreateTest] = useState(false);

  // Mock data - replace with real tRPC calls
  const mockTests: ABTestSummary[] = [
    {
      id: 'test_001',
      name: 'Holiday Email Subject Personalization',
      status: 'winner_declared',
      progress: 100,
      variants: 2,
      winner: 'variant_b',
      performance: {
        bestLift: 32.6,
        significance: 0.98,
      },
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'test_002',
      name: 'CTA Button Design & Copy',
      status: 'running',
      progress: 65,
      variants: 3,
      performance: {
        bestLift: 18.4,
        significance: 0.85,
      },
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'test_003',
      name: 'Email Send Time Optimization',
      status: 'running',
      progress: 28,
      variants: 4,
      performance: {
        bestLift: 8.2,
        significance: 0.65,
      },
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Activity className="h-4 w-4 text-neon-green animate-pulse" />;
      case 'winner_declared':
        return <Trophy className="h-4 w-4 text-neon-blue" />;
      case 'completed':
        return <Target className="h-4 w-4 text-neon-green" />;
      case 'draft':
        return <Clock className="h-4 w-4 text-secondary" />;
      default:
        return <Clock className="h-4 w-4 text-secondary" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return <Badge className="bg-neon-green text-black">Running</Badge>;
      case 'winner_declared':
        return <Badge className="bg-neon-blue text-black">Winner Declared</Badge>;
      case 'completed':
        return <Badge className="bg-gray-500 text-white">Completed</Badge>;
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCreateNewTest = () => {
    setShowCreateTest(true);
    setActiveTab('create');
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="glass-strong p-6 rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-r from-neon-blue to-neon-purple rounded-2xl flex items-center justify-center">
                <TestTube className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-primary">A/B Testing Lab</h1>
                <p className="text-secondary">
                  Advanced campaign optimization with AI-powered variant generation
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button onClick={handleCreateNewTest} className="btn-neon">
                <Plus className="h-4 w-4 mr-2" />
                Create New Test
              </Button>
              <Button
                variant="outline"
                className="border-neon-purple text-neon-purple hover:bg-neon-purple hover:text-black"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="glass p-4 rounded-xl text-center">
              <div className="text-2xl font-bold text-neon-blue">
                {mockTests.filter(t => t.status === 'running').length}
              </div>
              <div className="text-sm text-secondary">Running Tests</div>
            </div>
            <div className="glass p-4 rounded-xl text-center">
              <div className="text-2xl font-bold text-neon-green">
                {mockTests.filter(t => t.status === 'winner_declared').length}
              </div>
              <div className="text-sm text-secondary">Winners Declared</div>
            </div>
            <div className="glass p-4 rounded-xl text-center">
              <div className="text-2xl font-bold text-neon-purple">
                {Math.round(
                  mockTests.reduce((sum, t) => sum + t.performance.bestLift, 0) / mockTests.length
                )}
                %
              </div>
              <div className="text-sm text-secondary">Avg. Lift</div>
            </div>
            <div className="glass p-4 rounded-xl text-center">
              <div className="text-2xl font-bold text-neon-pink">
                {Math.round(
                  (mockTests.reduce((sum, t) => sum + t.performance.significance, 0) /
                    mockTests.length) *
                    100
                )}
                %
              </div>
              <div className="text-sm text-secondary">Avg. Confidence</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="glass">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center space-x-2">
              <Zap className="h-4 w-4" />
              <span>Create Test</span>
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Smart Scheduling</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="space-y-6">
              {/* Active Tests */}
              <Card className="card-neon">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-neon-green" />
                    <span>Active Tests</span>
                  </CardTitle>
                  <CardDescription>
                    Currently running A/B tests with real-time performance tracking
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockTests
                      .filter(test => test.status === 'running')
                      .map(test => (
                        <div key={test.id} className="glass p-4 rounded-xl">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              {getStatusIcon(test.status)}
                              <div>
                                <h4 className="font-semibold text-primary">{test.name}</h4>
                                <p className="text-sm text-secondary">
                                  {test.variants} variants • Started {formatDate(test.createdAt)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              {getStatusBadge(test.status)}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedTestId(test.id);
                                  setActiveTab('analytics');
                                }}
                              >
                                View Details
                              </Button>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-secondary">Progress</span>
                              <div className="text-lg font-semibold text-primary">
                                {test.progress}%
                              </div>
                            </div>
                            <div>
                              <span className="text-secondary">Best Lift</span>
                              <div className="text-lg font-semibold text-neon-green">
                                +{test.performance.bestLift.toFixed(1)}%
                              </div>
                            </div>
                            <div>
                              <span className="text-secondary">Confidence</span>
                              <div className="text-lg font-semibold text-neon-blue">
                                {(test.performance.significance * 100).toFixed(0)}%
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* Completed Tests */}
              <Card className="card-neon">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Trophy className="h-5 w-5 text-neon-blue" />
                    <span>Completed Tests</span>
                  </CardTitle>
                  <CardDescription>
                    Historical A/B tests with declared winners and learnings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockTests
                      .filter(
                        test => test.status === 'winner_declared' || test.status === 'completed'
                      )
                      .map(test => (
                        <div key={test.id} className="glass p-4 rounded-xl">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {getStatusIcon(test.status)}
                              <div>
                                <h4 className="font-semibold text-primary">{test.name}</h4>
                                <p className="text-sm text-secondary">
                                  Completed{' '}
                                  {test.completedAt ? formatDate(test.completedAt) : 'Recently'}
                                  {test.winner && ` • Winner: ${test.winner}`}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              {getStatusBadge(test.status)}
                              <div className="text-right">
                                <div className="text-sm text-secondary">Performance Lift</div>
                                <div className="text-lg font-semibold text-neon-green">
                                  +{test.performance.bestLift.toFixed(1)}%
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="space-y-6">
              {selectedTestId ? (
                <VariantAnalyticsPanel
                  testId={selectedTestId}
                  autoRefresh={true}
                  refreshInterval={30}
                />
              ) : (
                <Card className="card-neon">
                  <CardContent className="text-center py-12">
                    <BarChart3 className="h-16 w-16 text-secondary mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-primary mb-2">
                      Select a Test to View Analytics
                    </h3>
                    <p className="text-secondary mb-6">
                      Choose an active or completed test from the overview to see detailed
                      performance analytics
                    </p>
                    <Button onClick={() => setActiveTab('overview')} className="btn-neon">
                      Go to Overview
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Create Test Tab */}
          <TabsContent value="create">
            <div className="space-y-6">
              <Card className="card-neon">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="h-5 w-5 text-neon-purple" />
                    <span>AI-Powered Variant Generation</span>
                  </CardTitle>
                  <CardDescription>
                    Create optimized content variants using advanced AI and historical performance
                    data
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Campaign Content Input */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-secondary mb-2">
                          Email Subject Line
                        </label>
                        <input
                          type="text"
                          placeholder="Enter your email subject..."
                          className="input-neon w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-secondary mb-2">
                          Email Body
                        </label>
                        <textarea
                          placeholder="Enter your email content..."
                          rows={4}
                          className="input-neon w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-secondary mb-2">
                          Call-to-Action
                        </label>
                        <input type="text" placeholder="Learn More" className="input-neon w-full" />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-secondary mb-2">
                          Target Audience
                        </label>
                        <select className="input-neon w-full">
                          <option>Premium Subscribers</option>
                          <option>New Users</option>
                          <option>Engaged Users</option>
                          <option>At-Risk Users</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-secondary mb-2">
                          Content Type
                        </label>
                        <select className="input-neon w-full">
                          <option>Email Marketing</option>
                          <option>Social Media</option>
                          <option>SMS Campaign</option>
                          <option>Push Notification</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-secondary mb-2">
                          Brand Tone
                        </label>
                        <select className="input-neon w-full">
                          <option>Professional</option>
                          <option>Conversational</option>
                          <option>Urgent</option>
                          <option>Friendly</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Variant Types Selection */}
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-3">
                      Variant Types to Generate
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {[
                        { key: 'subject', label: 'Subject Lines', icon: Brain },
                        { key: 'copy', label: 'Copy Styles', icon: Sparkles },
                        { key: 'visual', label: 'Visual Themes', icon: BarChart3 },
                        { key: 'cta', label: 'CTAs', icon: Target },
                        { key: 'timing', label: 'Send Times', icon: Clock },
                      ].map(({ key, label, icon: Icon }) => (
                        <label
                          key={key}
                          className="glass p-3 rounded-xl cursor-pointer hover:bg-neon-blue/10 transition-colors"
                        >
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              className="rounded border-gray-600"
                              defaultChecked
                            />
                            <Icon className="h-4 w-4 text-neon-blue" />
                            <span className="text-sm font-medium">{label}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Generate Button */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                    <div className="text-sm text-secondary">
                      AI will generate 3-5 optimized variants for each selected type
                    </div>
                    <Button className="btn-neon">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Variants
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Test Configuration */}
              <Card className="card-neon">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5 text-neon-green" />
                    <span>Test Configuration</span>
                  </CardTitle>
                  <CardDescription>
                    Advanced settings for statistical significance and test parameters
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-2">
                        Test Duration
                      </label>
                      <select className="input-neon w-full">
                        <option>48 hours (Recommended)</option>
                        <option>24 hours</option>
                        <option>72 hours</option>
                        <option>1 week</option>
                        <option>Custom</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-2">
                        Confidence Level
                      </label>
                      <select className="input-neon w-full">
                        <option>95% (Standard)</option>
                        <option>90%</option>
                        <option>99%</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-2">
                        Primary Metric
                      </label>
                      <select className="input-neon w-full">
                        <option>Conversion Rate</option>
                        <option>Open Rate</option>
                        <option>Click Rate</option>
                        <option>Revenue per User</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-2">
                        Auto-declare Winner
                      </label>
                      <select className="input-neon w-full">
                        <option>Yes (Recommended)</option>
                        <option>No - Manual Review</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Smart Scheduling Tab */}
          <TabsContent value="schedule">
            <Card className="card-neon">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-neon-purple" />
                  <span>Smart Scheduling Engine</span>
                </CardTitle>
                <CardDescription>
                  AI-powered optimal timing based on audience behavior and historical performance
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center py-12">
                <Calendar className="h-16 w-16 text-secondary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-primary mb-2">
                  Smart Scheduling Integration
                </h3>
                <p className="text-secondary mb-6 max-w-2xl mx-auto">
                  The Smart Scheduling Engine analyzes historical performance, audience behavior
                  patterns, and competitive landscape to determine optimal send times for maximum
                  engagement.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-6">
                  <div className="glass p-4 rounded-xl">
                    <Users className="h-8 w-8 text-neon-blue mx-auto mb-2" />
                    <h4 className="font-semibold text-primary mb-1">Audience Analysis</h4>
                    <p className="text-sm text-secondary">Learns from audience activity patterns</p>
                  </div>
                  <div className="glass p-4 rounded-xl">
                    <Clock className="h-8 w-8 text-neon-green mx-auto mb-2" />
                    <h4 className="font-semibold text-primary mb-1">Optimal Timing</h4>
                    <p className="text-sm text-secondary">Predicts best send times per segment</p>
                  </div>
                  <div className="glass p-4 rounded-xl">
                    <TrendingUp className="h-8 w-8 text-neon-purple mx-auto mb-2" />
                    <h4 className="font-semibold text-primary mb-1">Performance Boost</h4>
                    <p className="text-sm text-secondary">Average 15-30% engagement increase</p>
                  </div>
                </div>
                <Button className="btn-neon">
                  <Play className="h-4 w-4 mr-2" />
                  Enable Smart Scheduling
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
