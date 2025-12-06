import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'wouter';
import './FYPFeed.css';

interface Creator {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  isFollowing?: boolean;
}

interface Video {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  hlsUrl?: string;
  dashUrl?: string;
  thumbnail: string;
  creator: Creator;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  duration: number;
  hashtags: string[];
  isLive?: boolean;
}

interface FYPFeedProps {
  videos: Video[];
  onLoadMore?: () => void;
}

const FYPFeed: React.FC<FYPFeedProps> = ({ videos, onLoadMore }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set());
  const [followedCreators, setFollowedCreators] = useState<Set<string>>(new Set());
  const [videoError, setVideoError] = useState<string>('');
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const intersectionObserverRef = useRef<IntersectionObserver | null>(null);
  const [, navigate] = useLocation();

  // Auto-play current video, pause others
  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      
      if (index === currentIndex) {
        // Play current video
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn('Auto-play blocked:', err);
            setVideoError('Tap to play');
          });
        }
      } else {
        // Pause and reset other videos
        video.pause();
        video.currentTime = 0;
      }
    });
  }, [currentIndex]);

  const handleScroll = useCallback((direction: 'up' | 'down') => {
    if (direction === 'down' && currentIndex < videos.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setVideoError('');
    } else if (direction === 'up' && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setVideoError('');
    }

    if (currentIndex >= videos.length - 3 && onLoadMore) {
      onLoadMore();
    }
  }, [currentIndex, videos.length, onLoadMore]);

  // Wheel scroll support (BETTER than mobile-only TikTok)
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      clearTimeout(scrollTimeout);

      scrollTimeout = setTimeout(() => {
        if (e.deltaY > 0) {
          handleScroll('down');
        } else {
          handleScroll('up');
        }
      }, 100);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
      clearTimeout(scrollTimeout);
    };
  }, [handleScroll]);

  // Keyboard navigation (BETTER than TikTok)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        handleScroll('down');
      } else if (e.key === 'ArrowUp') {
        handleScroll('up');
      } else if (e.key === ' ') {
        e.preventDefault();
        const currentVideo = videoRefs.current[currentIndex];
        if (currentVideo) {
          if (currentVideo.paused) {
            currentVideo.play();
          } else {
            currentVideo.pause();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, handleScroll]);

  const touchStartY = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleScroll('down');
      } else {
        handleScroll('up');
      }
    }
  };

  const handleVideoClick = () => {
    const currentVideo = videoRefs.current[currentIndex];
    if (currentVideo) {
      if (currentVideo.paused) {
        currentVideo.play().catch((err) => {
          console.error('Play failed:', err);
          setVideoError('Cannot play video');
        });
      } else {
        currentVideo.pause();
      }
    }
  };

  const handleVideoError = () => {
    setVideoError('Video failed to load');
  };

  const toggleLike = (videoId: string) => {
    setLikedVideos((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(videoId)) {
        newSet.delete(videoId);
      } else {
        newSet.add(videoId);
      }
      return newSet;
    });
  };

  const toggleFollow = (creatorId: string) => {
    setFollowedCreators((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(creatorId)) {
        newSet.delete(creatorId);
      } else {
        newSet.add(creatorId);
      }
      return newSet;
    });
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  if (!videos || videos.length === 0) {
    return (
      <div className="fyp-feed-empty">
        <p>No videos available</p>
      </div>
    );
  }

  return (
    <div
      className="fyp-feed-container"
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: `translateY(-${currentIndex * 100}vh)`,
        transition: 'transform 0.3s ease-out'
      }}
    >
      {videos.map((video, index) => {
        const isLiked = likedVideos.has(video.id);
        const isFollowing = followedCreators.has(video.creator.id);
        const isActive = index === currentIndex;

        // Only render current video and 1 video before/after for smooth scrolling
        const shouldRender = Math.abs(index - currentIndex) <= 1;
        if (!shouldRender) {
          return <div key={video.id} className="fyp-video-wrapper" />;
        }

        return (
          <div 
            key={video.id} 
            className="fyp-video-wrapper" 
            onClick={isActive ? handleVideoClick : undefined}
          >
            <video
              ref={(el) => {
                videoRefs.current[index] = el;
              }}
              className="fyp-video"
              poster={video.thumbnail || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="700"%3E%3Crect width="400" height="700" fill="%23000000"/%3E%3Ctext x="50%25" y="50%25" fill="%2300ffff" font-size="24" text-anchor="middle"%3ETap to Play%3C/text%3E%3C/svg%3E'}
              autoPlay={isActive}
              muted={isMuted}
              loop
              playsInline
              preload={Math.abs(index - currentIndex) <= 1 ? "auto" : "none"}
              crossOrigin="anonymous"
              onError={isActive ? handleVideoError : undefined}
            >
              {video.hlsUrl && (
                <source src={video.hlsUrl} type="application/x-mpegURL" />
              )}
              {video.dashUrl && (
                <source src={video.dashUrl} type="application/dash+xml" />
              )}
              <source src={video.videoUrl} type="video/mp4" />
            </video>

        <div className="fyp-video-overlay"></div>

        {isActive && videoError && (
          <div className="fyp-error-message">
            <p>{videoError}</p>
            <p style={{ fontSize: '0.7rem', marginTop: '0.5rem' }}>Tap video to try again</p>
          </div>
        )}

        {/* CLICKABLE LIVE Badge - Navigate to stream */}
        {video.isLive && (
          <div 
            className="fyp-live-badge clickable"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/live/${video.creator.id}`);
            }}
            title="Watch live stream"
            data-testid="badge-live-clickable"
          >
            <span className="live-dot"></span>
            LIVE
          </div>
        )}

        {/* Mute Button with SVG icons */}
        <button
          className="fyp-mute-btn"
          onClick={(e) => {
            e.stopPropagation();
            setIsMuted(!isMuted);
          }}
          title={isMuted ? 'Unmute' : 'Mute'}
          data-testid="button-toggle-mute"
        >
          {isMuted ? (
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
            </svg>
          )}
        </button>

        {/* Video Description */}
        <div className="fyp-video-description-section">
          <p className="fyp-video-title">{video.title}</p>
          <p className="fyp-video-description">{video.description}</p>
          {video.hashtags.length > 0 && (
            <div className="fyp-hashtags">
              {video.hashtags.slice(0, 3).map((tag) => (
                <span key={tag} className="fyp-hashtag">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Creator Section - Bottom Left */}
        <div className="fyp-creator-section">
          <img
            src={video.creator.avatar}
            alt={video.creator.name}
            className="fyp-creator-avatar-large"
            data-testid="avatar-creator"
          />
          <div className="fyp-creator-text">
            <p className="fyp-creator-name">{video.creator.name}</p>
            <p className="fyp-creator-handle">@{video.creator.handle}</p>
          </div>
          <button
            className={`fyp-follow-btn-circle ${isFollowing ? 'following' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              toggleFollow(video.creator.id);
            }}
            title={isFollowing ? 'Unfollow' : 'Follow'}
            data-testid="button-follow-creator"
          >
            {isFollowing ? '✓' : '+'}
          </button>
        </div>

        {/* Sound Badge */}
        <div className="fyp-sound-badge">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z" />
          </svg>
          <span>Original Sound - {video.creator.name}</span>
        </div>

        {/* Actions Sidebar - Right */}
        <div className="fyp-actions-sidebar">
          {/* Like Button */}
          <button
            className={`fyp-action-circle ${isLiked ? 'liked' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              toggleLike(video.id);
            }}
            title="Like"
            data-testid="button-like-video"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span className="action-count">{formatNumber(video.likes)}</span>
          </button>

          {/* Comment Button */}
          <button
            className="fyp-action-circle"
            onClick={(e) => e.stopPropagation()}
            title="Comment"
            data-testid="button-comment"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
            </svg>
            <span className="action-count">{formatNumber(video.comments)}</span>
          </button>

          {/* Share Button */}
          <button
            className="fyp-action-circle"
            onClick={(e) => e.stopPropagation()}
            title="Share"
            data-testid="button-share"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
            </svg>
            <span className="action-count">{formatNumber(video.shares)}</span>
          </button>

          {/* Gift Button - PROFITHACK EXCLUSIVE */}
          <button
            className="fyp-action-circle gift"
            onClick={(e) => e.stopPropagation()}
            title="Send Gift"
            data-testid="button-gift"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z" />
            </svg>
            <span className="action-count">Gift</span>
          </button>
        </div>
          </div>
        );
      })}
    </div>
  );
};

export default FYPFeed;
