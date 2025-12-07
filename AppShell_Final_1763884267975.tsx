// File: AppShell_Final.tsx
// The final, production-ready AppShell component integrating all features and the TikTok-style navigation.

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';

// --- Import Core Components (Assuming they are in the project structure) ---
// NOTE: In a real project, these would be imported from their respective paths.
// For this final demonstration, we use placeholders for all but the core Feed and Battles.
import Feed from './Feed'; // The integrated Feed component
import BattleRooms from './BattleRooms'; // The integrated BattleRooms component

// --- Utility Components (Placeholders) ---
const Screen = ({ title }: { title: string }) => (
  <div style={{ 
    padding: '20px', 
    textAlign: 'center', 
    height: '100vh', 
    backgroundColor: '#000', 
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  }}>
    <h1 style={{ fontSize: '2rem' }}>{title}</h1>
    <p style={{ color: '#aaa' }}>Content for the {title} screen.</p>
  </div>
);

// --- 1. Navigation Data (Full Sitemap) ---
const ALL_ROUTES = [
  // Core Feeds
  { path: '/feed', label: 'Feed', icon: '🔥', component: Feed, nav: 'bottom' },
  { path: '/vibes', label: 'Vibes', icon: '🔥', component: () => <Screen title="Vibes" />, nav: 'sidebar' },
  { path: '/tube', label: 'Tube', icon: '📺', component: () => <Screen title="Tube (YouTube Style)" />, nav: 'sidebar' },
  { path: '/vids', label: 'Vids', icon: '🎬', component: () => <Screen title="Vids (OnlyFans Style)" />, nav: 'sidebar' },
  { path: '/discover', label: 'Discover', icon: '🧭', component: () => <Screen title="Discover" />, nav: 'bottom' },
  
  // Battles & Live
  { path: '/battles', label: 'Battles', icon: '⚔️', component: BattleRooms, nav: 'sidebar' },
  { path: '/live-battles', label: 'Live Battles', icon: '⚡', component: () => <Screen title="Live Battles" />, nav: 'bottom' },
  { path: '/live', label: 'Live', icon: '📡', component: () => <Screen title="Live Streaming" />, nav: 'sidebar' },

  // Creation
  { path: '/create', label: 'Create', icon: '✨', component: () => <Screen title="Create" />, nav: 'bottom' },
  { path: '/upload', label: 'Upload', icon: '📹', component: () => <Screen title="Upload" />, nav: 'sidebar' },
  { path: '/sora-ai', label: 'Sora AI', icon: '🎬', component: () => <Screen title="Sora AI Generator" />, nav: 'sidebar' },
  { path: '/edit', label: 'Edit', icon: '✨', component: () => <Screen title="Video Editor" />, nav: 'sidebar' },

  // Communication
  { path: '/dms', label: 'DMs', icon: '💬', component: () => <Screen title="DMs (WhatsApp Style)" />, nav: 'bottom' },
  { path: '/calls', label: 'Calls', icon: '📞', component: () => <Screen title="Calls" />, nav: 'sidebar' },
  { path: '/chat', label: 'Chat', icon: '💬', component: () => <Screen title="Chat" />, nav: 'sidebar' },
  
  // Dating
  { path: '/match', label: 'Match', icon: '💕', component: () => <Screen title="Match" />, nav: 'sidebar' },
  { path: '/rizz', label: 'Rizz', icon: '💕', component: () => <Screen title="Rizz" />, nav: 'sidebar' },

  // AI Zone
  { path: '/ai-lab', label: 'AI Lab', icon: '🚀', component: () => <Screen title="AI Lab (Replit Style)" />, nav: 'sidebar' },
  { path: '/ai-chat', label: 'AI Chat', icon: '🤖', component: () => <Screen title="AI Chat" />, nav: 'sidebar' },
  { path: '/ai-tools', label: 'AI Tools', icon: '⚡', component: () => <Screen title="AI Tools" />, nav: 'sidebar' },

  // Monetization & Profile
  { path: '/profile', label: 'Profile', icon: '👤', component: () => <Screen title="Profile" />, nav: 'bottom' },
  { path: '/stats', label: 'Stats', icon: '📈', component: () => <Screen title="Stats" />, nav: 'sidebar' },
  { path: '/wallet', label: 'Wallet', icon: '💰', component: () => <Screen title="Wallet" />, nav: 'sidebar' },
  { path: '/coins', label: 'Coins', icon: '🪙', component: () => <Screen title="Coins" />, nav: 'sidebar' },
  { path: '/premium', label: 'Premium', icon: '⭐', component: () => <Screen title="Premium" />, nav: 'sidebar' },
  { path: '/models', label: 'Models', icon: '👑', component: () => <Screen title="Models" />, nav: 'sidebar' },
  { path: '/shop', label: 'Shop', icon: '🎁', component: () => <Screen title="Shop" />, nav: 'sidebar' },
  
  // System
  { path: '/settings', label: 'Settings', icon: '⚙️', component: () => <Screen title="Settings" />, nav: 'sidebar' },
  { path: '/logout', label: 'Logout', icon: '🚪', component: () => <Screen title="Logout" />, nav: 'sidebar' },
];

