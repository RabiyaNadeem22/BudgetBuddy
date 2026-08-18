import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  updatePassword,
  deleteUser,
  forgotPassword,
  resetPassword,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/users/signup:
 *   post:
 *     summary: Register a new user
 *     description: Creates a user account and returns account details along with a JWT token.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minimum: 6
 *                 example: password123
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: 6a4d4ec22f906d358ab72ca0
 *                 name:
 *                   type: string
 *                   example: John Doe
 *                 email:
 *                   type: string
 *                   example: johndoe@example.com
 *                 avatar:
 *                   type: string
 *                   example: ""
 *                 settings:
 *                   type: object
 *                   properties:
 *                     currency:
 *                       type: string
 *                       example: USD
 *                     notificationsEnabled:
 *                       type: boolean
 *                       example: true
 *                     budgetWarningThreshold:
 *                       type: integer
 *                       example: 80
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Bad request (missing fields or user already exists)
 *       500:
 *         description: Server error
 */
router.post('/signup', registerUser);

/**
 * @swagger
 * /api/users/signin:
 *   post:
 *     summary: User login
 *     description: Authenticates user credentials and returns a JWT token.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *     responses:
 *       200:
 *         description: Authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: 6a4d4ec22f906d358ab72ca0
 *                 name:
 *                   type: string
 *                   example: John Doe
 *                 email:
 *                   type: string
 *                   example: johndoe@example.com
 *                 avatar:
 *                   type: string
 *                   example: ""
 *                 settings:
 *                   type: object
 *                   properties:
 *                     currency:
 *                       type: string
 *                       example: USD
 *                     notificationsEnabled:
 *                       type: boolean
 *                       example: true
 *                     budgetWarningThreshold:
 *                       type: integer
 *                       example: 80
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Bad request (missing credentials)
 *       401:
 *         description: Unauthorized (invalid credentials)
 *       500:
 *         description: Server error
 */
router.post('/signin', loginUser);

/**
 * @swagger
 * /api/users/forgot-password:
 *   post:
 *     summary: Request a password reset
 *     description: Sends password reset instructions to the user's email if the account exists. Always returns a generic success message to prevent email enumeration.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: johndoe@example.com
 *     responses:
 *       200:
 *         description: Reset instructions sent if account exists
 *       400:
 *         description: Missing email
 *       500:
 *         description: Server error
 */
router.post('/forgot-password', forgotPassword);

/**
 * @swagger
 * /api/users/reset-password:
 *   put:
 *     summary: Reset password with token
 *     description: Sets a new password using the token from the reset email. Returns a new JWT on success.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *                 example: abc123def456...
 *               password:
 *                 type: string
 *                 format: password
 *                 minimum: 6
 *                 example: newsecurepassword123
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired token, or invalid password
 *       500:
 *         description: Server error
 */
router.put('/reset-password', resetPassword);

/**
 * @swagger
 * /api/users/password:
 *   put:
 *     summary: Update password for the authenticated user
 *     description: Changes the signed-in user's password after verifying the current password.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 example: currentpassword123
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: newsecurepassword123
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 example: newsecurepassword123
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Missing fields or password mismatch
 *       401:
 *         description: Current password is incorrect
 *       500:
 *         description: Server error
 */
router.put('/password', protect, updatePassword);

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get user profile details
 *     description: Retrieves profile details of the currently authenticated user.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: 6a4d4ec22f906d358ab72ca0
 *                 name:
 *                   type: string
 *                   example: John Doe
 *                 email:
 *                   type: string
 *                   example: johndoe@example.com
 *                 avatar:
 *                   type: string
 *                   example: ""
 *                 settings:
 *                   type: object
 *                   properties:
 *                     currency:
 *                       type: string
 *                       example: USD
 *                     notificationsEnabled:
 *                       type: boolean
 *                       example: true
 *                     budgetWarningThreshold:
 *                       type: integer
 *                       example: 80
 *       401:
 *         description: Unauthorized (no or invalid token)
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/profile', protect, getUserProfile);

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update user profile
 *     description: Updates authenticated user details such as name, avatar, password, or configuration settings.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Johnathan Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: newsecurepassword123
 *               avatar:
 *                 type: string
 *                 example: "/uploads/avatars/johndoe.png"
 *               settings:
 *                 type: object
 *                 properties:
 *                   currency:
 *                     type: string
 *                     example: EUR
 *                   notificationsEnabled:
 *                     type: boolean
 *                     example: false
 *                   budgetWarningThreshold:
 *                     type: integer
 *                     example: 85
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: 6a4d4ec22f906d358ab72ca0
 *                 name:
 *                   type: string
 *                   example: Johnathan Doe
 *                 email:
 *                   type: string
 *                   example: johndoe@example.com
 *                 avatar:
 *                   type: string
 *                   example: "/uploads/avatars/johndoe.png"
 *                 settings:
 *                   type: object
 *                   properties:
 *                     currency:
 *                       type: string
 *                       example: EUR
 *                     notificationsEnabled:
 *                       type: boolean
 *                       example: false
 *                     budgetWarningThreshold:
 *                       type: integer
 *                       example: 85
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         description: Unauthorized (no or invalid token)
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.put('/profile', protect, updateUserProfile);

/**
 * @swagger
 * /api/users/profile:
 *   delete:
 *     summary: Delete user account
 *     description: Permanently deletes the authenticated user's account.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User account deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User deleted successfully
 *       401:
 *         description: Unauthorized (no or invalid token)
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.delete('/profile', protect, deleteUser);

export default router;
