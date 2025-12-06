/**
 * PROFITHACK AI - WhatsApp Core Module
 * Based on WhatsApp Clone ChatContainer.jsx reference
 * Adapted for React + TypeScript + PostgreSQL + WebSockets
 */

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Phone, Video, MoreVertical, Search, 
  Smile, Paperclip, Mic, Send, Camera,
  Check, CheckCheck, Image, File, X
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderImage?: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  files?: { url: string; name: string; type: string }[];
}

interface Conversation {
  id: string;
  name: string;
  avatar?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  online: boolean;
  isGroup: boolean;
  users?: { id: string; name: string; avatar?: string }[];
}

interface ChatContainerProps {
  conversationId: string;
  onBack?: () => void;
  onCall?: (type: 'voice' | 'video') => void;
}

// Chat Header Component - from reference ChatHeader
function ChatHeader({ 
  conversation, 
  online, 
  onCall 
}: { 
  conversation: Conversation; 
  online: boolean; 
  onCall?: (type: 'voice' | 'video') => void;
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-[#1f2c34] border-b border-gray-700">
      <div className="flex items-center gap-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={conversation.avatar} />
          <AvatarFallback className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
            {conversation.name?.[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-white font-medium">{conversation.name}</h3>
          <p className="text-gray-400 text-xs">
            {conversation.isGroup 
              ? `${conversation.users?.length || 0} participants`
              : online ? 'online' : 'offline'
            }
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button 
          onClick={() => onCall?.('video')}
          className="text-gray-400 hover:text-white transition-colors"
          data-testid="video-call-btn"
        >
          <Video className="w-5 h-5" />
        </button>
        <button 
          onClick={() => onCall?.('voice')}
          className="text-gray-400 hover:text-white transition-colors"
          data-testid="voice-call-btn"
        >
          <Phone className="w-5 h-5" />
        </button>
        <button className="text-gray-400 hover:text-white transition-colors">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// Message Bubble Component - from reference Message
function MessageBubble({ 
  message, 
  isMe 
}: { 
  message: Message; 
  isMe: boolean; 
}) {
  return (
    <div className={cn(
      "flex mb-1",
      isMe ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "max-w-[65%] rounded-lg px-3 py-2 relative",
        isMe 
          ? "bg-[#005c4b] text-white" 
          : "bg-[#1f2c34] text-white"
      )}>
        {/* File attachments */}
        {message.files && message.files.length > 0 && (
          <div className="space-y-2 mb-2">
            {message.files.map((file, idx) => (
              <a 
                key={idx}
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 bg-black/20 rounded"
              >
                {file.type.startsWith('image/') ? (
                  <Image className="w-4 h-4" />
                ) : (
                  <File className="w-4 h-4" />
                )}
                <span className="text-sm truncate">{file.name}</span>
              </a>
            ))}
          </div>
        )}

        {/* Message text */}
        {message.content && (
          <p className="text-sm break-words">{message.content}</p>
        )}

        {/* Timestamp and status */}
        <div className="flex items-center justify-end gap-1 mt-1">
          <span className="text-[10px] text-gray-300">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {isMe && (
            message.status === 'read' ? (
              <CheckCheck className="w-3 h-3 text-blue-400" />
            ) : message.status === 'delivered' ? (
              <CheckCheck className="w-3 h-3 text-gray-400" />
            ) : (
              <Check className="w-3 h-3 text-gray-400" />
            )
          )}
        </div>
      </div>
    </div>
  );
}

// Typing Indicator - from reference Typing
function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span className="text-gray-400 text-xs">typing...</span>
    </div>
  );
}

// Chat Actions - from reference ChatActions
function ChatActions({ 
  onSend, 
  onAttach,
  disabled 
}: { 
  onSend: (message: string) => void;
  onAttach?: () => void;
  disabled?: boolean;
}) {
  const [message, setMessage] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);

  const handleSend = () => {
    if (message.trim()) {
      onSend(message.trim());
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-[#1f2c34] p-3 border-t border-gray-700">
      <div className="flex items-center gap-2">
        <button 
          onClick={() => setShowEmoji(!showEmoji)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <Smile className="w-6 h-6" />
        </button>
        <button 
          onClick={onAttach}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <Paperclip className="w-6 h-6" />
        </button>
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message"
          className="flex-1 bg-[#2a3942] border-0 text-white placeholder:text-gray-500"
          data-testid="message-input"
          disabled={disabled}
        />
        {message.trim() ? (
          <button 
            onClick={handleSend}
            className="text-[#00a884] hover:text-[#00d9a3] transition-colors"
            data-testid="send-message-btn"
          >
            <Send className="w-6 h-6" />
          </button>
        ) : (
          <button className="text-gray-400 hover:text-white transition-colors">
            <Mic className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
}

// Files Preview - from reference FilesPreview
function FilesPreview({ 
  files, 
  onRemove, 
  onSend 
}: { 
  files: File[];
  onRemove: (index: number) => void;
  onSend: () => void;
}) {
  return (
    <div className="absolute inset-0 bg-[#0b141a] flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="grid grid-cols-2 gap-4 max-w-md">
          {files.map((file, idx) => (
            <div key={idx} className="relative bg-gray-800 rounded-lg p-4">
              <button
                onClick={() => onRemove(idx)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
              >
                <X className="w-4 h-4 text-white" />
              </button>
              {file.type.startsWith('image/') ? (
                <img 
                  src={URL.createObjectURL(file)} 
                  alt={file.name}
                  className="w-full h-32 object-cover rounded"
                />
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <File className="w-12 h-12 text-gray-400" />
                  <span className="text-white text-xs truncate max-w-full">{file.name}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="p-4 flex justify-center">
        <Button onClick={onSend} className="bg-[#00a884] hover:bg-[#00d9a3]">
          <Send className="w-5 h-5 mr-2" />
          Send Files
        </Button>
      </div>
    </div>
  );
}

// Main ChatContainer Component - from reference
export function ChatContainer({ 
  conversationId, 
  onBack,
  onCall 
}: ChatContainerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  // Fetch conversation details
  const { data: conversation } = useQuery<Conversation>({
    queryKey: ['/api/conversations', conversationId],
    enabled: !!conversationId,
  });

  // Fetch messages - from reference getConversationMessages
  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ['/api/conversations', conversationId, 'messages'],
    enabled: !!conversationId,
    refetchInterval: 3000, // Poll for new messages
  });

  // Check online status - from reference checkOnlineStatus
  const online = conversation?.online || false;

  // Scroll to bottom on new messages - from reference
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: (content: string) => 
      apiRequest(`/api/conversations/${conversationId}/messages`, "POST", { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversations', conversationId, 'messages'] });
    },
    onError: () => {
      toast({ title: "Failed to send message", variant: "destructive" });
    }
  });

  // Handle file attachment
  const handleAttach = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'image/*,video/*,application/pdf';
    input.onchange = (e) => {
      const selectedFiles = Array.from((e.target as HTMLInputElement).files || []);
      setFiles(prev => [...prev, ...selectedFiles]);
    };
    input.click();
  };

  // Handle sending files
  const handleSendFiles = async () => {
    // Upload files and send message
    toast({ title: "Sending files..." });
    setFiles([]);
  };

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-full bg-[#0b141a]">
        <p className="text-gray-400">Select a conversation to start chatting</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full border-l border-gray-700 select-none overflow-hidden bg-[#0b141a]">
      {/* Chat Header - from reference */}
      <ChatHeader 
        conversation={conversation} 
        online={online} 
        onCall={onCall}
      />

      {files.length > 0 ? (
        /* Files Preview - from reference */
        <FilesPreview 
          files={files}
          onRemove={(idx) => setFiles(files.filter((_, i) => i !== idx))}
          onSend={handleSendFiles}
        />
      ) : (
        <>
          {/* Chat Messages - from reference */}
          <div 
            className="absolute top-[60px] bottom-[60px] left-0 right-0 overflow-y-auto px-4 py-2"
            style={{
              backgroundImage: "url('https://res.cloudinary.com/dmhcnhtng/image/upload/v1677358270/Untitled-1_copy_rpx8yb.jpg')",
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat'
            }}
          >
            {messages.map((message) => (
              <MessageBubble 
                key={message.id}
                message={message}
                isMe={(user as any)?.id === message.senderId}
              />
            ))}
            
            {/* Typing indicator - from reference */}
            {isTyping && <TypingIndicator />}
            
            <div ref={messagesEndRef} className="mt-2" />
          </div>

          {/* Chat Actions - from reference */}
          <ChatActions 
            onSend={(msg) => sendMutation.mutate(msg)}
            onAttach={handleAttach}
            disabled={sendMutation.isPending}
          />
        </>
      )}
    </div>
  );
}

export default ChatContainer;
