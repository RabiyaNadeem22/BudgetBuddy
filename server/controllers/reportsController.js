import mongoose from 'mongoose';
import Transaction from '../models/Transaction.js';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const toObjectId = (id) => new mongoose.Types.ObjectId(id);

const getCurrentMonthRange = () => {
  const now = new Date();
  return {
    startDate: new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0),
    endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999),
  };
};

const getMonthRange = (year, month) => ({
  startDate: new Date(year, month, 1, 0, 0, 0, 0),
  endDate: new Date(year, month + 1, 0, 23, 59, 59, 999),
});

const parseDateRange = (startDate, endDate) => {
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    return { startDate: start, endDate: end };
  }
  return getCurrentMonthRange();
};

const getPreviousPeriodRange = (startDate, endDate) => {
  const durationMs = endDate.getTime() - startDate.getTime();
  const prevEnd = new Date(startDate.getTime() - 1);
  const prevStart = new Date(prevEnd.getTime() - durationMs);
  prevStart.setHours(0, 0, 0, 0);
  return { startDate: prevStart, endDate: prevEnd };
};

const sumByType = async (userId, startDate, endDate) => {
  const totals = await Transaction.aggregate([
    {
      $match: {
        userId: toObjectId(userId),
        date: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
      },
    },
  ]);

  const income = totals.find((item) => item._id === 'income')?.total || 0;
  const expense = totals.find((item) => item._id === 'expense')?.total || 0;

  return { income, expense };
};

const calcSavingsRate = (income, expenses) =>
  income > 0 ? Math.round(((income - expenses) / income) * 1000) / 10 : 0;

const calcPercentChange = (current, previous) => {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }
  return Math.round(((current - previous) / previous) * 1000) / 10;
};

const roundAmount = (value) => Math.round(value * 100) / 100;

const buildMonthBuckets = (months, referenceDate = new Date()) => {
  const buckets = [];
  for (let i = months - 1; i >= 0; i -= 1) {
    const date = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - i, 1);
    buckets.push({
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      label: MONTH_LABELS[date.getMonth()],
      income: 0,
      expenses: 0,
    });
  }
  return buckets;
};

const getFinancialHealthMessage = (savingsRate) => {
  if (savingsRate >= 20) {
    return `You're saving ${savingsRate}% of your income, which is a healthy rate. Keep it up!`;
  }
  if (savingsRate >= 10) {
    return `You're saving ${savingsRate}% of your income. Consider reducing expenses to reach 20%+.`;
  }
  if (savingsRate > 0) {
    return `You're saving ${savingsRate}% of your income. There is room to improve your savings rate.`;
  }
  return 'Your expenses match or exceed your income this period. Review spending to build savings.';
};

