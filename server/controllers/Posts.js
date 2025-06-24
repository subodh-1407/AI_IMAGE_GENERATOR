import Post from "../models/Posts.js"
import dotenv from "dotenv"  // ← Changed this line
import { createError } from "../error.js"
import { v2 as cloudinary } from "cloudinary"

dotenv.config()

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Get all posts
export const getAllPosts = async (req, res, next) => {
  try {
    const posts = await Post.find({}).sort({ createdAt: -1 })
    return res.status(200).json({ success: true, data: posts })
  } catch (error) {
    console.error("Get Posts Error:", error)
    next(createError(error.status || 500, error?.message || "Failed to fetch posts"))
  }
}

// Create Post
export const createPost = async (req, res, next) => {
  try {
    const { name, prompt, photo } = req.body

    // Validate required fields
    if (!name || !prompt || !photo) {
      return next(createError(400, "Name, prompt, and photo are required"))
    }

    console.log("Creating post for:", name)

    // Upload image to Cloudinary
    const photoUrl = await cloudinary.uploader.upload(photo, {
      folder: "ai-generated-images",
      resource_type: "image",
    })

    const newPost = await Post.create({
      name,
      prompt,
      photo: photoUrl?.secure_url,
    })

    console.log("Post created successfully:", newPost._id)
    return res.status(201).json({ success: true, data: newPost })
  } catch (error) {
    console.error("Create Post Error:", error)
    next(createError(error.status || 500, error?.message || "Failed to create post"))
  }
}