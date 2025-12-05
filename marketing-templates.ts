// Pre-built Marketing Campaign Templates Based on Proven Strategies

export interface CampaignTemplate {
  id: string;
  name: string;
  description: string;
  targetAudience: string[];
  painPoints: string[];
  platforms: string[];
  messageTemplates: {
    style: string;
    templates: string[];
  }[];
  contentStyles: string[];
}

// Pain Points that Convert
export const TARGET_PAIN_POINTS = {
  financial: [
    "Broke and need money fast",
    "Want to earn extra income",
    "Tired of working 9-5 for someone else",
    "Need $500-$2000 this month",
    "Want financial freedom",
    "Can't afford bills",
  ],
  business: [
    "Business not making enough money",
    "Need more customers fast",
    "Social media not working",
    "Don't have time for marketing",
    "Can't afford expensive marketing",
    "Website not getting traffic",
  ],
  creator: [
    "Not monetizing content",
    "Low follower engagement",
    "Need more subscribers",
    "Want to quit day job",
    "Content not going viral",
    "Not making money from followers",
  ],
};

// Content Styles (from your images)
export const CONTENT_STYLES = {
  lightbulb: {
    name: "Lightbulb Moment",
    description: "Content that teaches your audience something new",
    prompt: "Create educational content that gives an 'aha!' moment",
  },
  trending: {
    name: "Trending Content",
    description: "What the world is talking about",
    prompt: "Create content about current trending topics in [industry]",
  },
  curiosity: {
    name: "Curiosity Driven Q&A",
    description: "Answer questions people are dying to know",
    prompt: "Answer the most common questions in [industry] that drive curiosity",
  },
  contrarian: {
    name: "Contrarian Content",
    description: "Doesn't follow the popular opinion",
    prompt: "Create contrarian content that challenges industry beliefs",
  },
};

