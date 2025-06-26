'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Brain,
  Zap,
  DollarSign,
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
} from 'lucide-react';

// Mock data - in real implementation, this would come from tRPC
const mockAgentMemories = {
  'content-agent': {
    agentName: 'Content Agent',
    totalRuns: 245,
    successRate: 94.3,
    averageCost: 0.023,
    averageTokens: 1250,
    averageExecutionTime: 3400,
    totalCost: 5.64,
    healthScore: 87,
    overallHealth: 'good' as const,
    trends: {
      costTrend: 'improving' as const,
      performanceTrend: 'stable' as const,
      successTrend: 'improving' as const,
    },
    recentExecutions: [
      {
        id: '1',
        timestamp: new Date('2024-01-15T10:30:00'),
        success: true,
        executionTime: 2800,
        cost: 0.019,
        tokensUsed: 1100,
        task: 'Generate blog post about AI trends',
      },
      {
        id: '2',
        timestamp: new Date('2024-01-15T11:15:00'),
        success: true,
        executionTime: 4200,
        cost: 0.031,
        tokensUsed: 1580,
        task: 'Create social media content',
      },
      {
        id: '3',
        timestamp: new Date('2024-01-15T12:00:00'),
        success: false,
        executionTime: 1200,
        cost: 0.005,
        tokensUsed: 250,
        task: 'Generate product description',
        errorMessage: 'Invalid product data provided',
      },
    ],
    costTrend: [
      { date: '2024-01-01', cost: 0.031 },
      { date: '2024-01-02', cost: 0.028 },
      { date: '2024-01-03', cost: 0.025 },
      { date: '2024-01-04', cost: 0.023 },
      { date: '2024-01-05', cost: 0.021 },
    ],
    performanceTrend: [
      { date: '2024-01-01', executionTime: 4200 },
      { date: '2024-01-02', executionTime: 3800 },
      { date: '2024-01-03', executionTime: 3600 },
      { date: '2024-01-04', executionTime: 3400 },
      { date: '2024-01-05', executionTime: 3200 },
    ],
  },
  'seo-agent': {
    agentName: 'SEO Agent',
    totalRuns: 189,
    successRate: 91.5,
    averageCost: 0.018,
    averageTokens: 980,
    averageExecutionTime: 2800,
    totalCost: 3.4,
    healthScore: 92,
    overallHealth: 'excellent' as const,
    trends: {
      costTrend: 'stable' as const,
      performanceTrend: 'improving' as const,
      successTrend: 'stable' as const,
    },
    recentExecutions: [],
    costTrend: [],
    performanceTrend: [],
  },
};

const agentList = [
  { id: 'content-agent', name: 'Content Agent' },
  { id: 'seo-agent', name: 'SEO Agent' },
  { id: 'email-agent', name: 'Email Agent' },
  { id: 'social-agent', name: 'Social Agent' },
  { id: 'support-agent', name: 'Support Agent' },
  { id: 'ad-agent', name: 'Ad Agent' },
  { id: 'outreach-agent', name: 'Outreach Agent' },
  { id: 'trend-agent', name: 'Trend Agent' },
  { id: 'insight-agent', name: 'Insight Agent' },
  { id: 'design-agent', name: 'Design Agent' },
  { id: 'brand-voice-agent', name: 'Brand Voice Agent' },
];

const healthColors = {
  excellent: '#10B981', // emerald-500
  good: '#3B82F6', // blue-500
  fair: '#F59E0B', // amber-500
  poor: '#EF4444', // red-500
  critical: '#DC2626', // red-600
};

const trendIcons = {
  improving: <TrendingUp className="w-4 h-4 text-green-500" />,
  declining: <TrendingDown className="w-4 h-4 text-red-500" />,
  stable: <Minus className="w-4 h-4 text-gray-500" />,
};

