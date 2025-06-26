'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlanViewerPanel } from '@/components/PlanViewerPanel';
import { MeshActivityLog } from '@/components/MeshActivityLog';
import { AgentIntentionsGrid } from '@/components/AgentIntentionsGrid';
import { ExecutionProgressMonitor } from '@/components/ExecutionProgressMonitor';
import { SystemMetrics } from '@/components/SystemMetrics';
import { trpc } from '@/utils/trpc';

interface CoordinationState {
  activePlans: number;
  queuedRequests: number;
  agentsInUse: Array<{ agentType: string; goalPlanId: string }>;
  systemLoad: number;
  averageConsensusTime: number;
  successRate: number;
}

interface ExecutionMonitor {
  goalPlanId: string;
  currentPhase: number;
  executingAgent: string;
  status: string;
  progress: number;
  startedAt: string;
  expectedCompletion: string;
  blockers: string[];
  fallbacksAvailable: string[];
}

interface MeshActivity {
  id: string;
  timestamp: string;
  type:
    | 'GOAL_SUBMITTED'
    | 'PLAN_PROPOSED'
    | 'CONSENSUS_REACHED'
    | 'EXECUTION_STARTED'
    | 'REPLANNING_TRIGGERED';
  agentType?: string;
  goalPlanId?: string;
  message: string;
  metadata?: any;
}

