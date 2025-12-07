import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  Activity,
  Play,
  Pause,
  Square,
  Rocket,
  Video,
  TrendingUp,
  Users,
  Zap,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  PlayCircle,
  Search,
} from "lucide-react";

interface Agent {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'idle' | 'paused' | 'error' | 'stopped';
  priority: 'critical' | 'high' | 'medium' | 'low';
  tasksCompleted: number;
  tasksQueued: number;
  lastRunTime: string | null;
  nextRunTime: string | null;
  avgExecutionTime: number;
  errorCount: number;
  successRate: number;
  soraEnabled: boolean;
}

interface AgentStats {
  total: number;
  active: number;
  idle: number;
  paused: number;
  error: number;
  stopped: number;
  soraEnabled: number;
  totalTasksCompleted: number;
  totalTasksQueued: number;
  avgSuccessRate: number;
  soraHealth: {
    isAvailable: boolean;
    latency: number;
    provider: 'openai' | 'fallback' | 'none';
    lastCheck: string;
    errorMessage?: string;
  };
}

export default function AgentDashboard() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [testPrompt, setTestPrompt] = useState('A beautiful sunset over the ocean with golden light');

  const { data: agents = [], isLoading: loadingAgents } = useQuery<Agent[]>({
    queryKey: ['/api/agents'],
  });

  const { data: stats, isLoading: loadingStats } = useQuery<AgentStats>({
    queryKey: ['/api/agents/stats'],
    refetchInterval: 5000,
  });

  const startAllMutation = useMutation({
    mutationFn: () => apiRequest('/api/agents/start-all', 'POST', {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/agents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/agents/stats'] });
      toast({
        title: "Success!",
        description: "All agents started successfully",
      });
    },
  });

  const stopAllMutation = useMutation({
    mutationFn: () => apiRequest('/api/agents/stop-all', 'POST', {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/agents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/agents/stats'] });
      toast({
        title: "Success!",
        description: "All agents stopped",
      });
    },
  });

  const startAgentMutation = useMutation({
    mutationFn: (agentId: string) => apiRequest(`/api/agents/${agentId}/start`, 'POST', {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/agents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/agents/stats'] });
    },
  });

  const stopAgentMutation = useMutation({
    mutationFn: (agentId: string) => apiRequest(`/api/agents/${agentId}/stop`, 'POST', {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/agents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/agents/stats'] });
    },
  });

  const pauseAgentMutation = useMutation({
    mutationFn: (agentId: string) => apiRequest(`/api/agents/${agentId}/pause`, 'POST', {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/agents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/agents/stats'] });
    },
  });

  const testSoraMutation = useMutation({
    mutationFn: (prompt: string) => apiRequest('/api/agents/test-sora', 'POST', { prompt }),
    onSuccess: (data: any) => {
      toast({
        title: data.success ? "Sora 2 Test Passed!" : "Sora 2 Test Failed",
        description: data.success 
          ? `Video generated in ${data.latency}ms. Job ID: ${data.jobId}` 
          : data.error,
      });
    },
  });

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || agent.type === selectedType;
    return matchesSearch && matchesType;
  });

  const agentTypes = Array.from(new Set(agents.map(a => a.type)));

  const getStatusIcon = (status: Agent['status']) => {
    switch (status) {
      case 'active':
        return <Activity className="w-4 h-4 text-green-500" />;
      case 'idle':
        return <Clock className="w-4 h-4 text-muted-foreground" />;
      case 'paused':
        return <Pause className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'stopped':
        return <Square className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: Agent['status']) => {
    const variants = {
      active: 'default',
      idle: 'secondary',
      paused: 'outline',
      error: 'destructive',
      stopped: 'secondary',
    };
    return <Badge variant={variants[status] as any}>{status.toUpperCase()}</Badge>;
  };

  const getPriorityBadge = (priority: Agent['priority']) => {
    const colors = {
      critical: 'bg-red-500',
      high: 'bg-orange-500',
      medium: 'bg-yellow-500',
      low: 'bg-gray-500',
    };
    return (
      <Badge className={`${colors[priority]} text-white`}>
        {priority.toUpperCase()}
      </Badge>
    );
  };

  if (loadingAgents || loadingStats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Activity className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent" data-testid="text-dashboard-title">
              200-Agent Orchestrator
            </h1>
            <p className="text-muted-foreground mt-2" data-testid="text-dashboard-subtitle">
              Enterprise AI Agent Management with Sora 2 Integration
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => startAllMutation.mutate()}
              disabled={startAllMutation.isPending}
              className="bg-green-500 hover-elevate"
              data-testid="button-start-all"
            >
              <Play className="w-4 h-4 mr-2" />
              Start All
            </Button>
            <Button
              onClick={() => stopAllMutation.mutate()}
              disabled={stopAllMutation.isPending}
              variant="destructive"
              data-testid="button-stop-all"
            >
              <Square className="w-4 h-4 mr-2" />
              Stop All
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-agents">
                {stats?.total || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.soraEnabled || 0} with Sora 2
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
              <Activity className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500" data-testid="text-active-agents">
                {stats?.active || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.idle || 0} idle, {stats?.paused || 0} paused
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
              <CheckCircle className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-tasks-completed">
                {stats?.totalTasksCompleted.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.totalTasksQueued || 0} queued
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-success-rate">
                {stats?.avgSuccessRate.toFixed(1) || 0}%
              </div>
              <Progress value={stats?.avgSuccessRate || 0} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        <Card className="border-2 border-purple-500/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Video className="w-6 h-6 text-purple-500" />
                <div>
                  <CardTitle>Sora 2 AI Status</CardTitle>
                  <CardDescription>OpenAI Video Generation</CardDescription>
                </div>
              </div>
              {stats?.soraHealth.isAvailable ? (
                <Badge className="bg-green-500 text-white">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  CONNECTED
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <XCircle className="w-4 h-4 mr-1" />
                  DISCONNECTED
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Provider</p>
                <p className="font-bold text-lg" data-testid="text-sora-provider">
                  {stats?.soraHealth.provider.toUpperCase()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Latency</p>
                <p className="font-bold text-lg" data-testid="text-sora-latency">
                  {stats?.soraHealth.latency}ms
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Check</p>
                <p className="font-bold text-sm">
                  {new Date(stats?.soraHealth.lastCheck || '').toLocaleTimeString()}
                </p>
              </div>
            </div>

            {stats?.soraHealth.errorMessage && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                <p className="text-sm text-destructive">
                  <AlertCircle className="w-4 h-4 inline mr-2" />
                  {stats.soraHealth.errorMessage}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-sm font-medium">Test Sora 2 Integration</p>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter video prompt..."
                  value={testPrompt}
                  onChange={(e) => setTestPrompt(e.target.value)}
                  className="flex-1"
                  data-testid="input-test-prompt"
                />
                <Button
                  onClick={() => testSoraMutation.mutate(testPrompt)}
                  disabled={testSoraMutation.isPending}
                  className="bg-purple-500 hover-elevate"
                  data-testid="button-test-sora"
                >
                  {testSoraMutation.isPending ? (
                    <Activity className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Zap className="w-4 h-4 mr-2" />
                  )}
                  Test
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Agent Management</CardTitle>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search agents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                    data-testid="input-search-agents"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="space-y-4">
              <TabsList className="grid grid-cols-6 w-full">
                <TabsTrigger value="all" data-testid="tab-all">
                  All ({agents.length})
                </TabsTrigger>
                <TabsTrigger value="active" data-testid="tab-active">
                  Active ({stats?.active})
                </TabsTrigger>
                <TabsTrigger value="idle" data-testid="tab-idle">
                  Idle ({stats?.idle})
                </TabsTrigger>
                <TabsTrigger value="paused" data-testid="tab-paused">
                  Paused ({stats?.paused})
                </TabsTrigger>
                <TabsTrigger value="error" data-testid="tab-error">
                  Error ({stats?.error})
                </TabsTrigger>
                <TabsTrigger value="sora" data-testid="tab-sora">
                  Sora ({stats?.soraEnabled})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-2">
                <AgentList
                  agents={filteredAgents}
                  onStart={(id) => startAgentMutation.mutate(id)}
                  onStop={(id) => stopAgentMutation.mutate(id)}
                  onPause={(id) => pauseAgentMutation.mutate(id)}
                />
              </TabsContent>

              <TabsContent value="active" className="space-y-2">
                <AgentList
                  agents={filteredAgents.filter(a => a.status === 'active')}
                  onStart={(id) => startAgentMutation.mutate(id)}
                  onStop={(id) => stopAgentMutation.mutate(id)}
                  onPause={(id) => pauseAgentMutation.mutate(id)}
                />
              </TabsContent>

              <TabsContent value="idle" className="space-y-2">
                <AgentList
                  agents={filteredAgents.filter(a => a.status === 'idle')}
                  onStart={(id) => startAgentMutation.mutate(id)}
                  onStop={(id) => stopAgentMutation.mutate(id)}
                  onPause={(id) => pauseAgentMutation.mutate(id)}
                />
              </TabsContent>

              <TabsContent value="paused" className="space-y-2">
                <AgentList
                  agents={filteredAgents.filter(a => a.status === 'paused')}
                  onStart={(id) => startAgentMutation.mutate(id)}
                  onStop={(id) => stopAgentMutation.mutate(id)}
                  onPause={(id) => pauseAgentMutation.mutate(id)}
                />
              </TabsContent>

              <TabsContent value="error" className="space-y-2">
                <AgentList
                  agents={filteredAgents.filter(a => a.status === 'error')}
                  onStart={(id) => startAgentMutation.mutate(id)}
                  onStop={(id) => stopAgentMutation.mutate(id)}
                  onPause={(id) => pauseAgentMutation.mutate(id)}
                />
              </TabsContent>

              <TabsContent value="sora" className="space-y-2">
                <AgentList
                  agents={filteredAgents.filter(a => a.soraEnabled)}
                  onStart={(id) => startAgentMutation.mutate(id)}
                  onStop={(id) => stopAgentMutation.mutate(id)}
                  onPause={(id) => pauseAgentMutation.mutate(id)}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AgentList({ agents, onStart, onStop, onPause }: {
  agents: Agent[];
  onStart: (id: string) => void;
  onStop: (id: string) => void;
  onPause: (id: string) => void;
}) {
  const getStatusIcon = (status: Agent['status']) => {
    switch (status) {
      case 'active':
        return <Activity className="w-4 h-4 text-green-500" />;
      case 'idle':
        return <Clock className="w-4 h-4 text-muted-foreground" />;
      case 'paused':
        return <Pause className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'stopped':
        return <Square className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: Agent['status']) => {
    const variants = {
      active: 'default',
      idle: 'secondary',
      paused: 'outline',
      error: 'destructive',
      stopped: 'secondary',
    };
    return <Badge variant={variants[status] as any}>{status.toUpperCase()}</Badge>;
  };

  const getPriorityBadge = (priority: Agent['priority']) => {
    const colors = {
      critical: 'bg-red-500',
      high: 'bg-orange-500',
      medium: 'bg-yellow-500',
      low: 'bg-gray-500',
    };
    return (
      <Badge className={`${colors[priority]} text-white`}>
        {priority.toUpperCase()}
      </Badge>
    );
  };

  if (agents.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No agents found
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {agents.map((agent) => (
        <Card key={agent.id} className="hover-elevate" data-testid={`agent-card-${agent.id}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                {getStatusIcon(agent.status)}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold" data-testid={`text-agent-name-${agent.id}`}>
                      {agent.name}
                    </p>
                    {agent.soraEnabled && (
                      <Badge className="bg-purple-500 text-white">
                        <Video className="w-3 h-3 mr-1" />
                        SORA
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-muted-foreground">
                      {agent.type.replace(/_/g, ' ').toUpperCase()}
                    </p>
                    <span className="text-muted-foreground">•</span>
                    {getPriorityBadge(agent.priority)}
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground">Completed</p>
                    <p className="font-bold">{agent.tasksCompleted}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Queued</p>
                    <p className="font-bold">{agent.tasksQueued}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Success</p>
                    <p className="font-bold">{agent.successRate.toFixed(0)}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Avg Time</p>
                    <p className="font-bold">{agent.avgExecutionTime.toFixed(0)}ms</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                {getStatusBadge(agent.status)}
                {agent.status !== 'active' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onStart(agent.id)}
                    data-testid={`button-start-${agent.id}`}
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                )}
                {agent.status === 'active' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onPause(agent.id)}
                    data-testid={`button-pause-${agent.id}`}
                  >
                    <Pause className="w-4 h-4" />
                  </Button>
                )}
                {agent.status !== 'stopped' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onStop(agent.id)}
                    data-testid={`button-stop-${agent.id}`}
                  >
                    <Square className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
