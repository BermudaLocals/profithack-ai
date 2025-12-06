import { useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Check, CheckCheck, Image as ImageIcon, FileText, Play } from "lucide-react";

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  type: 'text' | 'image' | 'file' | 'video';
  fileUrl?: string;
  fileName?: string;
}

interface ChatMessagesProps {
  messages: Message[];
  currentUserId: string;
  typing?: boolean;
  typingUserName?: string;
}

function MessageBubble({ message, isMe }: { message: Message; isMe: boolean }) {
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderContent = () => {
    switch (message.type) {
      case 'image':
        return (
          <div className="relative">
            <img 
              src={message.fileUrl} 
              alt="Image" 
              className="max-w-[250px] rounded-lg cursor-pointer hover:opacity-90"
              data-testid={`message-image-${message.id}`}
            />
            {message.content && (
              <p className="mt-2 text-sm">{message.content}</p>
            )}
          </div>
        );
      case 'video':
        return (
          <div className="relative">
            <div className="relative max-w-[250px] rounded-lg overflow-hidden bg-black/20">
              <video 
                src={message.fileUrl} 
                className="w-full"
                controls
                data-testid={`message-video-${message.id}`}
              />
            </div>
            {message.content && (
              <p className="mt-2 text-sm">{message.content}</p>
            )}
          </div>
        );
      case 'file':
        return (
          <a 
            href={message.fileUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
            data-testid={`message-file-${message.id}`}
          >
            <FileText className="w-8 h-8 text-blue-400" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{message.fileName || 'File'}</p>
              <p className="text-xs opacity-70">Click to download</p>
            </div>
          </a>
        );
      default:
        return <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>;
    }
  };

  const renderStatus = () => {
    if (!isMe) return null;
    switch (message.status) {
      case 'sending':
        return <div className="w-3 h-3 border border-white/50 rounded-full animate-spin" />;
      case 'sent':
        return <Check className="w-4 h-4 text-white/50" />;
      case 'delivered':
        return <CheckCheck className="w-4 h-4 text-white/50" />;
      case 'read':
        return <CheckCheck className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className={cn(
      "flex gap-2 mb-3 max-w-[85%]",
      isMe ? "ml-auto flex-row-reverse" : "mr-auto"
    )} data-testid={`message-bubble-${message.id}`}>
      {!isMe && (
        <Avatar className="w-8 h-8 mt-auto">
          <AvatarImage src={message.senderAvatar} />
          <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white text-xs">
            {message.senderName[0]}
          </AvatarFallback>
        </Avatar>
      )}
      <div className={cn(
        "rounded-2xl px-4 py-2 max-w-full",
        isMe 
          ? "bg-gradient-to-br from-pink-500 to-purple-600 text-white rounded-br-sm" 
          : "bg-white/10 text-white rounded-bl-sm"
      )}>
        {!isMe && (
          <p className="text-xs font-medium text-pink-400 mb-1">{message.senderName}</p>
        )}
        {renderContent()}
        <div className="flex items-center justify-end gap-1 mt-1">
          <span className="text-[10px] opacity-70">{formatTime(message.timestamp)}</span>
          {renderStatus()}
        </div>
      </div>
    </div>
  );
}

function TypingIndicator({ userName }: { userName?: string }) {
  return (
    <div className="flex gap-2 mb-3" data-testid="typing-indicator">
      <Avatar className="w-8 h-8 mt-auto">
        <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white text-xs">
          {userName?.[0] || '?'}
        </AvatarFallback>
      </Avatar>
      <div className="bg-white/10 rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

export function ChatMessages({ messages, currentUserId, typing, typingUserName }: ChatMessagesProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  return (
    <div 
      className="flex-1 overflow-y-auto px-4 py-4 bg-[url('/chat-bg.png')] bg-cover bg-center"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.8)), url('https://res.cloudinary.com/dmhcnhtng/image/upload/v1677358270/Untitled-1_copy_rpx8yb.jpg')`
      }}
      data-testid="chat-messages-container"
    >
      <div className="flex flex-col">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isMe={message.senderId === currentUserId}
          />
        ))}
        {typing && <TypingIndicator userName={typingUserName} />}
        <div ref={endRef} className="h-1" />
      </div>
    </div>
  );
}

export default ChatMessages;
