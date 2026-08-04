import mongoose from 'mongoose';
import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';
import User from '../models/User.js';
import Category from '../models/Category.js';

// Helper to check budget status for a user and category ID
const checkBudgetStatus = async (userId, categoryId) => {
  try {
    const budget = await Budget.findOne({ userId, category: categoryId });
    if (!budget) return null;

    // Get range start and end based on budget period
    const now = new Date();
    let startDate;
    let endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    if (budget.period === 'weekly') {
      const day = now.getDay();
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day, 0, 0, 0, 0);
    } else if (budget.period === 'yearly') {
      startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
    } else {
      // Monthly
      startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    }

    // Convert categoryId to mongoose ObjectId for aggregation matching
    const catObjectId = new mongoose.Types.ObjectId(categoryId);

    // Sum all transactions of type 'expense' for this user in this category ID & period
    const expenseSum = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          type: 'expense',
          category: catObjectId,
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    const spent = expenseSum.length > 0 ? expenseSum[0].total : 0;
    const percentage = budget.amount > 0 ? Math.round((spent / budget.amount) * 100) : 0;

    const user = await User.findById(userId);
    const warningThreshold = user?.settings?.budgetWarningThreshold || 80;

    return {
      hasBudget: true,
      budgetAmount: budget.amount,
      period: budget.period,
      totalSpent: spent,
      percentage,
      exceedsBudget: spent > budget.amount,
      warningThresholdReached: percentage >= warningThreshold,
    };
  } catch (error) {
    console.error('Error checking budget status:', error);
    return null;
  }
};

// @desc    Get all transactions for the authenticated user
// @route   GET /api/transactions
// @access  Private
export const getTransactions = async (req, res) => {
  try {
    // Build query object
    const query = { userId: req.user._id };

    // Filter by type (income or expense)
    if (req.query.type) {
      query.type = req.query.type;
    }

    // Filter by category ID
    if (req.query.category) {
      if (!mongoose.Types.ObjectId.isValid(req.query.category)) {
        return res.status(400).json({ message: 'Invalid category ID' });
      }
      query.category = new mongoose.Types.ObjectId(req.query.category);
    }

    // Filter by date range (startDate to endDate)
    if (req.query.startDate || req.query.endDate) {
      query.date = {};
      if (req.query.startDate) {
        query.date.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        query.date.$lte = new Date(req.query.endDate);
      }
    }

    // Search by name (case-insensitive regex)
    if (req.query.search) {
      query.name = { $regex: req.query.search, $options: 'i' };
    }

    // Execute query sorted by date (newest first) and populate category
    const transactions = await Transaction.find(query)
      .populate('category')
      .sort({ date: -1, createdAt: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single transaction by ID
// @route   GET /api/transactions/:id
// @access  Private
export const getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id).populate('category');

    // Verify transaction exists and belongs to the authenticated user
    if (!transaction || transaction.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new transaction
// @route   POST /api/transactions
// @access  Private
export const createTransaction = async (req, res) => {
  const { name, amount, type, category, date, notes } = req.body;

  try {
    if (!name || amount === undefined || !type || !category) {
      return res.status(400).json({ message: 'Please include all required fields: name, amount, type, category' });
    }

    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ message: 'Type must be income or expense' });
    }

    // Validate that the category exists and is accessible by the user
    const dbCategory = await Category.findOne({
      _id: category,
      $or: [{ userId: null }, { userId: req.user._id }],
    });

    if (!dbCategory) {
      return res.status(400).json({ message: 'Invalid category specified or not authorized' });
    }

    // Ensure the category type matches the transaction type
    if (dbCategory.type !== type) {
      return res.status(400).json({ message: `Category '${dbCategory.name}' is registered as an ${dbCategory.type}, but transaction is being registered as an ${type}` });
    }

    const transaction = await Transaction.create({
      userId: req.user._id,
      name,
      amount,
      type,
      category,
      date: date || new Date(),
      notes: notes || '',
    });

    // Populate category on the newly created transaction
    const populatedTransaction = await transaction.populate('category');

    // Check budget status for expense transaction
    const budgetStatus = type === 'expense' ? await checkBudgetStatus(req.user._id, category) : null;

    res.status(201).json({
      ...populatedTransaction.toObject(),
      budgetStatus,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a transaction
// @route   PUT /api/transactions/:id
// @access  Private
export const updateTransaction = async (req, res) => {
  const { name, amount, type, category, date, notes } = req.body;

  try {
    const transaction = await Transaction.findById(req.params.id);

    // Verify transaction exists and belongs to user
    if (!transaction || transaction.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Validate category changes if submitted
    if (category) {
      const dbCategory = await Category.findOne({
        _id: category,
        $or: [{ userId: null }, { userId: req.user._id }],
      });

      if (!dbCategory) {
        return res.status(400).json({ message: 'Invalid category specified or not authorized' });
      }

      // Check category type compatibility
      const checkType = type || transaction.type;
      if (dbCategory.type !== checkType) {
        return res.status(400).json({ message: `Category '${dbCategory.name}' is registered as an ${dbCategory.type}, but transaction is being registered as an ${checkType}` });
      }
      transaction.category = category;
    }

    // Apply updates
    transaction.name = name !== undefined ? name : transaction.name;
    transaction.amount = amount !== undefined ? amount : transaction.amount;
    transaction.date = date !== undefined ? new Date(date) : transaction.date;
    transaction.notes = notes !== undefined ? notes : transaction.notes;

    if (type) {
      if (!['income', 'expense'].includes(type)) {
        return res.status(400).json({ message: 'Type must be income or expense' });
      }
      transaction.type = type;
    }

    const updatedTransaction = await transaction.save();
    const populatedTransaction = await updatedTransaction.populate('category');

    // Check budget status for updated category/type
    const checkCategory = category || updatedTransaction.category;
    const checkType = type || updatedTransaction.type;
    const budgetStatus = checkType === 'expense' ? await checkBudgetStatus(req.user._id, checkCategory) : null;

    res.json({
      ...populatedTransaction.toObject(),
      budgetStatus,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id
// @access  Private
export const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    // Verify transaction exists and belongs to user
    if (!transaction || transaction.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    await Transaction.deleteOne({ _id: req.params.id });

    res.json({ message: 'Transaction removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


