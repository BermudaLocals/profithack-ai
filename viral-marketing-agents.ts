// ============================================
// VIRAL MARKETING AI AGENTS SYSTEM
// TikTok Algorithm Exploitation | Growth Hacking
// Heavy-Hitting Knowledge for Exponential Growth
// ============================================

import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ============================================
// 1. VIRAL HOOK GENERATOR AGENT
// Creates scroll-stopping hooks (first 3 seconds)
// ============================================

export async function generateViralHooks(topic: string, count: number = 5): Promise<any[]> {
  const prompt = `You are a TikTok viral hook expert. Your job is to create hooks that make people STOP scrolling within 0.5 seconds.

CRITICAL KNOWLEDGE:
1. **Pattern Interrupts** - Break the scrolling pattern with:
   - Unexpected statements ("This AI just made me $5,000...")
   - Shocking numbers ("1 AI tool replaced my $100K job...")
   - Controversy ("TikTok is hiding this from creators...")
   - Questions ("Would you quit your job for this?")

2. **Psychological Triggers**:
   - FOMO (Fear of Missing Out): "Only 24 hours left..."
   - Curiosity Gap: "Wait until the end..."
   - Status/Wealth: "$10K passive income..."
   - Scarcity: "Limited spots available..."

TASK: Generate ${count} viral hooks for "${topic}".
Each hook should:
- Be 5-15 words
- Include a specific number or statistic
- Create curiosity gap
- Be platform-native (TikTok/Instagram Reels style)

Format as JSON array:
[
  {
    "hook": "Hook text",
    "visual": "How to show this visually",
    "psychology": "Why it works",
    "expectedCTR": "Percentage"
  }
]`;

  const message = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0];
  if (content.type === "text") {
    try {
      const jsonMatch = content.text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error("Failed to parse hooks:", e);
    }
  }

  return [];
}

// ============================================
// 2. TRENDING TOPIC ANALYZER AGENT
// Finds trending topics and angles
// ============================================

export async function analyzeTrendingTopics(platform: string = "TikTok"): Promise<any[]> {
  const prompt = `You are a ${platform} trend analyst. Identify 10 trending topics this week and create angles for ProfitHack AI (AI video generation + daily engagement platform).

CRITICAL KNOWLEDGE:
1. **Current Mega-Trends**:
   - AI replacing jobs (anxiety + opportunity)
   - Passive income (everyone wants it)
   - Creator economy (growth mindset)
   - Side hustles (financial independence)
   - Automation (time freedom)

2. **Viral Angles for AI/Money Content**:
   - **The Skeptic**: "I didn't believe it until..."
   - **The Transformation**: "I went from $0 to $X..."
   - **The Hack**: "Here's how to get $X in 24 hours..."
   - **The Comparison**: "AI vs Human: Who wins?"
   - **The Tutorial**: "Step-by-step guide to $X..."

Format as JSON array:
[
  {
    "trend": "Trending topic",
    "angle": "How to connect ProfitHack AI",
    "hook": "Opening line",
    "hashtags": ["tag1", "tag2"],
    "expectedReach": "Estimated views"
  }
]`;

  const message = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 3000,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0];
  if (content.type === "text") {
    try {
      const jsonMatch = content.text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error("Failed to parse trends:", e);
    }
  }

  return [];
}

// ============================================
// 3. ENGAGEMENT MAXIMIZER AGENT
// Optimizes for watch time and completion rate
// ============================================

export async function generateEngagementScript(
  topic: string,
  duration: number = 60
): Promise<any> {
  const prompt = `You are a TikTok engagement expert. Create a ${duration}-second video script for "${topic}" that maximizes watch time and completion rate.

CRITICAL KNOWLEDGE:
1. **Watch Time Optimization**:
   - **Pacing**: Cut every 0.5-1 second (keeps attention)
   - **Pattern Breaks**: Change scene/angle every 3 seconds
   - **Retention Dips**: Add hook at 25%, 50%, 75% marks
   - **Ending**: Strong CTA in last 2 seconds

2. **Completion Rate Formula**:
   - Seconds 0-3: Hook (must be STRONG)
   - Seconds 3-15: Value (teach/show something)
   - Seconds 15-30: Proof (show results/testimonials)
   - Seconds 30-45: CTA (what to do next)
   - Seconds 45-60: Loop (can replay from start)

Format as JSON:
{
  "hook": { "timeRange": "0-3s", "script": "...", "visual": "..." },
  "value": { "timeRange": "3-15s", "script": "...", "visual": "..." },
  "proof": { "timeRange": "15-30s", "script": "...", "visual": "..." },
  "cta": { "timeRange": "30-45s", "script": "...", "visual": "..." },
  "retentionHooks": ["...", "..."],
  "expectedCompletionRate": "Percentage",
  "expectedEngagementRate": "Percentage"
}`;

  const message = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0];
  if (content.type === "text") {
    try {
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error("Failed to parse script:", e);
    }
  }

  return {};
}

// ============================================
// 4. VIRAL COEFFICIENT OPTIMIZER AGENT
// Maximizes sharing and word-of-mouth
// ============================================

