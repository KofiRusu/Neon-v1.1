'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  Activity,
  Calendar,
  RefreshCw,
  BarChart3,
  Zap,
  Bot,
} from 'lucide-react';

// Mock data interfaces (in real app, these would come from tRPC)
interface MonthlyBudgetData {
  month: string;
  totalBudget: number;
  totalSpent: number;
  alertThreshold: number;
  isAlertSent: boolean;
  budgetUtilization: number;
  isOverBudget: boolean;
  isNearBudget: boolean;
  projectedSpend: number;
}

interface AgentCostSummary {
  agentType: string;
  totalCost: number;
  totalTokens: number;
  executions: number;
  campaignCount: number;
  averageCostPerExecution: number;
}

interface CampaignCost {
  id: string;
  campaignId: string;
  totalCost: number;
  monthlyBudget?: number;
  campaign: {
    name: string;
    type: string;
    status: string;
  };
}

interface BillingLog {
  id: string;
  agentType: string;
  cost: number;
  tokens: number;
  task?: string;
  timestamp: string;
  campaign?: {
    name: string;
  };
}

const AGENT_COST_CONSTANTS = {
  CONTENT: 0.04,
  SEO: 0.03,
  EMAIL_MARKETING: 0.05,
  SOCIAL_POSTING: 0.03,
  CUSTOMER_SUPPORT: 0.04,
  AD: 0.06,
  OUTREACH: 0.04,
  TREND: 0.03,
  INSIGHT: 0.05,
  DESIGN: 0.07,
  BRAND_VOICE: 0.04,
  GOAL_PLANNER: 0.05,
  PATTERN_MINER: 0.04,
  SEGMENT_ANALYZER: 0.05,
};

