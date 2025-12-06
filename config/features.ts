export const COMING_SOON_FEATURES = {
  aiVideoGenerator: {
    id: "ai_video_generator",
    title: "🎬 AI Video Generator (Sora 2)",
    description: "Create viral TikTok-style videos from text in seconds using cutting-edge AI. No filming needed!",
    benefits: [
      "Generate 30-60s viral videos instantly",
      "Multiple styles: cinematic, anime, photorealistic",
      "Auto-optimize for TikTok, Instagram, YouTube",
      "Trending sounds & hashtags included"
    ],
    launchDate: "January 2026"
  },
  
  battleRooms: {
    id: "battle_rooms",
    title: "⚔️ Creator Battle Rooms",
    description: "Compete live with other creators! Fans vote, winners take all. The ultimate engagement booster.",
    benefits: [
      "1v1 and team battle modes",
      "Live voting & real-time rankings",
      "Winner gets 70% of battle pot",
      "Massive exposure to both audiences"
    ],
    launchDate: "December 2025"
  },

  loveConnection: {
    id: "love_connection",
    title: "💘 Love Connection Dating",
    description: "AI-powered dating for creators & fans. Video profiles, compatibility matching, verified badges.",
    benefits: [
      "87% AI compatibility matching accuracy",
      "Video profile introductions",
      "Verified creator/fan badges",
      "Swipe 5 free matches daily"
    ],
    launchDate: "February 2026"
  },

  creatorWallet: {
    id: "creator_wallet",
    title: "💰 Creator Wallet & Payouts",
    description: "Instant payouts, global payments, crypto support. Get paid YOUR way, anywhere in the world.",
    benefits: [
      "7+ payment methods (PayPal, Crypto, Square)",
      "Instant withdrawals (24-48 hours)",
      "55% creator / 45% platform split",
      "Works in 180+ countries"
    ],
    launchDate: "January 2026"
  },

  aiContentOrchestrator: {
    id: "ai_content_orchestrator",
    title: "🤖 AI Content Orchestrator",
    description: "Your AI assistant posts to ALL platforms automatically. TikTok, Instagram, YouTube, Twitter - all at once.",
    benefits: [
      "6 AI agents optimize your content",
      "Auto-post to 5+ platforms simultaneously",
      "Viral hook generation & trending analysis",
      "Best posting times auto-scheduled"
    ],
    launchDate: "January 2026"
  },

  premiumUsernames: {
    id: "premium_usernames",
    title: "👑 Premium Username Marketplace",
    description: "Buy, sell, trade premium @handles. Own @boss, @king, @rich and watch them appreciate in value!",
    benefits: [
      "Invest in rare @handles",
      "Trade on open marketplace",
      "Verified ownership NFTs",
      "Appreciating digital assets"
    ],
    launchDate: "March 2026"
  },

  expertMentors: {
    id: "expert_mentors",
    title: "🎓 26 AI Expert Mentors",
    description: "Learn from top creators earning $86K-$95K/month. Real strategies, proven results, AI-powered advice.",
    benefits: [
      "26 ultra-realistic AI experts",
      "Personalized growth strategies",
      "Content optimization secrets",
      "24/7 instant mentorship"
    ],
    launchDate: "Available Now! 🚀"
  },

  liveStreaming: {
    id: "live_streaming",
    title: "📹 Live Streaming & Private Shows",
    description: "Go live, earn tips, run private shows. Full OnlyFans-style streaming with payment enforcement.",
    benefits: [
      "HD live streaming (WebRTC)",
      "Tipping & virtual gifts during stream",
      "Private show scheduling",
      "Auto payment enforcement"
    ],
    launchDate: "January 2026"
  }
} as const;

export type FeatureId = keyof typeof COMING_SOON_FEATURES;