export async function generateViralContent(topic: string, count: number = 5): Promise<any[]> {
  const prompt = `You are a viral growth expert. Create ${count} content ideas for "${topic}" with maximum viral coefficient (k-factor).

CRITICAL KNOWLEDGE:
1. **Viral Coefficient Formula**:
   k = (Shares × Conversion Rate) + (Comments × Engagement Rate)
   k > 1 = EXPONENTIAL GROWTH

2. **Share Triggers**:
   - **Relatability**: "Tag someone who needs this..."
   - **Status**: "Only X% of creators know this..."
   - **Help**: "Send this to your friend who..."
   - **Controversy**: "This will blow your mind..."

3. **Comment Triggers**:
   - **Questions**: "What would you do with $X?"
   - **Polls**: "AI or Human? Comment below..."
   - **Controversy**: "Agree or disagree?"

Format as JSON array:
[
  {
    "idea": "Content concept",
    "shareTrigger": "Why people share it",
    "commentTrigger": "Why people comment",
    "duetPotential": "How to make it interactive",
    "shareabilityScore": "1-50",
    "expectedViralCoefficient": "k-factor",
    "projections": {
      "day1": "views",
      "day3": "views",
      "day7": "views"
    }
  }
]`;

  const message = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 3000,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0];
  if (content.type === "text") {
    try {
      const jsonMatch = content.text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error("Failed to parse viral content:", e);
    }
  }

  return [];
}

// ============================================
// 5. AUDIENCE PSYCHOLOGY AGENT
// Understands what makes people act
// ============================================

export async function analyzeAudiencePsychology(segment: string): Promise<any> {
  const prompt = `You are a behavioral psychologist specializing in creator audiences. Analyze the "${segment}" segment.

CRITICAL KNOWLEDGE:
1. **Creator Audience Segments**:
   - **Aspiring Creators** (Age 18-25): Want growth hacks, viral secrets, quick wins
   - **Struggling Creators** (Age 25-35): Want passive income, automation, scaling
   - **Entrepreneurs** (Age 25-45): Want business tools, efficiency, ROI
   - **Students** (Age 18-22): Want side income, easy money, no experience needed

2. **Pain Points and Motivation Drivers** vary by segment.

3. **Trust Builders**:
   - **Social proof**: "10K creators use this..."
   - **Scarcity**: "Only 100 spots left..."
   - **Authority**: "Endorsed by [creator]..."

Format as JSON:
{
  "segment": "Audience type",
  "painPoint": "What hurts them",
  "motivation": "What drives them",
  "messaging": "How to speak to them",
  "objections": ["fear 1", "fear 2"],
  "trustBuilders": ["builder 1", "builder 2"],
  "expectedConversion": "Percentage"
}`;

  const message = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1500,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0];
  if (content.type === "text") {
    try {
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error("Failed to parse psychology:", e);
    }
  }

  return {};
}

// ============================================
// 6. POSTING SCHEDULE OPTIMIZER AGENT
// Finds optimal posting times
// ============================================

export async function generatePostingSchedule(platform: string = "TikTok"): Promise<any> {
  const prompt = `You are a ${platform} algorithm expert. Create optimal posting schedule for maximum reach.

CRITICAL KNOWLEDGE:
1. **Peak Activity Times**:
   - **Morning Peak**: 6am-9am (commute viewers)
   - **Lunch Peak**: 12pm-1pm (break time)
   - **Evening Peak**: 6pm-10pm (prime time)
   - **Night Peak**: 10pm-2am (late-night scrollers)

2. **Frequency Strategy**:
   - **Minimum**: 3 posts/week (stay relevant)
   - **Optimal**: 1 post/day (consistent growth)
   - **Maximum**: 3 posts/day (avoid algorithm suppression)

Format as JSON:
{
  "schedule": {
    "monday": ["time1", "time2"],
    "tuesday": ["time1", "time2"],
    "wednesday": ["time1", "time2"],
    "thursday": ["time1", "time2"],
    "friday": ["time1", "time2"],
    "saturday": ["time1"],
    "sunday": ["time1"]
  },
  "contentCalendar": [
    {
      "day": 1,
      "contentType": "type",
      "time": "time",
      "expectedReach": "views"
    }
  ],
  "reasoning": "Why this schedule works"
}`;

  const message = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0];
  if (content.type === "text") {
    try {
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error("Failed to parse schedule:", e);
    }
  }

  return {};
}

// ============================================
// ORCHESTRATOR - Combines All Agents
// ============================================

export async function generateViralStrategy(topic: string): Promise<any> {
  const [hooks, trends, script, viralIdeas, psychology, schedule] = await Promise.all([
    generateViralHooks(topic, 5),
    analyzeTrendingTopics("TikTok"),
    generateEngagementScript(topic, 60),
    generateViralContent(topic, 5),
    analyzeAudiencePsychology("Aspiring Creators"),
    generatePostingSchedule("TikTok"),
  ]);

  return {
    topic,
    hooks,
    trends,
    script,
    viralIdeas,
    psychology,
    schedule,
    generatedAt: new Date().toISOString(),
  };
}
