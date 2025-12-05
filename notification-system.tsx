/**
 * Notification System with Sound
 * Real-time notifications for messages, likes, comments, follows
 */

import { useState, useEffect } from "react";
import { Bell, X, Heart, MessageCircle, UserPlus, Video, Gift } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'message' | 'video' | 'gift';
  user: {
    name: string;
    avatar: string;
    username: string;
  };
  content: string;
  time: string;
  read: boolean;
}

const notificationSound = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDGH0fPTgjMGHm7A7+OZRQ0PVKzn77BdGAk+ltryxnMkBSl+y/DajTcIDV6 z6emnVhQKQ5zg8r1wIgU1jtL00YU1Bx9uwO7mmkYOD1Ct5+60YBkKPJTa8sZ0JgUqfsvv3I02CApdsubjpVUSCkCa3vO+cSMGN5HT9NSINAcfb7/u45xGDg5Prvfutl8aCTuU2/LHdSgEK3/M7t+QNwgLXLPo46NWEgk+mN/zwXQkBjiR1vXXiDMHIG/D7uWeSBEOUrDn77RiGQo6kdvyx3YpBCuCzO7ijz0JDFy06OSfUxEJPZje88J2JgU5k9b112M2Bx9wxO3mnEYODU+v5/C1YhoKOY/b8sl4KwUrgs/u5I8+CQ1bsvPkn1MRCTyZ3/PEeCgEOpTX9dpjNwcfccXt55xHDgxPr+fwtmIaCjiO2/LIeSwFKoLP7uWPPgkNW7Lz5J9TERQ8mt/zw3goBDuV1/XaYjYHH3HF7eicRw4MT67n8LZiGgo4jtrzyHktBSqCz+7ljz4JDVu/y/DajTcIDF6z6uu=');

export function NotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'like',
      user: { name: 'Sarah Johnson', avatar: '', username: 'sarah_creates' },
      content: 'liked your video',
      time: '2m ago',
      read: false,
    },
    {
      id: '2',
      type: 'comment',
      user: { name: 'Alex Martinez', avatar: '', username: 'alex_tech' },
      content: 'commented: "This is amazing! 🔥"',
      time: '5m ago',
      read: false,
    },
    {
      id: '3',
      type: 'follow',
      user: { name: 'Emma Wilson', avatar: '', username: 'emma_creative' },
      content: 'started following you',
      time: '10m ago',
      read: false,
    },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);

  useEffect(() => {
    // Simulate new notifications
    const interval = setInterval(() => {
      const newNotification: Notification = {
        id: Date.now().toString(),
        type: ['like', 'comment', 'follow', 'message', 'gift'][Math.floor(Math.random() * 5)] as any,
        user: {
          name: 'New User',
          avatar: '',
          username: 'newuser' + Math.floor(Math.random() * 1000),
        },
        content: 'interacted with your content',
        time: 'Just now',
        read: false,
      };

      setNotifications(prev => [newNotification, ...prev].slice(0, 20));
      setUnreadCount(prev => prev + 1);
      
      // Play notification sound
      notificationSound.play().catch(() => {
        // Ignore autoplay restrictions
      });
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'like': return <Heart className="w-5 h-5 text-pink-500" />;
      case 'comment': return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'follow': return <UserPlus className="w-5 h-5 text-purple-500" />;
      case 'message': return <MessageCircle className="w-5 h-5 text-cyan-500" />;
      case 'video': return <Video className="w-5 h-5 text-orange-500" />;
      case 'gift': return <Gift className="w-5 h-5 text-yellow-500" />;
    }
  };

  return (
    <>
      {/* Notification Bell */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 hover:bg-gray-800 rounded-full transition-colors"
        data-testid="button-notifications"
      >
        <Bell className="w-6 h-6 text-white" />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-pink-600 rounded-full flex items-center justify-center px-1.5">
            <span className="text-white text-xs font-bold">{unreadCount > 99 ? '99+' : unreadCount}</span>
          </div>
        )}
      </button>

      {/* Notification Panel */}
      {showNotifications && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowNotifications(false)}
          />

          {/* Panel */}
          <div className="fixed top-16 right-4 w-96 max-h-[600px] bg-[#1a1a1a] rounded-xl shadow-2xl border border-gray-800 z-50 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-800 flex items-center justify-between sticky top-0 bg-[#1a1a1a]">
              <h2 className="text-white font-bold text-lg">Notifications</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-pink-500 hover:text-pink-400 transition-colors"
                >
                  Mark all read
                </button>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="p-1 hover:bg-gray-800 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto max-h-[520px]">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                  <p className="text-gray-400">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <button
                    key={notification.id}
                    className={cn(
                      "w-full p-4 flex items-start gap-3 hover:bg-[#252525] transition-colors border-b border-gray-800",
                      !notification.read && "bg-[#252525]/50"
                    )}
                    data-testid={`notification-${notification.id}`}
                  >
                    <div className="flex-shrink-0">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={notification.user.avatar} />
                        <AvatarFallback className="bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold">
                          {notification.user.name[0]}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm">
                        <span className="font-semibold">{notification.user.name}</span>
                        {' '}
                        <span className="text-gray-400">{notification.content}</span>
                      </p>
                      <p className="text-gray-500 text-xs mt-1">{notification.time}</p>
                    </div>

                    <div className="flex-shrink-0 mt-1">
                      {getIcon(notification.type)}
                    </div>

                    {!notification.read && (
                      <div className="flex-shrink-0 w-2 h-2 bg-pink-500 rounded-full mt-2" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
