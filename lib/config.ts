// Configuration file for API keys and settings
export const CONFIG = {
  // Use the environment variable that's already available
  GEMINI_API_KEY: process.env.NEXT_PUBLIC_GEMINI_API_KEY || "",

  // Gemini API settings
  GEMINI_MODELS: {
    TEXT: "gemini-1.5-flash",
    VISION: "gemini-1.5-flash",
  },

  // Generation settings
  GENERATION_CONFIG: {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 2048,
  },
}
