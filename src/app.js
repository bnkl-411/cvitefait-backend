import express from 'express'
import cookieParser from 'cookie-parser'
import path from 'path'
import { fileURLToPath } from 'url'
import { getRedisClient } from './config/redis.js';

import cors from 'cors'
import routes from './routes/index.js'
import { errorHandler, notFound } from './middlewares/errorHandler.js'
import { CacheService } from './services/cache.service.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const app = express()

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))

app.use(express.json({ limit: '10mb' }))

await getRedisClient();

app.use(cookieParser())

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
console.log('Dossier uploads monté sur /uploads')
console.log('Chemin absolu:', path.join(__dirname, 'uploads'))

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  })
})

app.get('/cache/stats', (req, res) => {
  res.json(CacheService.getStats())
})

app.use('/api', routes)

app.use(notFound)
app.use(errorHandler)

export default app