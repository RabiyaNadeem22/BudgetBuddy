import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { sendPasswordResetEmail } from '../utils/emailService.js';

const PASSWORD_RESET_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

const hashResetToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const buildPasswordResetUrl = (token) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  return `${frontendUrl.replace(/\/$/, '')}/reset-password?token=${token}`;
};

// Helper function to generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const mergeNotificationPreferences = (current = {}, incoming = {}) => ({
  budgetAlerts: {
    email: incoming.budgetAlerts?.email ?? current.budgetAlerts?.email ?? true,
    push: incoming.budgetAlerts?.push ?? current.budgetAlerts?.push ?? true,
  },
  largeTransactions: {
    email: incoming.largeTransactions?.email ?? current.largeTransactions?.email ?? true,
    push: incoming.largeTransactions?.push ?? current.largeTransactions?.push ?? false,
  },
  monthlySummary: {
    email: incoming.monthlySummary?.email ?? current.monthlySummary?.email ?? true,
    push: incoming.monthlySummary?.push ?? current.monthlySummary?.push ?? false,
  },
  savingsGoals: {
    email: incoming.savingsGoals?.email ?? current.savingsGoals?.email ?? false,
    push: incoming.savingsGoals?.push ?? current.savingsGoals?.push ?? true,
  },
});

// @desc    Register a new user (Signup)
// @route   POST /api/users/signup
// @access  Public
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please include all required fields' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        settings: user.settings,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data received' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate user & get token (Signin)
// @route   POST /api/users/signin
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find user by email
    const user = await User.findOne({ email });

    // Validate credentials
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        settings: user.settings,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    // req.user is populated by protect middleware
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        settings: user.settings,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.avatar = req.body.avatar !== undefined ? req.body.avatar : user.avatar;

      // Handle updating nested settings object
      if (req.body.settings) {
        user.settings = {
          currency: req.body.settings.currency || user.settings.currency,
          notificationsEnabled:
            req.body.settings.notificationsEnabled !== undefined
              ? req.body.settings.notificationsEnabled
              : user.settings.notificationsEnabled,
          budgetWarningThreshold:
            req.body.settings.budgetWarningThreshold !== undefined
              ? req.body.settings.budgetWarningThreshold
              : user.settings.budgetWarningThreshold,
          savingsGoalTarget:
            req.body.settings.savingsGoalTarget !== undefined
              ? req.body.settings.savingsGoalTarget
              : user.settings.savingsGoalTarget,
          notificationPreferences: mergeNotificationPreferences(
            user.settings.notificationPreferences,
            req.body.settings.notificationPreferences
          ),
        };
      }

      // If updating password
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        settings: updatedUser.settings,
        token: generateToken(updatedUser._id), // return new token in case payload changes
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update password for authenticated user
// @route   PUT /api/users/password
// @access  Private
export const updatePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  try {
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'Please provide current password, new password, and confirmation' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'New password and confirmation do not match' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user account
// @route   DELETE /api/users/profile
// @access  Private
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      await User.deleteOne({ _id: req.user._id });
      res.json({ message: 'User deleted successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Request password reset email
// @route   POST /api/users/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: 'Please provide an email address' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    const genericMessage =
      'If an account with that email exists, password reset instructions have been sent.';

    if (!user) {
      return res.json({ message: genericMessage });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = hashResetToken(resetToken);
    user.resetPasswordExpire = new Date(Date.now() + PASSWORD_RESET_EXPIRY_MS);
    await user.save({ validateBeforeSave: false });

    const resetUrl = buildPasswordResetUrl(resetToken);
    const emailResult = await sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      resetUrl,
    });

    const response = { message: genericMessage };

    if (process.env.NODE_ENV === 'development' && emailResult.devMode) {
      response.resetUrl = resetUrl;
    }

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset password using token from email
// @route   PUT /api/users/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  try {
    if (!token || !password) {
      return res.status(400).json({ message: 'Please provide a reset token and new password' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const hashedToken = hashResetToken(token);
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired password reset token' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({
      message: 'Password reset successful',
      token: generateToken(user._id),
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      settings: user.settings,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
