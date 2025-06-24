import dotenv from 'dotenv'
import OpenAI from 'openai'
import { v2 as cloudinary } from 'cloudinary'

dotenv.config()

// Test OpenAI
const testOpenAI = async () => {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
    
    console.log("Testing OpenAI...")
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: "a simple red circle",
      n: 1,
      size: "1024x1024",
      response_format: "url",
    })
    
    console.log("✅ OpenAI API working! Image URL:", response.data[0].url)
  } catch (error) {
    console.error("❌ OpenAI API failed:", error.message)
  }
}

// Test Cloudinary
const testCloudinary = async () => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    })
    
    console.log("Testing Cloudinary...")
    const result = await cloudinary.api.ping()
    console.log("✅ Cloudinary API working!", result)
  } catch (error) {
    console.error("❌ Cloudinary API failed:", error.message)
  }
}

// Run tests
const runTests = async () => {
  console.log("🧪 Testing API Keys...")
  await testOpenAI()
  await testCloudinary()
}

runTests()