export default function MemoryPage() {
  const [selectedAgent, setSelectedAgent] = useState<string>('content-agent');
  const [timeRange, setTimeRange] = useState<string>('30');
  const [agentData, setAgentData] = useState(
    mockAgentMemories[selectedAgent as keyof typeof mockAgentMemories]
  );

  useEffect(() => {
    setAgentData(
      mockAgentMemories[selectedAgent as keyof typeof mockAgentMemories] ||
        mockAgentMemories['content-agent']
    );
  }, [selectedAgent]);

  const formatCurrency = (amount: number) => `$${amount.toFixed(4)}`;
  const formatTime = (ms: number) => `${(ms / 1000).toFixed(1)}s`;
  const formatDate = (date: Date) => date.toLocaleString();

  const getHealthBadgeColor = (health: string) => {
    const colors = {
      excellent: 'bg-green-100 text-green-800 border-green-200',
      good: 'bg-blue-100 text-blue-800 border-blue-200',
      fair: 'bg-amber-100 text-amber-800 border-amber-200',
      poor: 'bg-red-100 text-red-800 border-red-200',
      critical: 'bg-red-200 text-red-900 border-red-300',
    };
    return colors[health as keyof typeof colors] || colors.fair;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-400/30">
            <Brain className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Agent Memory & Performance
            </h1>
            <p className="text-slate-400 mt-1">
              Monitor agent learning, performance metrics, and optimization opportunities
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-4 items-center">
          <Select value={selectedAgent} onValueChange={setSelectedAgent}>
            <SelectTrigger className="w-64 bg-slate-800 border-slate-700 text-white">
              <SelectValue placeholder="Select Agent" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {agentList.map(agent => (
                <SelectItem
                  key={agent.id}
                  value={agent.id}
                  className="text-white hover:bg-slate-700"
                >
                  {agent.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32 bg-slate-800 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="7" className="text-white hover:bg-slate-700">
                7 days
              </SelectItem>
              <SelectItem value="30" className="text-white hover:bg-slate-700">
                30 days
              </SelectItem>
              <SelectItem value="90" className="text-white hover:bg-slate-700">
                90 days
              </SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
          >
            <Activity className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="overview" className="text-white data-[state=active]:bg-purple-600">
            Overview
          </TabsTrigger>
          <TabsTrigger value="performance" className="text-white data-[state=active]:bg-purple-600">
            Performance
          </TabsTrigger>
          <TabsTrigger value="memory" className="text-white data-[state=active]:bg-purple-600">
            Memory Log
          </TabsTrigger>
          <TabsTrigger value="tuning" className="text-white data-[state=active]:bg-purple-600">
            Tuning
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-400">Health Score</CardTitle>
                  <Target className="w-4 h-4 text-purple-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white mb-2">
                  {agentData.healthScore}/100
                </div>
                <Badge className={getHealthBadgeColor(agentData.overallHealth)}>
                  {agentData.overallHealth}
                </Badge>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-400">Success Rate</CardTitle>
                  <CheckCircle className="w-4 h-4 text-green-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white mb-2">
                  {agentData.successRate.toFixed(1)}%
                </div>
                <div className="flex items-center gap-1 text-sm">
                  {trendIcons[agentData.trends.successTrend]}
                  <span className="text-slate-400">{agentData.totalRuns} runs</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-400">Average Cost</CardTitle>
                  <DollarSign className="w-4 h-4 text-amber-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white mb-2">
                  {formatCurrency(agentData.averageCost)}
                </div>
                <div className="flex items-center gap-1 text-sm">
                  {trendIcons[agentData.trends.costTrend]}
                  <span className="text-slate-400">per run</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-400">
                    Avg Response Time
                  </CardTitle>
                  <Clock className="w-4 h-4 text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white mb-2">
                  {formatTime(agentData.averageExecutionTime)}
                </div>
                <div className="flex items-center gap-1 text-sm">
                  {trendIcons[agentData.trends.performanceTrend]}
                  <span className="text-slate-400">execution</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trends Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Cost Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={agentData.costTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="cost"
                      stroke="#F59E0B"
                      strokeWidth={2}
                      dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Performance Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={agentData.performanceTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="executionTime"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-white">Performance Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <span className="text-slate-300">Cost Efficiency</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-600 rounded-full h-2">
                        <div
                          className="bg-amber-500 h-2 rounded-full"
                          style={{ width: `${(agentData.averageCost / 0.05) * 100}%` }}
                        />
                      </div>
                      <span className="text-white text-sm">Good</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <span className="text-slate-300">Execution Speed</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-600 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{
                            width: `${Math.max(0, 100 - (agentData.averageExecutionTime / 5000) * 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-white text-sm">Good</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <span className="text-slate-300">Reliability</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-600 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${agentData.successRate}%` }}
                        />
                      </div>
                      <span className="text-white text-sm">Excellent</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {formatCurrency(agentData.totalCost)}
                  </div>
                  <div className="text-sm text-slate-400">Total Cost</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {agentData.averageTokens.toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-400">Avg Tokens</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{agentData.totalRuns}</div>
                  <div className="text-sm text-slate-400">Total Runs</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Memory Log Tab */}
        <TabsContent value="memory" className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Recent Executions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {agentData.recentExecutions.map(execution => (
                  <div
                    key={execution.id}
                    className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/30"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {execution.success ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-red-400" />
                        )}
                        <span className="text-white font-medium">{execution.task}</span>
                      </div>
                      <div className="text-sm text-slate-400">
                        {formatDate(execution.timestamp)}
                        {execution.errorMessage && (
                          <span className="ml-2 text-red-400">• {execution.errorMessage}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="text-sm text-slate-300">
                        {formatTime(execution.executionTime)}
                      </div>
                      <div className="text-sm text-slate-400">{formatCurrency(execution.cost)}</div>
                      <div className="text-xs text-slate-500">{execution.tokensUsed} tokens</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tuning Tab */}
        <TabsContent value="tuning" className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Performance Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5" />
                    <div>
                      <h4 className="text-amber-200 font-medium mb-1">Optimize Token Usage</h4>
                      <p className="text-amber-100/80 text-sm mb-3">
                        Current average of {agentData.averageTokens} tokens per run could be
                        optimized. Consider refining prompts to reduce unnecessary context.
                      </p>
                      <div className="flex gap-2">
                        <Badge
                          variant="outline"
                          className="text-xs border-amber-400/30 text-amber-200"
                        >
                          Medium Priority
                        </Badge>
                        <Badge
                          variant="outline"
                          className="text-xs border-amber-400/30 text-amber-200"
                        >
                          Cost Optimization
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-blue-400 mt-0.5" />
                    <div>
                      <h4 className="text-blue-200 font-medium mb-1">Implement Response Caching</h4>
                      <p className="text-blue-100/80 text-sm mb-3">
                        Execution time averaging {formatTime(agentData.averageExecutionTime)} could
                        benefit from caching frequently requested content types.
                      </p>
                      <div className="flex gap-2">
                        <Badge
                          variant="outline"
                          className="text-xs border-blue-400/30 text-blue-200"
                        >
                          High Priority
                        </Badge>
                        <Badge
                          variant="outline"
                          className="text-xs border-blue-400/30 text-blue-200"
                        >
                          Performance
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {agentData.successRate < 95 && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
                      <div>
                        <h4 className="text-red-200 font-medium mb-1">Improve Error Handling</h4>
                        <p className="text-red-100/80 text-sm mb-3">
                          Success rate of {agentData.successRate.toFixed(1)}% indicates room for
                          improvement in error handling and retry logic.
                        </p>
                        <div className="flex gap-2">
                          <Badge
                            variant="outline"
                            className="text-xs border-red-400/30 text-red-200"
                          >
                            High Priority
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-xs border-red-400/30 text-red-200"
                          >
                            Reliability
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
