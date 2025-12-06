// PrivateOnlyFansFeed.tsx - OnlyFans Private Panel with Payment Enforcement

import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import './PrivateOnlyFansFeed.css';

interface PrivateVideo {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  hlsUrl: string;
  thumbnail: string;
  creator: {
    id: string;
    name: string;
    handle: string;
    avatar: string;
    isFollowing: boolean;
    isLive?: boolean;
  };
  likes: number;
  comments: number;
  shares: number;
  views: number;
  duration: number;
  hashtags: string[];
  isPrivate: boolean;
  subscriptionRequired: boolean;
  subscriptionPrice: number;
}

interface PrivateOnlyFansFeedProps {
  videos: PrivateVideo[];
  onLoadMore?: () => void;
}

export const PrivateOnlyFansFeed: React.FC<PrivateOnlyFansFeedProps> = ({
  videos,
  onLoadMore
}) => {
  const [, navigate] = useLocation();
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [userSubscriptions, setUserSubscriptions] = useState<Set<string>>(new Set());
  const [isLoadingSubscriptions, setIsLoadingSubscriptions] = useState(true);
  const [terminationOverlay, setTerminationOverlay] = useState(false);
  const [terminationReason, setTerminationReason] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ============================================
  // FETCH USER SUBSCRIPTIONS
  // ============================================
  useEffect(() => {
    const fetchUserSubscriptions = async () => {
      try {
        const response = await fetch('/api/user/subscriptions', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUserSubscriptions(new Set(data.subscriptionIds));
        }
      } catch (error) {
        console.error('Failed to fetch subscriptions:', error);
      } finally {
        setIsLoadingSubscriptions(false);
      }
    };

    fetchUserSubscriptions();
  }, []);

  // ============================================
  // CHECK PAYMENT STATUS FOR CURRENT VIDEO
  // ============================================
  const checkPaymentStatus = async (videoId: string, creatorId: string) => {
    try {
      const response = await fetch(`/api/onlyfans/check-access/${videoId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        // Payment failed or subscription expired
        handlePaymentFailure(videoId, creatorId);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Payment check failed:', error);
      handlePaymentFailure(videoId, creatorId);
      return false;
    }
  };

  // ============================================
  // HANDLE PAYMENT FAILURE - BLACK SCREEN
  // ============================================
  const handlePaymentFailure = (videoId: string, creatorId: string) => {
    // Stop video playback
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }

    // Show black screen overlay
    setTerminationOverlay(true);
    setTerminationReason('subscription_expired');

    // Redirect after 3 seconds
    setTimeout(() => {
      navigate('/models');
    }, 3000);
  };

  // ============================================
  // HANDLE VIDEO CHANGE
  // ============================================
  const handleVideoChange = (index: number) => {
    if (index >= 0 && index < videos.length) {
      setCurrentVideoIndex(index);
      setTerminationOverlay(false);
      setIsPlaying(true);
    }
  };

  // ============================================
  // KEYBOARD & SCROLL NAVIGATION
  // ============================================
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        handleVideoChange(currentVideoIndex - 1);
      } else if (e.key === 'ArrowDown') {
        handleVideoChange(currentVideoIndex + 1);
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying(!isPlaying);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentVideoIndex, isPlaying]);

  // ============================================
  // WHEEL SCROLL NAVIGATION
  // ============================================
  useEffect(() => {
    let wheelTimeout: NodeJS.Timeout;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      clearTimeout(wheelTimeout);

      wheelTimeout = setTimeout(() => {
        if (e.deltaY > 0) {
          handleVideoChange(currentVideoIndex + 1);
        } else {
          handleVideoChange(currentVideoIndex - 1);
        }
      }, 100);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, [currentVideoIndex]);

  // ============================================
  // AUTO-PLAY VIDEO
  // ============================================
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => {
          // Autoplay may be blocked by browser
          console.log('Autoplay blocked');
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  // ============================================
  // CHECK PAYMENT ON VIDEO LOAD
  // ============================================
  useEffect(() => {
    const currentVideo = videos[currentVideoIndex];
    if (currentVideo && currentVideo.isPrivate && currentVideo.subscriptionRequired) {
      checkPaymentStatus(currentVideo.id, currentVideo.creator.id);
    }
  }, [currentVideoIndex, videos]);

  if (isLoadingSubscriptions) {
    return <div className="loading-screen">Loading...</div>;
  }

  const currentVideo = videos[currentVideoIndex];

  if (!currentVideo) {
    return <div className="empty-screen">No videos available</div>;
  }

  // Check if user has access to this video
  const hasAccess =
    !currentVideo.isPrivate ||
    !currentVideo.subscriptionRequired ||
    userSubscriptions.has(currentVideo.creator.id);

  return (
    <div className="private-fyp-container" ref={containerRef}>
      {/* VIDEO PLAYER */}
      <div className="video-wrapper">
        <video
          ref={videoRef}
          className={`video-player ${!hasAccess ? 'blocked' : ''}`}
          src={currentVideo.hlsUrl || currentVideo.videoUrl}
          muted={isMuted}
          loop
          playsInline
          onClick={() => setIsPlaying(!isPlaying)}
        />

        {/* [LIVE] BADGE - TOP LEFT */}
        {currentVideo.creator.isLive && (
          <div
            className="live-badge"
            onClick={() => navigate(`/live/${currentVideo.creator.id}`)}
          >
            <span className="live-dot"></span>
            [LIVE]
          </div>
        )}

        {/* MUTE BUTTON - TOP RIGHT */}
        <button
          className="mute-button"
          onClick={() => setIsMuted(!isMuted)}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>

        {/* VIDEO COUNTER - TOP LEFT (BELOW LIVE BADGE) */}
        <div className="video-counter">
          {currentVideoIndex + 1} / {videos.length}
        </div>

        {/* CREATOR INFO - BOTTOM LEFT */}
        <div className="creator-section">
          <div className="creator-info">
            <img
              src={currentVideo.creator.avatar}
              alt={currentVideo.creator.name}
              className="creator-avatar"
              onClick={() => navigate(`/profile/${currentVideo.creator.id}`)}
            />
            <div className="creator-details">
              <h3 className="creator-name">{currentVideo.creator.name}</h3>
              <p className="creator-handle">@{currentVideo.creator.handle}</p>
            </div>
          </div>

          {/* FOLLOW/SUBSCRIBE BUTTON */}
          <button className="follow-button">
            {currentVideo.creator.isFollowing ? '✓' : '+'}
          </button>
        </div>

        {/* VIDEO TITLE - BOTTOM LEFT */}
        <div className="video-title-section">
          <p className="video-title">{currentVideo.title}</p>
          <p className="video-description">{currentVideo.description}</p>
        </div>

        {/* ACTION BUTTONS - RIGHT SIDE */}
        <div className="action-buttons">
          {/* LIKE BUTTON */}
          <button className="action-button like-button" title="Like">
            <span className="button-icon">❤️</span>
            <span className="button-count">{currentVideo.likes}</span>
          </button>

          {/* COMMENT BUTTON */}
          <button
            className="action-button comment-button"
            onClick={() => navigate(`/video/${currentVideo.id}`)}
            title="Comment"
          >
            <span className="button-icon">💬</span>
            <span className="button-count">{currentVideo.comments}</span>
          </button>

          {/* SHARE BUTTON */}
          <button className="action-button share-button" title="Share">
            <span className="button-icon">📤</span>
            <span className="button-count">{currentVideo.shares}</span>
          </button>

          {/* GIFT BUTTON */}
          <button className="action-button gift-button" title="Send Gift">
            <span className="button-icon">🎁</span>
          </button>

          {/* BOOKMARK BUTTON */}
          <button className="action-button bookmark-button" title="Bookmark">
            <span className="button-icon">🔖</span>
          </button>
        </div>

        {/* SOUND INFO - BOTTOM LEFT */}
        <div className="sound-info">
          <span className="sound-icon">🎵</span>
          <span className="sound-name">Original Sound</span>
        </div>

        {/* TERMINATION OVERLAY - PAYMENT FAILED */}
        {terminationOverlay && (
          <div className="termination-overlay active">
            <div className="termination-alert">
              <div className="alert-icon">🔒</div>
              <h2>Subscription Required</h2>
              <p>
                {terminationReason === 'subscription_expired'
                  ? 'Your subscription has expired or you do not have access to this content.'
                  : 'Payment failed. Please try again.'}
              </p>
              <div className="alert-progress">
                <div className="progress-bar"></div>
              </div>
              <p className="redirect-message">Redirecting to models...</p>
            </div>
          </div>
        )}
      </div>

      {/* SUBSCRIPTION BANNER - IF REQUIRED */}
      {currentVideo.isPrivate && currentVideo.subscriptionRequired && !hasAccess && (
        <div className="subscription-banner">
          <div className="banner-content">
            <h3>Subscribe to {currentVideo.creator.name}</h3>
            <p>${currentVideo.subscriptionPrice}/month for exclusive content</p>
            <button className="subscribe-button">Subscribe Now</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrivateOnlyFansFeed;
