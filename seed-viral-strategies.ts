import { storage } from "./storage";

// 13 Billion-View Proven Viral Strategies
export async function seedViralStrategies() {
  console.log("🔥 Seeding 13 billion-view viral strategies...");
  
  const strategies = [
    {
      name: "3-6 Second Hook Mastery",
      category: "hook",
      description: "Master the first 3-6 seconds with emotion + curiosity gap. This is the #1 non-negotiable for virality.",
      keyPrinciples: [
        "Make audience feel an emotion IMMEDIATELY",
        "Create a curiosity gap - don't give payoff too early",
        "Aim for 90% retention in first 6 seconds = top 1% content",
        "Confused brain scrolls, curious brain stays"
      ],
      implementation: "Open with a visual or statement that sparks emotion (shock, intrigue, excitement) + poses a question that can only be answered by watching. Example: Show dramatic visual + text overlay hinting at outcome.",
      examples: [
        "Ribs cooking on car engine - Will it work? Is it safe?",
        "Giant pair of jeans challenge - Lost 45 pounds in 70 days without...",
        "Salmon in dishwasher - People have feelings they didn't know they had"
      ],
      avgRetentionBoost: "42.00",
      avgShareBoost: "28.00",
      successRate: "91.00",
      priority: 100
    },
    {
      name: "Reverse Engineering Content",
      category: "retention",
      description: "Design every video in REVERSE. Start with the exact comments you want, then work backwards. Called the 'Missy Elliott Method' - flip it and reverse it.",
      keyPrinciples: [
        "Know the exact outcome before creating",
        "Design comment section in reverse",
        "Start with payoff, then structure journey to it",
        "Build opening shot first, not topic"
      ],
      implementation: "Before filming: Write down exactly what comments you want (agree, disagree, 'share with sister', etc.). Then craft hook, middle, and payoff to generate those exact responses.",
      examples: [
        "Want 'This is so me' comments? Show relatable couple dynamic 10x'd",
        "Want shares to husbands? Create content wives identify with",
        "Want debates? Present contrasting viewpoint to expectations"
      ],
      avgRetentionBoost: "35.00",
      avgShareBoost: "67.00",
      successRate: "88.00",
      priority: 95
    },
    {
      name: "$5 Dark Post Testing",
      category: "testing",
      description: "Test 7-12 variations of every video with $5 each before posting. Check retention graph, find drop-off points, fix and retest until 50-60% retention.",
      keyPrinciples: [
        "Make 7-12 variations: different hooks, music, lengths, text overlays",
        "$5 per variation to 1000 US viewers",
        "Analyze retention line - find where 42% of people left",
        "Fix drop-offs, retest until retention graph is solid"
      ],
      implementation: "Run dark posts on Facebook or use trial reels. Analyze retention at 3sec, 6sec, 12sec, 20sec markers. Identify exact timestamp where people leave and fix that moment.",
      examples: [
        "Between 12-20 seconds lost 42% - was it a weird pan? Early payoff?",
        "Test with music vs without music",
        "Test different opening shots for same content"
      ],
      avgRetentionBoost: "58.00",
      avgShareBoost: "31.00",
      successRate: "94.00",
      priority: 90
    },
    {
      name: "Wide Hook Strategy",
      category: "hook",
      description: "Don't niche your hook too early. Speak to 90% of people first, then niche down as video progresses. Wider colander catches more fish.",
      keyPrinciples: [
        "First 6-12 seconds should appeal to EVERYONE",
        "Show don't tell - visual beats talking to avatar",
        "Niche down gradually through video",
        "Challenge format > talking head"
      ],
      implementation: "Instead of 'If you're a perimenopausal woman...', show someone in giant jeans with 'I challenged myself to lose 45 pounds in 70 days'. Much wider appeal, same end result.",
      examples: [
        "Bad: 'If you're struggling with menopause weight...'",
        "Good: Challenge format showing dramatic before/after visual",
        "Let algorithm find your niche FROM wider pool"
      ],
      avgRetentionBoost: "52.00",
      avgShareBoost: "44.00",
      successRate: "87.00",
      priority: 85
    },
    {
      name: "Emotion-Driven Sharing",
      category: "sharing",
      description: "People share videos that align with their beliefs or entertain them. Make people FEEL something specific and they'll share it.",
      keyPrinciples: [
        "Share ≠ just funny content",
        "Share = belief alignment OR aspiration OR entertainment",
        "Think: Why would my mom share this? My best friend?",
        "Shares > reposts (shares are private, reposts are public)"
      ],
      implementation: "Ask yourself: What emotion am I creating? Why would someone want their friend to feel this same emotion? Make it very clear what value/feeling they're sharing.",
      examples: [
        "Parrot videos to brother who likes parrots",
        "Inspirational content aligning with beliefs",
        "Relatable content that makes someone say 'This is SO you'"
      ],
      avgRetentionBoost: "18.00",
      avgShareBoost: "89.00",
      successRate: "92.00",
      priority: 98
    },
    {
      name: "Avoid Sensory Overload",
      category: "hook",
      description: "Keep it simple. Clear visual + strong text overlay. Confused brain scrolls, not too many elements competing for attention.",
      keyPrinciples: [
        "Max 2-3 elements: visual, text, audio",
        "Don't add: crazy voice + clown + controversial text + weird visual",
        "Clarity > complexity",
        "Let one thing lead, others support"
      ],
      implementation: "If you have interesting visual, add complementary text overlay that preframes belief. Don't add competing elements that confuse the viewer about where to look.",
      examples: [
        "Salmon in dishwasher = clear. Add clown + circle + crazy text = confused",
        "Simple dramatic visual + one powerful text overlay",
        "One clear curiosity gap, not five competing questions"
      ],
      avgRetentionBoost: "33.00",
      avgShareBoost: "22.00",
      successRate: "85.00",
      priority: 80
    },
    {
      name: "Watch Time Optimization",
      category: "retention",
      description: "Watch time is THE ranking factor. Keep curiosity alive, don't give payoff too early, maintain engagement every 3 seconds.",
      keyPrinciples: [
        "Algorithm ranks by who keeps viewers on platform longest",
        "Never give full answer in first 6-12 seconds",
        "Maintain curiosity gap through entire video",
        "Avoid early payoffs that let people leave satisfied"
      ],
      implementation: "Structure content so each 3-6 second block raises new micro-questions. Payoff comes at end, but journey is engaging throughout.",
      examples: [
        "Bad: 'Here's how to save on taxes' (payoff too early)",
        "Good: 'This weird tax trick...' keep revealing slowly",
        "Layer curiosity - answer one question, raise another"
      ],
      avgRetentionBoost: "61.00",
      avgShareBoost: "29.00",
      successRate: "90.00",
      priority: 93
    },
    {
      name: "Show Don't Tell",
      category: "retention",
      description: "Become a spectacle to look at. Don't just give advice - BE the embodiment of what you're teaching. Liver King doesn't talk about carnivore, he IS carnivore.",
      keyPrinciples: [
        "Living proof > talking head advice",
        "Visual demonstration > verbal explanation",
        "10x the relatable dynamic",
        "Shock value + controversy = can't look away"
      ],
      implementation: "Don't just give tips, demonstrate dramatically. Want a vacation? Put hot tub in living room. Want a dog? Turn apartment into barnyard. Make it visual and extreme.",
      examples: [
        "Liver King: Lives carnivore lifestyle dramatically vs just giving diet tips",
        "Couples content: 10x normal couple arguments into apartment transformations",
        "Create undeniable stack of proof you ARE what you're teaching"
      ],
      avgRetentionBoost: "71.00",
      avgShareBoost: "83.00",
      successRate: "89.00",
      priority: 88
    },
    {
      name: "Page Health Management",
      category: "testing",
      description: "50% of virality is page health. Test content on burner accounts or trial reels before posting to main. Never let your main page 'miss'.",
      keyPrinciples: [
        "Test variations on trial reels or burner accounts",
        "Get retention line through edits before main page",
        "Only post winners on main page",
        "Maintain page health by avoiding low-performing content"
      ],
      implementation: "Use trial reels (Instagram) or testing accounts to validate content. Check retention graph, pick best variation, THEN post on main account.",
      examples: [
        "Trial reel same content twice = 100M views each time (before recent change)",
        "Test 7 variations, post only the winner on main page",
        "Maintain high page health = algorithm trusts your content more"
      ],
      avgRetentionBoost: "39.00",
      avgShareBoost: "26.00",
      successRate: "96.00",
      priority: 82
    },
    {
      name: "Storytelling Over Education",
      category: "retention",
      description: "Be dynamic, show personality, tell stories. Don't just be aggressive coach giving advice. Show relationships, humor, depth.",
      keyPrinciples: [
        "Multi-dimensional humans > one-dimensional advice",
        "Mix content types: education + personality + relationships",
        "Storytelling > bullet point tips",
        "Turn dial up on awareness through better storytelling"
      ],
      implementation: "If you're fitness coach, don't just yell tips. Show your relationship, humor, behind-scenes. Make yourself more than your niche.",
      examples: [
        "Brian Mark: Added wife, humor, personality = $6M to $10M",
        "Changed ONE thing: better storytelling and awareness",
        "System already good, just needed more attention through storytelling"
      ],
      avgRetentionBoost: "47.00",
      avgShareBoost: "56.00",
      successRate: "84.00",
      priority: 78
    },
    {
      name: "Pattern Interrupt Hooks",
      category: "hook",
      description: "Say something that contradicts expectations. Press on sensibilities people don't know they have. Challenge conventional beliefs.",
      keyPrinciples: [
        "Contrast what everyone expects you to say",
        "Make people feel combative (if done right)",
        "Create 'wait what?' moment",
        "Challenge assumptions in your niche"
      ],
      implementation: "In real estate video about Key West, instead of expected advice, say the OPPOSITE. Create cognitive dissonance that keeps them watching.",
      examples: [
        "Expected: 'Best real estate in Key West is...'",
        "Pattern interrupt: 'Everyone's WRONG about Key West real estate...'",
        "Unexpected takes on familiar topics"
      ],
      avgRetentionBoost: "55.00",
      avgShareBoost: "41.00",
      successRate: "81.00",
      priority: 75
    },
    {
      name: "Multiple Variations Testing",
      category: "testing",
      description: "Never post just one version. Create 7-12 variations testing hooks, music, length, text overlays, opening shots. Test scientifically.",
      keyPrinciples: [
        "Systematic testing > gut feeling",
        "Change ONE variable per variation",
        "Track what works, double down on winners",
        "Data-driven iteration beats one-shot content"
      ],
      implementation: "Take same core content, create variations: different music track, different hook, different length, different text. Test each, find winner, iterate.",
      examples: [
        "Version A: upbeat music",
        "Version B: no music",
        "Version C: different hook but same content",
        "Winner gets posted, losers inform future content"
      ],
      avgRetentionBoost: "44.00",
      avgShareBoost: "34.00",
      successRate: "93.00",
      priority: 87
    },
    {
      name: "Retention Graph Analysis",
      category: "testing",
      description: "Study the retention graph like a scientist. Find exact timestamp where viewers leave, diagnose WHY, fix that specific moment.",
      keyPrinciples: [
        "Get to 50-60% retention all the way through",
        "Find drop-off points: 3s, 6s, 12s, 20s, 30s markers",
        "Diagnose: weird transition? early payoff? boring moment?",
        "Fix and retest until smooth retention curve"
      ],
      implementation: "After $5 dark post hits 1000 views, check retention line. If 42% leave at seconds 12-20, review that footage. What happened? Whip pan? Gave answer? Fix it.",
      examples: [
        "Seconds 12-20 lost 42%: identified weird camera movement, removed it",
        "Seconds 3-6 lost 60%: hook wasn't strong enough, rewrote it",
        "Iterative fixing until retention is smooth"
      ],
      avgRetentionBoost: "66.00",
      avgShareBoost: "27.00",
      successRate: "97.00",
      priority: 91
    }
  ];

  for (const strategy of strategies) {
    try {
      await storage.createViralStrategy(strategy);
    } catch (error: any) {
      if (error.message?.includes("duplicate")) {
        // Strategy already exists, skip
        continue;
      }
      console.error(`Failed to seed strategy ${strategy.name}:`, error);
    }
  }

  console.log("✅ Seeded 13 billion-view viral strategies");
}

