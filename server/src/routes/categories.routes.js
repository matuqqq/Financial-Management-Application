import { Router } from 'express';
import { celebrate, Joi } from 'celebrate';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categories.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getCategories);

router.post('/',
  authorize('admin', 'user'), // Allow both admin and regular users to create categories
  celebrate({
    body: Joi.object({
      name: Joi.string().required(),
    }),
  }),
  createCategory
);

router.patch('/:id',
  authorize('admin'),
  celebrate({
    params: Joi.object({
      id: Joi.number().integer().required(),
    }),
    body: Joi.object({
      name: Joi.string().required(),
    }),
  }),
  updateCategory
);

router.delete('/:id',
  authorize('admin'),
  celebrate({
    params: Joi.object({
      id: Joi.number().integer().required(),
    }),
  }),
  deleteCategory
);

export default router;