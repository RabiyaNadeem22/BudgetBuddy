import express from 'express';
import {
  getBudgets,
  upsertBudget,
  deleteBudget,
} from '../controllers/budgetController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/budgets:
 *   get:
 *     summary: Retrieve user budgets
 *     description: Fetches all budgets for the authenticated user, dynamically calculating spent amount, progress percentage, and warning status based on current expenses.
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of budgets with spending statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: 6a4d4ec22f906d358ab72ca5
 *                   category:
 *                     type: string
 *                     description: Category ID (ObjectId)
 *                     example: 64f1d2a4b9c0d1234567890a
 *                   budget:
 *                     type: number
 *                     example: 1000
 *                   period:
 *                     type: string
 *                     example: monthly
 *                   spent:
 *                     type: number
 *                     example: 850
 *                   percentage:
 *                     type: integer
 *                     example: 85
 *                   status:
 *                     type: string
 *                     enum: [good, warning, over]
 *                     example: warning
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
router.get('/', protect, getBudgets);

/**
 * @swagger
 * /api/budgets:
 *   post:
 *     summary: Create or update a budget
 *     description: Sets a budget limit for a specific category. If a budget already exists for the category, it updates the amount and period.
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - category
 *               - amount
 *             properties:
 *               category:
 *                 type: string
 *                 description: Category ID (ObjectId)
 *                 example: 64f1d2a4b9c0d1234567890a
 *               amount:
 *                 type: number
 *                 example: 500.00
 *               period:
 *                 type: string
 *                 enum: [weekly, monthly, yearly]
 *                 default: monthly
 *                 example: monthly
 *     responses:
 *       200:
 *         description: Budget updated successfully
 *       201:
 *         description: Budget created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: 6a4d4ec22f906d358ab72ca5
 *                 userId:
 *                   type: string
 *                   example: 6a4d4ec22f906d358ab72ca0
 *                 category:
 *                   type: string
 *                   description: Category ID (ObjectId)
 *                   example: 64f1d2a4b9c0d1234567890a
 *                 amount:
 *                   type: number
 *                   example: 500
 *                 period:
 *                   type: string
 *                   example: monthly
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Bad request (missing fields, invalid values)
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/', protect, upsertBudget);

/**
 * @swagger
 * /api/budgets/{id}:
 *   delete:
 *     summary: Delete a budget limit
 *     description: Deletes the budget entry by ID.
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the budget to delete
 *     responses:
 *       200:
 *         description: Budget removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Budget removed successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Budget not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', protect, deleteBudget);

export default router;