// Instant Win Method Templates
export const INSTANT_WIN_TEMPLATES: CampaignTemplate[] = [
  {
    id: "instant-win-basic",
    name: "Instant Win Method - Basic Setup",
    description: "Get clients fast with simple AI fixes (10 mins or less)",
    targetAudience: ["small_business_owners", "local_businesses", "entrepreneurs"],
    painPoints: TARGET_PAIN_POINTS.business,
    platforms: ["facebook", "instagram", "whatsapp"],
    messageTemplates: [
      {
        style: "value_first",
        templates: [
          "Hey {name}! 👋 I noticed {issue} on your {platform} - made you a quick fix using AI. Want me to post it for you?",
          "Hi {name}! Found a gap in your {service_type} - created an AI solution in 10 minutes. Can I show you?",
          "Hey! I saw your {business_type} and made a quick improvement using AI. No selling - just value. Interested?",
        ],
      },
      {
        style: "instant_win",
        templates: [
          "🔥 Instant Win: Fixed {issue} for your business in under 10 minutes using AI. The value speaks for itself - want to see?",
          "Made you a {solution_type} using AI that would normally take hours. Can you just do it for me? (They usually say yes!)",
          "Quick 10-minute AI fix for {pain_point}. No pitch, no proposal - just results. Ready?",
        ],
      },
    ],
    contentStyles: ["lightbulb", "contrarian"],
  },
  {
    id: "loyalty-magnetizer",
    name: "Loyalty Magnetizer - Review Automation",
    description: "Automate posts & review replies to boost repeat business",
    targetAudience: ["local_businesses", "service_providers", "restaurants"],
    painPoints: [
      "No time to respond to reviews",
      "Not posting regularly on social media",
      "Losing repeat customers",
      "Low engagement on Google/Facebook",
    ],
    platforms: ["facebook", "instagram", "google_business"],
    messageTemplates: [
      {
        style: "problem_solution",
        templates: [
          "Hey {name}! Noticed you haven't replied to some amazing 5-star reviews. I used AI to write friendly responses - want me to post them?",
          "Your business has {num} unreplied reviews. Created personalized AI responses in 5 minutes. Can I send them over?",
          "Most businesses ignore reviews and lose 33% more revenue. Made you AI-powered responses. Interested?",
        ],
      },
      {
        style: "stat_driven",
        templates: [
          "93% of customers read reviews before choosing a business. Your {business} has unreplied reviews - I can fix that with AI in 10 mins!",
          "Businesses that reply to reviews see 33% more revenue. Created automated AI replies for you - want them?",
          "Found {num} 5-star reviews with no response. AI can turn these into social proof gold. Ready?",
        ],
      },
    ],
    contentStyles: ["lightbulb", "curiosity"],
  },
  {
    id: "side-hustle-blueprint",
    name: "Side Hustle Blueprint - $625-$1650/mo",
    description: "Beginner-friendly guide to earning first client with AI",
    targetAudience: ["broke_individuals", "side_hustlers", "beginners"],
    painPoints: TARGET_PAIN_POINTS.financial,
    platforms: ["tiktok", "instagram", "whatsapp", "facebook"],
    messageTemplates: [
      {
        style: "income_focused",
        templates: [
          "🚀 Earn your first $625-$1,650 in 7 days using AI tools. No tech skills needed. No cold calling. Want the blueprint?",
          "Broke? I'll show you how to land $625 clients in 48 hours using simple AI fixes. Completely beginner-friendly.",
          "Turn 10 minutes of AI work into $625-$1,650/month. Zero cold calling. Zero tech skills. Interested?",
        ],
      },
      {
        style: "no_barriers",
        templates: [
          "✅ Zero Cold Calling\n✅ No Technical Skills\n✅ No Prior Experience\n\nStart earning with AI today. If you can use a smartphone, you can do this!",
          "No selling required - businesses PAY YOU to implement AI solutions. Start from absolute zero. Ready?",
          "The value is so obvious businesses immediately see the benefit. Your work speaks for itself. Start today?",
        ],
      },
      {
        style: "fast_results",
        templates: [
          "⚡ First win can happen within 48 HOURS if you follow this system exactly as outlined.",
          "This course is designed with one goal: help you earn $1,650 within 7 days using AI tools.",
          "Everything you learn is beginner-friendly and broken down into simple, actionable steps anyone can follow.",
        ],
      },
    ],
    contentStyles: ["lightbulb", "trending", "contrarian"],
  },
];

// ChatGPT Content Generation Prompts
export const AI_CONTENT_PROMPTS = {
  contrarian: {
    template: `Pretend you are the {personality_type} business owner of {business_name} in {industry} that sells {product_service} to {specific_audience} and write me a {length} {type_of_post} that is HELPFUL BUT CONTRARIAN TO WHAT MOST OF THE INDUSTRY BELIEVES.`,
    example: "Why 'Selling' is Dead — and What Works Now. Forget high-pressure tactics. Today's clients spot manipulation from miles away.",
  },
  parametric: {
    template: `Write me a {type_of_content} for {specific_who} that sells {product_or_service}. Write from the perspective of {insert_perspective} in the voice of {insert_voice}. Write in a {insert_mood_type} mood, in the style of {insert_style_type}, and make sure to follow these parameters: use only {X} amount of words, {X} amount of sentences, and be compliant with the policies of {insert_platform}.`,
    contentTypes: ["Facebook ad", "Instagram caption", "YouTube script", "Memes", "Behind the scenes", "Infographics", "Announcements", "Polls", "Fill in the blanks", "Industry tips and news"],
    perspectives: ["Business owner", "Customer", "Product", "Character", "Inanimate object"],
    voices: ["Actor", "Public figure", "Author", "Disney character"],
    moods: ["Humorous", "Sad", "Lethargic", "Energetic", "Anxious"],
    styles: ["Story", "Poem", "Allegory", "Haiku", "Report", "News update", "Infomercial", "Testimonial"],
  },
  review_response: {
    template: `You are helping a {business_type} in {city}. Generate 1 friendly, keyword-rich reply to this 5-star review: "{paste_review_here}" Then, write a social media post for the week about {insert_topic}.`,
    example: "Generate responses that add keywords for local SEO, show appreciation, and build customer loyalty.",
  },
  service_page: {
    template: `I want you to write an optimized {platform} business profile description for {business_name} inc in {city} and include some local landmarks and {industry} keywords keep it {word_count} words`,
    use_cases: ["Missing service pages", "Google Business Profile", "Local SEO optimization", "Website content"],
  },
};

