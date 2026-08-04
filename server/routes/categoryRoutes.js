import express from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Retrieve categories list
 *     description: Fetches global default categories and the custom categories created by the authenticated user.
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: 6a4d4ec22f906d358ab72ca3
 *                   userId:
 *                     type: string
 *                     nullable: true
 *                     example: null
 *                   name:
 *                     type: string
 *                     example: Food & Dining
 *                   color:
 *                     type: string
 *                     example: "#F59E0B"
 *                   type:
 *                     type: string
 *                     example: expense
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', protect, getCategories);

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Create custom category
 *     description: Registers a new custom category for the authenticated user. Name must be unique within the user's active categories.
 *     tags: [Categories]
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
 *               - color
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *                 example: Gym
 *               color:
 *                 type: string
 *                 example: "#FF5733"
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *                 example: expense
 *     responses:
 *       201:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: 6a4d4ec22f906d358ab72ca6
 *                 userId:
 *                   type: string
 *                   example: 6a4d4ec22f906d358ab72ca0
 *                 name:
 *                   type: string
 *                   example: Gym
 *                 color:
 *                   type: string
 *                   example: "#FF5733"
 *                 type:
 *                   type: string
 *                   example: expense
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Bad request (missing fields, duplicate name)
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/', protect, createCategory);

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Update custom category
 *     description: Modifies details of a user's custom category by ID. Global defaults cannot be modified.
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The Category ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Fitness & Gym
 *               color:
 *                 type: string
 *                 example: "#C70039"
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *                 example: expense
 *     responses:
 *       200:
 *         description: Category updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: 6a4d4ec22f906d358ab72ca6
 *                 userId:
 *                   type: string
 *                   example: 6a4d4ec22f906d358ab72ca0
 *                 name:
 *                   type: string
 *                   example: Fitness & Gym
 *                 color:
 *                   type: string
 *                   example: "#C70039"
 *                 type:
 *                   type: string
 *                   example: expense
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Bad request (invalid data, name conflicts)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (cannot modify global default categories)
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
router.put('/:id', protect, updateCategory);

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Delete custom category
 *     description: Removes a user's custom category and clears any associated budgets. Global default categories cannot be deleted.
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The Category ID to delete
 *     responses:
 *       200:
 *         description: Category and associated budgets deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Category removed successfully (associated budgets cleared)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (cannot delete global default categories)
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', protect, deleteCategory);

export default router;
