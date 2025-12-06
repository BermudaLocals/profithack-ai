import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import './LiveHostsFeed.css';

interface LiveHost {
  id: string;
  userId: string;
  username: string;
  handle: string;
  avatar: string;
  thumbnail: string;
  title: string;
  viewers: number;
  isVerified: boolean;
  category: string;
  streamUrl: string;
  startedAt: Date;
  gifts: number;
}

interface LiveHostsFeedProps {
  onSelectHost?: (host: LiveHost) => void;
}

const LiveHostsFeed: React.FC<LiveHostsFeedProps> = ({ onSelectHost }) => {
  const [liveHosts, setLiveHosts] = useState<LiveHost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [, navigate] = useLocation();

  const categories = ['all', 'gaming', 'music', 'beauty', 'fitness', 'cooking', 'art', 'education', 'other'];

  // Fetch live hosts
  useEffect(() => {
    const fetchLiveHosts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/live/hosts', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        const data = await response.json();
        setLiveHosts(data);
      } catch (error) {
        console.error('Failed to fetch live hosts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLiveHosts();
    const interval = setInterval(fetchLiveHosts, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const filteredHosts = selectedCategory === 'all' 
    ? liveHosts 
    : liveHosts.filter(host => host.category === selectedCategory);

  const handleHostClick = (host: LiveHost) => {
    if (onSelectHost) {
      onSelectHost(host);
    }
    navigate(`/live/${host.userId}`);
  };

  const formatViewers = (viewers: number): string => {
    if (viewers >= 1000000) return (viewers / 1000000).toFixed(1) + 'M';
    if (viewers >= 1000) return (viewers / 1000).toFixed(1) + 'K';
    return viewers.toString();
  };

  const formatUptime = (startedAt: Date): string => {
    const now = new Date();
    const diff = now.getTime() - new Date(startedAt).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="live-hosts-container">
      {/* Header */}
      <div className="live-hosts-header">
        <h1>🔴 LIVE</h1>
        <p>Watch creators streaming now</p>
      </div>

      {/* Category Filter */}
      <div className="live-category-filter">
        {categories.map((category) => (
          <button
            key={category}
            className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="live-loading">
          <p>Loading live streams...</p>
        </div>
      )}

      {/* Live Hosts Grid */}
      {!isLoading && (
        <div className="live-hosts-grid">
          {filteredHosts.length > 0 ? (
            filteredHosts.map((host) => (
              <div
                key={host.id}
                className="live-host-card"
                onClick={() => handleHostClick(host)}
              >
                {/* Thumbnail */}
                <div className="live-thumbnail-wrapper">
                  <img
                    src={host.thumbnail}
                    alt={host.username}
                    className="live-thumbnail"
                  />
                  
                  {/* Live Badge */}
                  <div className="live-badge-overlay">
                    <span className="live-dot"></span>
                    <span className="live-text">LIVE</span>
                  </div>

                  {/* Viewers Count */}
                  <div className="live-viewers">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                    </svg>
                    <span>{formatViewers(host.viewers)}</span>
                  </div>

                  {/* Uptime */}
                  <div className="live-uptime">
                    {formatUptime(host.startedAt)}
                  </div>
                </div>

                {/* Host Info */}
                <div className="live-host-info">
                  <div className="live-host-header-info">
                    <img
                      src={host.avatar}
                      alt={host.username}
                      className="live-host-avatar"
                    />
                    <div className="live-host-details">
                      <div className="live-host-name">
                        {host.username}
                        {host.isVerified && (
                          <svg className="verified-badge" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                          </svg>
                        )}
                      </div>
                      <p className="live-host-handle">@{host.handle}</p>
                    </div>
                  </div>
                  <p className="live-stream-title">{host.title}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="live-empty">
              <p>No live streams in this category</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LiveHostsFeed;
