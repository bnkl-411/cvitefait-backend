import { Router } from 'express';
import aiRoutes from './ai.routes.js';
import authRoutes from './auth.routes.js';
import cvRoutes from './cv.routes.js';
import pdfRoutes from './pdf.routes.js';

const router = Router();

router.use('/ai', aiRoutes);
router.use('/auth', authRoutes);
router.use('/cv', cvRoutes);
router.use('/pdf', pdfRoutes);

export default router;