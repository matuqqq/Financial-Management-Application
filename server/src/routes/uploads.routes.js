import { Router } from 'express';
import { upload, uploadFile } from '../controllers/uploads.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post('/', upload.single('file'), uploadFile);

export default router;