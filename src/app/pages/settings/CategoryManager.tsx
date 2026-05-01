import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Plus, Edit2, Trash2, Check, X } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  color: string;
  type: 'income' | 'expense';
}

const initialCategories: Category[] = [
  { id: 1, name: 'Salary', color: '#4CAF50', type: 'income' },
  { id: 2, name: 'Freelance', color: '#3B82F6', type: 'income' },
  { id: 3, name: 'Food & Dining', color: '#F59E0B', type: 'expense' },
  { id: 4, name: 'Transportation', color: '#8B5CF6', type: 'expense' },
  { id: 5, name: 'Shopping', color: '#EC4899', type: 'expense' },
  { id: 6, name: 'Entertainment', color: '#10B981', type: 'expense' },
  { id: 7, name: 'Bills', color: '#06B6D4', type: 'expense' },
];

const colorOptions = ['#4CAF50', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#10B981', '#06B6D4', '#6366F1'];

export function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    color: '#4CAF50',
    type: 'expense' as 'income' | 'expense',
  });

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setEditName(category.name);
    setEditColor(category.color);
  };

  const handleSaveEdit = (id: number) => {
    setCategories(categories.map(cat =>
      cat.id === id ? { ...cat, name: editName, color: editColor } : cat
    ));
    setEditingId(null);
  };

  const handleDelete = (id: number) => {
    setCategories(categories.filter(cat => cat.id !== id));
  };

  const handleAddCategory = () => {
    const newCat: Category = {
      id: Math.max(...categories.map(c => c.id)) + 1,
      ...newCategory,
    };
    setCategories([...categories, newCat]);
    setNewCategory({ name: '', color: '#4CAF50', type: 'expense' });
    setShowAddForm(false);
  };

  const incomeCategories = categories.filter(c => c.type === 'income');
  const expenseCategories = categories.filter(c => c.type === 'expense');

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 md:pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Category Manager</h1>
          <p className="text-muted-foreground">Customize your income and expense categories</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="w-5 h-5" />
          Add Category
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Category</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Category Name"
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              placeholder="Enter category name"
            />

            <div>
              <label className="block mb-3 text-sm font-medium">Category Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setNewCategory({ ...newCategory, type: 'income' })}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    newCategory.type === 'income'
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-muted-foreground'
                  }`}
                >
                  Income
                </button>
                <button
                  type="button"
                  onClick={() => setNewCategory({ ...newCategory, type: 'expense' })}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    newCategory.type === 'expense'
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-muted-foreground'
                  }`}
                >
                  Expense
                </button>
              </div>
            </div>

            <div>
              <label className="block mb-3 text-sm font-medium">Color</label>
              <div className="flex gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewCategory({ ...newCategory, color })}
                    className={`w-10 h-10 rounded-xl border-2 transition-all ${
                      newCategory.color === color ? 'border-foreground scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleAddCategory} disabled={!newCategory.name}>
                Add Category
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Income Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {incomeCategories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-muted transition-colors"
              >
                {editingId === category.id ? (
                  <>
                    <div className="flex items-center gap-3 flex-1">
                      <select
                        value={editColor}
                        onChange={(e) => setEditColor(e.target.value)}
                        className="w-12 h-12 rounded-xl border-2 border-border cursor-pointer"
                        style={{ backgroundColor: editColor }}
                      >
                        {colorOptions.map((color) => (
                          <option key={color} value={color}>
                            {color}
                          </option>
                        ))}
                      </select>
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleSaveEdit(category.id)}>
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(category)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(category.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Expense Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {expenseCategories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-muted transition-colors"
              >
                {editingId === category.id ? (
                  <>
                    <div className="flex items-center gap-3 flex-1">
                      <select
                        value={editColor}
                        onChange={(e) => setEditColor(e.target.value)}
                        className="w-12 h-12 rounded-xl border-2 border-border cursor-pointer"
                        style={{ backgroundColor: editColor }}
                      >
                        {colorOptions.map((color) => (
                          <option key={color} value={color}>
                            {color}
                          </option>
                        ))}
                      </select>
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleSaveEdit(category.id)}>
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(category)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(category.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
