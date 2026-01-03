/**
 * AI PROVIDER CONFIGURATION
 * 
 * This file centralizes all configuration for AI providers.
 * It includes API keys, model names, and routing rules for cost optimization.
 * This is the brain of our AI operation.
 */

export interface AIProvider {
  name: string;
  apiKey: string | undefined;
  models: {
    [key: string]: string; // e.g., { fast: 'llama3-8b-8192', powerful: 'llama3-70b-8192' }
  };
  baseUrl?: string; // For local providers like Ollama
  costPerToken?: number; // For future cost tracking
  speed?: number; // Relative speed ranking (lower is faster)
  capabilities?: string[]; // e.g., ['text', 'vision', 'audio']
}

export const aiProviders: { [key: string]: AIProvider } = {
  // --- Free & Fast Providers (Our Primary Workhorses) ---
  groq: {
    name: 'Groq',
    apiKey: process.env.GROQ_API_KEY,
    models: {
      fast: 'llama3-8b-8192',
      balanced: 'llama3-70b-8192',
    },
    speed: 1, // Fastest
    capabilities: ['text'],
  },
  ollama: {
    name: 'Ollama',
    apiKey: 'not-required', // Ollama doesn't use an API key
    models: {
      local: 'llama3', // Assumes user has llama3 pulled
    },
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    speed: 2, // Fast, but depends on local hardware
    capabilities: ['text'],
  },
  gemini: {
    name: 'Google Gemini',
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    models: {
      fast: 'gemini-1.5-flash',
      powerful: 'gemini-1.5-pro',
    },
    speed: 3,
    capabilities: ['text', 'vision'],
  },

  // --- Existing & Premium Providers (For High-Value Tasks) ---
  openai: {
    name: 'OpenAI',
    apiKey: process.env.OPENAI_API_KEY,
    models: {
      default: 'gpt-4o',
      vision: 'gpt-4o',
      audio: 'whisper-1',
      video: 'sora-2', // Placeholder for future Sora 2 integration
    },
    speed: 4,
    capabilities: ['text', 'vision', 'audio', 'video'],
  },
  anthropic: {
    name: 'Anthropic',
    apiKey: process.env.ANTHROPIC_API_KEY,
    models: {
      default: 'claude-3-5-sonnet-20240620',
    },
    speed: 4,
    capabilities: ['text', 'vision'],
  },
};

// --- Routing Rules ---
// These rules define which provider/model to use for a given task.
// This is how we optimize for cost and speed.
export const routingRules = {
  // For simple, fast text generation (e.g., chat, comments, ad scripts)
  text_fast: {
    provider: 'groq',
    model: 'fast',
  },
  // For more complex text generation (e.g., content creation, analysis)
  text_balanced: {
    provider: 'groq',
    model: 'balanced',
  },
  // For tasks requiring privacy (e.g., sensitive data, offline mode)
  text_private: {
    provider: 'ollama',
    model: 'local',
  },
  // For complex reasoning with vision (e.g., analyzing images)
  multimodal_reasoning: {
    provider: 'openai',
    model: 'vision',
  },
  // For premium, state-of-the-art tasks (e.g., AI Co-Pilot)
  agi_core: {
    provider: 'openai', // Will be updated to 'agi' when available
    model: 'default',
  },
};

// --- Fallback Chain ---
// If a provider fails, the system will try the next one in the chain.
// This ensures our app is resilient and never goes down.
export const fallbackChain = [
  'groq',       // Primary: Fast and free
  'gemini',      // Secondary: Good free tier
  'ollama',      // Tertiary: If local setup is available
  'openai',      // Quaternary: Paid, reliable fallback
  'anthropic',   // Final: Paid, reliable fallback
];
