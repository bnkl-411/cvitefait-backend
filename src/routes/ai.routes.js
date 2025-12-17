import { Router } from 'express';
import { enhanced, structuredCvData, atsScore } from '../controllers/ai.controller.js';
import {
  validateEnhanceText,
  validateStructureCV,
  validateATSAnalysis
} from '../middlewares/validation.js';
import { rateLimitByIP } from '../middlewares/rateLimit.js';
import { authMiddleware } from '../middlewares/auth.js'


const router = Router();

router.post('/enhance', rateLimitByIP(10, 60000), validateEnhanceText, authMiddleware, enhanced);
router.post('/analyze-ats', rateLimitByIP(5, 60000), validateATSAnalysis, atsScore);
router.post('/structure-cv', validateStructureCV, structuredCvData);

export default router;