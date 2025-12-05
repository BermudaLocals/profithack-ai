/**
 * Sora 2 Video Generation Service
 * 
 * Integrates OpenAI's Sora 2 for AI influencer video generation
 * - Text-to-video with synchronized audio
 * - Up to 90 seconds of 4K video
 * - Multi-shot narrative coherence
 * - Character consistency (Cameo feature)
 */

import { OpenAI } from "openai";

export interface SoraGenerationRequest {
  prompt: string;
  duration?: number; // In seconds (max 90)
  aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3";
  quality?: "standard" | "high" | "ultra";
  characterAppearance?: string; // Consistent character description
  voiceId?: string; // For synchronized dialogue
  userApiKey?: string; // Optional: user's own OpenAI key
}

export interface SoraGenerationResponse {
  jobId: string;
  status: "pending" | "processing" | "completed" | "failed";
  videoUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  error?: string;
}

// Credit costs for Sora 2 video generation
export const SORA_CREDIT_COSTS = {
  // Based on duration (credits per second)
  standard: 5, // ~$0.05 per second = $3 per 60 seconds
  high: 8,
  ultra: 12,
  // Base costs (one-time per video)
  baseCost: 100, // ~$1.00 minimum
};

/**
 * Sora 2 Video Generation Provider
 */
export class SoraService {
  private apiKey: string | null = null;
  private client: OpenAI | null = null;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.OPENAI_API_KEY;
    if (key) {
      this.apiKey = key;
      this.client = new OpenAI({ apiKey: key });
    }
  }

  isConfigured(): boolean {
    return this.apiKey !== null;
  }

  /**
   * Generate video using Sora 2
   * Note: As of Oct 2025, Sora 2 API is in preview access
   */
  async generateVideo(
    request: SoraGenerationRequest
  ): Promise<SoraGenerationResponse> {
    // Use user-provided API key or fallback to instance/env key
    const apiKey = request.userApiKey || this.apiKey;
    
    if (!apiKey) {
      throw new Error("OpenAI API key not configured for Sora 2");
    }

    try {
      // Build enhanced prompt with character consistency
      let enhancedPrompt = request.prompt;
      if (request.characterAppearance) {
        enhancedPrompt = `Character: ${request.characterAppearance}\n\nScene: ${request.prompt}`;
      }

      // Call Sora 2 API (preview endpoint)
      // Note: This is based on OpenAI's preview API structure
      const response = await fetch("https://api.openai.com/v1/videos/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "OpenAI-Beta": "sora-v2", // Preview access header
        },
        body: JSON.stringify({
          model: "sora-2",
          prompt: enhancedPrompt,
          duration: request.duration || 10,
          aspect_ratio: request.aspectRatio || "9:16",
          quality: request.quality || "standard",
          // Cameo feature for character consistency
          character_consistency: request.characterAppearance ? true : false,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Sora 2 API error: ${error.message || response.statusText}`);
      }

      const data = await response.json();

      // Sora 2 uses async generation with job tracking
      return {
        jobId: data.id,
        status: data.status || "pending",
        videoUrl: data.video_url,
        thumbnailUrl: data.thumbnail_url,
        duration: data.duration,
      };
    } catch (error) {
      console.error("Sora 2 generation failed:", error);
      return {
        jobId: "",
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Check status of Sora 2 generation job
   */
  async checkJobStatus(jobId: string, userApiKey?: string): Promise<SoraGenerationResponse> {
    const apiKey = userApiKey || this.apiKey;
    
    if (!apiKey) {
      throw new Error("OpenAI API key not configured");
    }

    try {
      const response = await fetch(
        `https://api.openai.com/v1/videos/generations/${jobId}`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "OpenAI-Beta": "sora-v2",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to check job status: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        jobId: data.id,
        status: data.status,
        videoUrl: data.video_url,
        thumbnailUrl: data.thumbnail_url,
        duration: data.duration,
        error: data.error,
      };
    } catch (error) {
      throw new Error(`Failed to check Sora job: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Calculate credit cost for video generation
   */
  calculateCost(duration: number, quality: "standard" | "high" | "ultra" = "standard"): number {
    const perSecondCost = SORA_CREDIT_COSTS[quality];
    const totalCost = SORA_CREDIT_COSTS.baseCost + (duration * perSecondCost);
    return Math.ceil(totalCost);
  }

  /**
   * Generate influencer video with consistent character
   * Optimized for AI influencer use case
   */
  async generateInfluencerVideo(params: {
    prompt: string;
    influencerAppearance: string;
    influencerPersonality: string;
    duration?: number;
    voiceId?: string;
    userApiKey?: string;
  }): Promise<SoraGenerationResponse> {
    // Enhance prompt with personality traits
    const contextualPrompt = `
AI Influencer Video Generation:

Character Appearance: ${params.influencerAppearance}
Personality: ${params.influencerPersonality}

Scene Description: ${params.prompt}

Ensure character consistency throughout the video. Include natural facial expressions and body language that match the personality traits.
    `.trim();

    return await this.generateVideo({
      prompt: contextualPrompt,
      duration: params.duration || 15, // Default 15 seconds for influencer content
      aspectRatio: "9:16", // Vertical video for social media
      quality: "high",
      characterAppearance: params.influencerAppearance,
      voiceId: params.voiceId,
      userApiKey: params.userApiKey,
    });
  }
}

/**
 * Fallback: Third-party Sora 2 API provider (muapi.ai)
 * Used when OpenAI official API is not available
 */
export class SoraFallbackService {
  private apiKey: string | null = null;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.MUAPI_KEY || null;
  }

  isConfigured(): boolean {
    return this.apiKey !== null;
  }

  async generateVideo(
    request: SoraGenerationRequest
  ): Promise<SoraGenerationResponse> {
    if (!this.apiKey) {
      throw new Error("Third-party Sora API key not configured");
    }

    try {
      const response = await fetch(
        "https://api.muapi.ai/api/v1/openai-sora-2-text-to-video",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": this.apiKey,
          },
          body: JSON.stringify({
            prompt: request.prompt,
            duration: request.duration || 10,
            aspect_ratio: request.aspectRatio || "9:16",
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Fallback API error: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        jobId: data.task_id || data.id,
        status: "processing",
        videoUrl: data.video_url,
      };
    } catch (error) {
      return {
        jobId: "",
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

/**
 * Unified Sora Service with automatic fallback
 * Tries OpenAI first, falls back to third-party if available
 */
export class UnifiedSoraService {
  private primary: SoraService;
  private fallback: SoraFallbackService;

  constructor() {
    this.primary = new SoraService();
    this.fallback = new SoraFallbackService();
  }

  /**
   * Generate video with automatic fallback
   */
  async generateVideo(
    request: SoraGenerationRequest
  ): Promise<SoraGenerationResponse> {
    // Try primary (OpenAI) first
    try {
      const result = await this.primary.generateVideo(request);
      if (result.status !== "failed") {
        return result;
      }
    } catch (error) {
      console.warn("Primary Sora service failed, trying fallback:", error);
    }

    // Fallback to third-party provider
    if (this.fallback.isConfigured()) {
      try {
        return await this.fallback.generateVideo(request);
      } catch (error) {
        console.error("Fallback Sora service also failed:", error);
        throw error;
      }
    }

    throw new Error("All Sora video generation providers failed");
  }

  /**
   * Check job status (primary only for now)
   */
  async checkJobStatus(jobId: string, userApiKey?: string): Promise<SoraGenerationResponse> {
    return await this.primary.checkJobStatus(jobId, userApiKey);
  }

  /**
   * Calculate cost (uses primary pricing)
   */
  calculateCost(duration: number, quality: "standard" | "high" | "ultra" = "standard"): number {
    return this.primary.calculateCost(duration, quality);
  }

  /**
   * Generate influencer video with fallback
   */
  async generateInfluencerVideo(params: {
    prompt: string;
    influencerAppearance: string;
    influencerPersonality: string;
    duration?: number;
    voiceId?: string;
    userApiKey?: string;
  }): Promise<SoraGenerationResponse> {
    return await this.generateVideo({
      prompt: `
AI Influencer Video Generation:

Character Appearance: ${params.influencerAppearance}
Personality: ${params.influencerPersonality}

Scene Description: ${params.prompt}

Ensure character consistency throughout the video. Include natural facial expressions and body language that match the personality traits.
      `.trim(),
      duration: params.duration || 15,
      aspectRatio: "9:16",
      quality: "high",
      characterAppearance: params.influencerAppearance,
      voiceId: params.voiceId,
      userApiKey: params.userApiKey,
    });
  }
}

// Export singleton instances
export const soraService = new UnifiedSoraService();
