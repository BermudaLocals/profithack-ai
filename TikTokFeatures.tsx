// TikTokFeatures.tsx - All TikTok Features (Duets, Stitches, Comments, DMs, Notifications, Search, Trending, Analytics)

import { useState, useEffect } from 'react';
import './TikTokFeatures.css';

// ============================================
// DUETS COMPONENT
// ============================================
export interface DuetProps {
  videoId: string;
  originalCreatorId: string;
  onClose: () => void;
}

export const DuetComponent: React.FC<DuetProps> = ({ videoId, originalCreatorId, onClose }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<Blob | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setIsRecording(true);
      // Recording logic here
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    // Stop recording and save
  };

  const publishDuet = async () => {
    if (!recordedVideo) return;
    try {
      const formData = new FormData();
      formData.append('duetVideo', recordedVideo);
      formData.append('originalVideoId', videoId);
      formData.append('originalCreatorId', originalCreatorId);

      const response = await fetch('/api/duets/create', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        alert('Duet published!');
        onClose();
      }
    } catch (error) {
      console.error('Failed to publish duet:', error);
    }
  };

  return (
    <div className="duet-modal">
      <div className="duet-container">
        <h2>Create a Duet</h2>
        <div className="duet-preview">
          {isRecording ? (
            <div className="recording-indicator">🔴 RECORDING</div>
          ) : (
            <p>Click to start recording your duet</p>
          )}
        </div>
        <div className="duet-controls">
          <button onClick={isRecording ? stopRecording : startRecording}>
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </button>
          <button onClick={publishDuet} disabled={!recordedVideo}>
            Publish Duet
          </button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// STITCHES COMPONENT
// ============================================
export interface StitchProps {
  videoId: string;
  originalCreatorId: string;
  onClose: () => void;
}

export const StitchComponent: React.FC<StitchProps> = ({ videoId, originalCreatorId, onClose }) => {
  const [selectedClip, setSelectedClip] = useState<number>(0);
  const [isRecording, setIsRecording] = useState(false);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const publishStitch = async () => {
    try {
      const response = await fetch('/api/stitches/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          originalVideoId: videoId,
          originalCreatorId: originalCreatorId,
          clipDuration: selectedClip
        })
      });

      if (response.ok) {
        alert('Stitch published!');
        onClose();
      }
    } catch (error) {
      console.error('Failed to publish stitch:', error);
    }
  };

  return (
    <div className="stitch-modal">
      <div className="stitch-container">
        <h2>Create a Stitch</h2>
        <div className="stitch-clip-selector">
          <p>Select a clip from the original video:</p>
          <input
            type="range"
            min="0"
            max="100"
            value={selectedClip}
            onChange={(e) => setSelectedClip(Number(e.target.value))}
          />
        </div>
        <div className="stitch-controls">
          <button onClick={startRecording}>
            {isRecording ? '🔴 RECORDING' : 'Start Recording'}
          </button>
          <button onClick={publishStitch}>Publish Stitch</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// COMMENTS COMPONENT
// ============================================
export interface Comment {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  text: string;
  timestamp: Date;
  likes: number;
  replies: Comment[];
}

export interface CommentsProps {
  videoId: string;
}

export const CommentsComponent: React.FC<CommentsProps> = ({ videoId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`/api/videos/${videoId}/comments`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        const data = await response.json();
        setComments(data);
      } catch (error) {
        console.error('Failed to fetch comments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [videoId]);

  const postComment = async () => {
    if (!newComment.trim()) return;

    try {
      const response = await fetch(`/api/videos/${videoId}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: newComment })
      });

      if (response.ok) {
        const comment = await response.json();
        setComments([comment, ...comments]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Failed to post comment:', error);
    }
  };

  return (
    <div className="comments-panel">
      <h3>Comments ({comments.length})</h3>
      
      {isLoading ? (
        <p>Loading comments...</p>
      ) : (
        <>
          <div className="comments-list">
            {comments.map((comment) => (
              <div key={comment.id} className="comment-item">
                <img src={comment.avatar} alt={comment.username} className="comment-avatar" />
                <div className="comment-content">
                  <div className="comment-header">
                    <strong>{comment.username}</strong>
                    <span className="comment-time">
                      {new Date(comment.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="comment-text">{comment.text}</p>
                  <div className="comment-actions">
                    <button>❤️ {comment.likes}</button>
                    <button>Reply</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="comment-input">
            <input
              type="text"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && postComment()}
            />
            <button onClick={postComment}>Post</button>
          </div>
        </>
      )}
    </div>
  );
};

// ============================================
// NOTIFICATIONS COMPONENT
// ============================================
export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention';
  userId: string;
  username: string;
  avatar: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
}

export const NotificationsComponent: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/notifications', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        const data = await response.json();
        setNotifications(data);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like': return '❤️';
      case 'comment': return '💬';
      case 'follow': return '👤';
      case 'mention': return '@';
      default: return '🔔';
    }
  };

  return (
    <div className="notifications-panel">
      <h3>Notifications</h3>
      {isLoading ? (
        <p>Loading notifications...</p>
      ) : (
        <div className="notifications-list">
          {notifications.map((notif) => (
            <div key={notif.id} className={`notification-item ${notif.isRead ? '' : 'unread'}`}>
              <span className="notification-icon">{getNotificationIcon(notif.type)}</span>
              <img src={notif.avatar} alt={notif.username} className="notification-avatar" />
              <div className="notification-content">
                <p>
                  <strong>{notif.username}</strong> {notif.content}
                </p>
                <span className="notification-time">
                  {new Date(notif.timestamp).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================
// SEARCH COMPONENT
// ============================================
export const SearchComponent: React.FC = () => {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<'users' | 'videos' | 'sounds' | 'hashtags'>('users');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const performSearch = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(query)}&type=${searchType}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      );
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="search-container">
      <div className="search-header">
        <input
          type="text"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && performSearch()}
        />
        <button onClick={performSearch}>🔍</button>
      </div>

      <div className="search-tabs">
        <button
          className={searchType === 'users' ? 'active' : ''}
          onClick={() => setSearchType('users')}
        >
          Users
        </button>
        <button
          className={searchType === 'videos' ? 'active' : ''}
          onClick={() => setSearchType('videos')}
        >
          Videos
        </button>
        <button
          className={searchType === 'sounds' ? 'active' : ''}
          onClick={() => setSearchType('sounds')}
        >
          Sounds
        </button>
        <button
          className={searchType === 'hashtags' ? 'active' : ''}
          onClick={() => setSearchType('hashtags')}
        >
          Hashtags
        </button>
      </div>

      {isLoading ? (
        <p>Searching...</p>
      ) : (
        <div className="search-results">
          {results.map((result, index) => (
            <div key={index} className="search-result-item">
              {/* Render based on search type */}
              {searchType === 'users' && (
                <>
                  <img src={result.avatar} alt={result.username} />
                  <div>
                    <strong>{result.username}</strong>
                    <p>{result.bio}</p>
                  </div>
                </>
              )}
              {searchType === 'videos' && (
                <>
                  <img src={result.thumbnail} alt={result.title} />
                  <p>{result.title}</p>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================
// TRENDING SOUNDS COMPONENT
// ============================================
export interface TrendingSound {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  usageCount: number;
}

export const TrendingSoundsComponent: React.FC = () => {
  const [sounds, setSounds] = useState<TrendingSound[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrendingSounds = async () => {
      try {
        const response = await fetch('/api/sounds/trending', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        const data = await response.json();
        setSounds(data);
      } catch (error) {
        console.error('Failed to fetch trending sounds:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrendingSounds();
  }, []);

  return (
    <div className="trending-sounds-container">
      <h3>🎵 Trending Sounds</h3>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="trending-sounds-list">
          {sounds.map((sound) => (
            <div key={sound.id} className="trending-sound-item">
              <img src={sound.thumbnail} alt={sound.title} />
              <div className="sound-info">
                <strong>{sound.title}</strong>
                <p>{sound.artist}</p>
                <span>{sound.usageCount} videos</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================
// CREATOR ANALYTICS COMPONENT
// ============================================
export const CreatorAnalyticsComponent: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/creator/analytics', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        const data = await response.json();
        setAnalytics(data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  return (
    <div className="analytics-container">
      <h2>📊 Creator Analytics</h2>
      {isLoading ? (
        <p>Loading analytics...</p>
      ) : analytics ? (
        <div className="analytics-grid">
          <div className="analytics-card">
            <h3>Total Views</h3>
            <p className="analytics-number">{analytics.totalViews?.toLocaleString()}</p>
          </div>
          <div className="analytics-card">
            <h3>Total Likes</h3>
            <p className="analytics-number">{analytics.totalLikes?.toLocaleString()}</p>
          </div>
          <div className="analytics-card">
            <h3>Followers</h3>
            <p className="analytics-number">{analytics.followers?.toLocaleString()}</p>
          </div>
          <div className="analytics-card">
            <h3>Engagement Rate</h3>
            <p className="analytics-number">{analytics.engagementRate}%</p>
          </div>
        </div>
      ) : (
        <p>No analytics available</p>
      )}
    </div>
  );
};

// ============================================
// DIRECT MESSAGES COMPONENT
// ============================================
export const DirectMessagesComponent: React.FC = () => {
  return (
    <div className="dm-container">
      <h2>💬 Direct Messages</h2>
      <p>Coming soon...</p>
    </div>
  );
};
