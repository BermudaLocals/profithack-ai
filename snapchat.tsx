/**
 * PROFITHACK AI - Snapchat Clone
 * EXACT Snapchat UI with Camera, Stories, Map
 */

import { useState } from "react";
import { Camera, Search, User, MapPin, MessageCircle, Ghost } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type Tab = "camera" | "stories" | "discover" | "map";

export default function SnapchatPage() {
  const [activeTab, setActiveTab] = useState<Tab>("camera");

  return (
    <div className="h-screen bg-black flex flex-col">
      {/* Snapchat Header */}
      <div className="bg-black px-4 py-3 flex items-center justify-between">
        <Search className="w-6 h-6 text-white cursor-pointer hover:text-gray-300 transition-colors" data-testid="button-search" />
        <Ghost className="w-10 h-10 text-white" />
        <Avatar className="h-8 w-8 cursor-pointer">
          <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-yellow-500 text-black text-sm">U</AvatarFallback>
        </Avatar>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center justify-around border-b border-gray-800 py-2 bg-black">
        <button
          onClick={() => setActiveTab("map")}
          className={cn(
            "flex flex-col items-center gap-1 p-2",
            activeTab === "map" ? "opacity-100" : "opacity-50"
          )}
          data-testid="tab-map"
        >
          <MapPin className={cn("w-6 h-6", activeTab === "map" ? "text-white" : "text-gray-400")} />
          <span className={cn("text-xs", activeTab === "map" ? "text-white" : "text-gray-400")}>Map</span>
        </button>
        <button
          onClick={() => setActiveTab("stories")}
          className={cn(
            "flex flex-col items-center gap-1 p-2",
            activeTab === "stories" ? "opacity-100" : "opacity-50"
          )}
          data-testid="tab-stories"
        >
          <MessageCircle className={cn("w-6 h-6", activeTab === "stories" ? "text-white" : "text-gray-400")} />
          <span className={cn("text-xs", activeTab === "stories" ? "text-white" : "text-gray-400")}>Chat</span>
        </button>
        <button
          onClick={() => setActiveTab("camera")}
          className={cn(
            "flex flex-col items-center gap-1 p-2",
            activeTab === "camera" ? "opacity-100" : "opacity-50"
          )}
          data-testid="tab-camera"
        >
          <Camera className={cn("w-6 h-6", activeTab === "camera" ? "text-white" : "text-gray-400")} />
          <span className={cn("text-xs", activeTab === "camera" ? "text-white" : "text-gray-400")}>Camera</span>
        </button>
        <button
          onClick={() => setActiveTab("discover")}
          className={cn(
            "flex flex-col items-center gap-1 p-2",
            activeTab === "discover" ? "opacity-100" : "opacity-50"
          )}
          data-testid="tab-discover"
        >
          <div className={cn("w-6 h-6 flex items-center justify-center", activeTab === "discover" ? "text-white" : "text-gray-400")}>
            <div className="w-4 h-4 border-2 rounded-sm" />
          </div>
          <span className={cn("text-xs", activeTab === "discover" ? "text-white" : "text-gray-400")}>Stories</span>
        </button>
        <button
          onClick={() => window.location.href = "/profile"}
          className="flex flex-col items-center gap-1 p-2 opacity-50"
          data-testid="tab-profile"
        >
          <User className="w-6 h-6 text-gray-400" />
          <span className="text-xs text-gray-400">Profile</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-black">
        {activeTab === "camera" && (
          <div className="h-full flex items-center justify-center bg-gradient-to-br from-yellow-400/20 to-yellow-500/20">
            <div className="text-center">
              <Camera className="w-24 h-24 text-white mx-auto mb-4" />
              <h2 className="text-white text-2xl font-bold mb-2">Camera</h2>
              <p className="text-gray-300 text-sm">Tap to capture a Snap</p>
              
              {/* Camera Button */}
              <button className="mt-8 w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform mx-auto">
                <div className="w-16 h-16 border-4 border-black rounded-full" />
              </button>
            </div>
          </div>
        )}

        {activeTab === "stories" && (
          <div className="p-4 space-y-3">
            {["Sarah", "Mike", "Emma", "John"].map((name, i) => (
              <div key={i} className="flex items-center gap-3 p-3 hover:bg-gray-900 rounded-lg cursor-pointer transition-colors">
                <Avatar className="h-12 w-12 border-2 border-yellow-400">
                  <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-yellow-500 text-black">
                    {name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-white font-semibold">{name}</h3>
                  <p className="text-gray-400 text-sm">Tap to view story</p>
                </div>
                <span className="text-gray-400 text-xs">2h</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === "discover" && (
          <div className="p-4 grid grid-cols-2 gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer">
                <span className="text-gray-600 text-sm">Discover Story {i}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === "map" && (
          <div className="h-full flex items-center justify-center bg-gray-900">
            <div className="text-center">
              <MapPin className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-white text-lg font-semibold mb-2">Snap Map</h3>
              <p className="text-gray-400 text-sm">See where your friends are</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