const BOTTOM_NAV_LINKS = ALL_ROUTES.filter(r => r.nav === 'bottom');
const SIDEBAR_LINKS = ALL_ROUTES.filter(r => r.nav === 'sidebar');

// --- 2. Bottom Navigation Component (TikTok Style) ---
const BottomNav: React.FC = () => {
  const location = useLocation();
  
  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '60px',
      backgroundColor: 'black',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      borderTop: '1px solid #333',
      zIndex: 900
    }}>
      {BOTTOM_NAV_LINKS.map(link => (
        <Link key={link.path} to={link.path} style={{
          color: location.pathname === link.path ? '#FF4500' : 'white',
          textDecoration: 'none',
          textAlign: 'center',
          fontSize: link.label === 'Create' ? '30px' : '12px',
          fontWeight: link.label === 'Create' ? 'bold' : 'normal',
          padding: '5px',
          borderRadius: link.label === 'Create' ? '5px' : '0',
          backgroundColor: link.label === 'Create' ? '#FF4500' : 'transparent',
          transition: 'color 0.2s',
        }}>
          {link.icon}
          <div style={{ fontSize: '10px', marginTop: '2px', color: link.label === 'Create' ? 'white' : 'inherit' }}>
            {link.label === 'Create' ? '' : link.label}
          </div>
        </Link>
      ))}
    </div>
  );
};

// --- 3. Sidebar Component ---
const Sidebar: React.FC<{ isOpen: boolean, toggleSidebar: () => void }> = ({ isOpen, toggleSidebar }) => (
  <div style={{
    position: 'fixed',
    top: 0,
    left: isOpen ? 0 : '-300px',
    width: '300px',
    height: '100%',
    backgroundColor: '#1e1e1e',
    color: 'white',
    padding: '20px',
    boxShadow: '2px 0 5px rgba(0,0,0,0.5)',
    transition: 'left 0.3s',
    zIndex: 1000,
    overflowY: 'auto'
  }}>
    <h2 style={{ borderBottom: '1px solid #333', paddingBottom: '10px' }}>PROFITHACK AI</h2>
    <div style={{ marginBottom: '20px', cursor: 'pointer' }} onClick={toggleSidebar}>
      <span style={{ marginRight: '5px' }}>👤</span> abajwebapora24@gmail.com
    </div>
    
    {/* Grouping logic for the sidebar links */}
    {['Core', 'Communication', 'Live & Battles', 'Dating', 'Creation', 'AI Zone', 'Monetization & Profile', 'System'].map(groupName => {
      const groupLinks = SIDEBAR_LINKS.filter(link => {
        if (groupName === 'Core') return ['/home', '/vibes', '/tube', '/vids'].includes(link.path);
        if (groupName === 'Communication') return ['/chat', '/calls'].includes(link.path);
        if (groupName === 'Live & Battles') return ['/live', '/battles'].includes(link.path);
        if (groupName === 'Dating') return ['/match', '/rizz'].includes(link.path);
        if (groupName === 'Creation') return ['/upload', '/sora-ai', '/edit'].includes(link.path);
        if (groupName === 'AI Zone') return ['/ai-lab', '/ai-chat', '/ai-tools'].includes(link.path);
        if (groupName === 'Monetization & Profile') return ['/stats', '/wallet', '/coins', '/premium', '/models', '/shop'].includes(link.path);
        if (groupName === 'System') return ['/settings', '/logout'].includes(link.path);
        return false;
      });

      if (groupLinks.length === 0) return null;

      return (
        <div key={groupName} style={{ marginBottom: '15px' }}>
          <h4 style={{ color: '#aaa', margin: '5px 0' }}>{groupName}</h4>
          {groupLinks.map(link => (
            <Link key={link.path} to={link.path} onClick={toggleSidebar} style={{ display: 'block', color: 'white', textDecoration: 'none', padding: '5px 0' }}>
              <span style={{ marginRight: '5px' }}>{link.icon}</span> {link.label}
            </Link>
          ))}
        </div>
      );
    })}
  </div>
);

// --- 4. Main App Shell Component ---
const AppShellFinal: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <Router>
      <div style={{ backgroundColor: '#000', minHeight: '100vh', color: 'white', position: 'relative' }}>
        
        {/* Top Bar with Sidebar Toggle (Only visible on non-feed screens) */}
        <div style={{ 
          padding: '10px', 
          borderBottom: '1px solid #333', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: 'black',
          zIndex: 950
        }}>
          <button onClick={toggleSidebar} style={{ background: 'none', border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer' }}>
            ☰
          </button>
          <h1 style={{ margin: 0, fontSize: '18px' }}>PROFITHACK AI</h1>
          <div style={{ width: '24px' }}></div> {/* Spacer */}
        </div>

        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        
        {/* Main Content Area */}
        <div style={{ paddingTop: '50px', paddingBottom: '60px' }}> {/* Space for fixed top/bottom bars */}
          <Routes>
            {/* Map all routes */}
            {ALL_ROUTES.map(route => (
              <Route key={route.path} path={route.path} element={<route.component />} />
            ))}
            
            {/* Default route */}
            <Route path="/" element={<Screen title="Welcome to PROFITHACK AI" />} />
          </Routes>
        </div>

        <BottomNav />
      </div>
    </Router>
  );
};

export default AppShellFinal;
