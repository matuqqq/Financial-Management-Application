import { Router } from 'express';
import { getMonthlySummary } from '../controllers/summary.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/monthly', getMonthlySummary);

export default router;
