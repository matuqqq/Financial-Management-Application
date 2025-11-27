import { Router } from 'express';
import { celebrate, Joi } from 'celebrate';
import {
  getMe,
  updateMe,
  deleteMe,
  getUserStats,
  changePassword,
  updateSavingsGoal,
  updateExpenseBudget,
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

router.patch('/me/savings-goal',
  celebrate({
    body: Joi.object({
      savingsGoal: Joi.number().positive().required(),
    }),
  }),
  updateSavingsGoal
);

router.patch('/me/expense-budget',
  celebrate({
    body: Joi.object({
      expenseBudget: Joi.number().positive().required(),
    }),
  }),
  updateExpenseBudget
);

export default router;