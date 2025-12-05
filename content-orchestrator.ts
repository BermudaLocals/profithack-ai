import OpenAI from "openai";

// Types for the content generation
interface ContentGenerationRequest {
  topic: string;
  style?: string;
  duration?: number;
  userApiKey?: string;
}

interface ScriptResult {
  hook: string;
  body: string;
  cta: string;
  estimatedDuration: number;
}

interface ContentGenerationResult {
  script: ScriptResult;
  caption: string;
  hashtags: string[];
  thumbnailPrompt: string;
  musicSuggestion: string;
}

interface VideoMetrics {
  id: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  watchTimeSeconds: number;
  durationSeconds: number;
  [key: string]: any;
}

interface RankedVideo extends VideoMetrics {
  viralScore: number;
  watchTimePercentage: number;
  engagementRate: number;
  commentRate: number;
  shareRate: number;
}

/**
 * AI Content Orchestrator - Coordinates all AI agents for TikTok-style content generation
 */
export class ContentOrchestrator {
  private openai: OpenAI | null = null;

  constructor() {
    // Initialize OpenAI if API key is available
    const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  /**
   * Get OpenAI client - uses user's key if provided, otherwise platform key
   */
  private getOpenAIClient(userApiKey?: string): OpenAI {
    if (userApiKey) {
      return new OpenAI({ apiKey: userApiKey });
    }
    
    if (!this.openai) {
      throw new Error("OpenAI API key not configured. Please provide your own API key or configure AI_INTEGRATIONS_OPENAI_API_KEY.");
    }
    
    return this.openai;
  }

  /**
   * ScriptWriterAgent - Generate viral TikTok scripts using OpenAI
   */
  async generateScript(topic: string, style: string = "engaging", duration: number = 30, userApiKey?: string): Promise<ScriptResult> {
    const client = this.getOpenAIClient(userApiKey);
    
    const prompt = `Generate a viral TikTok script about "${topic}" that is ${duration} seconds long. Make it hook viewers in first 3 seconds, use storytelling, and end with a call-to-action. Style: ${style}. Return JSON with: hook, body, cta, estimatedDuration`;
    
    try {
      const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a viral TikTok content script writer. You understand how to hook viewers in the first 3 seconds, maintain engagement, and drive action. Always return valid JSON with the exact structure requested."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.8,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No response from OpenAI");
      }

      const result = JSON.parse(content);
      
      // Validate and structure the response
      return {
        hook: result.hook || result.Hook || "",
        body: result.body || result.Body || "",
        cta: result.cta || result.CTA || result.callToAction || "",
        estimatedDuration: result.estimatedDuration || result.duration || duration,
      };
    } catch (error: any) {
      console.error("ScriptWriterAgent error:", error);
      throw new Error(`Failed to generate script: ${error.message}`);
    }
  }

  /**
   * CaptionAgent - Create engaging captions with emojis
   */
  async generateCaption(topic: string, script: ScriptResult, userApiKey?: string): Promise<string> {
    const client = this.getOpenAIClient(userApiKey);
    
    const prompt = `Create a viral TikTok caption for a video about "${topic}". The video hook is: "${script.hook}". Make it engaging, use 3-5 relevant emojis, include a question to drive comments, and keep it under 150 characters. Return only the caption text, no JSON.`;
    
    try {
      const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a TikTok caption expert. You know how to write captions that drive engagement, use emojis effectively, and encourage comments. Keep captions concise and punchy."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.9,
        max_tokens: 100,
      });

      return response.choices[0]?.message?.content?.trim() || "";
    } catch (error: any) {
      console.error("CaptionAgent error:", error);
      throw new Error(`Failed to generate caption: ${error.message}`);
    }
  }

  /**
   * HashtagAgent - Generate 5-10 trending hashtags
   */
  async generateHashtags(topic: string, userApiKey?: string): Promise<string[]> {
    const client = this.getOpenAIClient(userApiKey);
    
    const prompt = `Generate 5-10 trending TikTok hashtags for a video about "${topic}". Mix popular broad hashtags with niche-specific ones. Return as a JSON array of hashtag strings (without # symbol). Format: ["hashtag1", "hashtag2", ...]`;
    
    try {
      const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a TikTok hashtag strategist. You understand trending hashtags and how to mix viral broad hashtags with targeted niche hashtags for maximum reach."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No response from OpenAI");
      }

      const result = JSON.parse(content);
      const hashtags = result.hashtags || result.tags || [];
      
      // Ensure we return 5-10 hashtags
      return hashtags.slice(0, 10);
    } catch (error: any) {
      console.error("HashtagAgent error:", error);
      throw new Error(`Failed to generate hashtags: ${error.message}`);
    }
  }

  /**
   * ThumbnailPromptAgent - Create image prompts for thumbnails
   */
  async generateThumbnailPrompt(topic: string, script: ScriptResult, userApiKey?: string): Promise<string> {
    const client = this.getOpenAIClient(userApiKey);
    
    const prompt = `Create a detailed image generation prompt for a TikTok video thumbnail about "${topic}". The video hook is: "${script.hook}". Make it eye-catching, describe colors, composition, lighting, and mood. The thumbnail should make people want to click. Return only the prompt text, no JSON.`;
    
    try {
      const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a thumbnail design expert. You create detailed image prompts that result in eye-catching, clickable thumbnails that drive views."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 150,
      });

      return response.choices[0]?.message?.content?.trim() || "";
    } catch (error: any) {
      console.error("ThumbnailPromptAgent error:", error);
      throw new Error(`Failed to generate thumbnail prompt: ${error.message}`);
    }
  }

  /**
   * MusicSuggestionAgent - Suggest trending songs
   */
  async suggestMusic(topic: string, style: string, userApiKey?: string): Promise<string> {
    const client = this.getOpenAIClient(userApiKey);
    
    const prompt = `Suggest a trending song or music type for a TikTok video about "${topic}" with ${style} style. Consider what's currently trending on TikTok and what would match the vibe. Return just the song suggestion (artist - song name) or music type, no JSON.`;
    
    try {
      const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a TikTok music trends expert. You know which songs are trending and which music matches different content styles and topics."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 50,
      });

      return response.choices[0]?.message?.content?.trim() || "";
    } catch (error: any) {
      console.error("MusicSuggestionAgent error:", error);
      throw new Error(`Failed to suggest music: ${error.message}`);
    }
  }

  /**
   * ContentScheduler - Plan weekly content calendar
   */
  async planWeeklyCalendar(niche: string, userApiKey?: string): Promise<any> {
    const client = this.getOpenAIClient(userApiKey);
    
    const prompt = `Create a weekly TikTok content calendar for ${niche} niche. Include 7 video ideas (one per day), posting times optimized for engagement, and content variety. Return as JSON with structure: { "monday": { "topic": "...", "style": "...", "bestTime": "..." }, ... }`;
    
    try {
      const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a TikTok content strategist. You understand posting schedules, content variety, and how to maintain audience engagement throughout the week."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No response from OpenAI");
      }

      return JSON.parse(content);
    } catch (error: any) {
      console.error("ContentScheduler error:", error);
      throw new Error(`Failed to plan weekly calendar: ${error.message}`);
    }
  }

  /**
   * Main orchestrator method - Generate complete content package
   */
  async generateContent(request: ContentGenerationRequest): Promise<ContentGenerationResult> {
    const { topic, style = "engaging", duration = 30, userApiKey } = request;
    
    try {
      // Generate script first (it's the foundation)
      const script = await this.generateScript(topic, style, duration, userApiKey);
      
      // Generate all other content in parallel for efficiency
      const [caption, hashtags, thumbnailPrompt, musicSuggestion] = await Promise.all([
        this.generateCaption(topic, script, userApiKey),
        this.generateHashtags(topic, userApiKey),
        this.generateThumbnailPrompt(topic, script, userApiKey),
        this.suggestMusic(topic, style, userApiKey),
      ]);
      
      return {
        script,
        caption,
        hashtags,
        thumbnailPrompt,
        musicSuggestion,
      };
    } catch (error: any) {
      console.error("ContentOrchestrator error:", error);
      throw new Error(`Content generation failed: ${error.message}`);
    }
  }

  /**
   * TikTok Algorithm Scoring - Rank videos by viral potential
   * 
   * Scoring formula:
   * - Watch time percentage (40%) - How much of the video people watch
   * - Engagement rate (30%) - Likes per view
   * - Comment activity (15%) - Comments per view
   * - Share ratio (15%) - Shares per view
   */
  rankVideos(videos: VideoMetrics[]): RankedVideo[] {
    const rankedVideos: RankedVideo[] = videos.map(video => {
      // Calculate individual metrics
      const watchTimePercentage = video.durationSeconds > 0 
        ? (video.watchTimeSeconds / video.durationSeconds) * 100 
        : 0;
      
      const engagementRate = video.views > 0 
        ? (video.likes / video.views) * 100 
        : 0;
      
      const commentRate = video.views > 0 
        ? (video.comments / video.views) * 100 
        : 0;
      
      const shareRate = video.views > 0 
        ? (video.shares / video.views) * 100 
        : 0;
      
      // Calculate weighted viral score
      const viralScore = 
        (watchTimePercentage * 0.40) +  // 40% weight on watch time
        (engagementRate * 0.30) +        // 30% weight on engagement
        (commentRate * 0.15) +           // 15% weight on comments
        (shareRate * 0.15);              // 15% weight on shares
      
      return {
        ...video,
        viralScore: Math.round(viralScore * 100) / 100, // Round to 2 decimals
        watchTimePercentage: Math.round(watchTimePercentage * 100) / 100,
        engagementRate: Math.round(engagementRate * 100) / 100,
        commentRate: Math.round(commentRate * 100) / 100,
        shareRate: Math.round(shareRate * 100) / 100,
      };
    });
    
    // Sort by viral score descending (highest first)
    return rankedVideos.sort((a, b) => b.viralScore - a.viralScore);
  }

  /**
   * Get trending topics (hardcoded for now, can be enhanced with real data later)
   */
  getTrendingTopics(): string[] {
    return [
      "AI Tools",
      "Make Money Online",
      "Crypto News",
      "Dating Tips",
      "Fitness",
      "Cooking",
      "Tech Reviews",
      "Comedy Skits",
    ];
  }
}

// Export singleton instance
export const contentOrchestrator = new ContentOrchestrator();
