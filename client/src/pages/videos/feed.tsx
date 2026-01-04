import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Heart, MessageCircle, Share } from 'lucide-react';

// --- IMPORT YOUR CUSTOM HOOKS ---
import { useInteractions } from '../../hooks/useInteractions';
import { ReactionAnimation } from '../../components/ReactionAnimation';

// --- IMPORTANT: REPLACE THIS WITH YOUR ACTUAL AUTH HOOK ---
// This is a placeholder. You must replace it with your app's real authentication logic.
const useAuth = () => {
  // In a real app, this would get the user from context or a state manager
  return { user: { id: 1, username: 'testuser' } }; 
};

// --- IMPORTANT: REPLACE THIS WITH YOUR ACTUAL API CALL ---
// This is a placeholder for fetching videos.
const fetchVideos = async () => {
  // In a real app, you would fetch from your API: fetch('/api/videos/feed')
  return [
    { id: 1, username: 'creator1', videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', likes: 123 },
    { id: 2, username: 'creator2', videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', likes: 456 },
    { id: 3, username: 'creator3', videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', likes: 789 },
  ];
};

// --- THE MAIN FEED PAGE COMPONENT ---
export default function FeedPage() {
  const { user } = useAuth();
  const { interaction, sendInteraction } = useInteractions(user?.id ?? null);
  const [activeVideoId, setActiveVideoId] = useState<number | null>(null);

  const { data: videos, isLoading, error } = useQuery({
    queryKey: ['videos'],
    queryFn: fetchVideos,
  });

  if (isLoading) return <div className="flex justify-center items-center h-screen text-white">Loading feed...</div>;
  if (error) return <div className="flex justify-center items-center h-screen text-white">Error loading feed.</div>;

  return (
    <div className="h-screen bg-black text-white overflow-y-scroll snap-y snap-mandatory">
      {videos?.map((video) => (
        <div key={video.id} className="h-screen snap-start flex flex-col justify-between">
          {/* Video Player */}
          <div className="flex-1 relative">
            <video
              className="w-full h-full object-contain"
              src={video.videoUrl}
              controls
              loop
              autoPlay={activeVideoId === video.id}
              onPlay={() => setActiveVideoId(video.id)}
              muted
            />
          </div>

          {/* User Info & Actions */}
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="font-bold">@{video.username}</p>
              <p className="text-sm text-gray-400">{video.likes} likes</p>
            </div>
            <div className="flex space-x-4">
              {/* --- THE LIKE BUTTON --- */}
              <button
                onClick={() => sendInteraction('like', video.id)}
                className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
                aria-label="Like video"
              >
                <Heart className="h-6 w-6" />
              </button>
              
              {/* --- Other Action Buttons --- */}
              <button className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors" aria-label="Comment">
                <MessageCircle className="h-6 w-6" />
              </button>
              <button className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors" aria-label="Share">
                <Share className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* --- THE ANIMATION COMPONENT --- */}
      {/* This component listens for interactions and displays the animation */}
      <ReactionAnimation interaction={interaction} />
    </div>
  );
}
