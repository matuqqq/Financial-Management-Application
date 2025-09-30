import { Router } from 'express';
import { celebrate, Joi } from 'celebrate';
import {
  register,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
} from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authRateLimit } from '../middlewares/rateLimit.middleware.js';

const router = Router();

// Apply rate limiting to auth routes
router.use(authRateLimit);

router.post('/register', 
  celebrate({
    body: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
      name: Joi.string().min(2).optional(),
    }),
  }),
  register
);

router.post('/login',
  celebrate({
    body: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    }),
  }),
  login
);

router.post('/refresh',
  celebrate({
    body: Joi.object({
      refreshToken: Joi.string().required(),
    }),
  }),
  refresh
);

router.post('/logout',
  celebrate({
    body: Joi.object({
      refreshToken: Joi.string().optional(),
    }),
  }),
  logout
);

router.post('/forgot-password',
  celebrate({
    body: Joi.object({
      email: Joi.string().email().required(),
    }),
  }),
  forgotPassword
);

router.post('/reset-password',
  celebrate({
    body: Joi.object({
      token: Joi.string().required(),
      newPassword: Joi.string().min(6).required(),
    }),
  }),
  resetPassword
);

router.post('/change-password',
  authenticate,
  celebrate({
    body: Joi.object({
      oldPassword: Joi.string().required(),
      newPassword: Joi.string().min(6).required(),
    }),
  }),
  changePassword
);

export default router;