import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth.js'
import {
    createCv,
    findCvBySlug,
    saveCv,
    getMyCv,
    deleteMyCv
} from '../controllers/cv.controller.js'
import { cvToPdf } from '../controllers/pdf.controller.js'
import { rateLimit, ipKeyGenerator } from 'express-rate-limit'


const router = Router()

const cvLimiter = rateLimit({
    windowMs: 60000, // 1 minute
    max: 4, // requêtes par minute par IP,
    keyGenerator: (req) => {
        const ipKey = ipKeyGenerator(req.ip)
        return `${ipKey}:${req.params.slug}`
    },
    message: 'Too many requests',
    handler: function (req, res, next, options) {
        res.status(429).json({
            message: 'Too many requests - please consider donating for me bigger server <3'
        })
    },
})

router.post('/generate', authMiddleware, cvToPdf)
router.post('/create', authMiddleware, createCv)
router.get('/:slug', cvLimiter, findCvBySlug)
router.post('/save', authMiddleware, saveCv)
router.get('/my/data', authMiddleware, getMyCv)
router.delete('/my/data', authMiddleware, deleteMyCv)

export default router
