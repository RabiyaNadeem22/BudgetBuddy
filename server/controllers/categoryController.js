import Category from '../models/Category.js';
import Budget from '../models/Budget.js';

// @desc    Get all categories (global defaults + user's custom categories)
// @route   GET /api/categories
// @access  Private
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({
      $or: [{ userId: null }, { userId: req.user._id }],
    }).sort({ userId: 1, name: 1 }); // Global first, then alphabetically

    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a custom category
// @route   POST /api/categories
// @access  Private
export const createCategory = async (req, res) => {
  const { name, color, type } = req.body;

  try {
    if (!name || !color || !type) {
      return res.status(400).json({ message: 'Please include name, color, and type' });
    }

    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ message: 'Type must be income or expense' });
    }

    // Check if category name already exists for this user (or is a global category)
    const categoryExists = await Category.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
      type,
      $or: [{ userId: null }, { userId: req.user._id }],
    });

    if (categoryExists) {
      return res.status(400).json({ message: 'A category with this name and type already exists' });
    }

    const category = await Category.create({
      userId: req.user._id,
      name: name.trim(),
      color,
      type,
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a custom category
// @route   PUT /api/categories/:id
// @access  Private
export const updateCategory = async (req, res) => {
  const { name, color, type } = req.body;

  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Verify ownership (cannot update global categories where userId is null)
    if (!category.userId || category.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to modify this category' });
    }

    // Check name uniqueness if changed
    if (name && name.trim().toLowerCase() !== category.name.toLowerCase()) {
      const nameExists = await Category.findOne({
        name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
        type: type || category.type,
        $or: [{ userId: null }, { userId: req.user._id }],
        _id: { $ne: category._id },
      });

      if (nameExists) {
        return res.status(400).json({ message: 'A category with this name already exists' });
      }
      category.name = name.trim();
    }

    category.color = color !== undefined ? color : category.color;

    if (type) {
      if (!['income', 'expense'].includes(type)) {
        return res.status(400).json({ message: 'Type must be income or expense' });
      }
      category.type = type;
    }

    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a custom category
// @route   DELETE /api/categories/:id
// @access  Private
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Verify ownership (cannot delete global categories)
    if (!category.userId || category.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this category' });
    }

    // Cascade delete any budgets set for this category
    await Budget.deleteMany({ category: category._id });

    // Note: Transactions are kept, but their category reference will become invalid. 
    // Usually we update them to a generic category like 'Other' or leave them. We will keep them.
    await Category.deleteOne({ _id: req.params.id });

    res.json({ message: 'Category removed successfully (associated budgets cleared)' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