// Pre-built Message Sequences
export const MESSAGE_SEQUENCES = {
  instant_win_3_step: [
    {
      delay_hours: 0,
      message: "Hey {name}! 👋 Noticed {issue} on your {business_type}. Made you a quick AI fix in 10 minutes - want to see it?",
    },
    {
      delay_hours: 24,
      message: "Quick follow-up - that AI solution I created for {issue} is ready whenever you want it. No strings attached!",
    },
    {
      delay_hours: 48,
      message: "Last check-in! The {solution_type} I made saves you hours of work. Most business owners say 'can you just do it for me?' - interested?",
    },
  ],
  value_first_sequence: [
    {
      delay_hours: 0,
      message: "🎁 Made you something! Found {num} unreplied 5-star reviews for {business_name}. Created AI responses - sending now (no charge):",
    },
    {
      delay_hours: 48,
      message: "Did you get a chance to check out those AI-generated review responses? Businesses that reply see 33% more revenue!",
    },
    {
      delay_hours: 96,
      message: "Quick question: would you want me to handle this automatically every week for $200-$400/month? Most say yes!",
    },
  ],
};

export function generateCampaignMessage(
  template: string,
  variables: Record<string, string>
): string {
  let message = template;
  for (const [key, value] of Object.entries(variables)) {
    message = message.replace(new RegExp(`{${key}}`, 'g'), value);
  }
  return message;
}

export function getTemplateByPainPoint(painPoint: string): CampaignTemplate | null {
  for (const template of INSTANT_WIN_TEMPLATES) {
    if (template.painPoints.some(p => 
      p.toLowerCase().includes(painPoint.toLowerCase())
    )) {
      return template;
    }
  }
  return null;
}

// PROVEN SALES PITCHES - Ready to use in campaigns

export const GOOGLE_BUSINESS_PITCH = {
  subject: "Quick Google Business Profile Help for {business_name}",
  body: `Hi {name},

I help small businesses optimize their Google Business Profile so they can rank higher in search results and get before the right people.

I found several businesses in {city} that could use help creating better profiles that people are likely to use their service.

I'm going to call you today. Would you be interested in a quick chat about how I can help {business_name} get more visibility?

This typically increases local search rankings by 40-60% within 30 days.

Best,
{your_name}`,
  painPoints: ["Low local visibility", "Not showing up in Google", "Need more customers"],
  expectedRevenue: "$300-$800",
};

export const WEBSITE_BUILDING_PITCH = {
  subject: "I Built This Website for a Roofer—Letting It Go for $1,000",
  body: `Hey {name},

I was checking out roofing companies in {city} and noticed you don't have a website. I get it—you're busy running your business, and building a website from scratch is a hassle (not to mention expensive).

Here's the deal: I recently built a professional roofing website for a client, but they ended up going a different direction. Normally, I sell these for $3,000, but since it's already done, I'm just looking to liquidate it for $1,000—one-time, no hidden fees.

It's designed to bring in leads, looks great on mobile, and I can have it up and running for you in 48 hours or less.

If you want to see what it looks like, hit reply or text me at {your_phone}, and I'll send over the details. First roofer to grab it gets it.

Here's the site: {website_link}

Talk soon,
{your_name}
{your_company}`,
  painPoints: ["No website", "Expensive web design", "Need leads fast"],
  expectedRevenue: "$1,000-$3,000",
};

