/**
 * PROFITHACK AI - WhatsApp Sidebar Module
 * Based on WhatsApp Clone Sidebar.jsx reference
 * Adapted for React + TypeScript + PostgreSQL
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Search, MoreVertical, MessageCircle, Users, 
  Archive, Star, Settings, Phone
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Conversation {
  id: string;
  name: string;
  avatar?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  online: boolean;
  isGroup: boolean;
  typing?: boolean;
  pinned?: boolean;
  muted?: boolean;
}

interface ConversationListProps {
  onSelectConversation: (id: string) => void;
  selectedId?: string;
  onlineUsers?: string[];
  typingUsers?: { conversationId: string; userId: string }[];
}

// Sidebar Header - from reference SidebarHeader
function SidebarHeader() {
  return (
    <div className="flex items-center justify-between p-3 bg-[#1f2c34]">
      <Avatar className="w-10 h-10">
        <AvatarFallback className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
          P
        </AvatarFallback>
      </Avatar>
      <div className="flex items-center gap-4">
        <button className="text-gray-400 hover:text-white transition-colors">
          <Users className="w-5 h-5" />
        </button>
        <button className="text-gray-400 hover:text-white transition-colors">
          <MessageCircle className="w-5 h-5" />
        </button>
        <button className="text-gray-400 hover:text-white transition-colors">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// Search Component - from reference Search
function SearchBar({ 
  value, 
  onChange 
}: { 
  value: string; 
  onChange: (val: string) => void;
}) {
  return (
    <div className="p-2 bg-[#111b21]">
      <div className="flex items-center gap-3 bg-[#1f2c34] rounded-lg px-4 py-2">
        <Search className="w-4 h-4 text-gray-400" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search or start a new chat"
          className="bg-transparent border-0 text-white placeholder:text-gray-500 p-0 h-auto focus-visible:ring-0"
          data-testid="search-conversations"
        />
      </div>
    </div>
  );
}

// Notifications - from reference Notifications
function Notifications() {
  return (
    <div className="px-4 py-2 bg-[#182229] border-b border-gray-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-white text-sm font-medium">Get notified of new messages</p>
            <p className="text-gray-400 text-xs">Turn on desktop notifications</p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-white">
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// Conversation Item - from reference Conversations item
function ConversationItem({ 
  conversation, 
  isSelected, 
  onClick,
  isTyping
}: { 
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
  isTyping: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 p-3 transition-colors",
        isSelected ? "bg-[#2a3942]" : "hover:bg-[#1f2c34]"
      )}
      data-testid={`conversation-${conversation.id}`}
    >
      {/* Avatar */}
      <div className="relative">
        <Avatar className="w-12 h-12">
          <AvatarImage src={conversation.avatar} />
          <AvatarFallback className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
            {conversation.isGroup ? (
              <Users className="w-5 h-5" />
            ) : (
              conversation.name?.[0]?.toUpperCase()
            )}
          </AvatarFallback>
        </Avatar>
        {conversation.online && !conversation.isGroup && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#00a884] border-2 border-[#111b21] rounded-full" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-white font-medium truncate">{conversation.name}</h3>
          <span className={cn(
            "text-xs",
            conversation.unreadCount > 0 ? "text-[#00a884]" : "text-gray-500"
          )}>
            {conversation.lastMessageTime}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-gray-400 text-sm truncate flex-1">
            {isTyping ? (
              <span className="text-[#00a884]">typing...</span>
            ) : (
              conversation.lastMessage
            )}
          </p>
          <div className="flex items-center gap-2 ml-2">
            {conversation.pinned && (
              <Archive className="w-4 h-4 text-gray-500" />
            )}
            {conversation.unreadCount > 0 && (
              <div className="min-w-[20px] h-5 bg-[#00a884] rounded-full flex items-center justify-center px-1.5">
                <span className="text-black text-xs font-semibold">
                  {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

// Search Results - from reference SearchResults
function SearchResults({ 
  results, 
  onSelect,
  onClear
}: { 
  results: Conversation[];
  onSelect: (id: string) => void;
  onClear: () => void;
}) {
  if (results.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-400">No results found</p>
        <button 
          onClick={onClear}
          className="text-[#00a884] text-sm mt-2 hover:underline"
        >
          Clear search
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="px-4 py-2 flex items-center justify-between">
        <span className="text-gray-400 text-xs uppercase">Search Results</span>
        <button 
          onClick={onClear}
          className="text-[#00a884] text-xs hover:underline"
        >
          Clear
        </button>
      </div>
      {results.map((conv) => (
        <ConversationItem
          key={conv.id}
          conversation={conv}
          isSelected={false}
          onClick={() => onSelect(conv.id)}
          isTyping={false}
        />
      ))}
    </div>
  );
}

// Main Conversation List - from reference Sidebar
export function ConversationList({ 
  onSelectConversation,
  selectedId,
  onlineUsers = [],
  typingUsers = []
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Conversation[]>([]);

  // Fetch conversations
  const { data: conversations = [] } = useQuery<Conversation[]>({
    queryKey: ['/api/conversations'],
    refetchInterval: 5000,
  });

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const filtered = conversations.filter(c => 
        c.name.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  };

  // Check if user is typing
  const isUserTyping = (conversationId: string) => {
    return typingUsers.some(t => t.conversationId === conversationId);
  };

  // Update online status
  const conversationsWithOnline = conversations.map(conv => ({
    ...conv,
    online: onlineUsers.includes(conv.id)
  }));

  // Sort: pinned first, then by last message time
  const sortedConversations = [...conversationsWithOnline].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.lastMessageTime || 0).getTime() - new Date(a.lastMessageTime || 0).getTime();
  });

  return (
    <div className="flex flex-col h-full max-w-[30%] min-w-[300px] bg-[#111b21] select-none">
      {/* Header - from reference */}
      <SidebarHeader />
      
      {/* Notifications - from reference */}
      <Notifications />
      
      {/* Search - from reference */}
      <SearchBar value={searchQuery} onChange={handleSearch} />
      
      {/* Conversations or Search Results - from reference */}
      <div className="flex-1 overflow-y-auto">
        {searchResults.length > 0 ? (
          <SearchResults 
            results={searchResults}
            onSelect={(id) => {
              onSelectConversation(id);
              setSearchQuery("");
              setSearchResults([]);
            }}
            onClear={() => {
              setSearchQuery("");
              setSearchResults([]);
            }}
          />
        ) : (
          <div>
            {sortedConversations.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                isSelected={conv.id === selectedId}
                onClick={() => onSelectConversation(conv.id)}
                isTyping={isUserTyping(conv.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ConversationList;