export default function CoordinationDashboard() {
  const [coordinationState, setCoordinationState] = useState<CoordinationState>({
    activePlans: 0,
    queuedRequests: 0,
    agentsInUse: [],
    systemLoad: 0,
    averageConsensusTime: 0,
    successRate: 0,
  });

  const [executionMonitors, setExecutionMonitors] = useState<ExecutionMonitor[]>([]);
  const [meshActivities, setMeshActivities] = useState<MeshActivity[]>([]);
  const [selectedGoalPlan, setSelectedGoalPlan] = useState<string | null>(null);
  const [isRealTimeMode, setIsRealTimeMode] = useState(true);

  // Mock tRPC hooks (in production, these would be real API calls)
  const engineStateQuery = {
    data: coordinationState,
    isLoading: false,
    refetch: () => Promise.resolve(),
  };

  const executionMonitorsQuery = {
    data: executionMonitors,
    isLoading: false,
  };

  const meshActivityQuery = {
    data: meshActivities,
    isLoading: false,
  };

  // Real-time updates simulation
  useEffect(() => {
    if (!isRealTimeMode) return;

    const interval = setInterval(() => {
      // Simulate real-time state updates
      setCoordinationState(prev => ({
        ...prev,
        activePlans: Math.max(0, prev.activePlans + (Math.random() > 0.7 ? 1 : -1)),
        queuedRequests: Math.max(0, prev.queuedRequests + (Math.random() > 0.8 ? 1 : 0)),
        systemLoad: Math.max(0, Math.min(1, prev.systemLoad + (Math.random() - 0.5) * 0.1)),
        successRate: Math.max(0, Math.min(1, prev.successRate + (Math.random() - 0.5) * 0.05)),
      }));

      // Simulate new mesh activities
      if (Math.random() > 0.6) {
        const activities: MeshActivity['type'][] = [
          'GOAL_SUBMITTED',
          'PLAN_PROPOSED',
          'CONSENSUS_REACHED',
          'EXECUTION_STARTED',
          'REPLANNING_TRIGGERED',
        ];
        const agentTypes = ['CONTENT', 'SEO', 'BRAND_VOICE', 'TREND', 'AD'];

        const newActivity: MeshActivity = {
          id: `activity_${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: activities[Math.floor(Math.random() * activities.length)],
          agentType: agentTypes[Math.floor(Math.random() * agentTypes.length)],
          goalPlanId: `goal_${Math.floor(Math.random() * 100)}`,
          message: generateActivityMessage(
            activities[Math.floor(Math.random() * activities.length)]
          ),
        };

        setMeshActivities(prev => [newActivity, ...prev.slice(0, 19)]); // Keep last 20
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isRealTimeMode]);

  // Initialize with mock data
  useEffect(() => {
    setCoordinationState({
      activePlans: 7,
      queuedRequests: 3,
      agentsInUse: [
        { agentType: 'CONTENT', goalPlanId: 'goal_001' },
        { agentType: 'SEO', goalPlanId: 'goal_002' },
        { agentType: 'BRAND_VOICE', goalPlanId: 'goal_003' },
      ],
      systemLoad: 0.65,
      averageConsensusTime: 12500,
      successRate: 0.847,
    });

    setExecutionMonitors([
      {
        goalPlanId: 'goal_001',
        currentPhase: 2,
        executingAgent: 'content-agent-001',
        status: 'RUNNING',
        progress: 0.68,
        startedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        expectedCompletion: new Date(Date.now() + 25 * 60 * 1000).toISOString(),
        blockers: [],
        fallbacksAvailable: ['design-agent-001', 'content-agent-002'],
      },
      {
        goalPlanId: 'goal_002',
        currentPhase: 1,
        executingAgent: 'seo-agent-001',
        status: 'RUNNING',
        progress: 0.34,
        startedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
        expectedCompletion: new Date(Date.now() + 40 * 60 * 1000).toISOString(),
        blockers: ['API_RATE_LIMIT'],
        fallbacksAvailable: ['seo-agent-002'],
      },
    ]);

    setMeshActivities([
      {
        id: 'activity_001',
        timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        type: 'CONSENSUS_REACHED',
        agentType: 'GOAL_PLANNER',
        goalPlanId: 'goal_001',
        message: 'Plan accepted by consensus with quorum 8/9 agents (score: 0.89)',
      },
      {
        id: 'activity_002',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        type: 'PLAN_PROPOSED',
        agentType: 'CONTENT',
        goalPlanId: 'goal_003',
        message: "Agent 'ContentAgent' proposed plan with 92% brand alignment",
      },
      {
        id: 'activity_003',
        timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
        type: 'EXECUTION_STARTED',
        agentType: 'SEO',
        goalPlanId: 'goal_002',
        message: 'Phase 1 execution started: Market Research & Competitive Analysis',
      },
    ]);
  }, []);

  const getSystemStatusColor = (load: number) => {
    if (load < 0.5) return 'text-green-400';
    if (load < 0.8) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getSystemStatusText = (load: number) => {
    if (load < 0.5) return 'OPTIMAL';
    if (load < 0.8) return 'MODERATE';
    return 'HIGH LOAD';
  };

  const handleEmergencyStop = () => {
    console.log('🛑 Emergency stop triggered');
    // In production, would call emergency stop API
  };

  const handleTriggerReplan = (goalPlanId: string) => {
    console.log(`🔄 Triggering replan for ${goalPlanId}`);
    // In production, would call replan API
  };

  const handleNewGoalSubmission = () => {
    console.log('➕ New goal submission dialog would open');
    // In production, would open goal submission modal
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              Multi-Agent Coordination Console
            </h1>
            <p className="text-slate-400 mt-2">
              Real-time orchestration of the NeonHub reasoning mesh
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant={isRealTimeMode ? 'default' : 'outline'}
              onClick={() => setIsRealTimeMode(!isRealTimeMode)}
              className="bg-blue-600 hover:bg-blue-700 text-white border-blue-500"
            >
              {isRealTimeMode ? '🟢 Live' : '⏸️ Paused'}
            </Button>

            <Button
              onClick={handleNewGoalSubmission}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium px-6"
            >
              ➕ Submit New Goal
            </Button>

            <Button
              variant="destructive"
              onClick={handleEmergencyStop}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              🛑 Emergency Stop
            </Button>
          </div>
        </div>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400">System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div
                className={`text-2xl font-bold ${getSystemStatusColor(coordinationState.systemLoad)}`}
              >
                {getSystemStatusText(coordinationState.systemLoad)}
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-400">Load</div>
                <div className="text-lg font-semibold">
                  {Math.round(coordinationState.systemLoad * 100)}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400">Active Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-blue-400">
                {coordinationState.activePlans}
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-400">Queued</div>
                <div className="text-lg font-semibold text-purple-400">
                  {coordinationState.queuedRequests}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-green-400">
                {Math.round(coordinationState.successRate * 100)}%
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-400">Avg Consensus</div>
                <div className="text-lg font-semibold text-blue-400">
                  {Math.round(coordinationState.averageConsensusTime / 1000)}s
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400">Agents in Use</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-purple-400">
                {coordinationState.agentsInUse.length}
              </div>
              <div className="flex flex-wrap gap-1">
                {coordinationState.agentsInUse.slice(0, 3).map((agent, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-blue-600/20 text-blue-300 border-blue-500/30 text-xs"
                  >
                    {agent.agentType}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-slate-800/50 border-slate-700">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="plans"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            Plan Viewer
          </TabsTrigger>
          <TabsTrigger
            value="execution"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            Execution Monitor
          </TabsTrigger>
          <TabsTrigger
            value="intentions"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            Agent Intentions
          </TabsTrigger>
          <TabsTrigger
            value="activity"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            Activity Log
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SystemMetrics
              coordinationState={coordinationState}
              executionMonitors={executionMonitors}
            />
            <MeshActivityLog activities={meshActivities.slice(0, 8)} isRealTime={isRealTimeMode} />
          </div>

          <ExecutionProgressMonitor
            monitors={executionMonitors}
            onTriggerReplan={handleTriggerReplan}
            selectedGoalPlan={selectedGoalPlan}
            onSelectGoalPlan={setSelectedGoalPlan}
          />
        </TabsContent>

        {/* Plan Viewer Tab */}
        <TabsContent value="plans">
          <PlanViewerPanel
            selectedGoalPlan={selectedGoalPlan}
            onSelectGoalPlan={setSelectedGoalPlan}
            executionMonitors={executionMonitors}
          />
        </TabsContent>

        {/* Execution Monitor Tab */}
        <TabsContent value="execution">
          <ExecutionProgressMonitor
            monitors={executionMonitors}
            onTriggerReplan={handleTriggerReplan}
            selectedGoalPlan={selectedGoalPlan}
            onSelectGoalPlan={setSelectedGoalPlan}
            expandedView={true}
          />
        </TabsContent>

        {/* Agent Intentions Tab */}
        <TabsContent value="intentions">
          <AgentIntentionsGrid
            agentsInUse={coordinationState.agentsInUse}
            isRealTime={isRealTimeMode}
          />
        </TabsContent>

        {/* Activity Log Tab */}
        <TabsContent value="activity">
          <MeshActivityLog
            activities={meshActivities}
            isRealTime={isRealTimeMode}
            expandedView={true}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper function for generating activity messages
function generateActivityMessage(type: MeshActivity['type']): string {
  const messages = {
    GOAL_SUBMITTED: 'New goal submitted to planning queue',
    PLAN_PROPOSED: 'Agent proposed execution plan for review',
    CONSENSUS_REACHED: 'Plan approved by agent consensus',
    EXECUTION_STARTED: 'Plan execution phase initiated',
    REPLANNING_TRIGGERED: 'Replanning triggered due to execution failure',
  };

  return messages[type] || 'Unknown activity type';
}
