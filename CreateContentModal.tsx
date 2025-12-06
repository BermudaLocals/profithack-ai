/**
 * PROFITHACK AI - Create Content Modal
 * TikTok-style content creation options
 */

import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Radio, Video, Film, Clock, Image, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreateContentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateContentModal({ open, onOpenChange }: CreateContentModalProps) {
  const [, setLocation] = useLocation();

  const createOptions = [
    {
      id: "live",
      title: "Go Live",
      description: "Start streaming now",
      icon: Radio,
      color: "from-red-500 to-pink-500",
      duration: null,
      action: () => {
        setLocation("/go-live");
        onOpenChange(false);
      },
    },
    {
      id: "10min",
      title: "10 Min Video",
      description: "Long-form content",
      icon: Film,
      color: "from-purple-500 to-indigo-500",
      duration: "10:00",
      action: () => {
        setLocation("/upload?type=video&maxDuration=600");
        onOpenChange(false);
      },
    },
    {
      id: "3min",
      title: "3 Min Video",
      description: "Medium-form content",
      icon: Video,
      color: "from-blue-500 to-cyan-500",
      duration: "3:00",
      action: () => {
        setLocation("/upload?type=video&maxDuration=180");
        onOpenChange(false);
      },
    },
    {
      id: "60sec",
      title: "60s Clip",
      description: "Standard TikTok",
      icon: Clock,
      color: "from-cyan-500 to-teal-500",
      duration: "0:60",
      action: () => {
        setLocation("/upload?type=video&maxDuration=60");
        onOpenChange(false);
      },
    },
    {
      id: "30sec",
      title: "30s Clip",
      description: "Quick viral clip",
      icon: Clock,
      color: "from-green-500 to-emerald-500",
      duration: "0:30",
      action: () => {
        setLocation("/upload?type=video&maxDuration=30");
        onOpenChange(false);
      },
    },
    {
      id: "15sec",
      title: "15s Clip",
      description: "Ultra short",
      icon: Clock,
      color: "from-yellow-500 to-orange-500",
      duration: "0:15",
      action: () => {
        setLocation("/upload?type=video&maxDuration=15");
        onOpenChange(false);
      },
    },
    {
      id: "photo",
      title: "Photo",
      description: "Share an image",
      icon: Image,
      color: "from-orange-500 to-red-500",
      duration: null,
      action: () => {
        setLocation("/upload?type=photo");
        onOpenChange(false);
      },
    },
    {
      id: "ai",
      title: "AI Generate",
      description: "Create with Sora 2",
      icon: Sparkles,
      color: "from-pink-500 to-purple-500",
      duration: null,
      action: () => {
        setLocation("/sora");
        onOpenChange(false);
      },
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-black/95 backdrop-blur-xl border-pink-500/30 p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 bg-gradient-to-r from-pink-500/10 to-purple-500/10">
          <DialogTitle className="text-2xl font-bold text-white text-center">
            Create
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-4 gap-3 p-4">
          {createOptions.map((option) => {
            const Icon = option.icon;
            
            return (
              <button
                key={option.id}
                onClick={option.action}
                className="group flex flex-col items-center gap-2 p-3 rounded-xl transition-all hover:scale-105 active:scale-95"
                data-testid={`button-create-${option.id}`}
              >
                <div
                  className={cn(
                    "relative w-14 h-14 rounded-full flex items-center justify-center",
                    "bg-gradient-to-br shadow-lg",
                    option.color
                  )}
                >
                  <Icon className="w-6 h-6 text-white" />
                  {option.id === "live" && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  )}
                </div>
                
                <div className="text-center">
                  <p className="text-xs font-semibold text-white leading-tight">
                    {option.title}
                  </p>
                  {option.duration && (
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      {option.duration}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="p-4 pt-0">
          <button
            onClick={() => onOpenChange(false)}
            className="w-full py-3 text-gray-400 hover:text-white text-sm font-medium transition-colors"
            data-testid="button-cancel-create"
          >
            Cancel
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