export const MARKETING_AGENCY_EMAIL_SEQUENCE = {
  name: "30-Day Email Nurture Sequence",
  description: "High-level email sequence for marketing agency based in Hawaii",
  days: 30,
  emails: [
    {
      day: 1,
      subject: "Welcome to {agency_name} 🌺",
      theme: "Value-driven introduction",
      content: "Share your agency's unique approach to marketing in Hawaii, emphasize relationship-building and local expertise.",
    },
    {
      day: 3,
      subject: "Why Hawaii businesses need different marketing",
      theme: "Local insights",
      content: "Talk about things specific to doing business in Hawaii that most people don't know yet.",
    },
    {
      day: 7,
      subject: "Case Study: How we helped {local_business}",
      theme: "Social proof",
      content: "Share a success story from a Hawaii-based client with specific metrics and results.",
    },
    {
      day: 14,
      subject: "The #1 mistake Hawaii businesses make online",
      theme: "Education + authority",
      content: "Provide valuable insights that position you as the expert.",
    },
    {
      day: 21,
      subject: "Special offer for Hawaii businesses",
      theme: "Soft pitch",
      content: "Introduce your services with a Hawaii-specific offer or bonus.",
    },
    {
      day: 30,
      subject: "Ready to grow your Hawaii business?",
      theme: "Call to action",
      content: "Direct call to schedule a consultation, emphasizing limited availability.",
    },
  ],
};

// 7-DAY AFFILIATE BOOTCAMP SYSTEM
export const AFFILIATE_BOOTCAMP = {
  name: "7-Day Affiliate Marketing Bootcamp",
  description: "Complete beginner-friendly system for earning 40% recurring commissions",
  days: [
    {
      day: 1,
      title: "Welcome & Overview",
      contentPrompt: "Introduce the bootcamp, set expectations, explain the 'no tech, no product' approach. Just one invite link that pays monthly.",
    },
    {
      day: 2,
      title: "Find Your Niche + Setup Your Affiliate Link",
      niches: ["AI Tools", "Digital Products / Courses", "Health / Wellness", "Money / Side Hustles"],
      platforms: ["Builderall", "Legendary Marketer"],
      earlyWin: "Skool - earn 40% recurring commissions by inviting people",
      task: "Comment your chosen niche to unlock Day 3",
    },
    {
      day: 3,
      title: "Full Delivery Template",
      focus: "Your invite link is the funnel",
      script: "You're not building complicated landing pages. You're not setting up funnels and email software. Your invite link is the funnel. That link you shared yesterday? That's the page people land on when they want to learn affiliate marketing. And the best part is — when they join using your link and later upgrade... you get paid. You don't even have to sell anything directly. Just keep pointing people to that link.",
      distribution: ["Put it in your TikTok/Instagram bio", "Mention it in your videos", "Drop it in comments when you're helping people"],
    },
    {
      day: 4,
      title: "Make Your First Post & Launch Your Affiliate Journey",
      goal: "Stop learning and start earning",
      focus: "Publish your first post — even if it's not perfect",
      contentStrategy: "This content won't just promote affiliate products — it will drive people into the same free bootcamp you're in right now.",
      benefits: [
        "Earn 40% recurring commissions from anyone you bring in",
        "You don't need to 'sell,' just document your journey and invite them in",
        "You'll gain confidence and build an audience over time",
      ],
    },
    {
      day: 5,
      title: "Scale & Optimize",
      focus: "Post consistently, engage with your audience, track what works",
    },
    {
      day: 6,
      title: "Advanced Strategies",
      focus: "Email marketing, retargeting, content repurposing",
    },
    {
      day: 7,
      title: "Your First Commission Celebration",
      focus: "Review progress, plan next 30 days, mindset for long-term success",
    },
  ],
  contentPrompts: {
    day1: "I just started learning affiliate marketing inside a free 7-day bootcamp. No tech. No product. Just one invite link that pays me monthly. If you're curious, join free — link in bio.",
    reminder: "Some of you are just 1 or 2 posts away from your first commission. Let's make it happen today. Let's flood this group with content, feedback, and momentum. Your future audience is watching — even if they haven't followed you yet.",
  },
};

