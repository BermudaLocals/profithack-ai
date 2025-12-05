/**
 * PROFITHACK AI - Main Landing Page
 * The TikTok Killer Built for Profit
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ProfitHackLanding() {
  return (
    <div className="min-h-screen bg-black text-white font-sans antialiased">
      {/* Header / Navigation */}
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-sm border-b border-cyan-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <a href="#" className="text-2xl font-extrabold tracking-wider">
              <span className="text-[#FF00FF]">PROFIT</span>
              <span className="text-[#00F2EA]">HACK</span> AI
            </a>

            {/* Navigation Links */}
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-400 hover:text-cyan-500 transition duration-300">
                Features
              </a>
              <a href="#ai-power" className="text-gray-400 hover:text-cyan-500 transition duration-300">
                AI Power
              </a>
              <a href="#monetization" className="text-gray-400 hover:text-cyan-500 transition duration-300">
                Monetization
              </a>
              <a href="#launch" className="text-gray-400 hover:text-cyan-500 transition duration-300">
                Launch
              </a>
            </nav>

            {/* CTA Buttons */}
            <div className="flex items-center gap-4">
              <Button
                onClick={() => window.location.href = '/login'}
                variant="ghost"
                className="hidden md:flex px-4 py-2 text-white hover:text-cyan-500"
                data-testid="button-login"
              >
                Log In
              </Button>
              <Button
                onClick={() => window.location.href = '/signup'}
                className="px-6 py-2 rounded-full bg-[#FF00FF] hover:bg-[#FF00FF]/80 text-white font-bold shadow-[0_0_15px_rgba(255,0,255,0.5)]"
                data-testid="button-signup"
              >
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-extrabold leading-tight mb-6">
              <span className="block text-white">
                The <span className="text-[#FF00FF]">TikTok Killer</span>
              </span>
              <span className="block text-[#00F2EA]">Built for Profit.</span>
            </h1>

            <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10">
              ProfitHack AI is a production-ready, full-stack social platform with 11 microservices, 8 payment
              gateways, and a 55/45 revenue split that beats the competition.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-6 mb-20">
              <Button
                onClick={() => window.location.href = '/signup'}
                className="px-10 py-6 rounded-lg bg-[#FF00FF] hover:bg-[#FF00FF]/80 text-white text-lg font-bold shadow-[0_0_20px_rgba(255,0,255,0.5)]"
                data-testid="button-start-earning"
              >
                Sign Up Free
              </Button>
              <Button
                onClick={() => window.location.href = '/login'}
                className="px-10 py-6 rounded-lg border-2 border-[#00F2EA] text-[#00F2EA] hover:bg-[#00F2EA]/10 text-lg font-bold shadow-[0_0_20px_rgba(0,242,234,0.3)]"
                data-testid="button-login-hero"
              >
                Log In
              </Button>
            </div>

            {/* App Mockup Placeholder */}
            <div className="mt-20 relative">
              <div className="w-full max-w-4xl mx-auto rounded-xl overflow-hidden shadow-2xl shadow-cyan-500/20 border border-cyan-500/30">
                <div className="aspect-video bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🚀</div>
                    <h3 className="text-2xl font-bold text-white mb-2">TikTok-Style Video Feed</h3>
                    <p className="text-gray-400">9:16 Full-Screen • Auto-Play • Gesture Navigation</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Section 1: Core Platform */}
        <section id="features" className="py-24 bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-5xl font-bold text-center mb-16">
              A <span className="text-[#FF00FF]">Superior</span> Social Core
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {/* Feature Card 1 */}
              <Card className="p-8 rounded-xl border border-[#FF00FF]/30 bg-black/50 hover:bg-black/70 transition duration-500">
                <CardContent className="p-0">
                  <div className="text-4xl mb-4">🚀</div>
                  <h3 className="text-2xl font-semibold mb-3">Enterprise Video Processing</h3>
                  <p className="text-gray-400">
                    PostgreSQL-based job queue for reliable, ACID-compliant transcoding. HLS/DASH adaptive streaming
                    and dynamic watermarking built-in.
                  </p>
                </CardContent>
              </Card>

              {/* Feature Card 2 */}
              <Card className="p-8 rounded-xl border border-[#00F2EA]/30 bg-black/50 hover:bg-black/70 transition duration-500">
                <CardContent className="p-0">
                  <div className="text-4xl mb-4">⚔️</div>
                  <h3 className="text-2xl font-semibold mb-3">Battle Rooms & Dating</h3>
                  <p className="text-gray-400">
                    Go beyond simple video feeds. Engage users with 1v1 to 20-player Battle Rooms and an AI-matched
                    Dating App with XAI compatibility scores.
                  </p>
                </CardContent>
              </Card>

              {/* Feature Card 3 */}
              <Card className="p-8 rounded-xl border border-[#FF00FF]/30 bg-black/50 hover:bg-black/70 transition duration-500">
                <CardContent className="p-0">
                  <div className="text-4xl mb-4">⚙️</div>
                  <h3 className="text-2xl font-semibold mb-3">11 Running Microservices</h3>
                  <p className="text-gray-400">
                    Built on a robust gRPC architecture (Feed, XAI, Monetization, Security, etc.) for 100x better
                    performance and scalability than traditional monoliths.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Feature Section 2: AI Power */}
        <section id="ai-power" className="py-24 bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-5xl font-bold text-center mb-16">
              Unleash <span className="text-[#00F2EA]">True AI Power</span>
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Text Content */}
              <div>
                <h3 className="text-4xl font-bold mb-6">From Sora 2 to 200-Agent Orchestration</h3>
                <p className="text-xl text-gray-400 mb-8">
                  The platform is ready to activate the most advanced AI features on the market, giving your creators
                  an unfair advantage.
                </p>

                <ul className="space-y-4">
                  <li className="flex items-start space-x-3">
                    <span className="text-[#FF00FF] text-2xl font-bold">✓</span>
                    <p className="text-lg">
                      <strong>Sora 2 Video Generator:</strong> 60 agents are pre-configured to generate high-quality,
                      viral content on demand.
                    </p>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-[#00F2EA] text-2xl font-bold">✓</span>
                    <p className="text-lg">
                      <strong>200-Agent Orchestration:</strong> A dashboard to manage content creators, marketing bots,
                      and SEO writers, posting every 15 seconds.
                    </p>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-[#FF00FF] text-2xl font-bold">✓</span>
                    <p className="text-lg">
                      <strong>Manus-Style Autonomy:</strong> The foundation is built for tool-calling, multi-step task
                      execution, and web browsing AI.
                    </p>
                  </li>
                </ul>
              </div>

              {/* Code Mockup */}
              <div className="bg-gray-900 p-8 rounded-xl border border-[#00F2EA]/50 shadow-[0_0_20px_rgba(0,242,234,0.2)]">
                <pre className="text-sm text-gray-300 overflow-x-auto">
                  <code>{`// server/services/agent-orchestrator.ts

const AGENT_COUNT = 200;
const SORA_AGENTS = 60;

// Agent types: Content Creator, 
// SEO Writer, Marketing Bot
const agents = initializeAgents(
  AGENT_COUNT
);

// Health check for Sora 2
setInterval(() => {
  checkSoraConnectivity(SORA_AGENTS);
}, 5 * 60 * 1000);

// Start autonomous execution loop
agents.forEach(agent => {
  agent.startTaskLoop();
});`}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Section 3: Monetization */}
        <section id="monetization" className="py-24 bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-5xl font-bold mb-16">
              The <span className="text-[#FF00FF]">Creator-First</span> Economy
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Stat Card 1 */}
              <Card className="p-6 rounded-xl border border-[#FF00FF]/30 bg-black/50">
                <CardContent className="p-0">
                  <p className="text-5xl font-extrabold text-[#FF00FF]">55/45</p>
                  <p className="text-lg text-gray-400 mt-2">Creator Revenue Split (Beats TikTok)</p>
                </CardContent>
              </Card>

              {/* Stat Card 2 */}
              <Card className="p-6 rounded-xl border border-[#00F2EA]/30 bg-black/50">
                <CardContent className="p-0">
                  <p className="text-5xl font-extrabold text-[#00F2EA]">8+</p>
                  <p className="text-lg text-gray-400 mt-2">Global Payment Gateways</p>
                </CardContent>
              </Card>

              {/* Stat Card 3 */}
              <Card className="p-6 rounded-xl border border-[#FF00FF]/30 bg-black/50">
                <CardContent className="p-0">
                  <p className="text-5xl font-extrabold text-[#FF00FF]">5</p>
                  <p className="text-lg text-gray-400 mt-2">Monetization Streams</p>
                </CardContent>
              </Card>

              {/* Stat Card 4 */}
              <Card className="p-6 rounded-xl border border-[#00F2EA]/30 bg-black/50">
                <CardContent className="p-0">
                  <p className="text-5xl font-extrabold text-[#00F2EA]">20,709+</p>
                  <p className="text-lg text-gray-400 mt-2">Videos Seeded</p>
                </CardContent>
              </Card>
            </div>

            {/* Monetization Details */}
            <div className="mt-16 max-w-4xl mx-auto">
              <Card className="p-8 rounded-xl border border-[#FF00FF]/30 bg-gradient-to-br from-purple-900/10 to-black">
                <CardContent className="p-0">
                  <h3 className="text-2xl font-bold mb-6">Multiple Revenue Streams</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
                    <div>
                      <div className="text-3xl mb-2">🎁</div>
                      <p className="text-sm text-gray-400">Virtual Gifts</p>
                    </div>
                    <div>
                      <div className="text-3xl mb-2">👑</div>
                      <p className="text-sm text-gray-400">Subscriptions</p>
                    </div>
                    <div>
                      <div className="text-3xl mb-2">📺</div>
                      <p className="text-sm text-gray-400">Ad Revenue</p>
                    </div>
                    <div>
                      <div className="text-3xl mb-2">🛒</div>
                      <p className="text-sm text-gray-400">Marketplace</p>
                    </div>
                    <div>
                      <div className="text-3xl mb-2">💰</div>
                      <p className="text-sm text-gray-400">Coins</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section id="launch" className="py-32 bg-gradient-to-b from-black via-purple-900/10 to-black">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-5xl sm:text-6xl font-bold mb-6">
              Ready to <span className="text-[#00F2EA]">Dominate</span> Social Media?
            </h2>
            <p className="text-xl text-gray-400 mb-10">
              Launch your TikTok killer today with 20,709+ videos, 11 microservices, and AI-powered monetization.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Button
                onClick={() => window.location.href = '/signup'}
                className="px-12 py-6 rounded-lg bg-gradient-to-r from-[#FF00FF] to-[#00F2EA] hover:opacity-90 text-white text-xl font-bold shadow-[0_0_30px_rgba(255,0,255,0.5)]"
                data-testid="button-signup-final"
              >
                Create Free Account →
              </Button>
              <Button
                onClick={() => window.location.href = '/pricing'}
                className="px-12 py-6 rounded-lg border-2 border-white/20 hover:bg-white/5 text-white text-xl font-bold"
                data-testid="button-view-pricing"
              >
                View Pricing
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="mt-16 flex flex-wrap justify-center gap-8 text-gray-500">
              <Badge variant="outline" className="px-4 py-2 text-sm border-gray-700">
                ✅ Production Ready
              </Badge>
              <Badge variant="outline" className="px-4 py-2 text-sm border-gray-700">
                ✅ 11 Microservices
              </Badge>
              <Badge variant="outline" className="px-4 py-2 text-sm border-gray-700">
                ✅ 8 Payment Gateways
              </Badge>
              <Badge variant="outline" className="px-4 py-2 text-sm border-gray-700">
                ✅ AI-Powered
              </Badge>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="/features" className="hover:text-cyan-500">
                    Features
                  </a>
                </li>
                <li>
                  <a href="/pricing" className="hover:text-cyan-500">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="/fyp" className="hover:text-cyan-500">
                    Video Feed
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="/about" className="hover:text-cyan-500">
                    About
                  </a>
                </li>
                <li>
                  <a href="/careers" className="hover:text-cyan-500">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="/blog" className="hover:text-cyan-500">
                    Blog
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="/api" className="hover:text-cyan-500">
                    API Docs
                  </a>
                </li>
                <li>
                  <a href="/help" className="hover:text-cyan-500">
                    Help Center
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="/privacy" className="hover:text-cyan-500">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="/terms" className="hover:text-cyan-500">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
            <p>© 2025 PROFITHACK AI. The TikTok Killer Built for Profit.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
