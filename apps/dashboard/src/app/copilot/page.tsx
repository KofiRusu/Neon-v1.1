'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Send,
  Mic,
  MicOff,
  Settings,
  History,
  Zap,
  Bot,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Download,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Trash2,
  MoreVertical,
  Copy,
  Share,
  Bookmark,
} from 'lucide-react';

// Mock types for copilot functionality
interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  confidence?: number;
  actions?: string[];
  attachments?: MessageAttachment[];
  status?: 'sending' | 'sent' | 'processing' | 'completed' | 'failed';
}

interface MessageAttachment {
  type: 'report' | 'chart' | 'campaign' | 'insight';
  id: string;
  title: string;
  preview?: string;
  downloadUrl?: string;
}

interface CopilotSession {
  id: string;
  title: string;
  startedAt: string;
  lastMessageAt: string;
  messageCount: number;
  status: 'active' | 'paused' | 'archived';
}

interface VoiceRecording {
  isRecording: boolean;
  isProcessing: boolean;
  duration: number;
  transcript?: string;
  confidence?: number;
}

interface ExecutionPlan {
  steps: ExecutionStep[];
  estimatedTime: number;
  requiresApproval: boolean;
}

interface ExecutionStep {
  id: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  estimatedDuration: number;
  progress?: number;
}

