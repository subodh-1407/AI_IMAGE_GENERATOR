import * as dotenv from "dotenv"
import { createError } from "../error.js"

dotenv.config()

// Multiple free services with automatic fallback
const FREE_SERVICES = [
  {
    name: "Pollinations AI",
    generate: async (prompt) => {
      const encodedPrompt = encodeURIComponent(prompt)
      const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&seed=${Math.floor(Math.random() * 1000000)}`

      const response = await fetch(url)
      if (!response.ok) throw new Error(`Pollinations failed: ${response.status}`)

      const buffer = await response.arrayBuffer()
      return Buffer.from(buffer).toString("base64")
    },
  },
  {
    name: "Craiyon API",
    generate: async (prompt) => {
      const response = await fetch("https://api.craiyon.com/v3", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt,
          token: null,
          model: "art",
          negative_prompt: "",
        }),
      })

      if (!response.ok) throw new Error(`Craiyon failed: ${response.status}`)

      const data = await response.json()
      // Craiyon returns base64 images directly
      return data.images[0] // First generated image
    },
  },
  {
    name: "Lexica API",
    generate: async (prompt) => {
      const response = await fetch("https://lexica.art/api/v1/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q: prompt,
          searchMode: "images",
          source: "search",
          cursor: 0,
          model: "lexica-aperture-v2",
        }),
      })

      if (!response.ok) throw new Error(`Lexica failed: ${response.status}`)

      const data = await response.json()
      if (!data.images || data.images.length === 0) {
        throw new Error("No images found")
      }

      // Get a random image from results and convert to base64
      const randomImage = data.images[Math.floor(Math.random() * Math.min(5, data.images.length))]
      const imageResponse = await fetch(randomImage.src)
      const buffer = await imageResponse.arrayBuffer()
      return Buffer.from(buffer).toString("base64")
    },
  },
]

export const generateImage = async (req, res, next) => {
  try {
    const { prompt } = req.body

    if (!prompt || prompt.trim() === "") {
      return next(createError(400, "Prompt is required"))
    }

    console.log("Generating image with prompt:", prompt)

    // Try each service until one works
    for (const service of FREE_SERVICES) {
      try {
        console.log(`Trying ${service.name}...`)

        const base64Image = await service.generate(prompt.trim())

        console.log(`✅ Success with ${service.name}`)

        return res.status(200).json({
          photo: base64Image,
          service: service.name,
          message: `Image generated successfully with ${service.name}`,
        })
      } catch (serviceError) {
        console.log(`❌ ${service.name} failed:`, serviceError.message)
        continue // Try next service
      }
    }

    // If all services fail, return error
    throw new Error("All image generation services are currently unavailable")
  } catch (error) {
    console.error("Image Generation Error:", error)
    next(createError(500, error.message || "Failed to generate image"))
  }
}