// Hook Templates
export async function seedHookTemplates() {
  console.log("🎣 Seeding proven hook templates...");
  
  const hooks = [
    {
      name: "Curiosity Gap Classic",
      hookType: "curiosity_gap",
      formula: "{Shocking visual} + {Text: 'What happens next will...'} + {No payoff}",
      example: "Putting ribs on car engine + 'What happens next is crazy' + don't show if it works",
      emotionScore: 75,
      curiosityScore: 92,
      avgRetention6sec: "88.50",
      avgRetention30sec: "62.30",
      avgShareRate: "12.40"
    },
    {
      name: "Pattern Interrupt",
      hookType: "pattern_interrupt",
      formula: "{Expected statement} + {Complete opposite} + {Explain why}",
      example: "Everyone says X is good, but they're WRONG because...",
      emotionScore: 85,
      curiosityScore: 81,
      avgRetention6sec: "84.20",
      avgRetention30sec: "71.50",
      avgShareRate: "18.70"
    },
    {
      name: "Challenge Format",
      hookType: "open_loop",
      formula: "I challenged myself to {extreme goal} in {timeframe} without {expectation}",
      example: "I challenged myself to lose 45 pounds in 70 days without going to the gym",
      emotionScore: 78,
      curiosityScore: 89,
      avgRetention6sec: "91.30",
      avgRetention30sec: "68.90",
      avgShareRate: "15.60"
    },
    {
      name: "Belief Challenge",
      hookType: "challenge_belief",
      formula: "{Common belief} is keeping you {negative outcome}",
      example: "Talking to your core avatar is keeping you small and broke",
      emotionScore: 88,
      curiosityScore: 86,
      avgRetention6sec: "87.10",
      avgRetention30sec: "74.20",
      avgShareRate: "21.30"
    },
    {
      name: "Sensibility Press",
      hookType: "pattern_interrupt",
      formula: "{Do something} that makes people have feelings they didn't know they had",
      example: "Cooking salmon in a dishwasher",
      emotionScore: 82,
      curiosityScore: 94,
      avgRetention6sec: "93.70",
      avgRetention30sec: "65.40",
      avgShareRate: "16.80"
    }
  ];

  for (const hook of hooks) {
    try {
      await storage.createHookTemplate(hook);
    } catch (error: any) {
      if (error.message?.includes("duplicate")) {
        continue;
      }
      console.error(`Failed to seed hook template ${hook.name}:`, error);
    }
  }

  console.log("✅ Seeded 5 proven hook templates");
}
