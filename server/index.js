import cors from "cors"
import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"  // ← Changed this line
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import PostRouter from "./routes/Posts.js"
import GenerateImageRouter from "./routes/GenerateImage.js"

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables with explicit path
const envPath = join(__dirname, '.env')
console.log("Looking for .env file at:", envPath)

const result = dotenv.config({ path: envPath })
if (result.error) {
  console.error("Error loading .env file:", result.error)
} else {
  console.log("✅ .env file loaded successfully")
}

// Debug environment variables
console.log("Environment variables check:")
console.log("MONGODB_URI exists:", !!process.env.MONGODB_URI)
console.log("OPENAI_API_KEY exists:", !!process.env.OPENAI_API_KEY)
console.log("PORT:", process.env.PORT)

const app = express()

// Middleware
app.use(cors())
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ extended: true }))

// Routes
app.use("/api/post", PostRouter)
app.use("/api/generateImage", GenerateImageRouter)

// Default route
app.get("/", async (req, res) => {
  res.status(200).json({
    message: "Hello GFG Developers!",
  })
})

// 404 handler for undefined routes
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  })
})

// Error handling middleware (must be last)
app.use((err, req, res, next) => {
  console.error("Error occurred:", err)

  const status = err.status || err.statusCode || 500
  const message = err.message || "Something went wrong!"

  return res.status(status).json({
    success: false,
    status,
    message: process.env.NODE_ENV === "production" ? "Internal Server Error" : message,
  })
})

// Function to connect to MongoDB
// Function to connect to MongoDB
const connectDB = async () => {
  try {
    mongoose.set("strictQuery", true)

    const mongoURI = process.env.MONGODB_URI

    if (!mongoURI) {
      throw new Error("MongoDB connection string not found in environment variables")
    }

    console.log("Connecting to MongoDB...")
    
    // Add connection options for better error handling
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000, // 10 seconds
      socketTimeoutMS: 45000, // 45 seconds
    })
    
    console.log("✅ MongoDB Connected Successfully")
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB:", err.message)
    
    // Provide helpful error messages
    if (err.message.includes('IP')) {
      console.error("💡 Solution: Add your IP address to MongoDB Atlas whitelist")
      console.error("   1. Go to MongoDB Atlas → Network Access")
      console.error("   2. Click 'Add IP Address'")
      console.error("   3. Click 'Add Current IP Address' or 'Allow Access from Anywhere'")
    }
    
    process.exit(1)
  }
}

// Function to start the server
const startServer = async () => {
  try {
    await connectDB()

    const PORT = process.env.PORT || 8080
    app.listen(PORT, () => {
      console.log(`🚀 Server started on port ${PORT}`)
      console.log(`📍 Server running at http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error("❌ Failed to start server:", error)
    process.exit(1)
  }
}

startServer()