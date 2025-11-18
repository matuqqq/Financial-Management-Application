import { Router } from 'express';
import { celebrate, Joi } from 'celebrate';
import {
  getItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
  getItemStats,
} from '../controllers/items.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/',
  celebrate({
    query: Joi.object({
      page: Joi.number().integer().min(1).optional(),
      limit: Joi.number().integer().min(1).max(100).optional(),
      from: Joi.date().iso().optional(),
      to: Joi.date().iso().optional(),
      category: Joi.number().integer().optional(),
      type: Joi.string().valid('income', 'expense').optional(),
      paymentMethod: Joi.string().valid('cash', 'debit', 'credit').optional(),
      search: Joi.string().allow('').optional(),
    }),
  }),
  getItems
);

router.get('/stats',
  celebrate({
    query: Joi.object({
      year: Joi.number().integer().min(2000).max(2100).optional(),
      month: Joi.number().integer().min(1).max(12).optional(),
    }),
  }),
  getItemStats
);

router.get('/:id',
  celebrate({
    params: Joi.object({
      id: Joi.number().integer().required(),
    }),
  }),
  getItem
);

router.post('/',
  celebrate({
    body: Joi.object({
      title: Joi.string().required(),
      amount: Joi.number().positive().required(),
      type: Joi.string().valid('income', 'expense').required(),
      categoryId: Joi.number().integer().optional(),
      date: Joi.date().iso().required(),
      notes: Joi.string().optional(),
      paymentMethod: Joi.string().valid('cash', 'debit', 'credit').required(),
      attachmentUrl: Joi.string().uri().optional(),
    }),
  }),
  createItem
);

router.patch('/:id',
  celebrate({
    params: Joi.object({
      id: Joi.number().integer().required(),
    }),
    body: Joi.object({
      title: Joi.string().optional(),
      amount: Joi.number().positive().optional(),
      type: Joi.string().valid('income', 'expense').optional(),
      categoryId: Joi.number().integer().optional().allow(null),
      date: Joi.date().iso().optional(),
      notes: Joi.string().optional().allow(''),
      paymentMethod: Joi.string().valid('cash', 'debit', 'credit').optional(),
      attachmentUrl: Joi.string().uri().optional().allow(null, ''),
    }),
  }),
  updateItem
);

router.delete('/:id',
  celebrate({
    params: Joi.object({
      id: Joi.number().integer().required(),
    }),
  }),
  deleteItem
);

export default router;