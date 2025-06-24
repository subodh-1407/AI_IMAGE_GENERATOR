import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

console.log("Current directory:", __dirname)
console.log("Looking for .env at:", join(__dirname, '.env'))

const result = dotenv.config({ path: join(__dirname, '.env') })
console.log("Dotenv result:", result)

console.log("MONGODB_URI:", process.env.MONGODB_URI ? "EXISTS" : "NOT FOUND")
console.log("All env vars:", Object.keys(process.env).filter(key => key.includes('MONGO')))