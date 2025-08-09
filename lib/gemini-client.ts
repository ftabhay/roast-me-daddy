import { CONFIG } from "./config"

export interface GeminiRequest {
  prompt: string
  file_urls?: string[]
  add_context_from_internet?: boolean
}

export class GeminiClient {
  private static apiKey = CONFIG.GEMINI_API_KEY

  static async generateContent({ prompt, file_urls, add_context_from_internet }: GeminiRequest): Promise<string> {
    // Check if API key is properly configured
    if (!this.apiKey || this.apiKey.trim() === "") {
      console.error("Gemini API key not found. Please check NEXT_PUBLIC_GEMINI_API_KEY environment variable.")
      throw new Error("Gemini API key not configured.")
    }

    console.log("Using Gemini API with key:", this.apiKey.substring(0, 10) + "...")

    try {
      let requestBody: any

      if (file_urls && file_urls.length > 0) {
        // Handle image analysis with Gemini Vision
        const parts = [{ text: prompt }]

        // Add images to the request
        for (const url of file_urls) {
          try {
            // Fetch image and convert to base64
            const response = await fetch(url, {
              mode: "cors",
              headers: {
                Accept: "image/*",
              },
            })

            if (!response.ok) {
              console.warn(`Failed to fetch image from ${url}:`, response.statusText)
              continue
            }

            const blob = await response.blob()
            const base64 = await this.blobToBase64(blob)

            parts.push({
              inline_data: {
                mime_type: blob.type || "image/jpeg",
                data: base64,
              },
            })
          } catch (imageError) {
            console.error("Error processing image:", imageError)
            // Continue with other images if one fails
          }
        }

        requestBody = {
          contents: [
            {
              parts: parts,
            },
          ],
          generationConfig: CONFIG.GENERATION_CONFIG,
        }
      } else {
        // Handle text-only requests
        requestBody = {
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: CONFIG.GENERATION_CONFIG,
        }
      }

      const model = file_urls && file_urls.length > 0 ? CONFIG.GEMINI_MODELS.VISION : CONFIG.GEMINI_MODELS.TEXT
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("Gemini API Error:", errorData)
        throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || response.statusText}`)
      }

      const data = await response.json()

      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const generatedText = data.candidates[0].content.parts[0].text
        return generatedText.trim()
      } else {
        console.error("Unexpected Gemini response structure:", data)
        throw new Error("Invalid response from Gemini API")
      }
    } catch (error) {
      console.error("Error calling Gemini API:", error)
      throw error
    }
  }

  private static blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(",")[1]
        resolve(base64String)
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  static getContextualFallback(prompt: string): string {
    if (prompt.includes("fashion") || prompt.includes("outfit")) {
      return "Your fashion sense is so questionable, even our AI had to look away. That's an achievement in itself."
    } else if (prompt.includes("typing") || prompt.includes("WPM")) {
      return "Your typing skills are so bad, even our roast generator gave up trying to find appropriate words."
    } else if (prompt.includes("GitHub") || prompt.includes("LinkedIn") || prompt.includes("Instagram")) {
      return "Your online presence is so cringe, it broke our AI. Congratulations on that unique achievement."
    } else {
      return "Something went so wrong that even our AI couldn't process it. That's... actually impressive."
    }
  }
}
