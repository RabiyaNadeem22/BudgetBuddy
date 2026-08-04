import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Budget amount is required'],
    },
    period: {
      type: String,
      enum: ['weekly', 'monthly', 'yearly'],
      default: 'monthly',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure a user only has one budget per category
budgetSchema.index({ userId: 1, category: 1 }, { unique: true });

const Budget = mongoose.model('Budget', budgetSchema);

export default Budget;