export default function AdminBudgetPage() {
  const [monthlyData, setMonthlyData] = useState<MonthlyBudgetData | null>(null);
  const [agentCosts, setAgentCosts] = useState<AgentCostSummary[]>([]);
  const [campaignCosts, setCampaignCosts] = useState<CampaignCost[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<BillingLog[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7));
  const [newBudget, setNewBudget] = useState<number[]>([1000]);
  const [loading, setLoading] = useState(true);

  // Mock data loading - in real app, this would use tRPC
  useEffect(() => {
    loadBudgetData();
  }, [selectedMonth]);

  const loadBudgetData = async () => {
    setLoading(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock monthly budget data
    const mockSpent = Math.random() * 800 + 200; // $200-$1000
    const mockBudget = 1000;
    const mockProjected = mockSpent * 1.2;

    setMonthlyData({
      month: selectedMonth,
      totalBudget: mockBudget,
      totalSpent: mockSpent,
      alertThreshold: 0.8,
      isAlertSent: false,
      budgetUtilization: (mockSpent / mockBudget) * 100,
      isOverBudget: mockSpent > mockBudget,
      isNearBudget: mockSpent / mockBudget >= 0.8,
      projectedSpend: mockProjected,
    });

    // Mock agent costs
    const mockAgentCosts: AgentCostSummary[] = Object.entries(AGENT_COST_CONSTANTS)
      .map(([agentType, rate]) => ({
        agentType,
        totalCost: Math.random() * 100 + 10,
        totalTokens: Math.floor(Math.random() * 50000 + 5000),
        executions: Math.floor(Math.random() * 50 + 5),
        campaignCount: Math.floor(Math.random() * 5 + 1),
        averageCostPerExecution: 0,
      }))
      .map(agent => ({
        ...agent,
        averageCostPerExecution: agent.totalCost / agent.executions,
      }));

    setAgentCosts(mockAgentCosts.sort((a, b) => b.totalCost - a.totalCost));

    // Mock campaign costs
    setCampaignCosts([
      {
        id: '1',
        campaignId: 'camp1',
        totalCost: 250.75,
        monthlyBudget: 300,
        campaign: { name: 'Holiday Social Campaign', type: 'SOCIAL_MEDIA', status: 'ACTIVE' },
      },
      {
        id: '2',
        campaignId: 'camp2',
        totalCost: 180.5,
        monthlyBudget: 200,
        campaign: { name: 'Product Launch Ads', type: 'ADS', status: 'ACTIVE' },
      },
      {
        id: '3',
        campaignId: 'camp3',
        totalCost: 95.25,
        monthlyBudget: 150,
        campaign: { name: 'Email Newsletter', type: 'EMAIL', status: 'COMPLETED' },
      },
    ]);

    // Mock recent transactions
    setRecentTransactions([
      {
        id: '1',
        agentType: 'CONTENT',
        cost: 2.45,
        tokens: 612,
        task: 'Generate social media post',
        timestamp: new Date(Date.now() - 30000).toISOString(),
        campaign: { name: 'Holiday Social Campaign' },
      },
      {
        id: '2',
        agentType: 'AD',
        cost: 3.6,
        tokens: 600,
        task: 'Optimize ad copy',
        timestamp: new Date(Date.now() - 180000).toISOString(),
        campaign: { name: 'Product Launch Ads' },
      },
      {
        id: '3',
        agentType: 'EMAIL_MARKETING',
        cost: 1.85,
        tokens: 370,
        task: 'Create newsletter content',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        campaign: { name: 'Email Newsletter' },
      },
    ]);

    setLoading(false);
  };

  const updateBudget = async () => {
    // Mock budget update - in real app, this would call tRPC mutation
    if (monthlyData) {
      setMonthlyData({
        ...monthlyData,
        totalBudget: newBudget[0],
        budgetUtilization: (monthlyData.totalSpent / newBudget[0]) * 100,
        isOverBudget: monthlyData.totalSpent > newBudget[0],
        isNearBudget: monthlyData.totalSpent / newBudget[0] >= monthlyData.alertThreshold,
      });
    }
  };

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
  const formatDate = (dateString: string) => new Date(dateString).toLocaleString();

  const getAgentIcon = (agentType: string) => {
    switch (agentType) {
      case 'CONTENT':
        return <Bot className="w-4 h-4" />;
      case 'AD':
        return <Zap className="w-4 h-4" />;
      case 'EMAIL_MARKETING':
        return <Activity className="w-4 h-4" />;
      default:
        return <Bot className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Enterprise Budget Control
            </h1>
            <p className="text-slate-400 mt-2">Monitor and manage AI agent execution costs</p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="bg-slate-800/50 border border-cyan-500/30 rounded-lg px-4 py-2 text-cyan-100 backdrop-blur-sm"
            >
              <option value="2024-01">January 2024</option>
              <option value="2024-02">February 2024</option>
              <option value="2024-03">March 2024</option>
              <option value="2024-04">April 2024</option>
              <option value="2024-05">May 2024</option>
            </select>
            <Button
              onClick={loadBudgetData}
              variant="outline"
              className="border-cyan-500/50 text-cyan-100 hover:bg-cyan-500/10"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Budget Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-slate-800/50 border-cyan-500/30 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-100">
              {formatCurrency(monthlyData?.totalBudget || 0)}
            </div>
            <p className="text-xs text-slate-400 mt-1">Monthly allocation</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-purple-500/30 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Total Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-100">
              {formatCurrency(monthlyData?.totalSpent || 0)}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {monthlyData?.budgetUtilization.toFixed(1)}% of budget
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-amber-500/30 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Projected Spend</CardTitle>
            <BarChart3 className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-100">
              {formatCurrency(monthlyData?.projectedSpend || 0)}
            </div>
            <p className="text-xs text-slate-400 mt-1">End of month estimate</p>
          </CardContent>
        </Card>

        <Card
          className={`bg-slate-800/50 backdrop-blur-sm ${
            monthlyData?.isOverBudget
              ? 'border-red-500/50'
              : monthlyData?.isNearBudget
                ? 'border-yellow-500/50'
                : 'border-green-500/30'
          }`}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Budget Status</CardTitle>
            <AlertTriangle
              className={`h-4 w-4 ${
                monthlyData?.isOverBudget
                  ? 'text-red-400'
                  : monthlyData?.isNearBudget
                    ? 'text-yellow-400'
                    : 'text-green-400'
              }`}
            />
          </CardHeader>
          <CardContent>
            <Badge
              variant={
                monthlyData?.isOverBudget
                  ? 'destructive'
                  : monthlyData?.isNearBudget
                    ? 'default'
                    : 'secondary'
              }
            >
              {monthlyData?.isOverBudget
                ? 'Over Budget'
                : monthlyData?.isNearBudget
                  ? 'Near Limit'
                  : 'On Track'}
            </Badge>
            <p className="text-xs text-slate-400 mt-2">
              Remaining:{' '}
              {formatCurrency(
                Math.max(0, (monthlyData?.totalBudget || 0) - (monthlyData?.totalSpent || 0))
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Control Panel */}
      <Card className="bg-slate-800/50 border-cyan-500/30 backdrop-blur-sm mb-8">
        <CardHeader>
          <CardTitle className="text-cyan-100">Monthly Budget Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">
                Budget Limit: {formatCurrency(newBudget[0])}
              </label>
              <Slider
                value={newBudget}
                onValueChange={setNewBudget}
                max={5000}
                min={100}
                step={50}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>$100</span>
                <span>$5,000</span>
              </div>
            </div>
            <Button
              onClick={updateBudget}
              className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
            >
              Update Budget
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Agent Cost Breakdown */}
        <Card className="bg-slate-800/50 border-purple-500/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-purple-100">Agent Cost Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {agentCosts.slice(0, 8).map((agent, index) => (
                <div
                  key={agent.agentType}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-900/30"
                >
                  <div className="flex items-center gap-3">
                    {getAgentIcon(agent.agentType)}
                    <div>
                      <p className="font-medium text-slate-200">
                        {agent.agentType.replace('_', ' ')}
                      </p>
                      <p className="text-sm text-slate-400">{agent.executions} executions</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-cyan-100">{formatCurrency(agent.totalCost)}</p>
                    <p className="text-xs text-slate-400">
                      {formatCurrency(agent.averageCostPerExecution)}/exec
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Campaign Budget Tracking */}
        <Card className="bg-slate-800/50 border-amber-500/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-amber-100">Campaign Budget Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {campaignCosts.map(campaign => (
                <div key={campaign.id} className="p-4 rounded-lg bg-slate-900/30">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-slate-200">{campaign.campaign.name}</h4>
                    <Badge
                      variant={campaign.campaign.status === 'ACTIVE' ? 'default' : 'secondary'}
                    >
                      {campaign.campaign.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">
                      {formatCurrency(campaign.totalCost)} /{' '}
                      {formatCurrency(campaign.monthlyBudget || 0)}
                    </span>
                    <span className="text-sm font-medium text-cyan-100">
                      {campaign.monthlyBudget
                        ? `${((campaign.totalCost / campaign.monthlyBudget) * 100).toFixed(1)}%`
                        : 'No limit'}
                    </span>
                  </div>
                  {campaign.monthlyBudget && (
                    <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                      <div
                        className={`h-2 rounded-full ${
                          campaign.totalCost / campaign.monthlyBudget > 0.9
                            ? 'bg-red-500'
                            : campaign.totalCost / campaign.monthlyBudget > 0.8
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                        }`}
                        style={{
                          width: `${Math.min(100, (campaign.totalCost / campaign.monthlyBudget) * 100)}%`,
                        }}
                      ></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="bg-slate-800/50 border-slate-500/30 backdrop-blur-sm mt-8">
        <CardHeader>
          <CardTitle className="text-slate-100">Recent Agent Executions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-300">Agent</th>
                  <th className="text-left py-3 px-4 text-slate-300">Task</th>
                  <th className="text-left py-3 px-4 text-slate-300">Campaign</th>
                  <th className="text-right py-3 px-4 text-slate-300">Tokens</th>
                  <th className="text-right py-3 px-4 text-slate-300">Cost</th>
                  <th className="text-right py-3 px-4 text-slate-300">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map(transaction => (
                  <tr key={transaction.id} className="border-b border-slate-800">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {getAgentIcon(transaction.agentType)}
                        <span className="text-slate-200">
                          {transaction.agentType.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{transaction.task || 'N/A'}</td>
                    <td className="py-3 px-4 text-slate-300">
                      {transaction.campaign?.name || 'No campaign'}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-300">
                      {transaction.tokens.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-cyan-100">
                      {formatCurrency(transaction.cost)}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400 text-sm">
                      {formatDate(transaction.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Cost Rate Reference */}
      <Card className="bg-slate-800/50 border-slate-500/30 backdrop-blur-sm mt-8">
        <CardHeader>
          <CardTitle className="text-slate-100">Agent Cost Rates (per 1K tokens)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Object.entries(AGENT_COST_CONSTANTS).map(([agent, rate]) => (
              <div key={agent} className="text-center p-3 rounded-lg bg-slate-900/30">
                <div className="flex justify-center mb-2">{getAgentIcon(agent)}</div>
                <p className="text-xs text-slate-400 mb-1">{agent.replace('_', ' ')}</p>
                <p className="font-bold text-cyan-100">${rate.toFixed(3)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
