import mongoose from 'mongoose';
import Category from '../models/Category.js';

const seedDefaultCategories = async () => {
  try {
    const count = await Category.countDocuments({ userId: null });
    if (count === 0) {
      const defaultCategories = [
        // Income Categories
        { name: 'Salary', color: '#4CAF50', type: 'income', userId: null },
        { name: 'Freelance', color: '#3B82F6', type: 'income', userId: null },
        { name: 'Investment', color: '#F59E0B', type: 'income', userId: null },
        { name: 'Other Income', color: '#8B5CF6', type: 'income', userId: null },
        // Expense Categories
        { name: 'Food & Dining', color: '#F59E0B', type: 'expense', userId: null },
        { name: 'Transportation', color: '#8B5CF6', type: 'expense', userId: null },
        { name: 'Shopping', color: '#EC4899', type: 'expense', userId: null },
        { name: 'Entertainment', color: '#10B981', type: 'expense', userId: null },
        { name: 'Bills', color: '#06B6D4', type: 'expense', userId: null },
        { name: 'Healthcare', color: '#10B981', type: 'expense', userId: null },
        { name: 'Education', color: '#06B6D4', type: 'expense', userId: null },
        { name: 'Other', color: '#6366F1', type: 'expense', userId: null },
      ];
      await Category.insertMany(defaultCategories);
      console.log('Seeded default categories successfully');
    }
  } catch (error) {
    console.error(`Seeding default categories failed: ${error.message}`);
  }
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    await seedDefaultCategories();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;

