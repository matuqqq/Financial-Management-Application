import { prisma } from '../config/database.js';
import { AppError } from '../middlewares/error.middleware.js';

export const getItems = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      page = 1,
      limit = 20,
      from,
      to,
      category,
      type,
      search,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {
      userId,
      ...(from && to && {
        date: {
          gte: new Date(from),
          lte: new Date(to),
        },
      }),
      ...(category && { categoryId: parseInt(category) }),
      ...(type && { type }),
      ...(search && search.trim() !== '' && {
        OR: [
          { title: { contains: search.trim(), mode: 'insensitive' } },
          { notes: { contains: search.trim(), mode: 'insensitive' } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      prisma.item.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true },
          },
        },
        orderBy: { date: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.item.count({ where }),
    ]);

    res.status(200).json({
      items,
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};


export const getItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const item = await prisma.item.findFirst({
      where: {
        id: parseInt(id),
        userId,
      },
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
    });

    if (!item) {
      throw new AppError('Item not found', 404, 'ITEM_NOT_FOUND');
    }

    res.status(200).json({
      item,
    });
  } catch (error) {
    next(error);
  }
};

export const createItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { title, amount, type, categoryId, date, notes } = req.body;

    const item = await prisma.item.create({
      data: {
        title,
        amount: parseFloat(amount),
        type,
        date: new Date(date),
        notes,
        userId,
        ...(categoryId && { categoryId: parseInt(categoryId) }),
      },
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
    });

    res.status(201).json({
      message: 'Item created successfully',
      item,
    });
  } catch (error) {
    next(error);
  }
};

export const updateItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, amount, type, categoryId, date, notes } = req.body;

    // Check if item exists and belongs to user
    const existingItem = await prisma.item.findFirst({
      where: {
        id: parseInt(id),
        userId,
      },
    });

    if (!existingItem) {
      throw new AppError('Item not found', 404, 'ITEM_NOT_FOUND');
    }

    const updatedItem = await prisma.item.update({
      where: { id: parseInt(id) },
      data: {
        ...(title !== undefined && { title }),
        ...(amount !== undefined && { amount: parseFloat(amount) }),
        ...(type !== undefined && { type }),
        ...(date !== undefined && { date: new Date(date) }),
        ...(notes !== undefined && { notes }),
        ...(categoryId !== undefined && { 
          categoryId: categoryId ? parseInt(categoryId) : null 
        }),
      },
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
    });

    res.status(200).json({
      message: 'Item updated successfully',
      item: updatedItem,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if item exists and belongs to user
    const existingItem = await prisma.item.findFirst({
      where: {
        id: parseInt(id),
        userId,
      },
    });

    if (!existingItem) {
      throw new AppError('Item not found', 404, 'ITEM_NOT_FOUND');
    }

    await prisma.item.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const getItemStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { year, month } = req.query;

    let dateFilter = {};
    if (year) {
      const startDate = new Date(parseInt(year), month ? parseInt(month) - 1 : 0, 1);
      const endDate = month 
        ? new Date(parseInt(year), parseInt(month), 0)
        : new Date(parseInt(year) + 1, 0, 0);
      
      dateFilter = {
        date: {
          gte: startDate,
          lte: endDate,
        },
      };
    }

    const [incomeStats, expenseStats, categoryStats] = await Promise.all([
      prisma.item.aggregate({
        where: { userId, type: 'income', ...dateFilter },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.item.aggregate({
        where: { userId, type: 'expense', ...dateFilter },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.item.groupBy({
        by: ['categoryId'],
        where: { userId, ...dateFilter },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    const stats = {
      income: {
        total: incomeStats._sum.amount || 0,
        count: incomeStats._count,
      },
      expense: {
        total: expenseStats._sum.amount || 0,
        count: expenseStats._count,
      },
      net: (incomeStats._sum.amount || 0) - (expenseStats._sum.amount || 0),
      categories: categoryStats,
    };

    res.status(200).json({
      stats,
    });
  } catch (error) {
    next(error);
  }
};