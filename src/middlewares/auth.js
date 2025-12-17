import jwt from 'jsonwebtoken'
import { JWT_CONFIG } from '../config/jwt.js'

export const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies[JWT_CONFIG.cookie.name]
        if (!token) {
            return res.status(401).json({ error: 'Non authentifié' })
        }

        const decoded = jwt.verify(token, JWT_CONFIG.secret)

        req.userId = decoded.userId
        req.slug = decoded.slug

        next()
    } catch (error) {
        res.status(401).json({ error: 'Token invalide' })
    }
}