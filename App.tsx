import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BottomNav } from "@/components/bottom-nav";
import { TopNav } from "@/components/TopNav";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import LandingPage from "@/pages/landing-page";
import Marketing from "@/pages/marketing";
import LoginPage from "@/pages/login";
import TermsPage from "@/pages/terms-page";
import PrivacyPage from "@/pages/privacy-page";
import RefundPage from "@/pages/refund-page";
import Home from "@/pages/home";
import Workspace from "@/pages/workspace-advanced";
import Videos from "@/pages/videos";
import WalletPage from "@/pages/wallet";
import CoinsPage from "@/pages/coins";
import Messages from "@/pages/messages";
import BlockedUsers from "@/pages/blocked-users";
import Admin from "@/pages/admin";
import InfluencersPage from "@/pages/influencers";
import InfluencerCreator from "@/pages/influencer-creator";
import Invites from "@/pages/invites";
import InviteGate from "@/pages/invite-gate";
import Reels from "@/pages/reels";
import Tube from "@/pages/tube";
import Marketplace from "@/pages/template-marketplace";
import DigitalMarketplace from "@/pages/digital-marketplace";
import Calls from "@/pages/calls";
import LiveStream from "@/pages/live-stream";
import Onboarding from "@/pages/onboarding";
import ProfileSetup from "@/pages/profile-setup";
import Premium from "@/pages/premium";
import PremiumModels from "@/pages/premium-models";
import Discord from "@/pages/discord";
import PhoneAuth from "@/pages/phone-auth";
import UploadPage from "@/pages/upload";
import CameraPage from "@/pages/camera";
import BotsPage from "@/pages/bots";
import Settings from "@/pages/settings";
import Stats from "@/pages/stats";
import EmailVerify from "@/pages/email-verify";
import SimpleSignup from "@/pages/simple-signup";
import VerifyEmail from "@/pages/verify-email";
import EmailPasswordLogin from "@/pages/email-password-login";
import AdminBypass from "@/pages/admin-bypass";
import SocialMediaSettings from "@/pages/social-media-settings";
import ViralDashboard from "@/pages/viral-dashboard";
import VideoGenerator from "@/pages/video-generator";
import CreatorStudioPro from "@/pages/creator-studio-pro";
import AdminDashboard from "@/pages/admin-dashboard";
import SocialCredentials from "@/pages/social-credentials";
import CRMSettings from "@/pages/crm-settings";
import PrivacyPolicy from "@/pages/privacy-policy";
import TermsOfService from "@/pages/terms-of-service";
import ForgotPassword from "@/pages/forgot-password";
import EditProfile from "@/pages/edit-profile";
import FeaturesPage from "@/pages/features";
import HowItWorksPage from "@/pages/how-it-works";
import AboutPage from "@/pages/about";
import CareersPage from "@/pages/careers";
import ApiDocsPage from "@/pages/api-docs";
import BlogPage from "@/pages/blog";
import AITools from "@/pages/ai-tools";
import AIWorkspace from "@/pages/ai-workspace";
import DownloadAnalysisPage from "@/pages/download-analysis";
import TrendingNews from "@/pages/trending-news";
import SettingsPrivacy from "@/pages/settings-privacy";
import MarketingAutomationDashboard from "@/pages/marketing-automation-dashboard";
import MarketingBlitz from "@/pages/marketing-blitz";
import AgentDashboard from "@/pages/agent-dashboard";
import FeedPage from "@/pages/feed";
import CheckoutPage from "@/pages/checkout";
import DiagnosticPage from "@/pages/diagnostic";
import SimpleFeed from "@/pages/feed-simple";
import BattlesPage from "@/pages/battles";
import BattleRoomPage from "@/pages/battle-room";
import UploadVideoPage from "@/pages/upload-video";
import LiveBattlesPage from "@/pages/live-battles";
import TransferPage from "@/pages/transfer";
import LoveConnection from "@/pages/love-connection";
import SoraGenerator from "@/pages/sora-generator";
import CreatorStudio from "@/pages/CreatorStudio";
import DatingSwipe from "@/pages/DatingSwipe";
import ToolsDirectory from "@/pages/tools-directory";
import PDFGenerator from "@/pages/pdf-generator";
import AIHub from "@/pages/ai-hub";
import SearchPage from "@/pages/search";
import WhatsAppMessages from "@/pages/messages-whatsapp";
import InstagramFeed from "@/pages/instagram-feed";
import YouTubeTube from "@/pages/youtube-tube";
import DiscordCommunities from "@/pages/discord-communities";
import InboxPage from "@/pages/inbox";
import AIClonerPage from "@/pages/ai-cloner";
import HomeLauncher from "@/pages/home-launcher";
import WhatsAppPage from "@/pages/whatsapp";
import InstagramPage from "@/pages/instagram";
import YouTubePage from "@/pages/youtube";
import SnapchatPage from "@/pages/snapchat";
import DiscordPage from "@/pages/discord";
import DownloadsPage from "@/pages/downloads";
import OnlyFansPage from "@/pages/onlyfans";
import LiveHostsPage from "@/pages/live-hosts";
import LuxuryLanding from "@/pages/luxury-landing";
import DailyNexus from "@/pages/daily-nexus";
import CRMDashboard from "@/pages/crm-dashboard";
import ComingSoonDemo from "@/pages/coming-soon-demo";
import PricingPage from "@/pages/pricing";
import CharityPage from "@/pages/charity";
import ProfilePage from "@/pages/profile";
import Elite2026Deployment from "@/pages/elite2026-deployment";
import FeaturesHub from "@/pages/features-hub";
import BattleRooms from "@/pages/battle-rooms";
import Dating from "@/pages/dating";
import CreatorStudioNew from "@/pages/creator-studio";
import UsernameMarketplace from "@/pages/username-marketplace";
import Gifts from "@/pages/gifts";
import ProfitHackLanding from "@/pages/profithack-landing";
import CreatorFeed from "@/pages/creator-feed";
import CreatorProfile from "@/pages/creator-profile";
import CreatorWallet from "@/pages/creator-wallet";
import CreatorMessages from "@/pages/creator-messages";
import CreatorAuth from "@/pages/creator-auth";
import CreatorUpload from "@/pages/creator-upload";
import AIDating from "@/pages/ai-dating";
import AIChat from "@/pages/ai-chat";
import { FTUETour } from "@/components/FTUETour";
import { SupportBot } from "@/components/support-bot";
import { SplashScreen } from "@/components/SplashScreen";
import { BetaBanner } from "@/components/BetaBanner";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";
import { CluelyAssistant, CluelyTriggerButton } from "@/components/cluely-assistant";
import { useState } from "react";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show app immediately - auth loads in background
  // (isLoading is now very fast and won't block)

  return (
    <Switch>
      {/* Splash Screen - First Launch */}
      <Route path="/splash" component={SplashScreen} />
      
      {/* Public Routes - Always Accessible */}
      <Route path="/downloads" component={DownloadsPage} />
      <Route path="/luxury" component={LuxuryLanding} />
      <Route path="/landing" component={LandingPage} />
      <Route path="/marketing" component={Marketing} />
      <Route path="/terms" component={TermsPage} />
      <Route path="/privacy" component={PrivacyPage} />
      <Route path="/refund" component={RefundPage} />
      <Route path="/features-hub" component={FeaturesHub} />
      <Route path="/features" component={FeaturesHub} />
      <Route path="/how-it-works" component={HowItWorksPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/careers" component={CareersPage} />
      <Route path="/api" component={ApiDocsPage} />
      <Route path="/blog" component={BlogPage} />
      <Route path="/trending" component={TrendingNews} />
      <Route path="/news" component={TrendingNews} />
      <Route path="/download-analysis" component={DownloadAnalysisPage} />
      <Route path="/invite" component={InviteGate} />
      <Route path="/admin-bypass" component={AdminBypass} />
      <Route path="/login" component={LoginPage} />
      <Route path="/email-login" component={EmailPasswordLogin} />
      <Route path="/signup" component={SimpleSignup} />
      <Route path="/auth" component={CreatorAuth} />
      <Route path="/creator-auth" component={CreatorAuth} />
      <Route path="/verify-email" component={VerifyEmail} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/profile-setup" component={ProfileSetup} />
      <Route path="/auth/phone" component={PhoneAuth} />
      
      {/* DIAGNOSTIC TEST PAGE */}
      <Route path="/test" component={DiagnosticPage} />
      <Route path="/diagnostic" component={DiagnosticPage} />
      <Route path="/simple" component={SimpleFeed} />
      
      {/* MAIN LANDING PAGE - PROFITHACK AI */}
      <Route path="/" component={ProfitHackLanding} />
      
      {/* VIDEO FEED - TikTok-Style */}
      <Route path="/feed" component={CreatorFeed} />
      <Route path="/fyp" component={CreatorFeed} />
      <Route path="/creator-feed" component={CreatorFeed} />
      
      {/* ONLYFANS - Payment-Gated Premium Content */}
      <Route path="/onlyfans" component={OnlyFansPage} />
      <Route path="/elite2026" component={Elite2026Deployment} />
      <Route path="/models" component={PremiumModels} />
      
      {/* LIVE HOSTS - Grid view of all live streams */}
      <Route path="/live-hosts" component={LiveHostsPage} />
      
      {/* DAILY NEXUS - TikTok-Beating Daily Engagement System */}
      <Route path="/daily-nexus" component={DailyNexus} />
      
      {/* ENTERPRISE CRM - Viral Marketing & Multi-Platform Content */}
      <Route path="/crm" component={CRMDashboard} />
      
      {/* COMING SOON DEMO - Feature Showcase */}
      <Route path="/coming-soon" component={ComingSoonDemo} />
      
      {/* PRICING PAGE - Clear Free vs Paid Tiers */}
      <Route path="/pricing" component={PricingPage} />
      
      {/* CHARITY PAGE - Helping Families Escape Poverty */}
      <Route path="/charity" component={CharityPage} />
      
      {isAuthenticated && (
        <>
          <Route path="/home-launcher" component={HomeLauncher} />
          <Route path="/stats" component={Stats} />
          <Route path="/home" component={Home} />
          <Route path="/workspace" component={Workspace} />
          <Route path="/ai-workspace" component={AIWorkspace} />
          <Route path="/ai-chat" component={AIWorkspace} />
          <Route path="/videos" component={Videos} />
          <Route path="/clickflo" component={Reels} />
          <Route path="/tube" component={Tube} />
          <Route path="/wallet" component={CreatorWallet} />
          <Route path="/credits" component={CreatorWallet} />
          <Route path="/coins" component={CoinsPage} />
          <Route path="/checkout" component={CheckoutPage} />
          
          {/* NEW FEATURES */}
          <Route path="/battle-rooms" component={BattleRooms} />
          <Route path="/battles" component={BattlesPage} />
          <Route path="/battle/:id" component={BattleRoomPage} />
          <Route path="/upload-video" component={UploadVideoPage} />
          <Route path="/live-battles" component={LiveBattlesPage} />
          <Route path="/love" component={LoveConnection} />
          <Route path="/dating" component={AIDating} />
          <Route path="/ai-dating" component={AIDating} />
          <Route path="/love-match" component={AIDating} />
          <Route path="/rizz" component={AIDating} />
          <Route path="/ai-chat" component={AIChat} />
          <Route path="/ai-assistant" component={AIChat} />
          <Route path="/sora" component={SoraGenerator} />
          <Route path="/creator-studio" component={CreatorStudioNew} />
          <Route path="/studio" component={CreatorStudioNew} />
          <Route path="/gifts" component={Gifts} />
          <Route path="/username-marketplace" component={UsernameMarketplace} />
          <Route path="/usernames" component={UsernameMarketplace} />
          <Route path="/messages" component={CreatorMessages} />
          <Route path="/messages/:recipientId" component={CreatorMessages} />
          <Route path="/messages-whatsapp" component={WhatsAppMessages} />
          <Route path="/blocked-users" component={BlockedUsers} />
          <Route path="/marketplace" component={Marketplace} />
          <Route path="/shop" component={DigitalMarketplace} />
          <Route path="/calls" component={Calls} />
          <Route path="/live">
            {() => <LiveStream />}
          </Route>
          <Route path="/invites" component={Invites} />
          <Route path="/ai-tools" component={AITools} />
          <Route path="/ai-hub" component={AIHub} />
          <Route path="/ai-cloner" component={AIClonerPage} />
          <Route path="/search" component={SearchPage} />
          <Route path="/inbox" component={InboxPage} />
          <Route path="/notifications" component={InboxPage} />
          <Route path="/whatsapp" component={WhatsAppPage} />
          <Route path="/instagram" component={InstagramPage} />
          <Route path="/youtube" component={YouTubePage} />
          <Route path="/tube" component={YouTubePage} />
          <Route path="/snapchat" component={SnapchatPage} />
          <Route path="/discord" component={DiscordPage} />
          <Route path="/communities" component={DiscordPage} />
          <Route path="/friends" component={FeedPage} />
          <Route path="/profile/:username" component={ProfilePage} />
          <Route path="/profile" component={EditProfile} />
          <Route path="/explore" component={SearchPage} />
          <Route path="/sora-generator" component={SoraGenerator} />
          <Route path="/video-generator" component={VideoGenerator} />
          <Route path="/creator-studio-pro" component={CreatorStudioPro} />
          <Route path="/admin" component={Admin} />
          <Route path="/admin-dashboard" component={AdminDashboard} />
          <Route path="/influencers" component={InfluencersPage} />
          <Route path="/influencers/create" component={InfluencerCreator} />
          <Route path="/premium" component={Premium} />
          <Route path="/premium-models" component={PremiumModels} />
          <Route path="/discord" component={Discord} />
          <Route path="/upload" component={CreatorUpload} />
          <Route path="/creator-upload" component={CreatorUpload} />
          <Route path="/camera" component={CameraPage} />
          <Route path="/bots" component={BotsPage} />
          <Route path="/settings" component={Settings} />
          <Route path="/settings/privacy" component={SettingsPrivacy} />
          <Route path="/edit-profile" component={EditProfile} />
          <Route path="/social-media" component={SocialMediaSettings} />
          <Route path="/social-credentials" component={SocialCredentials} />
          <Route path="/crm-settings" component={CRMSettings} />
          <Route path="/privacy" component={PrivacyPolicy} />
          <Route path="/terms" component={TermsOfService} />
          <Route path="/viral" component={ViralDashboard} />
          <Route path="/create" component={VideoGenerator} />
          <Route path="/marketing-automation" component={MarketingAutomationDashboard} />
          <Route path="/marketing-blitz" component={MarketingBlitz} />
          <Route path="/agents" component={AgentDashboard} />
          <Route path="/transfer" component={TransferPage} />
          <Route path="/tools" component={ToolsDirectory} />
          <Route path="/pdf-generator" component={PDFGenerator} />
          <Route path="/pdf" component={PDFGenerator} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function AuthenticatedLayout() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();

  // PUBLIC ROUTES - No auth required, no nav bar
  const publicRoutes = [
    '/',
    '/landing',
    '/marketing',
    '/login',
    '/email-login',
    '/signup',
    '/verify-email',
    '/forgot-password',
    '/terms',
    '/privacy',
    '/refund',
    '/features',
    '/features-hub',
    '/how-it-works',
    '/about',
    '/careers',
    '/api',
    '/blog',
    '/pricing',
    '/downloads',
    '/luxury',
    '/invite',
  ];

  const isPublicRoute = publicRoutes.includes(location);

  // If on public route, show content WITHOUT nav bars
  if (isPublicRoute) {
    return (
      <div className="flex flex-col h-screen w-full overflow-hidden bg-black">
        <div className="flex-1 overflow-y-auto">
          <Router />
        </div>
      </div>
    );
  }

  // AUTHENTICATED ROUTES - Require login, show nav bars
  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-white text-sm">Loading...</span>
        </div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated (except for public routes)
  if (!isAuthenticated) {
    window.location.href = '/login';
    return null;
  }

  // Redirect to onboarding if user needs to complete 18+ age verification
  if ((user as any)?.needsOnboarding && window.location.pathname !== '/onboarding') {
    window.location.href = '/onboarding';
    return null;
  }

  // Full-screen routes (TikTok-style) - hide top/bottom nav for immersive experience
  // NOTE: TikTok ALWAYS shows bottom nav, so only hide for live streams
  const isFullScreenRoute = ['/live'].includes(location);

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-black">
      {!isFullScreenRoute && <TopNav />}
      <div className={cn(
        "flex-1 overflow-y-auto",
        !isFullScreenRoute && "mt-16"
      )}>
        <Router />
      </div>
      {!isFullScreenRoute && <BottomNav />}
      <FTUETour />
      <SupportBot />
      <PWAInstallPrompt />
    </div>
  );
}

function App() {
  const [cluelyOpen, setCluelyOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthenticatedLayout />
        <Toaster />
        {/* Cluely AI Assistant - Global overlay available everywhere */}
        <CluelyAssistant isOpen={cluelyOpen} onClose={() => setCluelyOpen(false)} />
        {!cluelyOpen && <CluelyTriggerButton onClick={() => setCluelyOpen(true)} />}
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
