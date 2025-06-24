import { HfInference } from '@huggingface/inference'

const hf = new HfInference('hf_your_token_here') // Get free token from huggingface.co

const testHuggingFace = async () => {
  try {
    console.log("Testing Hugging Face image generation...")
    
    const response = await hf.textToImage({
      model: 'stabilityai/stable-diffusion-2',
      inputs: 'a red apple on a table',
    })
    
    console.log("✅ Hugging Face working!")
    // Convert response to base64 for your app
    
  } catch (error) {
    console.error("❌ Hugging Face failed:", error.message)
  }
}

testHuggingFace()