const CopilotDashboard: React.FC = () => {
  // Chat state
  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Voice state
  const [voiceRecording, setVoiceRecording] = useState<VoiceRecording>({
    isRecording: false,
    isProcessing: false,
    duration: 0,
  });

  // Session state
  const [currentSession, setCurrentSession] = useState<CopilotSession | null>(null);
  const [sessionHistory, setSessionHistory] = useState<CopilotSession[]>([]);

  // UI state
  const [activeTab, setActiveTab] = useState('chat');
  const [showHistory, setShowHistory] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);

  // Execution state
  const [currentExecution, setCurrentExecution] = useState<ExecutionPlan | null>(null);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const voiceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize session on mount
  useEffect(() => {
    initializeSession();
    loadSessionHistory();
    loadInitialMessages();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, autoScroll]);

  const initializeSession = () => {
    const newSession: CopilotSession = {
      id: `session_${Date.now()}`,
      title: 'New Conversation',
      startedAt: new Date().toISOString(),
      lastMessageAt: new Date().toISOString(),
      messageCount: 0,
      status: 'active',
    };
    setCurrentSession(newSession);
  };

  const loadSessionHistory = () => {
    // Mock session history
    const mockSessions: CopilotSession[] = [
      {
        id: 'session_1',
        title: 'Q1 Report Generation',
        startedAt: '2024-03-25T10:30:00Z',
        lastMessageAt: '2024-03-25T11:15:00Z',
        messageCount: 12,
        status: 'archived',
      },
      {
        id: 'session_2',
        title: 'Campaign Performance Analysis',
        startedAt: '2024-03-24T14:20:00Z',
        lastMessageAt: '2024-03-24T15:45:00Z',
        messageCount: 8,
        status: 'archived',
      },
      {
        id: 'session_3',
        title: 'Brand Voice Optimization',
        startedAt: '2024-03-23T09:00:00Z',
        lastMessageAt: '2024-03-23T09:30:00Z',
        messageCount: 6,
        status: 'archived',
      },
    ];
    setSessionHistory(mockSessions);
  };

  const loadInitialMessages = () => {
    const welcomeMessage: CopilotMessage = {
      id: 'welcome',
      role: 'assistant',
      content: `Hi! I'm your AI Marketing Copilot. I can help you with:\n\n• **Generate Reports**: "Create a Q1 boardroom report"\n• **Analyze Performance**: "What's our top campaign?"\n• **Manage Campaigns**: "Pause low-performing ads"\n• **Create Forecasts**: "Predict next quarter's revenue"\n• **System Status**: "Show agent health"\n\nWhat would you like to do today?`,
      timestamp: new Date().toISOString(),
      confidence: 1.0,
      status: 'completed',
    };
    setMessages([welcomeMessage]);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: CopilotMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toISOString(),
      status: 'sent',
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 1500));

      const response = await generateCopilotResponse(userMessage.content);
      setMessages(prev => [...prev, response]);

      // Update session
      if (currentSession) {
        const updatedSession = {
          ...currentSession,
          lastMessageAt: new Date().toISOString(),
          messageCount: currentSession.messageCount + 2,
          title:
            currentSession.messageCount === 0
              ? generateSessionTitle(userMessage.content)
              : currentSession.title,
        };
        setCurrentSession(updatedSession);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: CopilotMessage = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content:
          'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: new Date().toISOString(),
        status: 'failed',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const generateCopilotResponse = async (input: string): Promise<CopilotMessage> => {
    // Mock AI response generation based on input
    const inputLower = input.toLowerCase();

    let content = '';
    let actions: string[] = [];
    let attachments: MessageAttachment[] = [];
    let confidence = 0.9;

    if (inputLower.includes('report') || inputLower.includes('generate')) {
      content = `I'll generate a comprehensive report for you. This will include performance metrics, strategic insights, and recommendations.\n\nWould you like me to proceed with creating the report?`;
      actions = ['Generate Report', 'Customize Format', 'Schedule Report'];
      attachments = [
        {
          type: 'report',
          id: 'sample_report',
          title: 'Sample Executive Report',
          preview: 'Performance overview with key metrics',
        },
      ];

      // Mock execution plan
      setCurrentExecution({
        steps: [
          {
            id: 'step1',
            description: 'Gathering performance data',
            status: 'pending',
            estimatedDuration: 2000,
          },
          {
            id: 'step2',
            description: 'Analyzing trends and patterns',
            status: 'pending',
            estimatedDuration: 1500,
          },
          {
            id: 'step3',
            description: 'Generating insights and recommendations',
            status: 'pending',
            estimatedDuration: 3000,
          },
          {
            id: 'step4',
            description: 'Creating presentation format',
            status: 'pending',
            estimatedDuration: 2500,
          },
        ],
        estimatedTime: 9000,
        requiresApproval: false,
      });
    } else if (inputLower.includes('campaign') && inputLower.includes('pause')) {
      content = `I found 3 underperforming campaigns that could be paused:\n\n• Campaign A: ROAS 1.8x (target: 3.0x)\n• Campaign B: ROAS 2.1x (target: 3.0x)\n• Campaign C: ROAS 1.9x (target: 3.0x)\n\nPausing these campaigns will save approximately $2,400/day. Should I proceed?`;
      actions = ['Pause Campaigns', 'Review Details', 'Optimize Instead'];
      confidence = 0.85;
    } else if (inputLower.includes('forecast') || inputLower.includes('predict')) {
      content = `I'll create forecasts for your key metrics. Based on current trends, here are the projections:\n\n• Revenue: +23% growth projected\n• ROAS: Expected to reach 3.8x\n• Brand Alignment: 94% target achievement\n\nWould you like detailed forecasts with confidence intervals?`;
      actions = ['Generate Forecasts', 'View Trends', 'Compare Scenarios'];
      attachments = [
        {
          type: 'chart',
          id: 'forecast_chart',
          title: 'Revenue Forecast Chart',
          preview: '3-month projection with confidence bands',
        },
      ];
    } else if (inputLower.includes('status') || inputLower.includes('health')) {
      content = `System Status: **Healthy** ✅\n\n• **Active Campaigns**: 12\n• **Agents Online**: 11/12\n• **Last Report**: 2 hours ago\n• **Data Freshness**: Real-time\n• **Performance**: 96% success rate\n\nAll systems are operating normally.`;
      confidence = 0.95;
    } else if (inputLower.includes('help') || inputLower.includes('what can you')) {
      content = `I can help you with comprehensive marketing operations:\n\n🔹 **Strategic Reports**: Generate boardroom presentations, QBRs, and executive summaries\n🔹 **Performance Analysis**: Analyze campaigns, ROAS, brand alignment, and trends\n🔹 **Campaign Management**: Create, optimize, pause, or analyze campaigns\n🔹 **Forecasting**: Predict revenue, performance metrics, and strategic outcomes\n🔹 **Content Creation**: Generate brand-aligned content and creative assets\n🔹 **System Operations**: Monitor health, configure settings, and manage agents\n\nJust tell me what you need in natural language!`;
      actions = ['Try Demo', 'View Capabilities', 'System Tour'];
    } else {
      content = `I understand you're looking for help with "${input}". Could you provide more details about what specifically you'd like me to do?\n\nFor example:\n• "Generate a weekly performance report"\n• "Show me top-performing campaigns"\n• "Create forecasts for next quarter"\n• "Pause underperforming ads"`;
      confidence = 0.6;
    }

    return {
      id: `resp_${Date.now()}`,
      role: 'assistant',
      content,
      timestamp: new Date().toISOString(),
      confidence,
      actions: actions.length > 0 ? actions : undefined,
      attachments: attachments.length > 0 ? attachments : undefined,
      status: 'completed',
    };
  };

  const generateSessionTitle = (firstMessage: string): string => {
    const words = firstMessage.split(' ').slice(0, 4).join(' ');
    return words.length > 20 ? `${words.substring(0, 20)}...` : words;
  };

  const startVoiceRecording = async () => {
    try {
      // Mock voice recording start
      setVoiceRecording({
        isRecording: true,
        isProcessing: false,
        duration: 0,
      });

      // Start timer
      voiceTimerRef.current = setInterval(() => {
        setVoiceRecording(prev => ({
          ...prev,
          duration: prev.duration + 1,
        }));
      }, 1000);
    } catch (error) {
      console.error('Failed to start voice recording:', error);
    }
  };

  const stopVoiceRecording = async () => {
    if (voiceTimerRef.current) {
      clearInterval(voiceTimerRef.current);
      voiceTimerRef.current = null;
    }

    setVoiceRecording(prev => ({
      ...prev,
      isRecording: false,
      isProcessing: true,
    }));

    try {
      // Mock voice transcription
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockTranscript =
        'Generate a comprehensive quarterly business review report with performance metrics';

      setVoiceRecording(prev => ({
        ...prev,
        isProcessing: false,
        transcript: mockTranscript,
        confidence: 0.94,
      }));

      setInputValue(mockTranscript);
    } catch (error) {
      console.error('Voice transcription failed:', error);
      setVoiceRecording(prev => ({
        ...prev,
        isProcessing: false,
      }));
    }
  };

  const executeAction = async (action: string) => {
    if (!currentExecution) return;

    console.log(`Executing action: ${action}`);

    // Mock execution process
    for (let i = 0; i < currentExecution.steps.length; i++) {
      const step = currentExecution.steps[i];

      setCurrentExecution(prev => ({
        ...prev!,
        steps: prev!.steps.map(s =>
          s.id === step.id ? { ...s, status: 'running', progress: 0 } : s
        ),
      }));

      // Simulate step progress
      for (let progress = 0; progress <= 100; progress += 20) {
        await new Promise(resolve => setTimeout(resolve, step.estimatedDuration / 5));
        setCurrentExecution(prev => ({
          ...prev!,
          steps: prev!.steps.map(s => (s.id === step.id ? { ...s, progress } : s)),
        }));
      }

      setCurrentExecution(prev => ({
        ...prev!,
        steps: prev!.steps.map(s =>
          s.id === step.id ? { ...s, status: 'completed', progress: 100 } : s
        ),
      }));
    }

    // Add completion message
    const completionMessage: CopilotMessage = {
      id: `completion_${Date.now()}`,
      role: 'assistant',
      content: `✅ **${action} Completed Successfully!**\n\nThe report has been generated and is ready for download. All performance metrics have been analyzed and strategic recommendations are included.`,
      timestamp: new Date().toISOString(),
      status: 'completed',
      attachments: [
        {
          type: 'report',
          id: 'generated_report',
          title: 'Executive Performance Report',
          preview: 'Q1 2024 comprehensive analysis with forecasts',
          downloadUrl: '/downloads/executive-report-q1-2024.pdf',
        },
      ],
    };

    setMessages(prev => [...prev, completionMessage]);
    setCurrentExecution(null);
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-neon-green/20">
                <Bot className="w-6 h-6 text-neon-green" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">AI Marketing Copilot</h1>
                <p className="text-sm text-gray-400">
                  {currentSession ? `Session: ${currentSession.title}` : 'Ready to assist'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => setShowHistory(!showHistory)}>
                <History className="w-4 h-4 mr-2" />
                History
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex h-[calc(100vh-80px)]">
        {/* Sidebar - Session History */}
        {showHistory && (
          <div className="w-80 border-r border-gray-800 bg-gray-900/30 p-4">
            <h3 className="font-semibold text-gray-200 mb-4">Conversation History</h3>
            <ScrollArea className="h-full">
              <div className="space-y-2">
                {[currentSession, ...sessionHistory].filter(Boolean).map(session => (
                  <Card
                    key={session!.id}
                    className={`cursor-pointer transition-all duration-200 ${
                      session!.id === currentSession?.id
                        ? 'border-neon-green bg-gray-800/50'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-200 truncate">
                            {session!.title}
                          </h4>
                          <p className="text-xs text-gray-400 mt-1">
                            {session!.messageCount} messages
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatTimestamp(session!.lastMessageAt)}
                          </p>
                        </div>
                        <Badge
                          variant={session!.status === 'active' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {session!.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2 bg-gray-900/50 m-4 mb-0">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="execution">Execution</TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="flex-1 flex flex-col p-4 pt-2">
              {/* Messages Area */}
              <ScrollArea className="flex-1 rounded-lg border border-gray-800 bg-gray-900/20">
                <div className="p-4 space-y-4">
                  {messages.map(message => (
                    <div key={message.id} className="flex gap-3">
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        {message.role === 'user' ? (
                          <>
                            <AvatarFallback className="bg-blue-600">
                              <User className="w-4 h-4" />
                            </AvatarFallback>
                          </>
                        ) : (
                          <>
                            <AvatarFallback className="bg-neon-green/20 text-neon-green">
                              <Bot className="w-4 h-4" />
                            </AvatarFallback>
                          </>
                        )}
                      </Avatar>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {message.role === 'user' ? 'You' : 'AI Copilot'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(message.timestamp)}
                          </span>
                          {message.confidence && (
                            <Badge variant="outline" className="text-xs">
                              {(message.confidence * 100).toFixed(0)}% confident
                            </Badge>
                          )}
                          {message.status && (
                            <div className="flex items-center gap-1">
                              {message.status === 'sending' && (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              )}
                              {message.status === 'sent' && (
                                <CheckCircle className="w-3 h-3 text-green-500" />
                              )}
                              {message.status === 'failed' && (
                                <AlertCircle className="w-3 h-3 text-red-500" />
                              )}
                            </div>
                          )}
                        </div>

                        <div className="bg-gray-800/50 rounded-lg p-3">
                          <div className="whitespace-pre-wrap text-gray-200">{message.content}</div>

                          {/* Message Actions */}
                          {message.actions && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {message.actions.map((action, index) => (
                                <Button
                                  key={index}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => executeAction(action)}
                                  className="text-xs"
                                >
                                  {action}
                                </Button>
                              ))}
                            </div>
                          )}

                          {/* Attachments */}
                          {message.attachments && (
                            <div className="mt-3 space-y-2">
                              {message.attachments.map((attachment, index) => (
                                <Card key={index} className="border-gray-700">
                                  <CardContent className="p-3">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <div className="p-1 rounded bg-neon-green/20 text-neon-green">
                                          {attachment.type === 'report' && (
                                            <Download className="w-3 h-3" />
                                          )}
                                          {attachment.type === 'chart' && (
                                            <Zap className="w-3 h-3" />
                                          )}
                                        </div>
                                        <div>
                                          <div className="text-sm font-medium">
                                            {attachment.title}
                                          </div>
                                          {attachment.preview && (
                                            <div className="text-xs text-gray-400">
                                              {attachment.preview}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      <Button variant="ghost" size="sm">
                                        <Download className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex gap-3">
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className="bg-neon-green/20 text-neon-green">
                          <Bot className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-gray-800/50 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-neon-green rounded-full animate-bounce"></div>
                            <div
                              className="w-2 h-2 bg-neon-green rounded-full animate-bounce"
                              style={{ animationDelay: '0.1s' }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-neon-green rounded-full animate-bounce"
                              style={{ animationDelay: '0.2s' }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-400">AI Copilot is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Voice Recording Status */}
              {(voiceRecording.isRecording || voiceRecording.isProcessing) && (
                <Card className="border-neon-green bg-neon-green/5 mt-4">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      {voiceRecording.isRecording ? (
                        <>
                          <div className="p-2 rounded-full bg-red-500">
                            <Mic className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-red-400">Recording...</div>
                            <div className="text-xs text-gray-400">
                              Duration: {formatDuration(voiceRecording.duration)}
                            </div>
                          </div>
                          <Button variant="outline" onClick={stopVoiceRecording}>
                            Stop
                          </Button>
                        </>
                      ) : (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin text-neon-green" />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-neon-green">
                              Processing voice...
                            </div>
                            <div className="text-xs text-gray-400">Converting speech to text</div>
                          </div>
                        </>
                      )}
                    </div>
                    {voiceRecording.transcript && (
                      <div className="mt-2 p-2 bg-gray-800 rounded text-sm">
                        <div className="text-gray-300">{voiceRecording.transcript}</div>
                        {voiceRecording.confidence && (
                          <div className="text-xs text-gray-500 mt-1">
                            Confidence: {(voiceRecording.confidence * 100).toFixed(0)}%
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Input Area */}
              <div className="mt-4 space-y-2">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Input
                      ref={inputRef}
                      value={inputValue}
                      onChange={e => setInputValue(e.target.value)}
                      onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Ask me anything about your marketing performance..."
                      className="pr-24 bg-gray-900/50 border-gray-700 focus:border-neon-green"
                      disabled={isLoading}
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={
                          voiceRecording.isRecording ? stopVoiceRecording : startVoiceRecording
                        }
                        className={`p-1 ${voiceRecording.isRecording ? 'text-red-400' : 'text-gray-400 hover:text-neon-green'}`}
                      >
                        {voiceRecording.isRecording ? (
                          <MicOff className="w-4 h-4" />
                        ) : (
                          <Mic className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || isLoading}
                        className="p-1 text-gray-400 hover:text-neon-green"
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2">
                  {[
                    'Generate weekly report',
                    'Show top campaigns',
                    'Create forecast',
                    'Check system status',
                    'Pause low performers',
                  ].map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => setInputValue(suggestion)}
                      className="text-xs border-gray-700 hover:border-neon-green"
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="execution" className="flex-1 p-4 pt-2">
              {currentExecution ? (
                <Card className="h-full border-gray-800 bg-gray-900/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-neon-green" />
                      Execution Plan
                    </CardTitle>
                    <CardDescription>
                      Estimated time: {(currentExecution.estimatedTime / 1000).toFixed(0)} seconds
                      {currentExecution.requiresApproval && (
                        <Badge variant="outline" className="ml-2">
                          Approval Required
                        </Badge>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {currentExecution.steps.map((step, index) => (
                      <div key={step.id} className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          {step.status === 'pending' && <Clock className="w-4 h-4 text-gray-400" />}
                          {step.status === 'running' && (
                            <Loader2 className="w-4 h-4 text-neon-green animate-spin" />
                          )}
                          {step.status === 'completed' && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                          {step.status === 'failed' && (
                            <AlertCircle className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">{step.description}</div>
                          {step.status === 'running' && step.progress !== undefined && (
                            <div className="mt-1">
                              <div className="w-full bg-gray-700 rounded-full h-1.5">
                                <div
                                  className="bg-neon-green h-1.5 rounded-full transition-all duration-300"
                                  style={{ width: `${step.progress}%` }}
                                ></div>
                              </div>
                              <div className="text-xs text-gray-400 mt-1">{step.progress}%</div>
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {(step.estimatedDuration / 1000).toFixed(0)}s
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No Active Execution</h3>
                    <p className="text-sm">Start a conversation to see execution plans here</p>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default CopilotDashboard;
