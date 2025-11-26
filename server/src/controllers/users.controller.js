import { prisma } from '../config/database.js';
import { AppError } from '../middlewares/error.middleware.js';
import { AuthService } from '../services/auth.service.js';

const authService = new AuthService();

export const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    res.status(200).json({
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMe = async (req, res, next) => {
  try {
    const { name, email } = req.body;

    // Check if email is already taken by another user
    if (email && email !== req.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new AppError('Email already in use', 409, 'EMAIL_IN_USE');
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMe = async (req, res, next) => {
  try {
    await prisma.user.delete({
      where: { id: req.user.id },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const getUserStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [totalItems, totalIncome, totalExpense] = await Promise.all([
      prisma.item.count({
        where: { userId },
      }),
      prisma.item.aggregate({
        where: { userId, type: 'income' },
        _sum: { amount: true },
      }),
      prisma.item.aggregate({
        where: { userId, type: 'expense' },
        _sum: { amount: true },
      }),
    ]);

    const stats = {
      totalTransactions: totalItems,
      totalIncome: totalIncome._sum.amount || 0,
      totalExpense: totalExpense._sum.amount || 0,
      netSavings: (totalIncome._sum.amount || 0) - (totalExpense._sum.amount || 0),
    };

    res.status(200).json({
      stats,
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    await authService.changePassword(req.user.id, oldPassword, newPassword);

    res.status(200).json({
      message: 'Password updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const updateSavingsGoal = async (req, res, next) => {
  try {
    const { savingsGoal } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        savingsGoal,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        savingsGoal: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(200).json({
      message: 'Savings goal updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};