// 7 AI TOOLS TO CUT COSTS
export const AI_TOOLS_FRAMEWORK = {
  name: "7 AI Tools to Help You Cut Costs",
  description: "Reduce cost, time, and headache of creating content",
  tools: [
    {
      name: "ChatGPT",
      use: "Text generation, copywriting, email sequences, content ideas",
      category: "Content Creation",
    },
    {
      name: "DALL-E 2",
      use: "AI image generation for social media, ads, blog posts",
      category: "Visual Content",
    },
    {
      name: "Synthesia.io",
      use: "AI video creation with AI avatars (no filming required)",
      category: "Video Content",
    },
    {
      name: "Descript.com",
      use: "Audio/video editing, transcription, overdub",
      category: "Video/Audio Editing",
    },
    {
      name: "Soundraw",
      use: "AI-generated royalty-free music",
      category: "Audio Content",
    },
    {
      name: "Otter.ai",
      use: "Meeting transcription, notes, summaries",
      category: "Productivity",
    },
    {
      name: "Vidyo.ai",
      use: "Convert long-form videos into short clips for social media",
      category: "Video Repurposing",
    },
  ],
  insight: "What's the most expensive NOT to have? Content > Marketing > Sales > Customer Support > Operations",
};

// 5 CORE COMPETENCIES OF MODERN BUSINESS
export const FIVE_CORE_COMPETENCIES = {
  framework: "The 5 pillars every modern small business needs",
  competencies: [
    {
      day: 1,
      name: "CONTENT",
      description: "What people read, watch, listen to or see about your business",
      keyQuestion: "Are you creating valuable content that attracts your ideal customer?",
    },
    {
      day: 2,
      name: "MARKETING",
      description: "The distribution of that content to generate interest",
      keyQuestion: "How are you getting your content in front of the right people?",
    },
    {
      day: 3,
      name: "SALES",
      description: "Converting interest into customers",
      keyQuestion: "Do you have a clear system for turning leads into paying customers?",
    },
    {
      day: 4,
      name: "CUSTOMER SUPPORT",
      description: "Keep customers so happy that they buy more of your stuff",
      keyQuestion: "Are you creating raving fans who refer others and buy again?",
    },
    {
      day: 5,
      name: "OPERATIONS",
      description: "The management of the people, product, process, and risk in your business",
      keyQuestion: "Do you have systems that allow you to scale without chaos?",
    },
  ],
  insight: "Most expensive NOT to have: CONTENT. Without content, you have nothing to market, no trust to convert sales, and no customers to support.",
};

