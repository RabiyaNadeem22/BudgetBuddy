import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null represents global default categories
    },
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
    },
    color: {
      type: String,
      required: [true, 'Category color is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: [true, 'Category type must be income or expense'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to guarantee uniqueness of categories per user
categorySchema.index({ userId: 1, name: 1, type: 1 }, { unique: true });

const Category = mongoose.model('Category', categorySchema);

export default Category;
