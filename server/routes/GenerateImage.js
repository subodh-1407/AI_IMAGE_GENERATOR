import express from "express"
import { generateImage } from "../controllers/GenerateAIImage.js" // Using Pollinations (Option 1)
// import { generateImage } from "../controllers/GenerateAIImageHF.js" // For Hugging Face (Option 2)
// import { generateImage } from "../controllers/GenerateAIImageMulti.js" // For Multiple Services (Option 3)

const router = express.Router()

router.post("/", generateImage)

export default router
