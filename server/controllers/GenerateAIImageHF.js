import * as dotenv from "dotenv"
import { createError } from "../error.js"

dotenv.config()

// Controller using Hugging Face (Free)
export const generateImage = async (req, res, next) => {
  try {
    const { prompt } = req.body

    if (!prompt || prompt.trim() === "") {
      return next(createError(400, "Prompt is required"))
    }

    console.log("Generating image with Hugging Face:", prompt)

    const response = await fetch("https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1", {
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        inputs: prompt.trim(),
        parameters: {
          width: 1024,
          height: 1024,
          num_inference_steps: 20,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.status}`)
    }

    const imageBuffer = await response.arrayBuffer()
    const base64Image = Buffer.from(imageBuffer).toString("base64")

    console.log("✅ Image generated successfully with Hugging Face")

    return res.status(200).json({
      photo: base64Image,
      service: "Hugging Face",
      message: "Image generated successfully",
    })
  } catch (error) {
    console.error("Hugging Face Error:", error)
    next(createError(500, error.message || "Failed to generate image"))
  }
}
