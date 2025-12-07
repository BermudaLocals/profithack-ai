# API Key Activation Guide: Unlocking ProfitHack AI's Full Potential

This guide provides the step-by-step instructions to acquire and integrate the necessary API keys, activating the platform's most advanced AI features (Sora 2, AI Chat, Voice Cloning, and AI Avatars).

## 1. Prerequisites: The Secrets Manager

All API keys must be stored securely as environment variables in your secrets manager (e.g., Vercel Environment Variables, AWS Secrets Manager, or your local `.env` file).

| Feature | Provider | Environment Variable | Estimated Monthly Cost |
| :--- | :--- | :--- | :--- |
| **Sora 2, AI Chat, Code AI** | OpenAI | `OPENAI_API_KEY` | $50/month |
| **AI Voice Cloner** | ElevenLabs | `ELEVENLABS_API_KEY` | $99/month |
| **AI Avatar Creator** | D-ID or HeyGen | `D_ID_API_KEY` or `HEYGEN_API_KEY` | $29 - $99/month |

## 2. Step-by-Step Key Acquisition & Integration

### A. OpenAI API Key

1.  **Acquire Key:** Go to the [OpenAI Platform](https://platform.openai.com/) and create a new API key.
2.  **Enable Billing:** Ensure a payment method is attached to your account to avoid rate limits on the powerful models (GPT-4, Sora 2).
3.  **Integration:** Set the key in your secrets manager:
    ```bash
    OPENAI_API_KEY="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    ```
4.  **Testing:** The AI Chat, Code Assistant, and Sora 2 agents will automatically connect upon service restart.

### B. ElevenLabs API Key

1.  **Acquire Key:** Go to the [ElevenLabs Website](https://elevenlabs.io/) and subscribe to a Creator or higher plan ($22/month minimum, $99/month recommended for high volume).
2.  **Integration:** Set the key in your secrets manager:
    ```bash
    ELEVENLABS_API_KEY="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    ```
3.  **Testing:** Navigate to the `/ai-cloner` page and test the voice cloning feature.

### C. D-ID or HeyGen API Key (AI Avatar Creator)

Choose one provider for the AI Avatar feature.

#### Option 1: D-ID

1.  **Acquire Key:** Go to the [D-ID Website](https://www.d-id.com/) and sign up for a plan.
2.  **Integration:** Set the key in your secrets manager:
    ```bash
    D_ID_API_KEY="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    ```

#### Option 2: HeyGen

1.  **Acquire Key:** Go to the [HeyGen Website](https://www.heygen.com/) and sign up for a plan.
2.  **Integration:** Set the key in your secrets manager:
    ```bash
    HEYGEN_API_KEY="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    ```
3.  **Testing:** Navigate to the `/ai-cloner` page and test the avatar generation feature.

## 3. Final Action

After setting all keys, you must **restart all microservices** (especially the `Sora 2 Video Gen` service on port `50055` and the `AI Chat` service) to load the new environment variables.

This completes the activation of all high-value AI features, moving the platform to near 100% completion.
