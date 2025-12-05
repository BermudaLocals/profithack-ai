import { Link } from 'wouter';
import { Rocket, Zap, DollarSign, Code, Video, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Marketing() {
  return (
    <div className="min-h-screen bg-ph-bg text-ph-text font-sans antialiased">
      {/* Header / Navigation */}
      <header className="sticky top-0 z-50 bg-ph-bg/90 backdrop-blur-sm border-b border-ph-cyan/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link href="/">
              <a className="text-2xl font-extrabold tracking-wider text-ph-text">
                <span className="text-ph-magenta">PROFIT</span>
                <span className="text-ph-cyan">HACK</span> AI
              </a>
            </Link>
            
            {/* Navigation Links */}
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-ph-text-secondary hover:text-ph-cyan transition duration-300">
                Features
              </a>
              <a href="#ai-power" className="text-ph-text-secondary hover:text-ph-cyan transition duration-300">
                AI Power
              </a>
              <a href="#monetization" className="text-ph-text-secondary hover:text-ph-cyan transition duration-300">
                Monetization
              </a>
              <a href="#launch" className="text-ph-text-secondary hover:text-ph-cyan transition duration-300">
                Launch
              </a>
            </nav>
            
            {/* CTA Button */}
            <Button 
              asChild
              className="bg-ph-magenta text-ph-text font-bold hover:bg-ph-magenta/80 neon-glow-magenta"
              data-testid="button-launch-app"
            >
              <Link href="/">Launch App</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-extrabold leading-tight mb-6">
              <span className="block text-ph-text">
                The <span className="text-ph-magenta">TikTok Killer</span>
              </span>
              <span className="block text-ph-cyan">Built for Profit.</span>
            </h1>
            <p className="text-xl text-ph-text-secondary max-w-3xl mx-auto mb-10">
              ProfitHack AI is a production-ready, full-stack social platform with 11 microservices, 
              8 payment gateways, and a 55/45 revenue split that beats the competition.
            </p>
            <div className="flex justify-center space-x-6 flex-wrap gap-4">
              <Button 
                asChild
                size="lg"
                className="bg-ph-magenta text-ph-text text-lg font-bold hover:bg-ph-magenta/80 neon-glow-magenta"
                data-testid="button-start-earning"
              >
                <Link href="/signup">Start Earning Now</Link>
              </Button>
              <Button 
                asChild
                size="lg"
                variant="outline"
                className="border-ph-cyan text-ph-cyan text-lg font-bold hover:bg-ph-cyan/10 neon-glow-cyan"
                data-testid="button-explore-ai"
              >
                <a href="#ai-power">Explore AI Features</a>
              </Button>
            </div>
            
            {/* App Mockup Placeholder */}
            <div className="mt-20 relative">
              <div className="w-full max-w-4xl mx-auto aspect-video rounded-xl bg-gradient-to-br from-ph-magenta/20 to-ph-cyan/20 border border-ph-cyan/30 neon-glow-cyan flex items-center justify-center">
                <p className="text-2xl text-ph-text-secondary">App Preview</p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-ph-bg to-transparent pointer-events-none"></div>
            </div>
          </div>
        </section>

        {/* Feature Section 1: Core Platform */}
        <section id="features" className="py-24 bg-ph-bg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-5xl font-bold text-center mb-16">
              A <span className="text-ph-magenta">Superior</span> Social Core
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {/* Feature Card 1: Video Processing */}
              <div className="p-8 rounded-xl border border-ph-magenta/30 bg-ph-bg/50 hover:bg-ph-bg/70 transition duration-500">
                <Rocket className="w-12 h-12 text-ph-magenta mb-4" />
                <h3 className="text-2xl font-semibold mb-3 text-ph-text">
                  Enterprise Video Processing
                </h3>
                <p className="text-ph-text-secondary">
                  PostgreSQL-based job queue for reliable, ACID-compliant transcoding. 
                  HLS/DASH adaptive streaming and dynamic watermarking built-in.
                </p>
              </div>
              
              {/* Feature Card 2: Unique Engagement */}
              <div className="p-8 rounded-xl border border-ph-cyan/30 bg-ph-bg/50 hover:bg-ph-bg/70 transition duration-500">
                <Zap className="w-12 h-12 text-ph-cyan mb-4" />
                <h3 className="text-2xl font-semibold mb-3 text-ph-text">
                  Battle Rooms & Dating
                </h3>
                <p className="text-ph-text-secondary">
                  Go beyond simple video feeds. Engage users with 1v1 to 20-player Battle Rooms 
                  and an AI-matched Dating App with XAI compatibility scores.
                </p>
              </div>
              
              {/* Feature Card 3: Microservices */}
              <div className="p-8 rounded-xl border border-ph-magenta/30 bg-ph-bg/50 hover:bg-ph-bg/70 transition duration-500">
                <Shield className="w-12 h-12 text-ph-magenta mb-4" />
                <h3 className="text-2xl font-semibold mb-3 text-ph-text">
                  11 Running Microservices
                </h3>
                <p className="text-ph-text-secondary">
                  Built on a robust gRPC architecture (Feed, XAI, Monetization, Security, etc.) 
                  for 100x better performance and scalability than traditional monoliths.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Section 2: AI Power */}
        <section id="ai-power" className="py-24 bg-ph-bg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-5xl font-bold text-center mb-16">
              Unleash <span className="text-ph-cyan">True AI Power</span>
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Text Content */}
              <div>
                <h3 className="text-4xl font-bold mb-6 text-ph-text">
                  From Sora 2 to 200-Agent Orchestration
                </h3>
                <p className="text-xl text-ph-text-secondary mb-8">
                  The platform is ready to activate the most advanced AI features on the market, 
                  giving your creators an unfair advantage.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start space-x-3">
                    <span className="text-ph-magenta text-2xl font-bold">✓</span>
                    <p className="text-lg text-ph-text">
                      <strong>Sora 2 Video Generator:</strong> 60 agents are pre-configured to generate 
                      high-quality, viral content on demand (requires API key).
                    </p>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-ph-cyan text-2xl font-bold">✓</span>
                    <p className="text-lg text-ph-text">
                      <strong>200-Agent Orchestration:</strong> A dashboard to manage content creators, 
                      marketing bots, and SEO writers, posting every 15 seconds.
                    </p>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-ph-magenta text-2xl font-bold">✓</span>
                    <p className="text-lg text-ph-text">
                      <strong>Manus-Style Autonomy:</strong> The foundation is built for tool-calling, 
                      multi-step task execution, and web browsing AI.
                    </p>
                  </li>
                </ul>
              </div>
              
              {/* Code Mockup */}
              <div className="bg-gray-900 p-8 rounded-xl border border-ph-cyan/50 neon-glow-cyan">
                <pre className="text-sm text-ph-text-secondary overflow-x-auto">
                  <code>{`// server/services/agent-orchestrator.service.ts

const AGENT_COUNT = 200;
const SORA_AGENTS = 60;

// Agent types: Content Creator, SEO Writer, Marketing Bot
const agents = initializeAgents(AGENT_COUNT);

// Health check for Sora 2 connectivity
setInterval(() => {
  checkSoraConnectivity(SORA_AGENTS);
}, 5 * 60 * 1000);

// Start the autonomous execution loop
agents.forEach(agent => {
  agent.startTaskLoop();
});`}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Section 3: Monetization */}
        <section id="monetization" className="py-24 bg-ph-bg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-5xl font-bold mb-16">
              The <span className="text-ph-magenta">Creator-First</span> Economy
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Stat Card 1: Revenue Split */}
              <div className="p-6 rounded-xl border border-ph-magenta/30">
                <p className="text-5xl font-extrabold text-ph-magenta">55/45</p>
                <p className="text-lg text-ph-text-secondary mt-2">
                  Creator Revenue Split (Beats TikTok)
                </p>
              </div>
              
              {/* Stat Card 2: Payment Gateways */}
              <div className="p-6 rounded-xl border border-ph-cyan/30">
                <p className="text-5xl font-extrabold text-ph-cyan">8+</p>
                <p className="text-lg text-ph-text-secondary mt-2">
                  Global Payment Gateways (Crypto, PayPal, Stripe)
                </p>
              </div>
              
              {/* Stat Card 3: Monetization Types */}
              <div className="p-6 rounded-xl border border-ph-magenta/30">
                <p className="text-5xl font-extrabold text-ph-magenta">5</p>
                <p className="text-lg text-ph-text-secondary mt-2">
                  Monetization Streams (Gifts, Subs, Ads, Marketplace, Coins)
                </p>
              </div>
              
              {/* Stat Card 4: Video Count */}
              <div className="p-6 rounded-xl border border-ph-cyan/30">
                <p className="text-5xl font-extrabold text-ph-cyan">9,628+</p>
                <p className="text-lg text-ph-text-secondary mt-2">
                  Videos Seeded (Content-rich from Day 1)
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="launch" className="py-24 bg-ph-bg">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center p-10 rounded-xl border border-ph-magenta/50 neon-glow-magenta">
            <h2 className="text-4xl font-bold mb-4 text-ph-text">
              Ready to Launch the Future of Social?
            </h2>
            <p className="text-xl text-ph-text-secondary mb-8">
              Your platform is 85% complete. All that's left is to plug in the API keys 
              and secure the final approvals.
            </p>
            <Button 
              asChild
              size="lg"
              className="bg-ph-cyan text-ph-bg text-xl font-bold hover:bg-ph-cyan/80 neon-glow-cyan"
              data-testid="button-get-started"
            >
              <Link href="/signup">Get Started Today</Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-10 border-t border-ph-cyan/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-ph-text-secondary">
          <p>
            &copy; 2025 ProfitHack AI. All rights reserved. | Built with{' '}
            <span className="text-ph-magenta">AI</span> and{' '}
            <span className="text-ph-cyan">gRPC</span>.
          </p>
        </div>
      </footer>
    </div>
  );
}