// CONVERSION PSYCHOLOGY - 6 Weapons of Influence (Cialdini)
export const WEAPONS_OF_INFLUENCE = {
  name: "6 Weapons of Influence for Subscriber Conversion",
  description: "Proven psychological triggers that convert followers into paying subscribers",
  weapons: [
    {
      principle: "RECIPROCITY",
      description: "People feel obligated to give back to those who have given to them",
      tactics: [
        "Offer free value upfront (free credits, trial access, exclusive content)",
        "Give unexpected bonuses after signup",
        "Provide personalized help before asking for subscription",
        "Share exclusive tips/tools for free to create obligation",
      ],
      templates: {
        freeContent: "🎁 FREE GIFT: I'm giving away {value} to the first {number} people who {action}. No strings attached. Just value.",
        unexpectedBonus: "You just signed up, so here's an EXTRA {bonus} I wasn't planning to give. Enjoy!",
        valueFirst: "Before you subscribe, let me show you {free_tool}. Try it free. If it helps, consider joining.",
      },
    },
    {
      principle: "COMMITMENT & CONSISTENCY",
      description: "People want to be consistent with things they've said or done before",
      tactics: [
        "Get small commitments first (email signup, follow, like)",
        "Ask people to make public declarations about their goals",
        "Use foot-in-the-door technique (small ask → bigger ask)",
        "Remind people of previous actions/statements",
      ],
      templates: {
        microCommitment: "Quick question: Would you use a tool that {benefit}? Just type YES or NO.",
        publicCommitment: "Comment below: What's your #1 goal for {timeframe}? I'll check back in 30 days to see who made it happen.",
        footInDoor: "Since you already {small_action}, the next step is {bigger_action}. Ready?",
      },
    },
    {
      principle: "SOCIAL PROOF",
      description: "People look to others to determine correct behavior",
      tactics: [
        "Show number of subscribers/users (10,000+ creators trust us)",
        "Display testimonials and success stories",
        "Show live user activity (X people just subscribed)",
        "Highlight what similar people are doing",
      ],
      templates: {
        numbersBased: "Join 10,000+ creators already earning ${amount}/month with {platform}",
        testimonial: "\"{quote}\" - {name}, {title} (Earned ${amount} in {timeframe})",
        liveActivity: "🔥 {number} people subscribed in the last 24 hours. Don't miss out.",
        similarPeople: "Creators like you are earning {amount} with this exact system.",
      },
    },
    {
      principle: "LIKING",
      description: "People prefer to say yes to those they know and like",
      tactics: [
        "Find common ground with audience (shared struggles, goals)",
        "Give genuine compliments",
        "Be attractive (professional branding, good content)",
        "Associate with liked things/people",
      ],
      templates: {
        commonGround: "I was broke and {struggle} just like you. Here's how I turned it around...",
        compliment: "I love how dedicated you are to {goal}. That's exactly the energy that creates success.",
        association: "As seen on {platform}, used by {celebrity/influencer}, trusted by {brand}",
      },
    },
    {
      principle: "AUTHORITY",
      description: "People follow credible, knowledgeable experts",
      tactics: [
        "Display credentials, awards, certifications",
        "Share results and proof (screenshots of earnings)",
        "Use authoritative language and professional design",
        "Get endorsements from recognized authorities",
      ],
      templates: {
        credentials: "I've helped {number} businesses make ${total_amount} using this exact system.",
        proof: "Here's a screenshot of my ${amount} month. No BS, just results.",
        endorsement: "Recommended by {authority_figure} and used by {number} professionals.",
      },
    },
    {
      principle: "SCARCITY",
      description: "People want more of what they can have less of",
      tactics: [
        "Limited quantity (only 100 spots available)",
        "Limited time (offer expires in 24 hours)",
        "Exclusive access (invite-only)",
        "Deadline pressure (price increases soon)",
      ],
      templates: {
        limitedQuantity: "⚠️ ONLY {number} SPOTS LEFT at this price. Once they're gone, price doubles.",
        limitedTime: "This offer expires in {timeframe}. After that, it's gone forever.",
        exclusive: "This is invite-only. I'm only accepting {number} new members this month.",
        deadline: "Early bird pricing ends {date}. Save ${amount} if you join today.",
      },
    },
  ],
};

// NLP COPYWRITING TECHNIQUES
export const NLP_COPYWRITING = {
  name: "NLP Techniques for Irresistible Copy",
  description: "Neuro-Linguistic Programming strategies to create hypnotic marketing messages",
  techniques: [
    {
      name: "NLP Anchoring",
      description: "Associate positive emotions with your offer",
      usage: "Use specific words/phrases repeatedly when delivering good news to create positive associations",
      example: "Every time I say 'FREEDOM,' imagine yourself... [positive scenario]. Now, our FREEDOM package includes...",
    },
    {
      name: "Embedded Commands",
      description: "Hide direct commands within longer sentences",
      usage: "When you SUBSCRIBE NOW, you'll notice... / As you CLICK THE BUTTON, imagine...",
      templates: [
        "When you {action}, you'll discover...",
        "As you {action}, you'll notice...",
        "The moment you {action}, you'll feel...",
      ],
    },
    {
      name: "NLP Reframe",
      description: "Change the meaning by changing the context",
      examples: [
        "Not expensive → Investment in your future",
        "Takes time → Builds long-term wealth",
        "No experience needed → Fresh start advantage",
      ],
    },
    {
      name: "Presupposition",
      description: "Assume the sale has already happened",
      templates: [
        "After you subscribe, you'll receive...",
        "Once you're inside, you'll see...",
        "When you start earning, you'll realize...",
      ],
    },
    {
      name: "Sensory Language",
      description: "Engage all five senses in your copy",
      example: "FEEL the weight lift off your shoulders. SEE your bank account grow. HEAR the notifications of new sales. TASTE financial freedom.",
    },
  ],
};

