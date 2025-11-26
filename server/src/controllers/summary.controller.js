import { prisma } from '../config/database.js';
import { AppError } from '../middlewares/error.middleware.js';

export const getMonthlySummary = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { savingsGoal: true },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    const [income, expense] = await Promise.all([
      prisma.item.aggregate({
        _sum: { amount: true },
        where: {
          userId,
          type: 'income',
          date: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      }),
      prisma.item.aggregate({
        _sum: { amount: true },
        where: {
          userId,
          type: 'expense',
          date: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      }),
    ]);

    const totalIncome = income._sum.amount || 0;
    const totalExpense = expense._sum.amount || 0;
    const netSavings = totalIncome - totalExpense;
    const goalMet = netSavings >= user.savingsGoal;

    res.status(200).json({
      summary: {
        totalIncome,
        totalExpense,
        netSavings,
        savingsGoal: user.savingsGoal,
        goalMet,
        startPeriod: startOfMonth.toISOString(),
        endPeriod: endOfMonth.toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};
