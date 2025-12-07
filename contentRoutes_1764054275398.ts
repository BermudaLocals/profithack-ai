import { Router, Request, Response } from 'express';
import { generateContent, ContentRequest } from '../../core/AIService';

const router = Router();

/**
 * POST /api/v1/content/generate
 * Generates content based on a provided persona and topic.
 */
router.post('/generate', async (req: Request<{}, {}, ContentRequest>, res: Response) => {
    const { personaName, personaDescription, contentTopic, tone, length } = req.body;

    // Basic input validation
    if (!personaName || !personaDescription || !contentTopic || !tone || !length) {
        return res.status(400).json({ error: 'Missing required fields: personaName, personaDescription, contentTopic, tone, and length are required.' });
    }

    try {
        const generatedContent = await generateContent({
            personaName,
            personaDescription,
            contentTopic,
            tone,
            length
        });

        res.json({
            success: true,
            persona: personaName,
            topic: contentTopic,
            content: generatedContent
        });
    } catch (error) {
        console.error('Error generating content:', error);
        res.status(500).json({ error: 'Internal server error during content generation.' });
    }
});

export default router;
