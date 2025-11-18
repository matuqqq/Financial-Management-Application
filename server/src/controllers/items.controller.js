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
      paymentMethod,
      search,
      sortBy = 'date',
      sortOrder = 'desc',
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {
      userId,
      date: {
        ...(from && { gte: new Date(from) }),
        ...(to && { lte: new Date(to) }),
      },
      ...(category && category !== 'all' && { categoryId: parseInt(category) }),
      ...(type && type !== 'all' && { type }),
      ...(paymentMethod && paymentMethod !== 'all' && { paymentMethod }),
      ...(search && search.trim() !== '' && {
        OR: [
          { title: { contains: search.trim(), mode: 'insensitive' } },
          { notes: { contains: search.trim(), mode: 'insensitive' } },
        ],
      }),
    };

    if (!from && !to) {
      delete where.date;
    }

    const [items, total, totalsByType] = await Promise.all([
      prisma.item.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: parseInt(limit),
      }),
      prisma.item.count({ where }),
      prisma.item.groupBy({
        by: ['type'],
        where,
        _sum: { amount: true },
      }),
    ]);

    const totalIncome = totalsByType.find(item => item.type === 'income')?._sum.amount || 0;
    const totalExpense = totalsByType.find(item => item.type === 'expense')?._sum.amount || 0;

    res.status(200).json({
      data: {
        items,
        meta: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
        totals: {
          income: totalIncome,
          expense: totalExpense,
        },
      }
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
    const { title, amount, type, categoryId, date, notes, attachmentUrl, paymentMethod } = req.body;

    const item = await prisma.item.create({
      data: {
        title,
        amount: parseFloat(amount),
        type,
        date: new Date(date),
        notes,
        attachmentUrl,
        paymentMethod,
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
    const { title, amount, type, categoryId, date, notes, attachmentUrl, paymentMethod } = req.body;

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
        ...(attachmentUrl !== undefined && { attachmentUrl }),
        ...(paymentMethod !== undefined && { paymentMethod }),
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
    const { year = new Date().getFullYear() } = req.query;

    const startDate = new Date(parseInt(year), 0, 1);
    const endDate = new Date(parseInt(year) + 1, 0, 1);

    const dateFilter = {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    };

    // 1. Total Income, Expenses, and Transactions
    const totalStats = await prisma.item.groupBy({
      by: ['type'],
      where: dateFilter,
      _sum: { amount: true },
      _count: { id: true },
    });

    const totalIncome = totalStats.find(s => s.type === 'income')?._sum.amount || 0;
    const totalExpense = totalStats.find(s => s.type === 'expense')?._sum.amount || 0;
    const totalTransactions = totalStats.reduce((acc, s) => acc + s._count.id, 0);

    // 2. Monthly Summary (Income vs Expense)
    const monthlyData = await prisma.item.findMany({
      where: dateFilter,
      select: {
        amount: true,
        type: true,
        date: true,
      },
    });

    const monthlySummary = Array.from({ length: 12 }, (_, i) => ({
      month: new Date(0, i).toLocaleString('default', { month: 'short' }),
      income: 0,
      expense: 0,
    }));

    monthlyData.forEach(item => {
      const monthIndex = item.date.getMonth();
      if (item.type === 'income') {
        monthlySummary[monthIndex].income += item.amount;
      } else {
        monthlySummary[monthIndex].expense += item.amount;
      }
    });
    
    // 3. Category Summary
    const categoryData = await prisma.item.groupBy({
      by: ['categoryId'],
      where: { ...dateFilter, type: 'expense' },
      _sum: { amount: true },
    });

    const categories = await prisma.category.findMany({
      select: { id: true, name: true },
    });

    const categoryMap = categories.reduce((acc, cat) => {
      acc[cat.id] = cat.name;
      return acc;
    }, {});

    const categorySummary = categoryData
      .map(item => ({
        name: categoryMap[item.categoryId] || 'Uncategorized',
        value: item._sum.amount,
      }))
      .sort((a, b) => b.value - a.value);

    // 4. Recent Items (already have a separate endpoint, but can be combined)
    const recentItems = await prisma.item.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        amount: true,
        type: true,
        date: true,
      },
    });

    res.status(200).json({
      data: {
        totalIncome,
        totalExpense,
        netSavings: totalIncome - totalExpense,
        totalTransactions,
        monthlySummary,
        categorySummary,
        recentItems,
      },
    });
  } catch (error) {
    next(error);
  }
};