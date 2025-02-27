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

// Define page categories and their productivity levels
const PAGE_CATEGORIES = {
  ACADEMIC: [
    "arxiv.org",
    "scholar.google",
    "research",
    "paper",
    "academic",
    "study",
  ],
  DOCUMENTATION: ["docs.", "documentation", "learn", "tutorial", "guide"],
  PRODUCTIVITY: ["github.com", "gitlab.com", "stackoverflow.com", "coding"],
  ENTERTAINMENT: [
    "tiktok",
    "youtube.com",
    "instagram.com",
    "facebook.com",
    "twitter.com",
    "reddit.com",
  ],
  SHOPPING: ["amazon.com", "shopping", "store"],
  NEWS: ["news", "current events", "articles"],
} as const;

// Helper function to categorize a page based on content and URL
async function categorizePage(
  content: string,
  url: string,
  openaiClient: OpenAI
): Promise<string[]> {
  // First try the predefined categories
  const categories: string[] = [];
  const lowerContent = content.toLowerCase();
  const lowerUrl = url.toLowerCase();

  Object.entries(PAGE_CATEGORIES).forEach(([category, keywords]) => {
    if (
      keywords.some(
        (keyword) =>
          lowerContent.includes(keyword) || lowerUrl.includes(keyword)
      )
    ) {
      categories.push(category);
    }
  });

  // If no predefined categories match, use AI to analyze the content
  if (categories.length === 0) {
    try {
      const prompt = `Analyze this webpage content and URL to determine its category.
        URL: ${url}
        Content: ${content.substring(0, 1000)}

        Categorize this page into one or more of these categories:
        - ACADEMIC (educational, research, learning materials)
        - DOCUMENTATION (technical guides, API docs, manuals)
        - PRODUCTIVITY (work-related, development, tools)
        - ENTERTAINMENT (social media, videos, games)
        - SHOPPING (e-commerce, products)
        - NEWS (current events, articles)
        - OTHER (specify what it is)

        Return only the category names, separated by commas. If it's OTHER, include a brief description in parentheses.
        Example responses:
        "ENTERTAINMENT, PRODUCTIVITY"
        "OTHER (job application page)"
        "ACADEMIC, DOCUMENTATION"`;

      const completion = await openaiClient.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "gpt-4o-mini",
        max_tokens: 50,
        temperature: 0.3,
      });

      const aiCategories = completion.choices[0].message.content
        ?.split(",")
        .map((cat) => cat.trim())
        .filter((cat) => cat.length > 0);

      return aiCategories || ["UNKNOWN"];
    } catch (error) {
      console.log("Error in AI categorization:", error);
      return ["UNKNOWN"];
    }
  }

  return categories;
}

