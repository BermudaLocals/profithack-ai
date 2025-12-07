/**
 * WhatsApp-Style Messaging
 * EXACT WhatsApp UI with PROFITHACK branding
 * All WhatsApp features: chats, calls, status, groups
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Search, 
  Phone, 
  Video, 
  MoreVertical, 
  Camera, 
  Mic,
  Paperclip,
  Smile,
  Send,
  Check,
  CheckCheck,
  Archive,
  VolumeX,
  Pin,
  Trash2,
  Star,
  MessageCircle
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Tab = 'chats' | 'status' | 'calls';

// Mock data
const mockChats = [
  {
    id: '1',
    name: 'Sarah Johnson',
    avatar: '',
    lastMessage: 'Hey! Check out this new AI video I made 🔥',
    time: '12:45 PM',
    unread: 3,
    online: true,
    typing: false,
    pinned: true,
  },
  {
    id: '2',
    name: 'Tech Creators Group',
    avatar: '',
    lastMessage: 'Mike: The Sora 2 update is insane!',
    time: '11:23 AM',
    unread: 12,
    online: false,
    typing: false,
    pinned: false,
    isGroup: true,
  },
  {
    id: '3',
    name: 'Alex Martinez',
    avatar: '',
    lastMessage: 'Can you send me that template?',
    time: 'Yesterday',
    unread: 0,
    online: false,
    typing: false,
    pinned: false,
  },
  {
    id: '4',
    name: 'Emma Wilson',
    avatar: '',
    lastMessage: 'You: Thanks for the tips! 👍',
    time: 'Yesterday',
    unread: 0,
    online: true,
    typing: false,
    pinned: false,
  },
];

const mockStatus = [
  { id: '1', name: 'My Status', avatar: '', time: 'Tap to add status update', isOwn: true },
  { id: '2', name: 'Sarah Johnson', avatar: '', time: '23m ago', viewed: false },
  { id: '3', name: 'Alex Martinez', avatar: '', time: '1h ago', viewed: false },
  { id: '4', name: 'Emma Wilson', avatar: '', time: '3h ago', viewed: true },
];

const mockCalls = [
  { id: '1', name: 'Sarah Johnson', avatar: '', type: 'video', time: 'Today, 12:45 PM', missed: false, incoming: true },
  { id: '2', name: 'Alex Martinez', avatar: '', type: 'voice', time: 'Yesterday, 9:30 PM', missed: true, incoming: true },
  { id: '3', name: 'Emma Wilson', avatar: '', type: 'video', time: 'Yesterday, 6:15 PM', missed: false, incoming: false },
];

export default function WhatsAppMessages() {
  const [activeTab, setActiveTab] = useState<Tab>('chats');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChat, setSelectedChat] = useState<string | null>(null);

  return (
    <div className="h-screen bg-[#0a0a0a] flex flex-col">
      {/* WhatsApp Header */}
      <div className="bg-[#1f1f1f] border-b border-gray-800">
        <div className="px-4 py-3 flex items-center justify-between">
          <h1 className="text-white text-xl font-semibold">PROFITHACK</h1>
          <div className="flex items-center gap-6">
            <button className="text-gray-400 hover:text-white transition-colors">
              <Camera className="w-6 h-6" />
            </button>
            <button className="text-gray-400 hover:text-white transition-colors">
              <Search className="w-6 h-6" />
            </button>
            <button className="text-gray-400 hover:text-white transition-colors">
              <MoreVertical className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tabs - WhatsApp Style */}
        <div className="flex">
          <button
            onClick={() => setActiveTab('chats')}
            className={cn(
              "flex-1 py-3 text-sm font-medium transition-all relative",
              activeTab === 'chats' ? "text-[#00d9a3]" : "text-gray-400"
            )}
          >
            Chats
            {activeTab === 'chats' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00d9a3]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('status')}
            className={cn(
              "flex-1 py-3 text-sm font-medium transition-all relative",
              activeTab === 'status' ? "text-[#00d9a3]" : "text-gray-400"
            )}
          >
            Status
            {activeTab === 'status' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00d9a3]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('calls')}
            className={cn(
              "flex-1 py-3 text-sm font-medium transition-all relative",
              activeTab === 'calls' ? "text-[#00d9a3]" : "text-gray-400"
            )}
          >
            Calls
            {activeTab === 'calls' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00d9a3]" />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        {activeTab === 'chats' && (
          <div>
            {mockChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setSelectedChat(chat.id)}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#1a1a1a] active:bg-[#252525] transition-colors"
                data-testid={`chat-${chat.id}`}
              >
                {/* Avatar */}
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={chat.avatar} />
                    <AvatarFallback className="bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold">
                      {chat.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  {chat.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#00d9a3] border-2 border-[#0a0a0a] rounded-full" />
                  )}
                </div>

                {/* Chat Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-white font-medium truncate">{chat.name}</h3>
                    <span className="text-gray-500 text-xs">{chat.time}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-gray-400 text-sm truncate flex-1">
                      {chat.typing ? (
                        <span className="text-[#00d9a3]">typing...</span>
                      ) : (
                        chat.lastMessage
                      )}
                    </p>
                    {chat.unread > 0 && (
                      <div className="ml-2 min-w-[20px] h-5 bg-[#00d9a3] rounded-full flex items-center justify-center px-1.5">
                        <span className="text-black text-xs font-semibold">{chat.unread}</span>
                      </div>
                    )}
                    {chat.pinned && (
                      <Pin className="ml-2 w-4 h-4 text-gray-500" />
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {activeTab === 'status' && (
          <div>
            {mockStatus.map((status, index) => (
              <button
                key={status.id}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#1a1a1a] transition-colors"
              >
                <div className="relative">
                  <div className={cn(
                    "p-0.5 rounded-full",
                    status.isOwn ? "bg-gray-700" : status.viewed ? "bg-gray-700" : "bg-gradient-to-r from-pink-500 to-purple-600"
                  )}>
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={status.avatar} />
                      <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold">
                        {status.name[0]}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  {status.isOwn && (
                    <div className="absolute bottom-0 right-0 w-5 h-5 bg-[#00d9a3] rounded-full flex items-center justify-center border-2 border-[#0a0a0a]">
                      <span className="text-black text-xs font-bold">+</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-white font-medium">{status.name}</h3>
                  <p className="text-gray-500 text-sm">{status.time}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {activeTab === 'calls' && (
          <div>
            {mockCalls.map((call) => (
              <div
                key={call.id}
                className="px-4 py-3 flex items-center gap-3 hover:bg-[#1a1a1a] transition-colors"
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={call.avatar} />
                  <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold">
                    {call.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className={cn(
                    "font-medium",
                    call.missed ? "text-red-500" : "text-white"
                  )}>
                    {call.name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    {call.incoming ? (
                      <span className="text-xs">↙</span>
                    ) : (
                      <span className="text-xs">↗</span>
                    )}
                    <span>{call.time}</span>
                  </div>
                </div>
                <button className="p-2 hover:bg-[#252525] rounded-full transition-colors">
                  {call.type === 'video' ? (
                    <Video className="w-5 h-5 text-[#00d9a3]" />
                  ) : (
                    <Phone className="w-5 h-5 text-[#00d9a3]" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* WhatsApp Floating Action Button */}
      <button className="fixed bottom-24 right-6 w-14 h-14 bg-[#00d9a3] rounded-full flex items-center justify-center shadow-2xl active:scale-95 transition-transform z-50">
        <MessageCircle className="w-6 h-6 text-black" />
      </button>
    </div>
  );
}
