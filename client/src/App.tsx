import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Home, Search, PlusCircle, MessageCircle, User, Video, DollarSign, Heart, Code2, Wallet } from "lucide-react";
import Loading from "./components/Loading";
import { api } from "./lib/api";

interface BootstrapStatus {
  ready: boolean;
  pagesLoaded: boolean;
  componentsLoaded: boolean;
  progress: number;
  message: string;
}

interface UserProfile {
  id: number;
  username: string;
  email: string | null;
  profileImageUrl: string | null;
}

function App() {
  const [isBootstrapped, setIsBootstrapped] = useState<boolean>(false);
  const [MainApp, setMainApp] = useState<any>(null);

  const { data: bootstrapStatus, isLoading: checkingBootstrap } = useQuery<BootstrapStatus>({
    queryKey: ["/api/bootstrap-status"],
    queryFn: async () => {
      const res = await api.get("/api/bootstrap-status");
      return res.data;
    },
    refetchInterval: isBootstrapped ? false : 2000,
  });

  const { data: user } = useQuery<UserProfile | null>({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      try {
        const res = await api.get("/api/auth/user");
        return res.data;
      } catch {
        return null;
      }
    },
    enabled: isBootstrapped,
  });

  useEffect(() => {
    if (bootstrapStatus?.ready && bootstrapStatus?.pagesLoaded) {
      setIsBootstrapped(true);
      import("./pages/MainRouter")
        .then((mod) => setMainApp(() => mod.default))
        .catch(() => {
          console.log("Using fallback router");
          setMainApp(() => FallbackApp);
        });
    }
  }, [bootstrapStatus]);

  if (checkingBootstrap || !isBootstrapped) {
    return (
      <Loading
        progress={bootstrapStatus?.progress || 0}
        message={bootstrapStatus?.message || "Initializing..."}
      />
    );
  }

  if (MainApp) {
    return <MainApp user={user} />;
  }

  return <FallbackApp user={user} />;
}

function FallbackApp({ user }: { user: UserProfile | null }) {
  const features = [
    { title: "Video Feed", desc: "TikTok-style infinite scroll with 22K+ videos", Icon: Video },
    { title: "Messaging", desc: "WhatsApp-style real-time DMs and video calls", Icon: MessageCircle },
    { title: "Monetization", desc: "Virtual gifts, subscriptions, 8 payment gateways", Icon: DollarSign },
    { title: "AI Dating", desc: "Smart matching with compatibility scores", Icon: Heart },
    { title: "Code IDE", desc: "Monaco editor with multi-language support", Icon: Code2 },
    { title: "Creator Wallet", desc: "Track earnings, instant withdrawals", Icon: Wallet },
  ];

  const navItems = [
    { Icon: Home, label: "Home" },
    { Icon: Search, label: "Discover" },
    { Icon: PlusCircle, label: "Create" },
    { Icon: MessageCircle, label: "Messages" },
    { Icon: User, label: "Profile" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-pink-500/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
            ROFITHACK AI
          </h1>
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-white/80">{user.username}</span>
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            </div>
          ) : (
            <button
              className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg text-white font-medium hover:opacity-90 transition"
              onClick={() => (window.location.href = "/api/login")}
              data-testid="button-login"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      <main className="pt-20 pb-24">
        <section className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Create. Monetize.{" "}
            <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
              Dominate.
            </span>
          </h2>
          <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
            The ultimate creator monetization platform combining TikTok, OnlyFans, WhatsApp, and AI tools.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg text-white font-bold text-lg hover:scale-105 transition"
              data-testid="button-get-started"
            >
              Get Started Free
            </button>
            <button
              className="px-8 py-3 border border-white/30 rounded-lg text-white font-bold text-lg hover:bg-white/10 transition"
              data-testid="button-learn-more"
            >
              Learn More
            </button>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div
                key={i}
                className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-pink-500/50 transition"
                data-testid={`card-feature-${i}`}
              >
                <div className="mb-4 text-pink-400">
                  <feature.Icon className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-white/60">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-sm border-t border-white/10">
        <div className="max-w-md mx-auto flex justify-around py-3">
          {navItems.map((item, i) => (
            <button
              key={i}
              className="flex flex-col items-center gap-1 text-white/60 hover:text-pink-400 transition"
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              <item.Icon className="w-5 h-5" />
              <span className="text-xs">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

export default App;
