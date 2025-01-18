import { Router, Request, Response } from "express";
import OpenAI from "openai";
import dotenv from "dotenv";

// Ensure environment variables are loaded
dotenv.config();

const router = Router();

// Verify that the API key exists
if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set in environment variables");
}

// Initialize OpenAI client after ensuring environment variables are loaded
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/cheer", async (req: Request, res: Response) => {
  try {
    const { pageContent, hat } = req.body;

    if (!pageContent) {
      return res.status(400).json({ error: "Page content is required" });
    }

    const personalityDesc = hat?.description || "friendly and supportive";
    const prompt = `You are a Gen Z mascot (like a cute supportive friend) helping someone browse the web.
        Your personality: ${personalityDesc}
        
        Current webpage:
        Content: ${pageContent.substring(0, 1000)}

        Your task:
        - Write a short (1-2 sentences) message that:
        - Matches your hat's personality perfectly
        - References what they're specifically reading to keep it relatable
        - Feels real, authentic, and uplifting—not cringe or forced

        Make it sound natural and supportive, not forced.`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4",
      max_tokens: 100,
      temperature: 0.9,
    });

    const cheerMessage = completion.choices[0].message.content;
    res.json({ message: cheerMessage });
  } catch (error) {
    console.error("Error generating cheer:", error);
    res.status(500).json({ error: "Error generating mascot response" });
  }
});

export default router;
