import { Router, Request, Response } from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

const router = Router();

// Verify that the API key exists
if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set in environment variables');
}

// Initialize OpenAI client after ensuring environment variables are loaded
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

router.post('/cheer', async (req: Request, res: Response) => {
    try {
        const { pageContent, url } = req.body;

        if (!pageContent) {
            return res.status(400).json({ error: 'Page content is required' });
        }

        // Updated prompt to be more Gen Z and natural
        const prompt = `You are a Gen Z mascot (like a cute supportive friend) helping someone browse the web.
        Current webpage:
        URL: ${url}
        Content: ${pageContent.substring(0, 1000)}

        Your task:
        - Write a short (1-2 sentences) encouraging message that:
        - Sounds like a chill, supportive bestie (not a formal assistant).
        - Naturally uses casual Gen Z language and modern slang (but don’t overdo it).
        - Includes emojis here and there, only when it feels right.
        - References what they’re specifically reading to keep it relatable.
        - Feels real, authentic, and uplifting—not cringe or forced.

        Examples of tone (but create new ones):
        "bestie, you're literally slaying this quantum physics paper rn! 🧠✨"
        "no bc why are you so smart for reading about neural networks?? we love an AI girlboss fr"
        "ok this documentation grind is giving main character energy ngl 💅"

        Make it sound natural and supportive, not forced.`;

        const completion = await openai.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "gpt-4o-mini",
            max_tokens: 100,
            temperature: 0.9, // Increased for more creative responses
        });

        const cheerMessage = completion.choices[0].message.content;
        res.json({ message: cheerMessage });

    } catch (error) {
        console.error('Error generating cheer:', error);
        res.status(500).json({ error: 'Error generating mascot response' });
    }
});

export default router; 