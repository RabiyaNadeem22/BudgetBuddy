import express from 'express';
import {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '../controllers/transactionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Retrieve user transactions
 *     description: Fetches a list of transactions for the authenticated user, sorted by date (newest first). Supports filtering by type, category, date ranges, and text searches.
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [income, expense]
 *         description: Filter transactions by type
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter transactions by category ID (ObjectId)
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter transactions starting from this date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter transactions up to this date (YYYY-MM-DD)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search description/name using partial case-insensitive match
 *     responses:
 *       200:
 *         description: A list of transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: 6a4d4ec22f906d358ab72ca1
 *                   userId:
 *                     type: string
 *                     example: 6a4d4ec22f906d358ab72ca0
 *                   name:
 *                     type: string
 *                     example: Grocery shopping
 *                   amount:
 *                     type: number
 *                     example: 54.50
 *                   type:
 *                     type: string
 *                     example: expense
 *                   category:
 *                     type: string
 *                     description: Category ID (ObjectId)
 *                     example: 64f1d2a4b9c0d1234567890a
 *                   date:
 *                     type: string
 *                     format: date-time
 *                     example: 2026-08-04T12:00:00.000Z
 *                   notes:
 *                     type: string
 *                     example: Bought groceries at Walmart
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       500:
 *         description: Server error
 */
router.get('/', protect, getTransactions);

/**
 * @swagger
 * /api/transactions:
 *   post:
 *     summary: Create a new transaction
 *     description: Creates an income or expense transaction for the authenticated user.
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - amount
 *               - type
 *               - category
 *             properties:
 *               name:
 *                 type: string
 *                 example: Monthly Salary
 *               amount:
 *                 type: number
 *                 example: 3200
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *                 example: income
 *               category:
 *                 type: string
 *                 description: Category ID (ObjectId)
 *                 example: 64f1d2a4b9c0d1234567890a
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-08-04T12:00:00.000Z
 *               notes:
 *                 type: string
 *                 example: Regular monthly pay stub
 *     responses:
 *       201:
 *         description: Transaction created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: 6a4d4ec22f906d358ab72ca1
 *                 userId:
 *                   type: string
 *                   example: 6a4d4ec22f906d358ab72ca0
 *                 name:
 *                   type: string
 *                   example: Monthly Salary
 *                 amount:
 *                   type: number
 *                   example: 3200
 *                 type:
 *                   type: string
 *                   example: income
 *                 category:
 *                   type: string
 *                   description: Category ID (ObjectId)
 *                   example: 64f1d2a4b9c0d1234567890a
 *                 date:
 *                   type: string
 *                   format: date-time
 *                   example: 2026-08-04T12:00:00.000Z
 *                 notes:
 *                   type: string
 *                   example: Regular monthly pay stub
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                 budgetStatus:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     hasBudget:
 *                       type: boolean
 *                       example: true
 *                     budgetAmount:
 *                       type: number
 *                       example: 500
 *                     period:
 *                       type: string
 *                       example: monthly
 *                     totalSpent:
 *                       type: number
 *                       example: 54.50
 *                     percentage:
 *                       type: integer
 *                       example: 11
 *                     exceedsBudget:
 *                       type: boolean
 *                       example: false
 *                     warningThresholdReached:
 *                       type: boolean
 *                       example: false
 *       400:
 *         description: Bad request (missing required fields or invalid data types)
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/', protect, createTransaction);

/**
 * @swagger
 * /api/transactions/{id}:
 *   get:
 *     summary: Get transaction details by ID
 *     description: Retrieves the detailed record of a transaction, verifying ownership.
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the transaction to retrieve
 *     responses:
 *       200:
 *         description: Transaction retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: 6a4d4ec22f906d358ab72ca1
 *                 userId:
 *                   type: string
 *                   example: 6a4d4ec22f906d358ab72ca0
 *                 name:
 *                   type: string
 *                   example: Grocery shopping
 *                 amount:
 *                   type: number
 *                   example: 54.50
 *                 type:
 *                   type: string
 *                   example: expense
 *                 category:
 *                   type: string
 *                   description: Category ID (ObjectId)
 *                   example: 64f1d2a4b9c0d1234567890a
 *                 date:
 *                   type: string
 *                   format: date-time
 *                   example: 2026-08-04T12:00:00.000Z
 *                 notes:
 *                   type: string
 *                   example: Bought groceries at Walmart
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Transaction not found
 *       500:
 *         description: Server error
 */
router.get('/:id', protect, getTransactionById);

/**
 * @swagger
 * /api/transactions/{id}:
 *   put:
 *     summary: Update an existing transaction
 *     description: Updates properties of a user transaction by ID.
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the transaction to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Coffee Shop
 *               amount:
 *                 type: number
 *                 example: 5.75
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *                 example: expense
 *               category:
 *                 type: string
 *                 description: Category ID (ObjectId)
 *                 example: 64f1d2a4b9c0d1234567890a
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-08-04T09:30:00.000Z
 *               notes:
 *                 type: string
 *                 example: Espresso with double shot
 *     responses:
 *       200:
 *         description: Transaction updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: 6a4d4ec22f906d358ab72ca1
 *                 userId:
 *                   type: string
 *                   example: 6a4d4ec22f906d358ab72ca0
 *                 name:
 *                   type: string
 *                   example: Coffee Shop
 *                 amount:
 *                   type: number
 *                   example: 5.75
 *                 type:
 *                   type: string
 *                   example: expense
 *                 category:
 *                   type: string
 *                   description: Category ID (ObjectId)
 *                   example: 64f1d2a4b9c0d1234567890a
 *                 date:
 *                   type: string
 *                   format: date-time
 *                   example: 2026-08-04T09:30:00.000Z
 *                 notes:
 *                   type: string
 *                   example: Espresso with double shot
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                 budgetStatus:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     hasBudget:
 *                       type: boolean
 *                       example: true
 *                     budgetAmount:
 *                       type: number
 *                       example: 500
 *                     period:
 *                       type: string
 *                       example: monthly
 *                     totalSpent:
 *                       type: number
 *                       example: 54.50
 *                     percentage:
 *                       type: integer
 *                       example: 11
 *                     exceedsBudget:
 *                       type: boolean
 *                       example: false
 *                     warningThresholdReached:
 *                       type: boolean
 *                       example: false
 *       400:
 *         description: Bad request (invalid type value)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Transaction not found
 *       500:
 *         description: Server error
 */
router.put('/:id', protect, updateTransaction);

/**
 * @swagger
 * /api/transactions/{id}:
 *   delete:
 *     summary: Delete a transaction
 *     description: Permanently removes a transaction by ID.
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the transaction to delete
 *     responses:
 *       200:
 *         description: Transaction deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Transaction removed successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Transaction not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', protect, deleteTransaction);

export default router;
