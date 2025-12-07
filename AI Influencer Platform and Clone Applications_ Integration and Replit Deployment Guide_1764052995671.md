# AI Influencer Platform and Clone Applications: Integration and Replit Deployment Guide

This guide provides instructions for deploying the six provided applications on Replit and integrating the AI Influencer Platform (`elite2026`) with the clone applications (TikTok, WhatsApp, OnlyFans, Dating App, and Cluely Clone).

## 1. Overview of Applications and Stacks

| Application | Purpose | Stack | Replit Compatibility |
| :--- | :--- | :--- | :--- |
| **AI Influencer Platform (`elite2026`)** | Core AI persona and content generation service. | Node.js, TypeScript, Express.js, PostgreSQL (Mocked) | High |
| **TikTok Clone** | Social media video sharing platform. | Next.js, React, Tailwind CSS, Firebase (Mocked) | High |
| **WhatsApp Clone** | Real-time messaging and communication platform. | React, Node.js, MongoDB (Mocked), Socket.io | High |
| **OnlyFans Clone** | Subscription-based content sharing platform. | React, Express.js, PostgreSQL (Mocked) | High |
| **Dating App Clone** | Location-based matching and dating platform. | React, Node.js, MongoDB (Mocked), Express.js | High |
| **Cluely Clone** | AI Meeting Assistant/Sales Copilot. | React, TypeScript, Electron (requires local execution) | Medium (Frontend is Replit-compatible, but full functionality requires local desktop app) |

## 2. Replit Deployment Instructions

All projects are designed to be highly compatible with Replit's environment. The general steps for each project are as follows:

1.  **Create a New Repl**: Go to Replit and click the `+` button to create a new Repl.
2.  **Select Template**: Choose the appropriate template based on the project's stack (e.g., `Node.js` for `elite2026`, WhatsApp Backend, Dating App Backend; `Next.js` for TikTok; `React` for WhatsApp/OnlyFans Frontend and Cluely Clone).
3.  **Upload Source Code**: Upload the corresponding `.zip` file. Replit will automatically unzip the contents.
4.  **Install Dependencies**: Open the Shell and run the package manager install command:
    *   For Node.js/Next.js/React projects: `npm install` or `yarn install`
5.  **Configure Environment Variables**: Create a `.env` file or use Replit's **Secrets** feature to set necessary environment variables (e.g., API keys, database connection strings).
6.  **Run the Application**: Use the appropriate run command (e.g., `npm start`, `npm run dev`, or configure the `run` button in `.replit` file).

### Replit-Specific Notes

*   **Database**: For projects requiring a database (PostgreSQL for `elite2026` and OnlyFans Backend, MongoDB for WhatsApp and Dating App Backends), you will need to use a hosted service (e.g., ElephantSQL for PostgreSQL, MongoDB Atlas for MongoDB) and update the connection string in the `.env` file. Replit's built-in database features can also be explored.
*   **Port**: Ensure your application is configured to listen on `0.0.0.0` and the port specified by the `PORT` environment variable, which Replit automatically provides.

## 3. AI Influencer Platform (`elite2026`) Persona Customization

The core of the AI platform is the persona customization, which is controlled by the `systemPrompt` in the `elite2026/src/core/AIService.ts` file.

To modify the AI persona:

1.  Locate the file: `elite2026/src/core/AIService.ts`.
2.  Find the `systemPrompt` variable. It is a multi-line string that defines the AI's identity, background, tone, and rules.
3.  **Edit the `systemPrompt`**: Change the text to define your desired AI influencer persona. You have maximum control here.
    *   *Example:* Change the name, backstory, content style, and interaction rules.
4.  **Rebuild and Deploy**: After editing, you may need to re-run the build process (`npm run build`) and restart the application for the changes to take effect.

## 4. Microservices Integration Guide

The recommended approach for integrating the AI platform with the clone applications is a **Microservices Architecture**.

The `elite2026` platform acts as a dedicated **AI Content Generation Service** accessible via a REST API endpoint.

### Integration Steps

1.  **Deploy `elite2026`**: Deploy the `elite2026` platform first on Replit. Once deployed, Replit will provide a public URL (e.g., `https://elite2026-username.replit.dev`). This is your **AI_SERVICE_URL**.
2.  **Identify Integration Points**: Determine where in the clone applications you want to generate AI content (e.g., a new post on TikTok, a status update on WhatsApp, a private message on OnlyFans, a profile bio on the Dating App, or a generated response from the Cluely Clone).
3.  **Call the API**: In the clone application's backend code (or frontend for simplicity, but backend is recommended for security), make an HTTP POST request to the `elite2026` API endpoint:

    *   **Endpoint**: `[AI_SERVICE_URL]/api/v1/content/generate`
    *   **Method**: `POST`
    *   **Request Body (JSON)**:
        ```json
        {
          "prompt": "User's request or context for the AI",
          "personaDescription": "Optional: A brief, dynamic description to override or supplement the default systemPrompt for this specific request."
        }
        ```
    *   **Response Body (JSON)**:
        ```json
        {
          "content": "The AI-generated text or content."
        }
        ```

### Example Integration (Conceptual)

In the **Dating App Clone** (Node.js/React), you could use the AI service to generate a compelling profile bio:

```javascript
// Example: Dating App Clone Backend (Conceptual)
import axios from 'axios';

async function generateBio(user_interests) {
  const AI_SERVICE_URL = process.env.AI_SERVICE_URL; // Set this in Replit Secrets

  try {
    const response = await axios.post(`${AI_SERVICE_URL}/api/v1/content/generate`, {
      prompt: `Generate a short, witty, and engaging dating profile bio based on these interests: ${user_interests.join(', ')}.`,
      personaDescription: "A helpful, slightly humorous AI assistant for dating profiles."
    });

    return response.data.content;
  } catch (error) {
    console.error('AI Service Error:', error);
    return "Could not generate bio. Please try again.";
  }
}
```

By following this microservices approach, you can easily update the AI persona in one place (`elite2026`) and have the changes reflected across all five clone applications. Note that the Cluely Clone is primarily a desktop application, and while the source code is provided, full functionality may require local compilation and execution outside of the Replit environment.

## 5. Next Steps

All six application source codes are now packaged and ready for delivery. You can proceed with the deployment and customization using this guide.
