import { GoogleGenAI } from '@google/genai'
import dotenv from 'dotenv'

dotenv.config()

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY manquante dans .env')
}

const MODEL = 'gemini-2.5-flash'

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
})

export { ai, MODEL }