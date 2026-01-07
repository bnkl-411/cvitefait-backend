import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth.js'
import { cvToPdf, clearPdfCache } from '../controllers/pdf.controller.js'


const router = Router()

router.post('/generate', authMiddleware, cvToPdf)
router.delete('/cache', clearPdfCache)

export default router
