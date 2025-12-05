/**
 * Voice Cloning Service
 * 
 * Integrates ElevenLabs for AI influencer voice generation
 * - Voice cloning from samples
 * - Text-to-speech with custom voices
 * - Multiple language support
 * - Voice library management
 */

export interface VoiceCloneRequest {
  name: string;
  description?: string;
  audioSamples: string[]; // URLs to audio samples (at least 1 minute total)
  labels?: Record<string, string>; // Accent, age, gender, use_case
}

export interface VoiceGenerationRequest {
  text: string;
  voiceId: string;
  stability?: number; // 0-1, higher = more stable/consistent
  similarityBoost?: number; // 0-1, higher = more similar to original
  style?: number; // 0-1, for exaggeration
  userApiKey?: string;
}

export interface Voice {
  voiceId: string;
  name: string;
  category?: string;
  labels?: Record<string, string>;
  previewUrl?: string;
}

// Credit costs for voice generation
export const VOICE_CREDIT_COSTS = {
  textToSpeech: 2, // per 100 characters
  voiceCloning: 500, // one-time cost to create voice
  instantVoiceCloning: 200, // cheaper but lower quality
};

/**
 * ElevenLabs Voice Service
 */
export class VoiceService {
  private apiKey: string | null = null;
  private baseUrl = "https://api.elevenlabs.io/v1";

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.ELEVENLABS_API_KEY || null;
  }

  isConfigured(): boolean {
    return this.apiKey !== null;
  }

  /**
   * Get available voices from library
   */
  async getVoices(): Promise<Voice[]> {
    if (!this.apiKey) {
      throw new Error("ElevenLabs API key not configured");
    }

    try {
      const response = await fetch(`${this.baseUrl}/voices`, {
        headers: {
          "xi-api-key": this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch voices: ${response.statusText}`);
      }

      const data = await response.json();
      return data.voices.map((v: any) => ({
        voiceId: v.voice_id,
        name: v.name,
        category: v.category,
        labels: v.labels,
        previewUrl: v.preview_url,
      }));
    } catch (error) {
      throw new Error(`Voice fetch failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Clone voice from audio samples
   */
  async cloneVoice(request: VoiceCloneRequest): Promise<string> {
    if (!this.apiKey) {
      throw new Error("ElevenLabs API key not configured");
    }

    try {
      // Download audio samples
      const audioFiles = await Promise.all(
        request.audioSamples.map(async (url) => {
          const response = await fetch(url);
          return await response.arrayBuffer();
        })
      );

      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append("name", request.name);
      if (request.description) {
        formData.append("description", request.description);
      }
      if (request.labels) {
        formData.append("labels", JSON.stringify(request.labels));
      }

      // Attach audio files
      audioFiles.forEach((audio, index) => {
        const blob = new Blob([audio], { type: "audio/mpeg" });
        formData.append("files", blob, `sample_${index}.mp3`);
      });

      const response = await fetch(`${this.baseUrl}/voices/add`, {
        method: "POST",
        headers: {
          "xi-api-key": this.apiKey,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Voice cloning failed: ${error.detail?.message || response.statusText}`);
      }

      const data = await response.json();
      return data.voice_id;
    } catch (error) {
      throw new Error(`Voice cloning failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Generate speech from text using cloned voice
   */
  async generateSpeech(request: VoiceGenerationRequest): Promise<Buffer> {
    const apiKey = request.userApiKey || this.apiKey;
    if (!apiKey) {
      throw new Error("ElevenLabs API key not configured");
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/text-to-speech/${request.voiceId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "xi-api-key": apiKey,
          },
          body: JSON.stringify({
            text: request.text,
            model_id: "eleven_multilingual_v2", // Supports 29 languages
            voice_settings: {
              stability: request.stability ?? 0.5,
              similarity_boost: request.similarityBoost ?? 0.75,
              style: request.style ?? 0.0,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Speech generation failed: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      throw new Error(`Speech generation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Instant voice cloning (lower quality, faster)
   * Good for quick prototyping
   */
  async instantVoiceClone(audioSampleUrl: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error("ElevenLabs API key not configured");
    }

    try {
      // Download audio sample
      const audioResponse = await fetch(audioSampleUrl);
      const audioBuffer = await audioResponse.arrayBuffer();
      const audioBlob = new Blob([audioBuffer], { type: "audio/mpeg" });

      const formData = new FormData();
      formData.append("name", `instant_voice_${Date.now()}`);
      formData.append("files", audioBlob, "sample.mp3");

      const response = await fetch(`${this.baseUrl}/voices/add`, {
        method: "POST",
        headers: {
          "xi-api-key": this.apiKey,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Instant cloning failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.voice_id;
    } catch (error) {
      throw new Error(`Instant voice cloning failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Delete voice from library
   */
  async deleteVoice(voiceId: string): Promise<void> {
    if (!this.apiKey) {
      throw new Error("ElevenLabs API key not configured");
    }

    try {
      const response = await fetch(`${this.baseUrl}/voices/${voiceId}`, {
        method: "DELETE",
        headers: {
          "xi-api-key": this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Voice deletion failed: ${response.statusText}`);
      }
    } catch (error) {
      throw new Error(`Voice deletion failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Calculate credit cost for voice operations
   */
  calculateSpeechCost(textLength: number): number {
    const chunks = Math.ceil(textLength / 100);
    return chunks * VOICE_CREDIT_COSTS.textToSpeech;
  }

  calculateCloningCost(instant: boolean = false): number {
    return instant
      ? VOICE_CREDIT_COSTS.instantVoiceCloning
      : VOICE_CREDIT_COSTS.voiceCloning;
  }
}

export const voiceService = new VoiceService();
