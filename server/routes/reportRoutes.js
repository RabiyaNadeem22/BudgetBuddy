import express from 'express';
import {
  getDashboardSummary,
  getMonthlyStats,
  getCategoryBreakdown,
  getSummaryStats,
} from '../controllers/reportsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/reports/dashboard-summary:
 *   get:
 *     summary: Get dashboard summary
 *     description: Returns total income, total expense, current balance, balance change vs last month, and recent transactions for the authenticated user.
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Number of recent transactions to return (max 20)
 *     responses:
 *       200:
 *         description: Dashboard summary data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/dashboard-summary', protect, getDashboardSummary);

/**
 * @swagger
 * /api/reports/monthly-stats:
 *   get:
 *     summary: Get income vs expense aggregates
 *     description: Returns aggregated income and expense totals grouped by month or week, plus a focused summary for a selected month.
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: groupBy
 *         schema:
 *           type: string
 *           enum: [month, week]
 *           default: month
 *         description: Group results by month or week
 *       - in: query
 *         name: periods
 *         schema:
 *           type: integer
 *           default: 7
 *         description: Number of periods to include (max 24)
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Year for currentPeriod summary (defaults to current year)
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *         description: Month (1-12) for currentPeriod summary (defaults to current month)
 *     responses:
 *       200:
 *         description: Monthly or weekly statistics
 *       400:
 *         description: Invalid query parameters
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/monthly-stats', protect, getMonthlyStats);

/**
 * @swagger
 * /api/reports/category-breakdown:
 *   get:
 *     summary: Get expense breakdown by category
 *     description: Returns percentage spend breakdown of each expense category for pie charts, including period-over-period change.
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start of reporting period (defaults to start of current month)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End of reporting period (defaults to end of current month)
 *     responses:
 *       200:
 *         description: Category expense breakdown
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/category-breakdown', protect, getCategoryBreakdown);

/**
 * @swagger
 * /api/reports/summary-stats:
 *   get:
 *     summary: Get summary statistics
 *     description: Returns average monthly income/expenses/savings, savings goal progress, biggest expense category, largest transaction, transaction count, and expense trends for the Summary Stats page.
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: months
 *         schema:
 *           type: integer
 *           default: 4
 *         description: Number of months to include in averages and expense trends (max 24)
 *     responses:
 *       200:
 *         description: Summary statistics
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/summary-stats', protect, getSummaryStats);

export default router;