// Helper function to determine productivity transition
function analyzeTransition(prevCategories: string[], newCategories: string[]) {
  const productiveCategories = ["ACADEMIC", "DOCUMENTATION", "PRODUCTIVITY"];
  const nonProductiveCategories = ["ENTERTAINMENT", "SHOPPING"];

  const wasProd = prevCategories.some((cat) =>
    productiveCategories.includes(cat)
  );
  const wasNonProd = prevCategories.some((cat) =>
    nonProductiveCategories.includes(cat)
  );
  const isProd = newCategories.some((cat) =>
    productiveCategories.includes(cat)
  );
  const isNonProd = newCategories.some((cat) =>
    nonProductiveCategories.includes(cat)
  );

  return {
    productiveToNonProductive: wasProd && isNonProd,
    nonProductiveToProductive: wasNonProd && isProd,
    stayedProductive: wasProd && isProd,
    stayedNonProductive: wasNonProd && isNonProd,
  };
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Original cheer endpoint
router.post("/cheer", async (req: Request, res: Response) => {
  try {
    const { pageContent, personality } = req.body;

    if (!pageContent) {
      return res.status(400).json({ error: "Page content is required" });
    }

    console.log(personality);

    const prompt = `You are a Gen Z mascot (like a cute supportive friend) helping someone browse the web.
        Your personality: ${personality}
        
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
      model: "gpt-4o-mini",
      max_tokens: 100,
      temperature: 0.9,
    });

    const cheerMessage = completion.choices[0].message.content;
    res.json({ message: cheerMessage });
  } catch (error) {
    console.log("Error generating cheer:", error);
    res.status(500).json({ error: "Error generating mascot response" });
  }
});

// New pageswitch endpoint
router.post("/pageswitch", async (req: Request, res: Response) => {
  try {
    const { currentContent, currentUrl, previousContent, previousUrl, hat } =
      req.body;

    if (!currentContent || !previousContent) {
      return res
        .status(400)
        .json({ error: "Both current and previous page content are required" });
    }

    // Categorize current and previous pages using AI-enhanced categorization
    const currentCategories = await categorizePage(
      currentContent,
      currentUrl,
      openai
    );
    const previousCategories = await categorizePage(
      previousContent,
      previousUrl,
      openai
    );

    // Analyze the transition
    const transition = analyzeTransition(previousCategories, currentCategories);

    const personalityDesc = hat?.description || "friendly and supportive";
    const prompt = `You are a Gen Z mascot (like a cute supportive friend) helping someone browse the web.
        Your personality: ${personalityDesc}
        
        Previous page categories: ${previousCategories.join(", ")}
        Current page categories: ${currentCategories.join(", ")}
        Transition type: ${Object.entries(transition)
          .filter(([_, value]) => value)
          .map(([key]) => key)
          .join(", ")}

        Current webpage:
        Content: ${currentContent.substring(0, 1000)}

        Based on the transition type and specific categories, respond appropriately:
        - If productive -> non-productive: Express disappointment or playful concern
        - If non-productive -> productive: Show excitement and encouragement
        - If stayed productive: Maintain enthusiasm
        - If stayed non-productive: Express increasing concern
        - For OTHER categories: Acknowledge the specific activity they're doing

        Write a short (1-2 sentences) message that:
        - Matches your hat's personality
        - References the specific transition or content
        - Uses natural Gen Z language without being cringe
        - Keeps the tone playful but genuine
        - If it's an OTHER category, incorporate what they're specifically doing

        Examples:
        - For job applications: "bestie securing that bag! 💼 love watching you invest in your future fr fr"
        - For health/fitness: "going from twitter to workout routines? health queen behavior detected! 💪✨"
        
        Make it sound natural and supportive, not forced.`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4o-mini",
      max_tokens: 100,
      temperature: 0.9,
    });

    const switchMessage = completion.choices[0].message.content;
    res.json({
      message: switchMessage,
      categories: currentCategories,
      transition: transition,
    });
  } catch (error) {
    console.log("Error generating page switch response:", error);
    res.status(500).json({ error: "Error generating mascot response" });
  }
});

// New switch endpoint with single OpenAI call
router.post("/switch", async (req: Request, res: Response) => {
  try {
    const { currentContent, currentUrl, previousContent, previousUrl, hat } =
      req.body;

    if (!currentContent || !previousContent) {
      return res
        .status(400)
        .json({ error: "Both current and previous page content are required" });
    }

    const personalityDesc = hat?.description || "friendly and supportive";
    const prompt = `You are a Gen Z mascot (like a cute supportive friend) helping someone browse the web.
        Your personality: ${personalityDesc}

        The user just switched from:
        Previous URL: ${previousUrl}
        Previous content: ${previousContent.substring(0, 500)}

        To:
        Current URL: ${currentUrl}
        Current content: ${currentContent.substring(0, 500)}

        Analyze this transition and respond with a message that:
        1. First, understand what kind of content they switched from and to (e.g., from study material to entertainment, from social media to job applications, etc.)
        2. Based on the nature of the transition:
           - If switching from productive to non-productive: Express playful disappointment
           - If switching from non-productive to productive: Show excitement and pride
           - If staying productive: Maintain enthusiasm and encourage
           - If staying non-productive: Express increasing concern
           - For any other interesting transitions: Acknowledge the specific change

        Your response should:
        - Be 1-2 sentences max
        - Use natural Gen Z language and slang (but don't overdo it)
        - Include relevant emojis occasionally
        - Reference specific details from their browsing
        - Match your personality type
        - Sound like a supportive friend, not a formal assistant
        - Keep it playful but genuine

        Examples of tone (but create new ones):
        "bestie, you're literally trading quantum physics for cat videos rn? 😭 the academic girlboss era was serving"
        "going from twitter drama to leetcode grinding?? we love this character development fr fr 📚✨"
        "the way you're jumping from one research paper to another... intellectual slay bestie! 🧠"

        Make it sound natural and supportive, not forced.`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4o-mini",
      max_tokens: 100,
      temperature: 0.9,
    });

    const switchMessage = completion.choices[0].message.content;
    res.json({ message: switchMessage });
  } catch (error) {
    console.log("Error generating switch response:", error);
    res.status(500).json({ error: "Error generating mascot response" });
  }
});

export default router;
