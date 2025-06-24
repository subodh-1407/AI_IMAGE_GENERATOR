import * as dotenv from "dotenv"
import { createError } from "../error.js"

dotenv.config()

// Controller to generate Image using Pollinations AI (Free)
export const generateImage = async (req, res, next) => {
  try {
    console.log("Received request body:", req.body)

    const { prompt } = req.body

    if (!prompt || prompt.trim() === "") {
      console.log("No prompt provided")
      return next(createError(400, "Prompt is required"))
    }

    console.log("Generating image with prompt:", prompt)

    // Use Pollinations AI (completely free, no API key needed)
    const encodedPrompt = encodeURIComponent(prompt.trim())
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&seed=${Math.floor(Math.random() * 1000000)}`

    console.log("Pollinations URL:", imageUrl)

    // Fetch the image and convert to base64
    const response = await fetch(imageUrl)

    if (!response.ok) {
      throw new Error(`Failed to generate image: ${response.status}`)
    }

    const imageBuffer = await response.arrayBuffer()
    const base64Image = Buffer.from(imageBuffer).toString("base64")

    console.log("✅ Image generated successfully with Pollinations AI")

    return res.status(200).json({
      photo: base64Image,
      service: "Pollinations AI",
      message: "Image generated successfully with free service",
    })
  } catch (error) {
    console.error("Pollinations AI Error:", error)

    // Fallback to a different free service
    try {
      console.log("Trying fallback service...")
      return await generateWithFallback(req, res, next)
    } catch (fallbackError) {
      console.error("All services failed:", fallbackError)
      next(createError(500, "Failed to generate image with all available services"))
    }
  }
}

// Fallback function using a different free service
async function generateWithFallback(req, res, next) {
  const { prompt } = req.body

  // Use Picsum for random images as last resort
  const fallbackUrl = `https://picsum.photos/1024/1024?random=${Math.floor(Math.random() * 1000)}`

  const response = await fetch(fallbackUrl)
  const imageBuffer = await response.arrayBuffer()
  const base64Image = Buffer.from(imageBuffer).toString("base64")

  return res.status(200).json({
    photo: base64Image,
    service: "Picsum (Random)",
    message: `Fallback service used. Original prompt: "${prompt}"`,
  })
}