// @desc    Dashboard summary: totals, balance, recent transactions
// @route   GET /api/reports/dashboard-summary
// @access  Private
export const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 5, 1), 20);

    const [allTimeTotals, currentMonthTotals, previousMonthTotals, recentTransactions] =
      await Promise.all([
        sumByType(userId, new Date(0), new Date()),
        sumByType(userId, ...Object.values(getCurrentMonthRange())),
        (() => {
          const now = new Date();
          const prevMonth = now.getMonth() - 1;
          const year = prevMonth < 0 ? now.getFullYear() - 1 : now.getFullYear();
          const month = prevMonth < 0 ? 11 : prevMonth;
          const { startDate, endDate } = getMonthRange(year, month);
          return sumByType(userId, startDate, endDate);
        })(),
        Transaction.find({ userId })
          .populate('category')
          .sort({ date: -1, createdAt: -1 })
          .limit(limit),
      ]);

    const totalIncome = allTimeTotals.income;
    const totalExpense = allTimeTotals.expense;
    const currentBalance = totalIncome - totalExpense;

    const currentNet = currentMonthTotals.income - currentMonthTotals.expense;
    const previousNet = previousMonthTotals.income - previousMonthTotals.expense;
    const balanceChange = calcPercentChange(currentNet, previousNet);

    res.json({
      totalIncome,
      totalExpense,
      currentBalance,
      balanceChange,
      recentTransactions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Monthly/weekly income vs expense aggregates
// @route   GET /api/reports/monthly-stats
// @access  Private
export const getMonthlyStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const groupBy = req.query.groupBy === 'week' ? 'week' : 'month';
    const periods = Math.min(Math.max(parseInt(req.query.periods, 10) || 7, 1), 24);

    const now = new Date();
    const targetYear = req.query.year ? parseInt(req.query.year, 10) : now.getFullYear();
    const targetMonth = req.query.month ? parseInt(req.query.month, 10) - 1 : now.getMonth();

    if (req.query.month && (targetMonth < 0 || targetMonth > 11)) {
      return res.status(400).json({ message: 'Month must be between 1 and 12' });
    }

    let rangeStart;
    if (groupBy === 'week') {
      rangeStart = new Date(now);
      rangeStart.setDate(rangeStart.getDate() - periods * 7);
      rangeStart.setHours(0, 0, 0, 0);
    } else {
      rangeStart = new Date(now.getFullYear(), now.getMonth() - (periods - 1), 1, 0, 0, 0, 0);
    }

    const groupStage =
      groupBy === 'week'
        ? {
            year: { $isoWeekYear: '$date' },
            week: { $isoWeek: '$date' },
            type: '$type',
          }
        : {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type',
          };

    const aggregated = await Transaction.aggregate([
      {
        $match: {
          userId: toObjectId(userId),
          date: { $gte: rangeStart, $lte: now },
        },
      },
      {
        $group: {
          _id: groupStage,
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.week': 1, '_id.month': 1 } },
    ]);

    const periodMap = new Map();

    aggregated.forEach((item) => {
      const key =
        groupBy === 'week'
          ? `${item._id.year}-W${String(item._id.week).padStart(2, '0')}`
          : `${item._id.year}-${item._id.month}`;

      if (!periodMap.has(key)) {
        const label =
          groupBy === 'week'
            ? `W${item._id.week} ${item._id.year}`
            : MONTH_LABELS[item._id.month - 1];

        periodMap.set(key, {
          label,
          year: item._id.year,
          ...(groupBy === 'week' ? { week: item._id.week } : { month: item._id.month }),
          income: 0,
          expenses: 0,
        });
      }

      const period = periodMap.get(key);
      if (item._id.type === 'income') {
        period.income = item.total;
      } else {
        period.expenses = item.total;
      }
    });

    const stats = Array.from(periodMap.values()).map((period) => ({
      ...period,
      netSavings: period.income - period.expenses,
      savingsRate: calcSavingsRate(period.income, period.expenses),
    }));

    const { startDate: currentStart, endDate: currentEnd } = getMonthRange(targetYear, targetMonth);
    const currentPeriodTotals = await sumByType(userId, currentStart, currentEnd);

    const currentPeriod = {
      label: `${MONTH_LABELS[targetMonth]} ${targetYear}`,
      year: targetYear,
      month: targetMonth + 1,
      income: currentPeriodTotals.income,
      expenses: currentPeriodTotals.expense,
      netSavings: currentPeriodTotals.income - currentPeriodTotals.expense,
      savingsRate: calcSavingsRate(currentPeriodTotals.income, currentPeriodTotals.expense),
    };

    res.json({
      groupBy,
      stats,
      currentPeriod,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Expense breakdown by category with percentages
// @route   GET /api/reports/category-breakdown
// @access  Private
export const getCategoryBreakdown = async (req, res) => {
  try {
    const userId = req.user._id;
    const { startDate, endDate } = parseDateRange(req.query.startDate, req.query.endDate);
    const { startDate: prevStart, endDate: prevEnd } = getPreviousPeriodRange(startDate, endDate);

    const [currentBreakdown, previousBreakdown] = await Promise.all([
      Transaction.aggregate([
        {
          $match: {
            userId: toObjectId(userId),
            type: 'expense',
            date: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: '$category',
            amount: { $sum: '$amount' },
          },
        },
        {
          $lookup: {
            from: 'categories',
            localField: '_id',
            foreignField: '_id',
            as: 'category',
          },
        },
        { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
        { $sort: { amount: -1 } },
      ]),
      Transaction.aggregate([
        {
          $match: {
            userId: toObjectId(userId),
            type: 'expense',
            date: { $gte: prevStart, $lte: prevEnd },
          },
        },
        {
          $group: {
            _id: '$category',
            amount: { $sum: '$amount' },
          },
        },
      ]),
    ]);

    const totalExpenses = currentBreakdown.reduce((sum, item) => sum + item.amount, 0);
    const previousMap = new Map(
      previousBreakdown.map((item) => [item._id.toString(), item.amount])
    );

    const categories = currentBreakdown.map((item) => {
      const categoryId = item._id?.toString();
      const previousAmount = previousMap.get(categoryId) || 0;
      const percentage =
        totalExpenses > 0 ? Math.round((item.amount / totalExpenses) * 1000) / 10 : 0;

      return {
        categoryId: item._id,
        name: item.category?.name || 'Uncategorized',
        color: item.category?.color || '#94A3B8',
        amount: item.amount,
        percentage,
        change: calcPercentChange(item.amount, previousAmount),
      };
    });

    res.json({
      totalExpenses,
      startDate,
      endDate,
      categories,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Summary statistics for the Summary Stats page
// @route   GET /api/reports/summary-stats
// @access  Private
export const getSummaryStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const months = Math.min(Math.max(parseInt(req.query.months, 10) || 4, 1), 24);
    const now = new Date();
    const { startDate: currentMonthStart, endDate: currentMonthEnd } = getCurrentMonthRange();
    const avgRangeStart = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1, 0, 0, 0, 0);
    const savingsGoalTarget = req.user.settings?.savingsGoalTarget ?? 10000;

    const [
      monthlyAggregates,
      allTimeTotals,
      totalTransactions,
      biggestExpenseCategoryResult,
      largestTransaction,
    ] = await Promise.all([
      Transaction.aggregate([
        {
          $match: {
            userId: toObjectId(userId),
            date: { $gte: avgRangeStart, $lte: now },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$date' },
              month: { $month: '$date' },
              type: '$type',
            },
            total: { $sum: '$amount' },
          },
        },
      ]),
      sumByType(userId, new Date(0), now),
      Transaction.countDocuments({
        userId,
        date: { $gte: currentMonthStart, $lte: currentMonthEnd },
      }),
      Transaction.aggregate([
        {
          $match: {
            userId: toObjectId(userId),
            type: 'expense',
            date: { $gte: currentMonthStart, $lte: currentMonthEnd },
          },
        },
        {
          $group: {
            _id: '$category',
            amount: { $sum: '$amount' },
          },
        },
        {
          $lookup: {
            from: 'categories',
            localField: '_id',
            foreignField: '_id',
            as: 'category',
          },
        },
        { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
        { $sort: { amount: -1 } },
        { $limit: 1 },
      ]),
      Transaction.findOne({
        userId,
        type: 'expense',
        date: { $gte: currentMonthStart, $lte: currentMonthEnd },
      })
        .sort({ amount: -1 })
        .select('name amount date'),
    ]);

    const monthBuckets = buildMonthBuckets(months, now);

    monthlyAggregates.forEach((item) => {
      const bucket = monthBuckets.find(
        (entry) => entry.year === item._id.year && entry.month === item._id.month
      );
      if (!bucket) return;

      if (item._id.type === 'income') {
        bucket.income = item.total;
      } else {
        bucket.expenses = item.total;
      }
    });

    const totalIncome = monthBuckets.reduce((sum, bucket) => sum + bucket.income, 0);
    const totalExpenses = monthBuckets.reduce((sum, bucket) => sum + bucket.expenses, 0);
    const averageMonthlyIncome = roundAmount(totalIncome / months);
    const averageMonthlyExpenses = roundAmount(totalExpenses / months);
    const averageMonthlySavings = roundAmount(averageMonthlyIncome - averageMonthlyExpenses);
    const savingsRate = calcSavingsRate(averageMonthlyIncome, averageMonthlyExpenses);

    const expensesByMonth = monthBuckets.map((bucket) => ({
      month: bucket.label,
      year: bucket.year,
      amount: roundAmount(bucket.expenses),
    }));

    const firstMonthExpenses = expensesByMonth[0]?.amount || 0;
    const lastMonthExpenses = expensesByMonth[expensesByMonth.length - 1]?.amount || 0;
    const expenseTrendAmount = lastMonthExpenses - firstMonthExpenses;

    const topCategory = biggestExpenseCategoryResult[0];
    const biggestExpenseCategory = topCategory
      ? {
          name: topCategory.category?.name || 'Uncategorized',
          amount: roundAmount(topCategory.amount),
        }
      : null;

    const biggestTransaction = largestTransaction
      ? {
          name: largestTransaction.name,
          amount: roundAmount(largestTransaction.amount),
          date: largestTransaction.date.toISOString().split('T')[0],
        }
      : null;

    const currentSavings = roundAmount(allTimeTotals.income - allTimeTotals.expense);
    const savingsGoalPercentage =
      savingsGoalTarget > 0
        ? Math.min(100, Math.round((currentSavings / savingsGoalTarget) * 1000) / 10)
        : 0;

    let monthsToGoal = null;
    if (currentSavings >= savingsGoalTarget) {
      monthsToGoal = 0;
    } else if (averageMonthlySavings > 0) {
      monthsToGoal = Math.ceil((savingsGoalTarget - currentSavings) / averageMonthlySavings);
    }

    res.json({
      averageMonthlyIncome,
      averageMonthlyExpenses,
      averageMonthlySavings,
      savingsRate,
      biggestExpenseCategory,
      biggestTransaction,
      totalTransactions,
      expensesByMonth,
      expenseTrend: {
        direction: expenseTrendAmount <= 0 ? 'decreased' : 'increased',
        percentChange: calcPercentChange(lastMonthExpenses, firstMonthExpenses),
        monthsCompared: months,
      },
      savingsGoal: {
        target: savingsGoalTarget,
        current: currentSavings,
        percentage: savingsGoalPercentage,
        monthsToGoal,
      },
      financialHealth: {
        savingsRate,
        message: getFinancialHealthMessage(savingsRate),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
