import { Router } from 'express';
import { celebrate, Joi } from 'celebrate';
import {
  getMe,
  updateMe,
  deleteMe,
  getUserStats,
  changePassword,
} from '../controllers/users.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/me', getMe);

router.patch('/me',
  celebrate({
    body: Joi.object({
      name: Joi.string().min(2).optional(),
      email: Joi.string().email().optional(),
    }),
  }),
  updateMe
);

router.delete('/me', deleteMe);

router.get('/me/stats', getUserStats);

router.patch('/me/password',
  celebrate({
    body: Joi.object({
      oldPassword: Joi.string().required(),
      newPassword: Joi.string().min(6).required(),
    }),
  }),
  changePassword
);

export default router;