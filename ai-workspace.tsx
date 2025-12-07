import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Send,
  Loader2,
  Sparkles,
  Code,
  FileText,
  Zap,
  History,
  Trash2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  creditsUsed?: number;
  bonusCreditsUsed?: number;
  regularCreditsUsed?: number;
  timestamp: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

type AIModel = "gpt-4" | "gpt-3.5-turbo" | "claude-3" | "gemini-pro";
type TaskType = "chat" | "code" | "research" | "content";

const MODEL_INFO = {
  "gpt-4": { name: "GPT-4", credits: 50, description: "Most capable" },
  "gpt-3.5-turbo": { name: "GPT-3.5", credits: 10, description: "Fast & efficient" },
  "claude-3": { name: "Claude 3", credits: 40, description: "Great for writing" },
  "gemini-pro": { name: "Gemini Pro", credits: 30, description: "Google's best" },
};

const TASK_COSTS = {
  chat: 10, // Simple chat: 10 credits
  code: 50, // Code generation: 50 credits
  research: 100, // Multi-step research: 100 credits
  content: 30, // Content generation: 30 credits
};

export default function AIWorkspacePage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "👋 Hi! I'm your AI workspace assistant. I can help you with:\n\n💬 **Chat** - Ask me anything\n💻 **Code** - Generate, debug, or explain code\n🔍 **Research** - Multi-step research tasks\n✍️ **Content** - Write articles, scripts, or copy\n\nWhat would you like to work on?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AIModel>("gpt-4");
  const [selectedTask, setSelectedTask] = useState<TaskType>("chat");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Get user credits
  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  const chatMutation = useMutation({
    mutationFn: async ({
      message,
      model,
      taskType,
    }: {
      message: string;
      model: AIModel;
      taskType: TaskType;
    }) => {
      const response = await apiRequest("/api/ai/workspace/chat", {
        method: "POST",
        body: JSON.stringify({
          message,
          model,
          taskType,
          conversationHistory: messages,
        }),
        headers: { "Content-Type": "application/json" },
      });
      return await response.json();
    },
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.response,
          creditsUsed: data.creditsUsed,
          bonusCreditsUsed: data.bonusCreditsUsed,
          regularCreditsUsed: data.regularCreditsUsed,
          timestamp: new Date().toISOString(),
        },
      ]);
      setIsLoading(false);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error: any) => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `❌ Error: ${error.message || "Something went wrong. Please try again."}`,
          timestamp: new Date().toISOString(),
        },
      ]);
      setIsLoading(false);
      toast({
        title: "Error",
        description: error.message || "Failed to process request",
        variant: "destructive",
      });
    },
  });

  const handleSend = () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: userMessage,
        timestamp: new Date().toISOString(),
      },
    ]);
    setInput("");
    setIsLoading(true);

    chatMutation.mutate({
      message: userMessage,
      model: selectedModel,
      taskType: selectedTask,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        content:
          "Chat cleared! What would you like to work on next?",
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const totalCredits = (user?.credits || 0) + (user?.bonusCredits || 0);
  const estimatedCost = MODEL_INFO[selectedModel].credits + TASK_COSTS[selectedTask];

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-pink-500" />
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  AI Workspace
                </h1>
                <p className="text-sm text-muted-foreground">
                  ChatGPT-style autonomous AI assistant
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Total Credits</div>
                <div className="text-lg font-bold text-foreground">
                  {totalCredits.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">
                  {user?.credits || 0} regular + {user?.bonusCredits || 0} bonus
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={clearChat}
                data-testid="button-clear-chat"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-4 py-6 flex gap-6">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          <Card className="flex-1 flex flex-col">
            {/* Messages */}
            <ScrollArea className="flex-1 p-6" ref={scrollRef}>
              <div className="space-y-6">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] ${
                        msg.role === "user"
                          ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white"
                          : "bg-muted text-foreground"
                      } rounded-lg px-4 py-3`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      {msg.creditsUsed && (
                        <div className="mt-2 pt-2 border-t border-white/20 text-xs opacity-80">
                          💳 Used: {msg.bonusCreditsUsed} bonus + {msg.regularCreditsUsed} regular = {msg.creditsUsed} credits
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted text-foreground rounded-lg px-4 py-3 flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Thinking...</span>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-2 mb-3">
                <Select
                  value={selectedModel}
                  onValueChange={(value: AIModel) => setSelectedModel(value)}
                >
                  <SelectTrigger className="w-[200px]" data-testid="select-model">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(MODEL_INFO).map(([key, info]) => (
                      <SelectItem key={key} value={key}>
                        {info.name} ({info.credits} credits)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={selectedTask}
                  onValueChange={(value: TaskType) => setSelectedTask(value)}
                >
                  <SelectTrigger className="w-[200px]" data-testid="select-task">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="chat">💬 Chat ({TASK_COSTS.chat} credits)</SelectItem>
                    <SelectItem value="code">💻 Code ({TASK_COSTS.code} credits)</SelectItem>
                    <SelectItem value="research">🔍 Research ({TASK_COSTS.research} credits)</SelectItem>
                    <SelectItem value="content">✍️ Content ({TASK_COSTS.content} credits)</SelectItem>
                  </SelectContent>
                </Select>

                <Badge variant="secondary" className="ml-auto">
                  Est. Cost: {estimatedCost} credits
                </Badge>
              </div>

              <div className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type your message... (Shift+Enter for new line)"
                  className="resize-none"
                  rows={3}
                  disabled={isLoading}
                  data-testid="input-message"
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="h-full"
                  data-testid="button-send"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="w-80 space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              Quick Actions
            </h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  setSelectedTask("code");
                  setInput("Write a React component for a todo list");
                }}
                data-testid="button-quick-code"
              >
                <Code className="h-4 w-4 mr-2" />
                Generate Code
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  setSelectedTask("research");
                  setInput("Research the latest AI trends in 2025");
                }}
                data-testid="button-quick-research"
              >
                <FileText className="h-4 w-4 mr-2" />
                Research Topic
              </Button>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-3">Credit Pricing</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Chat</span>
                <span className="font-medium">{TASK_COSTS.chat} credits</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Code Gen</span>
                <span className="font-medium">{TASK_COSTS.code} credits</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Research</span>
                <span className="font-medium">{TASK_COSTS.research} credits</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Content</span>
                <span className="font-medium">{TASK_COSTS.content} credits</span>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-3">Model Costs</h3>
            <div className="space-y-2 text-sm">
              {Object.entries(MODEL_INFO).map(([key, info]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-muted-foreground">{info.name}</span>
                  <span className="font-medium">{info.credits} credits</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
