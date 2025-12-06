/**
 * PROFITHACK AI - Cluely-Style AI Assistant Overlay
 * Real-time AI assistance for interviews, meetings, coding, and content creation
 */

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  MessageSquare, 
  Minimize2, 
  Maximize2, 
  X, 
  Send, 
  Mic, 
  MicOff,
  Sparkles,
  Code,
  Video,
  FileText,
  Briefcase,
  Lightbulb,
  Copy,
  Check
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface CluelyAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: "interview" | "meeting" | "coding" | "content" | "general";
}

const QUICK_PROMPTS = {
  interview: [
    "Help me answer: Tell me about yourself",
    "What are my key strengths to highlight?",
    "How should I handle salary negotiation?",
    "Suggest follow-up questions to ask"
  ],
  meeting: [
    "Summarize the key discussion points",
    "What action items should I note?",
    "Generate meeting notes",
    "Suggest next steps"
  ],
  coding: [
    "Explain this code pattern",
    "Help me debug this error",
    "Optimize this function",
    "Write unit tests for this"
  ],
  content: [
    "Generate a viral hook",
    "Write an engaging caption",
    "Suggest trending hashtags",
    "Create a content calendar"
  ],
  general: [
    "Help me brainstorm ideas",
    "Summarize this document",
    "Draft a professional email",
    "Give me quick tips"
  ]
};

const MODE_ICONS = {
  interview: Briefcase,
  meeting: Video,
  coding: Code,
  content: FileText,
  general: Lightbulb
};

const MODE_COLORS = {
  interview: "from-blue-500 to-purple-500",
  meeting: "from-green-500 to-teal-500",
  coding: "from-orange-500 to-red-500",
  content: "from-pink-500 to-rose-500",
  general: "from-cyan-500 to-blue-500"
};

export function CluelyAssistant({ isOpen, onClose, mode = "general" }: CluelyAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [currentMode, setCurrentMode] = useState(mode);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const ModeIcon = MODE_ICONS[currentMode];

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", "/api/ai/chat", {
        message,
        context: `Mode: ${currentMode}. You are Cluely, an ultra-intelligent AI assistant that provides real-time help during ${currentMode}s. Be concise, actionable, and professional. Respond in a helpful, conversational tone.`,
        provider: "anthropic"
      });
      return response.json();
    },
    onSuccess: (data) => {
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.response || data.message || "I'm here to help!",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    },
    onError: (error: any) => {
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  });

  const handleSend = () => {
    if (!input.trim() || chatMutation.isPending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    chatMutation.mutate(input.trim());
    setInput("");
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  const copyToClipboard = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleListening = () => {
    if (!isListening && 'webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + ' ' + transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
      setIsListening(true);
    } else {
      setIsListening(false);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    setCurrentMode(mode);
  }, [mode]);

  if (!isOpen) return null;

  if (isMinimized) {
    return (
      <div 
        className="fixed bottom-4 right-4 z-50"
        data-testid="cluely-minimized"
      >
        <Button
          onClick={() => setIsMinimized(false)}
          className={`h-14 w-14 rounded-full bg-gradient-to-r ${MODE_COLORS[currentMode]} shadow-lg shadow-purple-500/25`}
          data-testid="button-expand-cluely"
        >
          <Brain className="h-6 w-6 text-white" />
        </Button>
      </div>
    );
  }

  return (
    <div 
      className="fixed bottom-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)]"
      data-testid="cluely-assistant"
    >
      <Card className="bg-black/95 border-purple-500/50 shadow-2xl shadow-purple-500/20 backdrop-blur-xl">
        <CardHeader className={`p-3 bg-gradient-to-r ${MODE_COLORS[currentMode]} rounded-t-lg`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                <ModeIcon className="h-4 w-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-white">Cluely AI</CardTitle>
                <p className="text-xs text-white/80 capitalize">{currentMode} Assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMinimized(true)}
                className="h-7 w-7 text-white/80 hover:text-white hover:bg-white/20"
                data-testid="button-minimize-cluely"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-7 w-7 text-white/80 hover:text-white hover:bg-white/20"
                data-testid="button-close-cluely"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="flex gap-1 p-2 bg-black/50 border-b border-purple-500/20 overflow-x-auto">
            {(Object.keys(MODE_ICONS) as Array<keyof typeof MODE_ICONS>).map((m) => {
              const Icon = MODE_ICONS[m];
              return (
                <Button
                  key={m}
                  variant={currentMode === m ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setCurrentMode(m)}
                  className={`h-7 px-2 text-xs capitalize ${
                    currentMode === m 
                      ? `bg-gradient-to-r ${MODE_COLORS[m]} text-white` 
                      : 'text-gray-400 hover:text-white'
                  }`}
                  data-testid={`button-mode-${m}`}
                >
                  <Icon className="h-3 w-3 mr-1" />
                  {m}
                </Button>
              );
            })}
          </div>

          <ScrollArea className="h-64 p-3" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="text-center py-6">
                <Sparkles className="h-10 w-10 text-purple-500 mx-auto mb-3" />
                <p className="text-gray-400 text-sm mb-4">
                  Hi! I'm your {currentMode} assistant. How can I help?
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {QUICK_PROMPTS[currentMode].slice(0, 2).map((prompt, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickPrompt(prompt)}
                      className="text-xs border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                      data-testid={`button-quick-prompt-${idx}`}
                    >
                      {prompt.slice(0, 25)}...
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg px-3 py-2 ${
                        msg.role === 'user'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-800 text-gray-100'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      {msg.role === 'assistant' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard(msg.content, msg.id)}
                          className="h-5 w-5 mt-1 text-gray-400 hover:text-white"
                          data-testid={`button-copy-${msg.id}`}
                        >
                          {copiedId === msg.id ? (
                            <Check className="h-3 w-3 text-green-400" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {chatMutation.isPending && (
                  <div className="flex justify-start">
                    <div className="bg-gray-800 rounded-lg px-3 py-2">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" />
                        <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          <div className="p-3 border-t border-purple-500/20">
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleListening}
                className={`h-9 w-9 ${isListening ? 'text-red-500 animate-pulse' : 'text-gray-400 hover:text-white'}`}
                data-testid="button-voice-input"
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything..."
                className="flex-1 bg-gray-900 border-purple-500/30 text-white placeholder:text-gray-500"
                data-testid="input-cluely-message"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || chatMutation.isPending}
                className={`h-9 w-9 bg-gradient-to-r ${MODE_COLORS[currentMode]}`}
                size="icon"
                data-testid="button-send-cluely"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function CluelyTriggerButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-4 right-4 z-40 h-14 w-14 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg shadow-purple-500/25 hover:scale-105 transition-transform"
      data-testid="button-open-cluely"
    >
      <Brain className="h-6 w-6 text-white" />
    </Button>
  );
}
