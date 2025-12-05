import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const hooks = [
  {
    main: "Your phone = Your business. Start now.",
    sub: "Direct, mobile-first income",
  },
  {
    main: "Make $500 while you sleep. Literally.",
    sub: "Passive income from subs + bots",
  },
  {
    main: "OnlyFans + TikTok + AI coding. One platform.",
    sub: "Everything you need in one place",
  },
  {
    main: "Up to 50% of ad revenue goes to YOU. Not 0%.",
    sub: "Better than TikTok, Instagram, YouTube",
  },
  {
    main: "Build apps. Post videos. Get paid. Repeat.",
    sub: "The complete creator economy loop",
  },
  {
    main: "Invite-only. For a reason.",
    sub: "Exclusive access for serious creators",
  },
  {
    main: "Why creators are leaving TikTok for this",
    sub: "Join the migration",
  },
  {
    main: "The platform TikTok doesn't want you to know about",
    sub: "Rebel with profit",
  },
  {
    main: "Code editor + live streaming + premium subs. All built-in.",
    sub: "No other platform does this",
  },
  {
    main: "Your AI influencer works 24/7. You don't have to.",
    sub: "Automation that actually makes money",
  },
  {
    main: "5 income streams. 1 platform. Zero limits.",
    sub: "Ads, Sparks, subs, marketplace, bots",
  },
  {
    main: "Bermuda-based. Crypto-friendly. Globally paid.",
    sub: "Get paid anywhere in the world",
  },
  {
    main: "TikTok keeps your money. We don't.",
    sub: "You keep what you earn",
  },
  {
    main: "Stop posting for likes. Start posting for dollars.",
    sub: "Real money. Real fast.",
  },
  {
    main: "Your followers = Your paycheck. Finally.",
    sub: "Monetize every single one",
  },
  {
    main: "Why work 9-5 when your content works 24/7?",
    sub: "Passive income unlocked",
  },
  {
    main: "They said 'get a real job.' You said 'watch this.'",
    sub: "Prove them wrong with profit",
  },
  {
    main: "Code + Create + Cash Out. It's that simple.",
    sub: "The trinity of modern wealth",
  },
  {
    main: "Stop making OTHER platforms rich. Start here.",
    sub: "Keep what you earn",
  },
  {
    main: "No ads = no money. We flip that script.",
    sub: "You get paid for ad views",
  },
  {
    main: "100 bots working for YOU while you sleep.",
    sub: "Scale without burnout",
  },
  {
    main: "From bedroom to boardroom. One platform.",
    sub: "Build your empire here",
  },
  {
    main: "They gatekeep. We invite. Join the movement.",
    sub: "Exclusive but growing fast",
  },
  {
    main: "Content that converts followers into customers.",
    sub: "Real monetization tools",
  },
  {
    main: "Why rent when you can OWN your audience?",
    sub: "Direct subscriber relationships",
  },
];

export function RotatingHooks() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % hooks.length);
    }, 4000); // Change every 4 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-[140px] md:min-h-[200px] flex items-center justify-center px-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-2 md:space-y-4"
        >
          <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight text-outlined-thick">
            {hooks[currentIndex].main}
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white text-outlined-thin">
            {hooks[currentIndex].sub}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Progress Dots */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {hooks.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex
                ? "w-8 bg-gradient-to-r from-pink-500 to-purple-600"
                : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
            }`}
            data-testid={`hook-dot-${index}`}
            aria-label={`Go to hook ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
