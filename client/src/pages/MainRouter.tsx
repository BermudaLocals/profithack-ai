import { Home, Search, PlusCircle, MessageCircle, User, Video, Heart, Code2, Wallet, Radio, Settings, UserCircle } from "lucide-react";

interface MainRouterProps {
  user: {
    id: number;
    username: string;
    email: string | null;
    profileImageUrl: string | null;
  } | null;
}

export default function MainRouter({ user }: MainRouterProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-pink-500/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
            PROFITHACK AI
          </h1>
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-white/80">{user.username}</span>
              {user.profileImageUrl ? (
                <img
                  src={user.profileImageUrl}
                  alt={user.username}
                  className="w-8 h-8 rounded-full object-cover"
                  data-testid="img-user-avatar"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
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
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
            {[
              { title: "Video Feed", Icon: Video, href: "/fyp", desc: "TikTok-style videos" },
              { title: "Messages", Icon: MessageCircle, href: "/messages", desc: "Real-time chat" },
              { title: "AI Dating", Icon: Heart, href: "/love", desc: "Find connections" },
              { title: "Code IDE", Icon: Code2, href: "/ai-lab", desc: "Build with AI" },
              { title: "Creator Wallet", Icon: Wallet, href: "/wallet", desc: "Track earnings" },
              { title: "Live Streams", Icon: Radio, href: "/live", desc: "Go live" },
              { title: "Settings", Icon: Settings, href: "/settings", desc: "Preferences" },
              { title: "Profile", Icon: UserCircle, href: "/profile", desc: "Your page" },
            ].map((item, i) => (
              <a
                key={i}
                href={item.href}
                className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-pink-500/50 transition group"
                data-testid={`nav-card-${item.title.toLowerCase().replace(/\s/g, "-")}`}
              >
                <div className="mb-3 group-hover:scale-110 transition text-pink-400">
                  <item.Icon className="w-8 h-8 mx-auto" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{item.title}</h3>
                <p className="text-sm text-white/50">{item.desc}</p>
              </a>
            ))}
          </div>
        </section>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-sm border-t border-white/10">
        <div className="max-w-md mx-auto flex justify-around py-3">
          {[
            { Icon: Home, label: "Home", href: "/" },
            { Icon: Search, label: "Discover", href: "/discover" },
            { Icon: PlusCircle, label: "Create", href: "/upload" },
            { Icon: MessageCircle, label: "Messages", href: "/messages" },
            { Icon: User, label: "Profile", href: "/profile" },
          ].map((item, i) => (
            <a
              key={i}
              href={item.href}
              className="flex flex-col items-center gap-1 text-white/60 hover:text-pink-400 transition"
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              <item.Icon className="w-5 h-5" />
              <span className="text-xs">{item.label}</span>
            </a>
          ))}
        </div>
      </nav>
    </div>
  );
}
