import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth.js'
import { signup, login, getMe } from '../controllers/auth.controller.js'

const router = Router()

router.post('/signup', signup)
router.post('/login', login)
router.get('/me', authMiddleware, getMe)

export default router