// EMOTIONAL TRIGGER FRAMEWORK
export const EMOTIONAL_TRIGGERS = {
  name: "Emotional Triggers That Convert",
  description: "Psychological hot buttons that drive subscription decisions",
  triggers: [
    {
      emotion: "FEAR OF MISSING OUT (FOMO)",
      trigger: "Everyone else is getting ahead while you're being left behind",
      copy: "While you're reading this, {number} people just started earning with our system. How much longer will you wait?",
    },
    {
      emotion: "GREED",
      trigger: "Desire for more money, status, success",
      copy: "Imagine waking up to ${amount} in your account. Every. Single. Day. That's the reality for our members.",
    },
    {
      emotion: "PAIN/FRUSTRATION",
      trigger: "Tired of current situation, desperate for change",
      copy: "Broke? Tired of working 60 hours a week for someone else? What if I told you there's a way out in 30 days?",
    },
    {
      emotion: "HOPE/ASPIRATION",
      trigger: "Dream of better future, potential realized",
      copy: "You're one decision away from the life you've always wanted. This is that decision.",
    },
    {
      emotion: "CURIOSITY",
      trigger: "Want to know the secret, the hidden method",
      copy: "The one thing nobody tells you about {topic}... (They don't want you to know because...)",
    },
    {
      emotion: "TRUST/SAFETY",
      trigger: "Need to feel secure, avoid risk",
      copy: "30-day money-back guarantee. Zero risk. If you don't make ${amount}, I'll refund every penny AND pay you $100.",
    },
    {
      emotion: "URGENCY",
      trigger: "Must act now or lose opportunity",
      copy: "🚨 URGENT: Price increases in {hours} hours. Lock in your discount NOW or pay ${amount} more tomorrow.",
    },
  ],
};

// SUBSCRIPTION CONVERSION TEMPLATES
export const SUBSCRIPTION_CONVERSION_TEMPLATES = [
  {
    id: "scarcity-urgency",
    name: "Scarcity + Urgency Combo",
    conversionRate: "25-40%",
    template: `⚠️ ONLY {number} SPOTS LEFT

Price: ${old_price} → ${new_price} (Save ${savings})

This deal expires in {hours} hours.

After that:
❌ Price goes up to ${future_price}
❌ Bonuses disappear
❌ You pay MORE for LESS

Join now: {link}`,
  },
  {
    id: "social-proof-authority",
    name: "Social Proof + Authority",
    conversionRate: "20-35%",
    template: `Join {number}+ creators making ${avg_amount}/month

"I made my first ${amount} in {days} days" - {name}

✅ {testimonial_count}+ Success Stories
✅ Featured in {media_outlets}
✅ Trusted by {big_name}

Start free: {link}`,
  },
  {
    id: "reciprocity-value",
    name: "Reciprocity (Free Value First)",
    conversionRate: "30-45%",
    template: `🎁 FREE GIFT: I'm giving you {freebie}

No credit card. No catch. Just pure value.

Inside you'll get:
✅ {benefit_1}
✅ {benefit_2}
✅ {benefit_3}

Grab it now: {link}

(Most people upgrade within 7 days after seeing the results)`,
  },
  {
    id: "pain-solution",
    name: "Pain → Solution → Transformation",
    conversionRate: "35-50%",
    template: `Are you:
❌ {pain_point_1}
❌ {pain_point_2}
❌ {pain_point_3}

What if you could:
✅ {solution_1}
✅ {solution_2}
✅ {solution_3}

Here's how: {link}

{number} people did this in the last {timeframe}. You're next.`,
  },
];
