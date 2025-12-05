/**
 * PROFITHACK AI - WhatsApp Clone
 * EXACT WhatsApp UI with Chats, Status, Calls
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, MoreVertical, Camera, Edit, Phone, Video, Archive, Users, Check, CheckCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Tab = "chats" | "status" | "calls";

interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  isRead: boolean;
  isGroup: boolean;
}

export default function WhatsAppPage() {
  const [activeTab, setActiveTab] = useState<Tab>("chats");
  const [searchQuery, setSearchQuery] = useState("");

  // Mock chats data
  const chats: Chat[] = [
    { id: "1", name: "Mom ❤️", avatar: "", lastMessage: "Love you too! 😊", time: "10:30 AM", unread: 0, isRead: true, isGroup: false },
    { id: "2", name: "Work Team", avatar: "", lastMessage: "John: Meeting at 3pm", time: "9:15 AM", unread: 5, isRead: false, isGroup: true },
    { id: "3", name: "Sarah", avatar: "", lastMessage: "See you tonight!", time: "Yesterday", unread: 2, isRead: false, isGroup: false },
    { id: "4", name: "Gym Buddies 💪", avatar: "", lastMessage: "Mike: Tomorrow 6am?", time: "Yesterday", unread: 0, isRead: true, isGroup: true },
    { id: "5", name: "Dad", avatar: "", lastMessage: "How's work going?", time: "Tuesday", unread: 0, isRead: true, isGroup: false },
  ];

  return (
    <div className="h-screen bg-[#111B21] flex flex-col">
      {/* WhatsApp Header */}
      <div className="bg-[#202C33] px-4 py-3 flex items-center justify-between border-b border-[#2A3942]">
        <h1 className="text-[#E9EDEF] text-xl font-medium">WhatsApp</h1>
        <div className="flex items-center gap-6">
          <Camera className="w-5 h-5 text-[#8696A0] cursor-pointer hover:text-white transition-colors" data-testid="button-camera" />
          <Search className="w-5 h-5 text-[#8696A0] cursor-pointer hover:text-white transition-colors" data-testid="button-search" />
          <MoreVertical className="w-5 h-5 text-[#8696A0] cursor-pointer hover:text-white transition-colors" data-testid="button-more" />
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-[#202C33] px-4 flex gap-6 border-b border-[#2A3942]">
        <button
          onClick={() => setActiveTab("chats")}
          className={cn(
            "py-3 text-sm font-medium transition-colors relative",
            activeTab === "chats" ? "text-[#00A884]" : "text-[#8696A0]"
          )}
          data-testid="tab-chats"
        >
          Chats
          {activeTab === "chats" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00A884]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("status")}
          className={cn(
            "py-3 text-sm font-medium transition-colors relative",
            activeTab === "status" ? "text-[#00A884]" : "text-[#8696A0]"
          )}
          data-testid="tab-status"
        >
          Status
          {activeTab === "status" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00A884]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("calls")}
          className={cn(
            "py-3 text-sm font-medium transition-colors relative",
            activeTab === "calls" ? "text-[#00A884]" : "text-[#8696A0]"
          )}
          data-testid="tab-calls"
        >
          Calls
          {activeTab === "calls" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00A884]" />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "chats" && (
          <div>
            {/* Archived */}
            <div className="px-4 py-3 flex items-center gap-4 hover:bg-[#202C33] cursor-pointer transition-colors">
              <Archive className="w-5 h-5 text-[#00A884]" />
              <span className="text-[#E9EDEF] text-sm font-medium">Archived</span>
            </div>

            {/* Chats List */}
            {chats.map((chat) => (
              <div
                key={chat.id}
                className="px-4 py-3 flex items-center gap-3 hover:bg-[#202C33] cursor-pointer transition-colors"
                data-testid={`chat-${chat.id}`}
              >
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={chat.avatar} />
                    <AvatarFallback className="bg-[#00A884] text-white text-lg font-medium">
                      {chat.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  {chat.isGroup && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#00A884] rounded-full flex items-center justify-center">
                      <Users className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-[#E9EDEF] font-medium truncate">{chat.name}</h3>
                    <span className={cn(
                      "text-xs",
                      chat.unread > 0 ? "text-[#00A884]" : "text-[#8696A0]"
                    )}>
                      {chat.time}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[#8696A0] text-sm truncate flex items-center gap-1">
                      {chat.isRead ? (
                        <CheckCheck className="w-4 h-4 text-[#53BDEB]" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      {chat.lastMessage}
                    </p>
                    {chat.unread > 0 && (
                      <div className="bg-[#00A884] rounded-full w-5 h-5 flex items-center justify-center">
                        <span className="text-[#111B21] text-xs font-medium">{chat.unread}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "status" && (
          <div className="p-6 text-center">
            <div className="text-[#8696A0] mb-4">
              <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium text-[#E9EDEF] mb-2">No status updates</p>
              <p className="text-sm">Share photos, videos, and text updates</p>
            </div>
          </div>
        )}

        {activeTab === "calls" && (
          <div className="p-6 text-center">
            <div className="text-[#8696A0] mb-4">
              <Phone className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium text-[#E9EDEF] mb-2">No recent calls</p>
              <p className="text-sm">Make voice or video calls</p>
            </div>
          </div>
        )}
      </div>

      {/* FAB - New Chat */}
      <div className="absolute bottom-6 right-6">
        <button
          className="w-14 h-14 bg-[#00A884] rounded-full flex items-center justify-center shadow-lg hover:bg-[#00A884]/90 transition-colors"
          data-testid="button-new-chat"
        >
          <Edit className="w-6 h-6 text-[#111B21]" />
        </button>
      </div>
    </div>
  );
}
