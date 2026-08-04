import mongoose from 'mongoose';
import Budget from '../models/Budget.js';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import Category from '../models/Category.js';

// Helper function to get date range for a period
const getPeriodDateRange = (period) => {
  const now = new Date();
  let startDate;
  let endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  if (period === 'weekly') {
    const day = now.getDay();
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day, 0, 0, 0, 0);
  } else if (period === 'yearly') {
    startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
  } else {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  }

  return { startDate, endDate };
};

// @desc    Get all budgets with calculated spending for the authenticated user
// @route   GET /api/budgets
// @access  Private
export const getBudgets = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const warningThreshold = user?.settings?.budgetWarningThreshold || 80;

    const budgets = await Budget.find({ userId: req.user._id }).populate('category');

    const populatedBudgets = await Promise.all(
      budgets.map(async (budget) => {
        const { startDate, endDate } = getPeriodDateRange(budget.period);
        const categoryIdentifier = budget.category?._id || budget.category;
        const categoryObjectId = new mongoose.Types.ObjectId(categoryIdentifier);

        const expenseSum = await Transaction.aggregate([
          {
            $match: {
              userId: req.user._id,
              type: 'expense',
              category: categoryObjectId,
              date: { $gte: startDate, $lte: endDate },
            },
          },
          {
            $group: {
              _id: null,
              totalSpent: { $sum: '$amount' },
            },
          },
        ]);

        const spent = expenseSum.length > 0 ? expenseSum[0].totalSpent : 0;
        const percentage = budget.amount > 0 ? Math.round((spent / budget.amount) * 100) : 0;

        let status = 'good';
        if (percentage > 100) {
          status = 'over';
        } else if (percentage >= warningThreshold) {
          status = 'warning';
        }

        return {
          _id: budget._id,
          category: budget.category,
          budget: budget.amount,
          period: budget.period,
          spent,
          percentage,
          status,
          createdAt: budget.createdAt,
          updatedAt: budget.updatedAt,
        };
      })
    );

    res.json(populatedBudgets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create or update a budget (upsert)
// @route   POST /api/budgets
// @access  Private
export const upsertBudget = async (req, res) => {
  const { category, amount, period } = req.body;

  try {
    if (!category || amount === undefined) {
      return res.status(400).json({ message: 'Category and amount are required' });
    }

    const budgetAmount = Number(amount);
    if (isNaN(budgetAmount) || budgetAmount < 0) {
      return res.status(400).json({ message: 'Amount must be a positive number' });
    }

    const budgetPeriod = period || 'monthly';
    if (!['weekly', 'monthly', 'yearly'].includes(budgetPeriod)) {
      return res.status(400).json({ message: 'Period must be weekly, monthly, or yearly' });
    }

    if (!mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }

    const categoryObjectId = new mongoose.Types.ObjectId(category);
    const dbCategory = await Category.findOne({
      _id: categoryObjectId,
      $or: [{ userId: null }, { userId: req.user._id }],
    });

    if (!dbCategory) {
      return res.status(400).json({ message: 'Invalid category specified or not authorized' });
    }

    const existingBudget = await Budget.findOne({ userId: req.user._id, category: categoryObjectId });

    const budget = await Budget.findOneAndUpdate(
      { userId: req.user._id, category: categoryObjectId },
      {
        amount: budgetAmount,
        period: budgetPeriod,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    await budget.populate('category');

    res.status(existingBudget ? 200 : 201).json(budget);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a budget
// @route   DELETE /api/budgets/:id
// @access  Private
export const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget || budget.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    await Budget.deleteOne({ _id: req.params.id });

    res.json({ message: 'Budget removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
